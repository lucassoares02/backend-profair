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

    const queryConsult = "select * from notices order by priority desc";

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Notices: ", error);
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

    const queryInsert = `insert into notices (title, description, image, action, priority, primaryColor, secondaryColor, stamp, type, provider) values ('${title}', '${description}', '${image}', '${action}', ${priority}, '${primaryColor}', '${secondaryColor}', '${stamp}', ${type}, ${provider})`;
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
    const queryInsert = `insert into notices (title, description, image, action, priority, primaryColor, secondaryColor, stamp, type, provider) values ('${title}', '${description}', '${image}', '${action}', ${priority}, '${primaryColor}', '${secondaryColor}', '${stamp}', ${type}, ${provider})`;
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
    const queryUpdate = `update notices set title = '${title}', description = '${description}', image = '${image}', action = '${action}', priority = ${priority}, primaryColor = '${primaryColor}', secondaryColor = '${secondaryColor}', stamp = '${stamp}', type = ${type}, provider = ${provider} where codNotice = ${id}`;
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
