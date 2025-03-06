const { connection } = require("@server");
const logger = require("@logger");
const Select = require("@select");
const Insert = require("@insert");

const Category = {

  async getCategoryConsult(req, res) {
    logger.info("Get Clients to Category for Consults");

    const { codconsult } = req.params;

    const queryConsult = "SET sql_mode = ''; select relacionafornecedor.codConsultor, relacionafornecedor.codFornecedor, consultor.nomeConsult, fornecedor.codCategoria, categoria.descCategoria, sum(pedido.quantMercPedido) as 'quantidade', FORMAT(IFNULL(sum(mercadoria.precoMercadoria*pedido.quantMercPedido),0), 2, 'de_DE') as 'valorCategoria' from consultor inner join relacionafornecedor on consultor.codConsult = relacionafornecedor.codConsultor inner join fornecedor on fornecedor.codForn = relacionafornecedor.codfornecedor join pedido on (fornecedor.codForn = pedido.codFornPedido) join mercadoria on (pedido.codMercPedido = mercadoria.codMercadoria) join categoria on fornecedor.codCategoria = categoria.codCategoria where consultor.codConsult =  " + codconsult + " group by fornecedor.codCategoria";

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Clients to Category for Consults: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },







};

module.exports = Category;
