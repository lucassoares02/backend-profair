const express = require("express");
const cors = require("cors");
const app = express();
require("newrelic");

const routes = require("@routes");

app.use(cors({ origin: "*", allowedHeaders: "X-Requested-With, Content-Type, user-id, platform", exposedHeaders: ["user-id", "platform"] }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.use("/", routes);

module.exports = app;
