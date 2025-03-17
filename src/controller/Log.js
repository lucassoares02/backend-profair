const { connection } = require("@server");
const logger = require("@logger");

const Log = {

  async InsertLog(req, res, next) {
    logger.info("Insert Logs");

    const logData = {
      ip: req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
      method: req.method,
      route: req.originalUrl,
      body: req.body,
      queryParams: req.query,
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
    };

    console.log(logData);

    const query = `INSERT INTO log (ip, userAgent, method, route, body, queryParams, timestamp) VALUES ('${logData.ip}', '${logData.userAgent}', '${logData.method}', '${logData.route}', '${JSON.stringify(logData.body)}', '${JSON.stringify(logData.queryParams)}', '${logData.timestamp}'); SHOW WARNINGS;`;

    console.log(query);

    connection.query(query, (error, results, fields) => {
      next();
    });
  },







};

module.exports = Log;
