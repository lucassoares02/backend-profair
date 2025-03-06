const { connection } = require("@server");
const logger = require("@logger");
const Insert = require("@insert");
const Update = require("@update");

const Faceline = {
  async insert(req, res) {
    logger.info("Post Save Faceline Client");

    const itens = req.body;

    let params = {
      table: "faceline",
      data: itens,
    };

    return Insert(params)
      .then(async (resp) => {
        res.json(resp);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
    // connection.end();
  },

  async update(req, res) {
    logger.info("Post Update Faceline Client");

    const itens = req.body;
    console.log(itens)

    let params = {
      table: 'faceline',
      data: itens.data,
      where: {
        client: itens.client
      }
    };

    console.log(params)

    return Update(params)
      .then(async (resp) => {
        res.json(resp);
      })
      .catch((error) => {
        res.status(400).send(error);
      });
    // connection.end();
  },

};

module.exports = Faceline;
