const { connection } = require("@server");
const logger = require("@logger");
const Select = require("@select");
const Insert = require("@insert");

const Notice = {

  async getAllNotice(req, res) {
    logger.info("Get All Notices");

    const queryConsult = "SET sql_mode = ''; select * from notices order by priority desc";

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Notices: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },


  async getAllSchedule(req, res) {
    logger.info("Get All Schedule");

    const queryConsult = "SET sql_mode = ''; select * from schedule";

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Schedule: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },




};

module.exports = Notice;
