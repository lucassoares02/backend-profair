const { connection } = require("@server");
const logger = require("@logger");

const WindowNegotiation = {

  async getWindowNegotiation(req, res) {

    logger.info("Get WindowNegotiation");

    const { client } = req.params;

    const query = `select * from negotiation_windows where client_id = ${client}`;

    console.log(query)

    connection.query(query, (error, results) => {
      if (error) {
        console.log("Error Get WindowNegotiation: ", error);
        return res.status(400).send(`message: ${error}`);
      } else {
        return res.json(results[0]);
      }
    });

  },


};

module.exports = WindowNegotiation;
