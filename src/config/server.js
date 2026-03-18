require("dotenv").config();
const mysql = require("mysql");

function handleDisconnect(conn) {
  conn.on("error", (err) => {
    if (err.code === "PROTOCOL_CONNECTION_LOST" || err.fatal) {
      console.log("Reconectando ao banco...");
      Object.assign(conn, mysql.createConnection(conn.config));
      handleDisconnect(conn);
      conn.connect();
    } else {
      throw err;
    }
  });
}

var connection = mysql.createConnection({
  port: process.env.MYSQL_PORT,
  host: process.env.MYSQL_HOSTNAME,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  charset: "utf8mb4",
  ssl: {
    rejectUnauthorized: false,
    // 👇 força algoritmos compatíveis com OpenSSL 3 + MySQL 8
    secureProtocol: "TLSv1_2_method",
    ciphers: "HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA",
  },
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
  multipleStatements: true,
});

handleDisconnect(connection);
handleDisconnect(connectionMultishow);

connection.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco principal:", err);
    return;
  }
  console.log("Banco principal conectado.");
});

connectionMultishow.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco multishow:", err);
    return;
  }
  console.log("Banco multishow conectado.");
});

module.exports = {
  connection,
  connectionMultishow,
};

// var connectionMultishow = mysql.createConnection({
//   port: process.env.MYSQL_PORT_MULTISHOW,
//   host: process.env.MYSQL_HOSTNAME_MULTISHOW,
//   user: process.env.MYSQL_USERNAME_MULTISHOW,
//   password: process.env.MYSQL_PASSWORD_MULTISHOW,
//   database: process.env.MYSQL_DATABASE_MULTISHOW,
//   ssl: {
//     rejectUnauthorized: false,
//   },
//   multipleStatements: true,
// });
