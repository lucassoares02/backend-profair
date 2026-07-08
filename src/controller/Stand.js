const { connection } = require("@server");
const logger = require("@logger");

// Helper: promisifica connection.query (pacote `mysql`, callback-based)
function query(sql, values) {
  return new Promise((resolve, reject) => {
    connection.query(sql, values, (error, results) => {
      if (error) return reject(error);
      return resolve(results);
    });
  });
}

// Normaliza um stand vindo do cliente para os valores gravados no banco.
function sanitizeStand(codOrg, raw) {
  const clamp01 = (v) => {
    const n = Number(v);
    if (Number.isNaN(n)) return 0;
    return Math.min(1, Math.max(0, n));
  };

  const codForn = raw.codForn === null || raw.codForn === undefined || `${raw.codForn}` === "" ? null : parseInt(raw.codForn);
  const nome = raw.nome === null || raw.nome === undefined ? null : `${raw.nome}`.trim().substring(0, 60);
  const cor = raw.cor === null || raw.cor === undefined ? null : `${raw.cor}`.trim().substring(0, 10);
  const rotacao = Number.isNaN(parseInt(raw.rotacao)) ? 0 : parseInt(raw.rotacao);

  return [
    parseInt(codOrg),
    Number.isNaN(codForn) ? null : codForn,
    nome,
    clamp01(raw.x),
    clamp01(raw.y),
    clamp01(raw.w),
    clamp01(raw.h),
    cor,
    rotacao,
  ];
}

const Stand = {
  // GET /stands/:codOrg  → lista os stands ativos do mapa
  async getStands(req, res) {
    logger.info("Get Stands");

    const { codOrg } = req.params;

    const sql = `
      SELECT s.codStand, s.codOrg, s.codForn, s.nome, s.x, s.y, s.w, s.h, s.cor, s.rotacao,
             f.nomeForn, f.image AS fornImage, f.color AS fornColor
      FROM stand s
      LEFT JOIN fornecedor f ON f.codForn = s.codForn
      WHERE s.codOrg = ? AND s.ativo = 1
      ORDER BY s.codStand`;

    try {
      const results = await query(sql, [parseInt(codOrg)]);
      return res.json(results);
    } catch (error) {
      logger.error(`Error getStands: ${error}`);
      return res.status(500).json({ error: "Erro ao buscar stands" });
    }
  },

  // POST /stands/:codOrg/batch  → substitui todos os stands do mapa
  // body: { stands: [ {codForn, nome, x, y, w, h, cor, rotacao}, ... ] }
  async saveStandsBatch(req, res) {
    logger.info("Save Stands Batch");

    const { codOrg } = req.params;

    let stands = req.body.stands;
    if (typeof stands === "string") {
      try {
        stands = JSON.parse(stands);
      } catch (e) {
        return res.status(400).json({ error: "Payload de stands inválido" });
      }
    }
    if (!Array.isArray(stands)) stands = [];

    try {
      // Estratégia "salvar o mapa inteiro": remove os antigos e insere os atuais.
      await query(`DELETE FROM stand WHERE codOrg = ?`, [parseInt(codOrg)]);

      if (stands.length > 0) {
        const values = stands.map((s) => sanitizeStand(codOrg, s));
        await query(
          `INSERT INTO stand (codOrg, codForn, nome, x, y, w, h, cor, rotacao) VALUES ?`,
          [values]
        );
      }

      return res.status(200).json({ message: "Stands salvos com sucesso", total: stands.length });
    } catch (error) {
      logger.error(`Error saveStandsBatch: ${error}`);
      return res.status(500).json({ error: "Erro ao salvar stands" });
    }
  },

  // POST /stand  → cria um único stand
  async createStand(req, res) {
    logger.info("Create Stand");

    const { codOrg } = req.body;
    if (!codOrg) return res.status(400).json({ error: "codOrg é obrigatório" });

    try {
      const values = sanitizeStand(codOrg, req.body);
      const result = await query(
        `INSERT INTO stand (codOrg, codForn, nome, x, y, w, h, cor, rotacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        values
      );
      return res.status(201).json({ codStand: result.insertId });
    } catch (error) {
      logger.error(`Error createStand: ${error}`);
      return res.status(500).json({ error: "Erro ao criar stand" });
    }
  },

  // PUT /stand/:codStand  → atualiza um stand
  async updateStand(req, res) {
    logger.info("Update Stand");

    const { codStand } = req.params;
    const codOrg = req.body.codOrg;
    if (!codOrg) return res.status(400).json({ error: "codOrg é obrigatório" });

    try {
      const [org, codForn, nome, x, y, w, h, cor, rotacao] = sanitizeStand(codOrg, req.body);
      await query(
        `UPDATE stand SET codForn = ?, nome = ?, x = ?, y = ?, w = ?, h = ?, cor = ?, rotacao = ? WHERE codStand = ?`,
        [codForn, nome, x, y, w, h, cor, rotacao, parseInt(codStand)]
      );
      return res.status(200).json({ message: "Stand atualizado com sucesso" });
    } catch (error) {
      logger.error(`Error updateStand: ${error}`);
      return res.status(500).json({ error: "Erro ao atualizar stand" });
    }
  },

  // DELETE /stand/:codStand  → remove um stand
  async deleteStand(req, res) {
    logger.info("Delete Stand");

    const { codStand } = req.params;

    try {
      await query(`DELETE FROM stand WHERE codStand = ?`, [parseInt(codStand)]);
      return res.status(200).json({ message: "Stand removido com sucesso" });
    } catch (error) {
      logger.error(`Error deleteStand: ${error}`);
      return res.status(500).json({ error: "Erro ao remover stand" });
    }
  },
};

module.exports = Stand;
