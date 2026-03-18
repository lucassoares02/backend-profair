require("dotenv").config();
const { Pool } = require("pg");
const mysql2 = require("mysql2");
const mysql = require("mysql");

var connection = mysql.createConnection({
  port: process.env.MYSQL_PORT,
  host: process.env.MYSQL_HOSTNAME,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  charset: "utf8mb4",
  // ssl: {
  //   rejectUnauthorized: false,
  // },
  // insecureAuth: true,
  // connectionLimit: 10,
  ssl: false,
  multipleStatements: true,
});

var connectionMultishow = mysql.createConnection({
  port: process.env.MYSQL_PORT_MULTISHOW,
  host: process.env.MYSQL_HOSTNAME_MULTISHOW,
  user: process.env.MYSQL_USERNAME_MULTISHOW,
  password: process.env.MYSQL_PASSWORD_MULTISHOW,
  database: process.env.MYSQL_DATABASE_MULTISHOW,
  ssl: {
    rejectUnauthorized: false,
  },
  // insecureAuth: true,
  // connectionLimit: 10,
  multipleStatements: true,
});

module.exports = {
  connection,
  connectionMultishow,
};
