const logger = require("@logger");
const { connection } = require("./../config/server");
const fs = require('fs');

async function Update(params) {
  const logs = 'logs.txt';

  const table = params.table;
  const data = params.data;
  const whereClause = params.where;

  if (table !== undefined && data !== undefined && whereClause !== undefined) {
    const columnsData = Object.keys(data);
    const valuesData = Object.values(data);

    // Cria a parte SET da query dinamicamente, ignorando valores nulos
    const setClause = columnsData
      .map((coluna, index) => {
        if (valuesData[index] !== null && valuesData[index] !== undefined) {
          return `${coluna} = '${valuesData[index]}'`;
        }
        return null;
      })
      .filter(clause => clause !== null)
      .join(", ");

    if (!setClause) {
      return "No valid data to update!";
    }

    // Cria a parte WHERE da query
    const whereKeys = Object.keys(whereClause);
    const whereValues = Object.values(whereClause);
    const whereCondition = whereKeys
      .map((coluna, index) => `${coluna} = '${whereValues[index]}'`)
      .join(" AND ");

    const query = `UPDATE ${table} SET ${setClause} WHERE ${whereCondition}; SHOW WARNINGS`;

    console.log("====== Query update ======");
    console.log(query);
    console.log("====== xxxxxxxxxxxx ======");

    return new Promise(function (resolve, reject) {
      try {
        connection.query(query, (error, results, fields) => {
          if (error) {
            logger.error(error);
            console.log(query);
            fs.writeFileSync(logs, `${new Date().toLocaleTimeString()} - ${error}\n`, { encoding: 'utf8', flag: 'a' });
            return resolve();
          }
          return resolve(results);
        });

      } catch (error) {
        console.log(`Error Update Promise: ${error}`);
        reject(error);
      }
    });
  } else {
    return "No Data Received!";
  }
}

module.exports = Update;
