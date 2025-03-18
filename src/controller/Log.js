const { connection } = require("@server");
const logger = require("@logger");

const Log = {

  async InsertLog(req, res, next) {
    logger.info("Insert Logs");

    console.log("=============================================");
    console.log("==================USER ID====================");
    console.log("=============================================");
    console.log(req.headers["user-id"]);
    console.log("=============================================");

    const logData = {
      ip: req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      userAgent: req.headers["user-id"],
      header: JSON.stringify(req.headers),
      method: req.method,
      route: req.originalUrl,
      body: req.method == 'GET' ? req.body : req.method == 'POST' ? req.body : req.method == 'PUT' ? req.body : req.method == 'DELETE' ? req.body : req.body,
      queryParams: req.query,
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
    };

    console.log(logData);

    const query = `INSERT INTO log (ip, userAgent, header, method, route, body, queryParams, timestamp) VALUES ('${logData.ip}', '${logData.userAgent}', '${logData.header}', '${logData.method}', '${logData.route}', '${JSON.stringify(logData.body)}', '${JSON.stringify(logData.queryParams)}', '${logData.timestamp}'); SHOW WARNINGS;`;

    connection.query(query, (error, results, fields) => {
      next();
    });
  },







};

module.exports = Log;
