const { connection } = require("@server");
const logger = require("@logger");

const Wedding = {

  async confirm(req, res) {

    logger.info("Confirmation Wedding");

    const { id } = req.query;

    const query = `update confirmado set confirmou = 1 where id = ${id}`;

    console.log(query)

    connection.query(query, (error, results) => {
      if (error) {
        console.log("Error Confirmation Wedding: ", error);
        return res.status(400).send(`message: ${error}`);
      } else {
        return res.json({ "message": "Confirmation success!" });
      }
    });

  },

  async disconfirm(req, res) {

    logger.info("Disconfirmation Wedding");

    const { id } = req.query;

    const query = `update confirmado set confirmou = 0 where id = ${id}`;

    try {
      connection.query(query, (error, results) => {
        if (error) {
          console.log("Error Desconfirmation Wedding: ", error);
          return res.status(400).send(`message: ${error}`);
        } else {
          return res.json({ "message": "Desconfirmation success!" });
        }
      });
    } catch (error) {
      logger.error(error);
      return res.status(400).send(`message: ${error}`);
    }


  },

  async get(req, res) {
    logger.info("Get Confirmation");

    const { id } = req.query;

    const query = `select confirmou from confirmado where id = ${id}`;

    connection.query(query, (error, results, fields) => {
      if (error) {
        console.log("Error Select Users: ", error);
      } else {
        return res.json(results[0]);
      }
    });
  },
  
  async getAllGuests(req, res) {
    logger.info("Get All Guests");

    const { id } = req.query;

    const query = `select convidados.*, confirmado.confirmou from convidados join confirmado on convidados.familia = confirmado.familia `;

    connection.query(query, (error, results, fields) => {
      if (error) {
        console.log("Error Select GetAll Guests: ", error);
      } else {
        return res.json(results);
      }
    });
  },


};

module.exports = Wedding;
