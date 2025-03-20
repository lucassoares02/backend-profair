const { connection } = require("@server");
const logger = require("@logger");

const Log = {

  async InsertLog(req, res, next) {
    logger.info("Insert Logs");

    const date = new Date();
date.setHours(date.getHours() - 3);

    const logData = {
      userAgent: req.headers["user-id"],
      method: req.method,
      route: req.originalUrl,
      body: req.method == 'GET' ? req.body : req.method == 'POST' ? req.body : req.method == 'PUT' ? req.body : req.method == 'DELETE' ? req.body : req.body,
      timestamp: date.toISOString().slice(0, 19).replace("T", " "),
    };

    console.log(logData);

    const query = `INSERT INTO log ( userAgent, header, method, route, body, timestamp) VALUES ('${logData.userAgent}', '${logData.header}', '${logData.method}', '${logData.route}', '${JSON.stringify(logData.body)}',  '${logData.timestamp}'); SHOW WARNINGS;`;

    connection.query(query, (error, results, fields) => {
      next();
    });
  },







};

module.exports = Log;
