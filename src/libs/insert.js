const logger = require("@logger");
const { connection } = require("./../config/server");
const fs = require('fs');

async function Insert(params) {
  // console.log("Function Insert");
  const logs = 'logs.txt';

  const table = params.table;
  const data = params.data;


  if (table !== undefined && data !== undefined) {
    // const columnsData = Object.keys(data);
    // const valuesData = Object.values(data);

    const primeiraMercadoria = data[0];
    const columnsData = Object.keys(primeiraMercadoria);

    const valuesData = data.map((item) => columnsData.map((coluna) => `'${item[coluna]}'`).join(","));

    // const query = "INSERT INTO " + table + " (" + columnsData.join(",") + ") VALUES (" + valuesData.join("','") + "')";
    
    const query = "INSERT INTO " + table + " (" + columnsData.join(",") + ") VALUES (" + valuesData.join("), (") + "); SHOW WARNINGS";

    return new Promise(function (resolve, reject) {
      try {
        connection.query(query, (error, results, fields) => {
          if (error) {
            logger.error(error);
            console.log(query);
            fs.writeFileSync(logs, `${new Date().toLocaleTimeString()} - ${error}\n`, { encoding: 'utf8', flag: 'a' });
            return resolve();
          }
          // for (let index = 0; index < results.length; index++) {
          //   console.log(results[index]);
          // }
          return resolve(results);
        });

      } catch (error) {
        console.log(`Error Insert Promise: ${error}`)
      }
    });
  } else {
    return "No Data Received!";
  }
}

module.exports = Insert;
