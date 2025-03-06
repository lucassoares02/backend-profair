const { connection } = require("@server");
const logger = require("@logger");

const Buyer = {
  async getBuyersClient(req, res) {
    logger.info("Get Buyers to Client");

    const { codconsultorclient } = req.params;

    const queryConsult =
      "SET sql_mode = ''; select comprador.codCompr, comprador.nomeCompr, comprador.descCatComprador, ifnull(sum(pedido.quantMercPedido), 0) as volumeTotal,   FORMAT(IFNULL(sum(mercadoria.precoMercadoria*pedido.quantMercPedido),0), 2, 'de_DE') as valorTotal from comprador left outer join fornecedor on fornecedor.codComprFornecedor = comprador.codCompr left join pedido on pedido.codFornPedido = fornecedor.codForn left join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido left join relaciona on relaciona.codConsultRelaciona = pedido.codAssocPedido where relaciona.codAssocRelaciona = " +
      codconsultorclient +
      " group by comprador.codCompr";

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Buyers to Client: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getBuyersProvider(req, res) {
    logger.info("Get Buyers to Providers");

    const { codprovider } = req.params;

    const queryConsult = `SET sql_mode = ''; 
    select 
    c.codConsult as 'codCompr',
    c.nomeConsult as 'nomeCompr',
        IFNULL(sum(mercadoria.precoMercadoria*pedido.quantMercPedido),0 ) as 'valorTotal', 
        IFNULL(sum(pedido.quantMercPedido),0 ) as 'volumeTotal'
        from consultor c
       join pedido on pedido.codConsultPedido = c.codConsult
        left join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido 
    where pedido.codFornPedido = ${codprovider}
        group by pedido.codConsultPedido
        order by valorTotal 
        desc
    `;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Buyers to Client: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getAllBuyers(req, res) {
    logger.info("Get All Buyers");

    const queryConsult = `
    SET sql_mode = ''; select 
    comprador.codCompr, 
    comprador.nomeCompr,
    comprador.descCatComprador,
    comprador.color,
    IFNULL(sum(mercadoria.precoMercadoria*pedido.quantMercPedido),0 ) as 'valorTotal', 
    IFNULL(sum(pedido.quantMercPedido),0 ) as 'volumeTotal'
    from comprador
    join fornecedor on fornecedor.codComprFornecedor = comprador.codCompr 
    left join pedido on pedido.codFornPedido = fornecedor.codForn
    left join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido 
    group by comprador.codCompr
    order by valorTotal 
    desc`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select All Buyers: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },
};

module.exports = Buyer;
