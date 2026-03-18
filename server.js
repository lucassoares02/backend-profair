require("dotenv").config();
require("module-alias/register");

const config = require("@config");
const app = require("@app");
const logger = require("@logger");

require("./scheduler");

process.on("uncaughtException", (err) => {
  logger.error(err);
});

process.on("unhandledRejection", (err) => {
  logger.error(err);
});

app.listen(config.app.port, () => {
  logger.info(`✅ Server Running on port ${config.app.port}`);
});
