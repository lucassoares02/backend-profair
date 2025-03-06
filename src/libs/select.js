const connection = require("./../config/server");
const logger = require("../utils/logger");

async function Select(params) {
  logger.info("Function Select");

  const table = params.table != undefined ? params.table : "";
  const data = params.data != undefined ? params.data : "";
  const where = params.where != undefined ? params.where : "";

  const columnsData = Object.keys(data);
  const valuesData = Object.values(data);
  const columnsWhere = Object.keys(where);
  const valuesWhere = Object.values(where);

  var concatWhere = "";
  if (where != "") {
    var i = 1;
    concatWhere =
      " where " + columnsWhere[0] + " LIKE '" + valuesWhere[0] + "'";

    for (i; i < columnsWhere.length; i++) {
      concatWhere +=
        " AND " + columnsWhere[i] + " LIKE '" + valuesWhere[i] + "'";
    }
  }

  const query = "SET sql_mode = ''; select * FROM " + table + concatWhere;
  


  return new Promise(function (resolve, reject) {
    connection.query(query, valuesData, function (error, results, fields) {
      if (error) {
        logger.error(error);
        return reject(error);
      }
      
      logger.info(results);
      return resolve(results);
    });
  });
}

module.exports = Select;
