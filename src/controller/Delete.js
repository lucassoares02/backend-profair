const { connection } = require("@server");
const logger = require("@logger");

const Delete = {
  async deleteAll(req, res) {
    logger.info("Get Deletes All Informations");

    const queryKill = `
    delete from acesso;
    delete from associado;
    delete from categoria;
    delete from cliente;
    delete from comprador;
    delete from consultor;
    delete from fornecedor;
    delete from log;
    delete from mercadoria;
    delete from mercadoriaNova;
    delete from negociacao;
    delete from negociacao_loja;
    delete from negotiation_windows;
    delete from notices;
    delete from pedido;
    delete from relaciona;
    delete from relacionaMercadoria;
    delete from relacionafornecedor;
    delete from schedule;
    delete from user_notifications;
    delete from organizador;
    `;

    connection.query(queryKill, (error, results, fields) => {
      if (error) {
        console.log("Error Delete All Informations: ", error);
      } else {
        return res.json({ message: "All Informations Deleted" });
      }
    });
    // connection.end();
  },


  async deleteCompanyToUser(req, res) {
    logger.info("Get Deletes Company to User");

    const { company, user, type } = req.params;

    console.log(company, user, type);


    let queryKill = "";

    if (type == 2) {
      queryKill = `delete from relaciona where codAssocRelaciona = ${user} and codConsultRelaciona = ${company}`;
    } else if (type == 1) {
      queryKill = `delete from relacionafornecedor where codConsultor = ${user} and codFornecedor = ${company}`;
    }

    console.log(queryKill);

    connection.query(queryKill, (error, results, fields) => {
      if (error) {
        console.log("Error Delete All Informations: ", error);
        return res.status(400).send(`message: ${error}`);
      } else {
        return res.json({ message: "Informations Deleted" });
      }
    });
    // connection.end();
  },



};

module.exports = Delete;
