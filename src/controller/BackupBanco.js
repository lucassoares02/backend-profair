const axios = require("axios");
const logger = require("@logger");
const { connection } = require("./../config/server");

const CHUNK_SIZE = 500;

function queryAsync(sql) {
  return new Promise((resolve, reject) => {
    connection.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

function isValidTableName(name) {
  return /^[a-zA-Z0-9_]+$/.test(name);
}

function splitIntoChunks(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks.length > 0 ? chunks : [[]];
}

const BackupBanco = {
  /**
   * Puxa os dados das tabelas informadas e envia para o ambiente espelho em chunks.
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
        logger.info(`BackupBanco.sendBackup – lendo tabela: ${table}`);
        const rows = await queryAsync(`SELECT * FROM \`${table}\``);
        logger.info(`BackupBanco.sendBackup – ${rows.length} registros lidos de '${table}'`);

        const chunks = splitIntoChunks(rows, CHUNK_SIZE);
        logger.info(`BackupBanco.sendBackup – '${table}' particionada em ${chunks.length} chunk(s)`);

        for (let i = 0; i < chunks.length; i++) {
          await axios.post(`${backupUrl}/backup/receive`, { table, rows: chunks[i], truncate: i === 0 }, { timeout: 30000 });
          logger.info(`BackupBanco.sendBackup – '${table}' chunk ${i + 1}/${chunks.length} enviado`);
        }

        counts[table] = rows.length;
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
