require("dotenv").config();
const mysql = require("mysql");

// O `connection` principal continua sendo uma conexão única porque alguns
// controllers usam transações (beginTransaction/commit/rollback) e connection.end(),
// que não existem na API de Pool. O handleDisconnect recria a conexão em caso de queda.
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

// O banco Multishow é um RDS remoto consultado esporadicamente. Uma conexão única
// persistente é derrubada por ociosidade (wait_timeout / firewall) e entra em estado
// fatal, causando "Cannot enqueue Query after fatal error". Um POOL resolve isso:
// entrega uma conexão saudável por query e descarta as mortas automaticamente.
// pool.query(sql, cb) tem a mesma assinatura de connection.query, e todos os usos
// de connectionMultishow são apenas .query(), então nenhum controller muda.
var connectionMultishow = mysql.createPool({
  connectionLimit: 10,
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

connection.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco principal:", err);
    return;
  }
  console.log("Banco principal conectado.");
});

// O pool cria as conexões sob demanda; aqui apenas validamos a conectividade no boot.
connectionMultishow.getConnection((err, conn) => {
  if (err) {
    console.error("Erro ao conectar ao banco multishow:", err);
    return;
  }
  console.log("Banco multishow conectado.");
  conn.release();
});

module.exports = {
  connection,
  connectionMultishow,
};
