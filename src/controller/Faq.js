const logger = require("@logger");
const { connection } = require("@server");
const { uploadFile, deleteFile } = require("@controller/Minio");
const util = require("util");

const query = util.promisify(connection.query).bind(connection);

// Limite de duração dos vídeos do FAQ (5 minutos).
const MAX_DURATION_SECONDS = 300;

/**
 * Extrai a chave do objeto no bucket a partir da URL pública do MinIO.
 * Ex.: https://files.profair.click/profair/faq/videos/123.mp4 -> faq/videos/123.mp4
 */
function objectFromUrl(url) {
  if (!url) return null;
  try {
    const pathname = new URL(url).pathname.replace(/^\/+/, ""); // profair/faq/videos/123.mp4
    const idx = pathname.indexOf("/");
    return idx >= 0 ? pathname.substring(idx + 1) : pathname;
  } catch (e) {
    return null;
  }
}

const Faq = {
  // Lista completa (gerenciamento na web) — inclui itens inativos.
  async getAllFaq(req, res) {
    logger.info("Get All Faq");
    try {
      const results = await query("SELECT * FROM faq ORDER BY position ASC, id DESC");
      return res.json(results);
    } catch (error) {
      logger.error(`Erro ao buscar FAQ: ${error.message}`);
      return res.status(400).send(error);
    }
  },

  // Lista pública — apenas itens ativos e com vídeo.
  async getPublicFaq(req, res) {
    logger.info("Get Public Faq");
    try {
      const results = await query(
        "SELECT id, title, description, tags, video_url, thumbnail, duration, width, height, views FROM faq WHERE active = 1 AND video_url IS NOT NULL AND video_url != '' ORDER BY position ASC, id DESC",
      );
      return res.json(results);
    } catch (error) {
      logger.error(`Erro ao buscar FAQ público: ${error.message}`);
      return res.status(400).send(error);
    }
  },

  async getFaqById(req, res) {
    logger.info("Get Faq By Id");
    const { id } = req.params;
    try {
      const results = await query("SELECT * FROM faq WHERE id = ?", [id]);
      if (!results.length) return res.status(404).send({ message: "Item não encontrado" });
      return res.json(results[0]);
    } catch (error) {
      logger.error(`Erro ao buscar item FAQ: ${error.message}`);
      return res.status(400).send(error);
    }
  },

  // Incrementa o contador de visualizações (chamado pela tela pública).
  async incrementView(req, res) {
    const { id } = req.params;
    try {
      await query("UPDATE faq SET views = views + 1 WHERE id = ?", [id]);
      return res.status(200).send({ message: "ok" });
    } catch (error) {
      logger.error(`Erro ao incrementar views FAQ: ${error.message}`);
      return res.status(400).send(error);
    }
  },

  async insertFaq(req, res) {
    logger.info("Insert Faq");
    const {
      title,
      description,
      tags,
      video_url,
      video_object,
      thumbnail,
      thumbnail_object,
      duration,
      width,
      height,
      active,
      position,
    } = req.body;

    if (!title || String(title).trim() === "") {
      return res.status(400).send({ message: "O título é obrigatório" });
    }

    if (duration && Number(duration) > MAX_DURATION_SECONDS) {
      return res.status(400).send({ message: "O vídeo excede o limite de 5 minutos" });
    }

    try {
      const result = await query(
        `INSERT INTO faq
          (title, description, tags, video_url, video_object, thumbnail, thumbnail_object, duration, width, height, active, position)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          description ?? null,
          tags ?? null,
          video_url ?? null,
          video_object ?? null,
          thumbnail ?? null,
          thumbnail_object ?? null,
          Number(duration) || 0,
          width ?? null,
          height ?? null,
          active == null ? 1 : Number(active),
          Number(position) || 0,
        ],
      );
      return res.status(200).send({ message: "FAQ criado com sucesso", id: result.insertId });
    } catch (error) {
      logger.error(`Erro ao inserir FAQ: ${error.message}`);
      return res.status(400).send(error);
    }
  },

  async updateFaq(req, res) {
    logger.info("Update Faq");
    const { id } = req.params;
    const {
      title,
      description,
      tags,
      video_url,
      video_object,
      thumbnail,
      thumbnail_object,
      duration,
      width,
      height,
      active,
      position,
    } = req.body;

    if (!title || String(title).trim() === "") {
      return res.status(400).send({ message: "O título é obrigatório" });
    }

    if (duration && Number(duration) > MAX_DURATION_SECONDS) {
      return res.status(400).send({ message: "O vídeo excede o limite de 5 minutos" });
    }

    try {
      // Se o vídeo/thumbnail foi trocado, remove o antigo do MinIO.
      const current = await query("SELECT video_object, thumbnail_object FROM faq WHERE id = ?", [id]);
      if (current.length) {
        const old = current[0];
        if (old.video_object && video_object && old.video_object !== video_object) {
          deleteFile(old.video_object).catch((e) => logger.error(`Falha ao remover vídeo antigo: ${e.message}`));
        }
        if (old.thumbnail_object && thumbnail_object && old.thumbnail_object !== thumbnail_object) {
          deleteFile(old.thumbnail_object).catch((e) => logger.error(`Falha ao remover thumb antiga: ${e.message}`));
        }
      }

      await query(
        `UPDATE faq SET
          title = ?, description = ?, tags = ?, video_url = ?, video_object = ?,
          thumbnail = ?, thumbnail_object = ?, duration = ?, width = ?, height = ?,
          active = ?, position = ?
         WHERE id = ?`,
        [
          title,
          description ?? null,
          tags ?? null,
          video_url ?? null,
          video_object ?? null,
          thumbnail ?? null,
          thumbnail_object ?? null,
          Number(duration) || 0,
          width ?? null,
          height ?? null,
          active == null ? 1 : Number(active),
          Number(position) || 0,
          id,
        ],
      );
      return res.status(200).send({ message: "FAQ atualizado com sucesso" });
    } catch (error) {
      logger.error(`Erro ao atualizar FAQ: ${error.message}`);
      return res.status(400).send(error);
    }
  },

  async deleteFaq(req, res) {
    logger.info("Delete Faq");
    const { id } = req.params;
    try {
      const current = await query("SELECT video_object, thumbnail_object FROM faq WHERE id = ?", [id]);
      await query("DELETE FROM faq WHERE id = ?", [id]);

      if (current.length) {
        const { video_object, thumbnail_object } = current[0];
        if (video_object) deleteFile(video_object).catch((e) => logger.error(`Falha ao remover vídeo: ${e.message}`));
        if (thumbnail_object) deleteFile(thumbnail_object).catch((e) => logger.error(`Falha ao remover thumb: ${e.message}`));
      }

      return res.status(200).send({ message: "FAQ removido com sucesso" });
    } catch (error) {
      logger.error(`Erro ao remover FAQ: ${error.message}`);
      return res.status(400).send(error);
    }
  },

  // Upload do vídeo. Valida a duração (enviada pelo cliente, que já a lê antes
  // do envio). Retorna a URL pública e a chave do objeto no bucket.
  async uploadVideo(req, res) {
    logger.info("Upload Faq Video");

    if (!req.file) {
      return res.status(400).json({ message: "Arquivo não enviado" });
    }

    const duration = Number(req.body.duration || 0);
    if (duration && duration > MAX_DURATION_SECONDS) {
      return res.status(400).json({ message: "O vídeo excede o limite de 5 minutos" });
    }

    if (req.file.mimetype && !req.file.mimetype.startsWith("video/")) {
      return res.status(400).json({ message: "O arquivo enviado não é um vídeo" });
    }

    try {
      const ext = (req.file.originalname.split(".").pop() || "mp4").toLowerCase();
      const fileName = `faq/videos/${Date.now()}.${ext}`;
      const { url } = await uploadFile(req.file.buffer, fileName, req.file.mimetype || "video/mp4");
      return res.status(200).json({ url, object: fileName });
    } catch (error) {
      logger.error(`Erro no upload do vídeo FAQ: ${error.message}`);
      return res.status(500).json({ message: "Erro ao fazer upload do vídeo" });
    }
  },

  // Upload da imagem de capa (thumbnail) — normalmente o primeiro quadro do vídeo,
  // gerado no navegador.
  async uploadThumbnail(req, res) {
    logger.info("Upload Faq Thumbnail");

    if (!req.file) {
      return res.status(400).json({ message: "Arquivo não enviado" });
    }

    try {
      const ext = (req.file.originalname.split(".").pop() || "jpg").toLowerCase();
      const fileName = `faq/thumbnails/${Date.now()}.${ext}`;
      const { url } = await uploadFile(req.file.buffer, fileName, req.file.mimetype || "image/jpeg");
      return res.status(200).json({ url, object: fileName });
    } catch (error) {
      logger.error(`Erro no upload da thumbnail FAQ: ${error.message}`);
      return res.status(500).json({ message: "Erro ao fazer upload da capa" });
    }
  },
};

module.exports = Faq;
module.exports.objectFromUrl = objectFromUrl;
