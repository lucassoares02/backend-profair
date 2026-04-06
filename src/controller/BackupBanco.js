const axios = require("axios");
const logger = require("@logger");
const { connection } = require("./../config/server");

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

const BackupBanco = {
  /**
   * Puxa os dados das tabelas informadas e envia para o ambiente espelho.
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
      const data = {};

      for (const table of tables) {
        logger.info(`BackupBanco.sendBackup – lendo tabela: ${table}`);
        const rows = await queryAsync(`SELECT * FROM \`${table}\``);
        data[table] = rows;
        logger.info(`BackupBanco.sendBackup – ${rows.length} registros lidos de '${table}'`);
      }

      logger.info("BackupBanco.sendBackup – enviando dados para o ambiente espelho");
      const response = await axios.post(
        `${backupUrl}/backup/receive`,
        { data },
        {
          // headers: { "x-mirror-request": "true" },
          timeout: 30000,
        },
      );

      logger.info(`BackupBanco.sendBackup – resposta do espelho: ${response.status}`);
      return res.status(200).json({
        message: "Backup enviado com sucesso.",
        tables: Object.keys(data),
        counts: Object.fromEntries(Object.entries(data).map(([t, rows]) => [t, rows.length])),
      });
    } catch (error) {
      logger.error(`BackupBanco.sendBackup – erro: ${error.message}`);
      return res.status(500).json({ error: "Falha ao enviar o backup.", detail: error.message });
    }
  },

  /**
   * Recebe os dados do ambiente principal e replica nas tabelas locais.
   * Body: { data: { tabela1: [...], tabela2: [...] } }
   * Estratégia: TRUNCATE + INSERT para manter espelho fiel.
   */
  async receiveBackup(req, res) {
    const { data } = req.body;

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return res.status(400).json({ error: "Informe o campo 'data' com o mapeamento { tabela: [...registros] }." });
    }

    const tables = Object.keys(data);
    if (tables.length === 0) {
      return res.status(400).json({ error: "Nenhuma tabela encontrada no payload." });
    }

    const invalidTables = tables.filter((t) => !isValidTableName(t));
    if (invalidTables.length > 0) {
      return res.status(400).json({ error: `Nome(s) de tabela inválido(s): ${invalidTables.join(", ")}` });
    }

    const result = {};

    try {
      await queryAsync("SET FOREIGN_KEY_CHECKS = 0");

      for (const table of tables) {
        const rows = data[table];

        if (!Array.isArray(rows)) {
          logger.warn(`BackupBanco.receiveBackup – '${table}' ignorada: valor não é array`);
          result[table] = { status: "skipped", reason: "valor não é array" };
          continue;
        }

        logger.info(`BackupBanco.receiveBackup – limpando tabela '${table}'`);
        await queryAsync(`TRUNCATE TABLE \`${table}\``);

        if (rows.length === 0) {
          logger.info(`BackupBanco.receiveBackup – tabela '${table}' esvaziada, sem registros para inserir`);
          result[table] = { status: "ok", inserted: 0 };
          continue;
        }

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

        result[table] = { status: "ok", inserted: rows.length };
      }

      await queryAsync("SET FOREIGN_KEY_CHECKS = 1");

      logger.info("BackupBanco.receiveBackup – backup recebido com sucesso");
      return res.status(200).json({ message: "Backup recebido e aplicado com sucesso.", result });
    } catch (error) {
      await queryAsync("SET FOREIGN_KEY_CHECKS = 1").catch(() => {});
      logger.error(`BackupBanco.receiveBackup – erro: ${error.message}`);
      return res.status(500).json({ error: "Falha ao aplicar o backup.", detail: error.message });
    }
  },
};

module.exports = BackupBanco;
