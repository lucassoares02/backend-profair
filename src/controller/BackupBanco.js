const axios = require("axios");
const logger = require("@logger");
const { connection } = require("./../config/server");

const CHUNK_SIZE = 500;

function queryAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

function isValidTableName(name) {
  return /^[a-zA-Z0-9_]+$/.test(name);
}

const BackupBanco = {
  /**
   * Puxa os dados das tabelas em batches (LIMIT/OFFSET) e envia para o espelho chunk a chunk,
   * evitando carregar tabelas grandes inteiras na memória.
   * Body: { tables: ["tabela1", "tabela2", ...] }
   */
  async sendBackup(req, res) {
    const { tables } = req.body;

    if (!Array.isArray(tables) || tables.length === 0) {
      return res.status(400).json({ error: "Informe uma lista de tabelas no campo 'tables'." });
    }

    const invalidTables = tables.filter((t) => !isValidTableName(t));
    if (invalidTables.length > 0) {
      return res.status(400).json({ error: `Nome(s) de tabela inválido(s): ${invalidTables.join(", ")}` });
    }

    const backupUrl = process.env.API_BACKUP;
    if (!backupUrl) {
      return res.status(500).json({ error: "API_BACKUP não definida no ambiente." });
    }

    try {
      const counts = {};

      for (const table of tables) {
        logger.info(`BackupBanco.sendBackup – iniciando tabela: ${table}`);

        let offset = 0;
        let firstChunk = true;
        let totalRows = 0;

        while (true) {
          const rows = await queryAsync(`SELECT * FROM \`${table}\` LIMIT ? OFFSET ?`, [CHUNK_SIZE, offset]);

          if (firstChunk && rows.length === 0) {
            // Tabela vazia: envia sinal de truncate sem registros
            await axios.post(`${backupUrl}/backup/receive`, { table, rows: [], truncate: true }, { timeout: 30000 });
            logger.info(`BackupBanco.sendBackup – '${table}' vazia, truncate enviado`);
            break;
          }

          if (rows.length === 0) break;

          await axios.post(`${backupUrl}/backup/receive`, { table, rows, truncate: firstChunk }, { timeout: 30000 });
          logger.info(`BackupBanco.sendBackup – '${table}' offset ${offset} → ${offset + rows.length} enviado`);

          totalRows += rows.length;
          offset += rows.length;
          firstChunk = false;

          if (rows.length < CHUNK_SIZE) break; // último batch
        }

        counts[table] = totalRows;
        logger.info(`BackupBanco.sendBackup – '${table}' concluída: ${totalRows} registros`);
      }

      return res.status(200).json({ message: "Backup enviado com sucesso.", tables, counts });
    } catch (error) {
      logger.error(`BackupBanco.sendBackup – erro: ${error.message}`);
      return res.status(500).json({ error: "Falha ao enviar o backup.", detail: error.message });
    }
  },

  /**
   * Recebe um chunk de dados e replica na tabela local.
   * Body: { table: "nome", rows: [...], truncate: true|false }
   * - truncate: true  → limpa a tabela antes de inserir (primeiro chunk)
   * - truncate: false → apenas insere (chunks subsequentes)
   */
  async receiveBackup(req, res) {
    const { table, rows, truncate } = req.body;

    if (!table || !isValidTableName(table)) {
      return res.status(400).json({ error: "Campo 'table' ausente ou inválido." });
    }

    if (!Array.isArray(rows)) {
      return res.status(400).json({ error: "Campo 'rows' deve ser um array." });
    }

    try {
      await queryAsync("SET FOREIGN_KEY_CHECKS = 0");

      if (truncate) {
        logger.info(`BackupBanco.receiveBackup – limpando tabela '${table}'`);
        await queryAsync(`TRUNCATE TABLE \`${table}\``);
      }

      if (rows.length > 0) {
        const columns = Object.keys(rows[0])
          .map((col) => `\`${col}\``)
          .join(", ");
        const values = rows.map(
          (row) =>
            "(" +
            Object.values(row)
              .map((v) => (v === null ? "NULL" : `'${String(v).replace(/'/g, "\\'")}'`))
              .join(", ") +
            ")",
        );

        const insertQuery = `INSERT INTO \`${table}\` (${columns}) VALUES ${values.join(", ")}`;
        logger.info(`BackupBanco.receiveBackup – inserindo ${rows.length} registros em '${table}'`);
        await queryAsync(insertQuery);
      }

      await queryAsync("SET FOREIGN_KEY_CHECKS = 1");

      return res.status(200).json({ message: "Chunk recebido e aplicado.", table, inserted: rows.length });
    } catch (error) {
      await queryAsync("SET FOREIGN_KEY_CHECKS = 1").catch(() => {});
      logger.error(`BackupBanco.receiveBackup – erro: ${error.message}`);
      return res.status(500).json({ error: "Falha ao aplicar o chunk.", detail: error.message });
    }
  },
};

module.exports = BackupBanco;
