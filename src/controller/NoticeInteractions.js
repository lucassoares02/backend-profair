const { connection } = require("@server");
const logger = require("@logger");

// id int
// codNotice int
// userId int
// interactionType enum('view', 'click', 'action')
// createdAt timestamp

const NoticeInteractions = {
  // create find, findone, insert, update, delete
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
