const { connection } = require("@server");
const logger = require("@logger");
const Select = require("@select");
const Insert = require("@insert");

const Notice = {
  // int? code;
  // String? title;
  // String? description;
  // String? image;
  // String? action;
  // int? priority;
  // String? primaryColor;
  // String? secondaryColor;
  // String? stamp;
  // int? type;
  // int? provider;

  async getAllNotice(req, res) {
    logger.info("Get All Notices");

    const codacesso = parseInt(req.headers["user-id"], 10);

    if (isNaN(codacesso)) {
      return res.status(400).json({ error: "Invalid user-id" });
    }

    const queryConsult = `
      SELECT n.*
      FROM notices n
      JOIN acesso a ON a.codAcesso = ?
      WHERE n.type = a.direcAcesso
      ORDER BY n.priority DESC
    `;

    connection.query(queryConsult, [codacesso], (error, results, fields) => {
      if (error) {
        console.log("Error Select Notices: ", error);
        return res.status(400).send(error);
      } else {
        return res.json(results);
      }
    });
    // connection.end();
  },

  async getAllNoticeAdmin(req, res) {
    logger.info("Get All Notices Admin");

    const queryConsult = "select * from notices order by priority desc";

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Notices Admin: ", error);
        return res.status(400).send(error);
      } else {
        return res.json(results);
      }
    });
    // connection.end();
  },

  async getAllSchedule(req, res) {
    logger.info("Get All Schedule");

    const queryConsult = "select * from schedule";

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Schedule: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async insertNotice(req, res) {
    logger.info("Insert Notice");
    const { title, description, image, action, priority, primaryColor, secondaryColor, stamp, type, provider } = req.body;

    const noticeType = Number(type);
    if (![1, 2, 3].includes(noticeType)) {
      return res.status(400).json({ error: "Invalid notice type" });
    }

    // provider pode ser null, entao tem que ser tratado
    const providerValue = provider ? provider : "NULL";

    const queryInsert = `insert into notices (title, description, image, action, priority, primaryColor, secondaryColor, stamp, type, provider) values ('${title}', '${description}', '${image}', '${action}', ${priority}, '${primaryColor}', '${secondaryColor}', '${stamp}', ${noticeType}, ${providerValue})`;
    connection.query(queryInsert, (error, results, fields) => {
      if (error) {
        console.log("Error Insert Notice: ", error);
      } else {
        return res.json({ message: "Notice inserted successfully" });
      }
    });
  },

  // findone notice
  async getNoticeById(req, res) {
    logger.info("Get Notice By Id");
    const { id } = req.params;
    const queryConsult = `select * from notices where codNotice = ${id}`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Notice By Id: ", error);
      } else {
        return res.json(results[0]);
      }
    });
  },

  // create notice
  async createNotice(req, res) {
    logger.info("Create Notice");
    const { title, description, image, action, priority, primaryColor, secondaryColor, stamp, type, provider } = req.body;
    const noticeType = Number(type);
    if (![1, 2, 3].includes(noticeType)) {
      return res.status(400).json({ error: "Invalid notice type" });
    }
    const queryInsert = `insert into notices (title, description, image, action, priority, primaryColor, secondaryColor, stamp, type, provider) values ('${title}', '${description}', '${image}', '${action}', ${priority}, '${primaryColor}', '${secondaryColor}', '${stamp}', ${noticeType}, ${provider})`;
    connection.query(queryInsert, (error, results, fields) => {
      if (error) {
        console.log("Error Insert Notice: ", error);
      } else {
        return res.json({ message: "Notice created successfully" });
      }
    });
  },

  // update notice
  async updateNotice(req, res) {
    logger.info("Update Notice");
    const { id } = req.params;
    const { title, description, image, action, priority, primaryColor, secondaryColor, stamp, type, provider } = req.body;
    const noticeType = Number(type);
    if (![1, 2, 3].includes(noticeType)) {
      return res.status(400).json({ error: "Invalid notice type" });
    }
    const providerValue = provider ? provider : "NULL";
    const queryUpdate = `update notices set title = '${title}', description = '${description}', image = '${image}', action = '${action}', priority = ${priority}, primaryColor = '${primaryColor}', secondaryColor = '${secondaryColor}', stamp = '${stamp}', type = ${noticeType}, provider = ${providerValue} where codNotice = ${id}`;
    connection.query(queryUpdate, (error, results, fields) => {
      if (error) {
        console.log("Error Update Notice: ", error);
      } else {
        return res.json({ message: "Notice updated successfully" });
      }
    });
  },

  // delete notice
  async deleteNotice(req, res) {
    logger.info("Delete Notice");
    const { id } = req.params;
    const queryDelete = `delete from notices where codNotice = ${id}`;
    connection.query(queryDelete, (error, results, fields) => {
      if (error) {
        console.log("Error Delete Notice: ", error);
      } else {
        return res.json({ message: "Notice deleted successfully" });
      }
    });
  },
};

module.exports = Notice;
