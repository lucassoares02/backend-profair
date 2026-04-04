const { connection } = require("@server");
const logger = require("@logger");

const WindowNegotiation = {
  async getWindowNegotiationByClient(req, res) {
    logger.info("Get WindowNegotiation");

    const { client } = req.params;

    const query = `select * from negotiation_windows where client_id = ${client}`;

    console.log(query);

    connection.query(query, (error, results) => {
      if (error) {
        console.log("Error Get WindowNegotiation: ", error);
        return res.status(400).send(`message: ${error}`);
      } else {
        return res.json(results);
      }
    });
  },

  async getWindowNegotiations(req, res) {
    logger.info("Get WindowNegotiation");

    const query = `SELECT 
        TIME(DATE_SUB(nw.start_at, INTERVAL 3 HOUR)) AS start_time,
        TIME(DATE_SUB(nw.end_at, INTERVAL 3 HOUR)) AS end_time,

        IF(
            nw.end_at IS NULL, 
            'EM ANDAMENTO',
            SEC_TO_TIME(
                TIMESTAMPDIFF(
                    SECOND, 
                    nw.start_at, 
                    nw.end_at
                )
            )
        ) AS duration,

        c.nomeConsult,
        c2.nomeConsult,
        f.nomeForn 

    FROM negotiation_windows nw 
    JOIN consultor c ON c.codConsult = nw.client_id 
    JOIN consultor c2 ON c2.codConsult = nw.consultant_id 
    JOIN fornecedor f ON f.codForn = nw.supplier_id;`;

    console.log(query);

    connection.query(query, (error, results) => {
      if (error) {
        console.log("Error Get WindowNegotiation: ", error);
        return res.status(400).send(`message: ${error}`);
      } else {
        return res.json(results);
      }
    });
  },

  async getWindowNegotiationsByProvider(req, res) {
    logger.info("Get WindowNegotiation");

    const { provider } = req.params;

    const query = `SELECT 
          TIME(DATE_SUB(nw.start_at, INTERVAL 3 HOUR)) AS start_time,
          TIME(DATE_SUB(nw.end_at, INTERVAL 3 HOUR)) AS end_time,

          IF(
              nw.end_at IS NULL, 
              'EM ANDAMENTO',
              SEC_TO_TIME(
                  TIMESTAMPDIFF(
                      SECOND, 
                      nw.start_at, 
                      nw.end_at
                  )
              )
          ) AS duration,
        nw.client_id as codClient,
          c.nomeConsult as nomeClient,
          nw.consultant_id as codConsult,
          c2.nomeConsult,
          nw.supplier_id as codForn,
          f.nomeForn 

      FROM negotiation_windows nw 
      JOIN consultor c ON c.codConsult = nw.client_id 
      JOIN consultor c2 ON c2.codConsult = nw.consultant_id 
      JOIN fornecedor f ON f.codForn = nw.supplier_id
      where nw.supplier_id = ${provider};`;

    connection.query(query, (error, results) => {
      if (error) {
        console.log("Error Get WindowNegotiation: ", error);
        return res.status(400).send(`message: ${error}`);
      } else {
        return res.json(results);
      }
    });
  },

  async getWindowNegotiationsByProviderAndClient(req, res) {
    logger.info("Get WindowNegotiation");

    const { provider, client } = req.params;

    const query = `SELECT 
          TIME(DATE_SUB(nw.start_at, INTERVAL 3 HOUR)) AS start_time,
          TIME(DATE_SUB(nw.end_at, INTERVAL 3 HOUR)) AS end_time,

          IF(
              nw.end_at IS NULL, 
              'EM ANDAMENTO',
              SEC_TO_TIME(
                  TIMESTAMPDIFF(
                      SECOND, 
                      nw.start_at, 
                      nw.end_at
                  )
              )
          ) AS duration,
        nw.client_id as codClient,
          c.nomeConsult as nomeClient,
          nw.consultant_id as codConsult,
          c2.nomeConsult,
          nw.supplier_id as codForn,
          f.nomeForn 

      FROM negotiation_windows nw 
      JOIN consultor c ON c.codConsult = nw.client_id 
      JOIN consultor c2 ON c2.codConsult = nw.consultant_id 
      JOIN fornecedor f ON f.codForn = nw.supplier_id
      where nw.supplier_id = ${provider} and nw.client_id = ${client};`;

    connection.query(query, (error, results) => {
      if (error) {
        console.log("Error Get WindowNegotiation: ", error);
        return res.status(400).send(`message: ${error}`);
      } else {
        return res.json(results);
      }
    });
  },

  async getWindowNegotiationsByProviderAndClientByConsult(req, res) {
    logger.info("Get WindowNegotiation");

    const { provider, client, consultant } = req.params;

    const query = `SELECT 
          TIME(DATE_SUB(nw.start_at, INTERVAL 3 HOUR)) AS start_time,
          TIME(DATE_SUB(nw.end_at, INTERVAL 3 HOUR)) AS end_time,

          IF(
              nw.end_at IS NULL, 
              'EM ANDAMENTO',
              SEC_TO_TIME(
                  TIMESTAMPDIFF(
                      SECOND, 
                      nw.start_at, 
                      nw.end_at
                  )
              )
          ) AS duration,
        nw.client_id as codClient,
          c.nomeConsult as nomeClient,
          nw.consultant_id as codConsult,
          c2.nomeConsult,
          nw.supplier_id as codForn,
          f.nomeForn 

      FROM negotiation_windows nw 
      JOIN consultor c ON c.codConsult = nw.client_id 
      JOIN consultor c2 ON c2.codConsult = nw.consultant_id 
      JOIN fornecedor f ON f.codForn = nw.supplier_id
      where nw.supplier_id = ${provider} and nw.client_id = ${client} and nw.consultant_id = ${consultant};`;

    connection.query(query, (error, results) => {
      if (error) {
        console.log("Error Get WindowNegotiation: ", error);
        return res.status(400).send(`message: ${error}`);
      } else {
        return res.json(results);
      }
    });
  },

  async getWindowNegotiationsByProviderByConsult(req, res) {
    logger.info("Get WindowNegotiation");

    const { provider, consultant } = req.params;

    const query = `SELECT 
          TIME(DATE_SUB(nw.start_at, INTERVAL 3 HOUR)) AS start_time,
          TIME(DATE_SUB(nw.end_at, INTERVAL 3 HOUR)) AS end_time,

          IF(
              nw.end_at IS NULL, 
              'EM ANDAMENTO',
              SEC_TO_TIME(
                  TIMESTAMPDIFF(
                      SECOND, 
                      nw.start_at, 
                      nw.end_at
                  )
              )
          ) AS duration,
        nw.client_id as codClient,
          c.nomeConsult as nomeClient,
          nw.consultant_id as codConsult,
          c2.nomeConsult,
          nw.supplier_id as codForn,
          f.nomeForn 

      FROM negotiation_windows nw 
      JOIN consultor c ON c.codConsult = nw.client_id 
      JOIN consultor c2 ON c2.codConsult = nw.consultant_id 
      JOIN fornecedor f ON f.codForn = nw.supplier_id
      where nw.supplier_id = ${provider} and nw.consultant_id = ${consultant};`;

    console.log(query);

    connection.query(query, (error, results) => {
      if (error) {
        console.log("Error Get WindowNegotiation: ", error);
        return res.status(400).send(`message: ${error}`);
      } else {
        return res.json(results);
      }
    });
  },
};

module.exports = WindowNegotiation;
