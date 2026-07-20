const { connection } = require("@server");
const logger = require("@logger");

// id int
// codNotice int
// userId int
// interactionType enum('view', 'click', 'action')
// createdAt timestamp

const NoticeInteractions = {
  // create find, findone, insert, update, delete
  async GetNoticeInteractions(req, res) {
    logger.info("Get Notice Interactions");
    const { id } = req.params;

    const query = [
      "SELECT ni.id, ni.codNotice, ni.userId, ni.interactionType, ni.createdAt,",
      "a.codAcesso, a.direcAcesso, c.nomeConsult, c.emailConsult, c.telConsult",
      "FROM notice_interactions ni",
      "LEFT JOIN acesso a ON a.codUsuario = ni.userId",
      "LEFT JOIN consultor c ON c.codConsult = ni.userId",
      "WHERE ni.codNotice = ?",
      "ORDER BY ni.createdAt DESC, ni.id DESC",
    ].join(" ");

    connection.query(query, [id], (error, results) => {
      if (error) {
        logger.error("Error selecting notice interactions:", error);
        return res.status(500).json({
          success: false,
          message: "Error selecting notice interactions",
          error,
        });
      }

      return res.status(200).json(results);
    });
  },

  async InsertNoticeInteraction(req, res, next) {
    logger.info("Insert Notice Interaction");
    const { codNotice, userId, interactionType } = req.body;

    const noticeInteractionData = {
      codNotice,
      userId,
      interactionType,
      createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
    };

    const query = `INSERT INTO notice_interactions (codNotice ,userId, interactionType, createdAt) VALUES ('${noticeInteractionData.codNotice}', '${noticeInteractionData.userId}', '${noticeInteractionData.interactionType}',  '${noticeInteractionData.createdAt}'); SHOW WARNINGS;`;

    connection.query(query, (error, results, fields) => {
      if (error) {
        logger.error("Error inserting notice interaction:", error);
        return res.status(500).json({
          success: false,
          message: "Error inserting notice interaction",
          error: error,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Notice Interaction inserted successfully",
        data: results,
      });
    });
  },
};

module.exports = NoticeInteractions;
