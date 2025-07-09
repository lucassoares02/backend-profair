const { connection } = require("@server");
const connectionMultishow = require("@server");
const logger = require("@logger");
const Select = require("@select");
const Insert = require("@insert");

const Negotiation = {
  async getAllNegotiation(req, res) {
    logger.info("Get All Negotiations");

    const queryConsult =
      "SET sql_mode = ''; select relaciona.codAssocRelaciona, consultor.nomeConsult, relaciona.codConsultRelaciona, associado.razaoAssociado,  associado.cnpjAssociado, FORMAT(COALESCE(sum(mercadoria.precoMercadoria*pedido.quantMercPedido),'0'), 2, 'de_DE') as 'valorTotal', sum(pedido.quantMercPedido) as 'volumeTotal' from associado join relaciona on relaciona.codConsultRelaciona = associado.codAssociado join consultor on consultor.codConsult = relaciona.codAssocRelaciona left join pedido on pedido.codAssocPedido = relaciona.codConsultRelaciona left join mercadoria on codMercadoria = pedido.codMercPedido group by relaciona.codConsultRelaciona order by sum(mercadoria.precoMercadoria*pedido.quantMercPedido) desc";

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Users: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getNegotiationProvider(req, res) {
    logger.info("Get Negotiation Provider");

    const { codforn } = req.params;

    const queryConsult = `
    SET sql_mode = ''; 
    select negociacao.*, 
    FORMAT(IFNULL(sum(mercadoria.precoMercadoria*pedido. quantMercPedido),0), 2, 'de_DE') as 'valorTotal', 
    IFNULL(sum(pedido.quantMercPedido),0) as 'volumeTotal' 
    from negociacao 
    left join pedido on pedido.codNegoPedido = negociacao.codNegociacao 
    left join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido 
    where negociacao.codFornNegociacao = ${codforn} 
    group by negociacao.codNegociacao 
    order by sum(mercadoria.precoMercadoria*pedido.quantMercPedido) 
    desc`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Negotiation Provider: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async GetExportNegotiations(req, res) {
    logger.info("Get Export Negotiation ");

    const { codforn } = req.params;

    const queryConsult = `
    SET sql_mode = ''; select
      p.codMercPedido,
      m.nomeMercadoria,
      m.nomeMercadoria as nomeMerc,
      m.complemento,
      m.barcode,
      m.erpcode,
      m.codMercadoria_ext as codigoMerc,
      m.marca,
      p.quantMercPedido as quantidade,
      p.codFornPedido,
      p.codAssocPedido,
      p.codNegoPedido ,
      p.codMercPedido
      from pedido p
      join mercadoria m 
      where m.codMercadoria = p.codMercPedido 
      order by p.codNegoPedido;`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Export Negotiation : ", error);
      } else {
        let csvData = `ID;Negociacao;Codigo ERP;Codigo de barras;Produto;Complemento;Valor;Valor (NF unitario);Valor (NF embalagem);Tipo Embalagem;Qtde. Embalagem;Qtde. Minima;Modalidade;Data inicio encarte;Data fim encarte;Termino negociacao;Marca;Estoque;Quantidade\n`;

        csvData += results[1]
          .map((row) => {
            return ` ${row.codigoMerc};${row.codNegoPedido};${row.erpcode};${row.barcode};${row.nomeMerc};${row.complemento};;;;;;;;;;;${row.marca};;${row.quantidade}`; // Substitua com os nomes das colunas do seu banco de dados
          })
          .join("\n");

        const dateNow = Date.now();

        // Configurar os cabeçalhos de resposta para fazer o download
        res.setHeader("Content-Disposition", `attachment; filename=${dateNow}_negociacoes.csv`);
        res.setHeader("Content-Type", "text/csv");

        // Transmitir o arquivo CSV como resposta
        return res.send(csvData);

        // return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async GetExportNegotiationsClientPerProvider(req, res) {
    logger.info("Get Export Negotiation ");

    const { codeclient, codeprovider } = req.params;

    const queryConsult = `
    SET sql_mode = ''; select
    m.codMercadoria_ext as codMercPedido,
    m.nomeMercadoria,
    m.complemento,
    m.barcode,
    m.erpcode,
    m.marca,
    m.nego,
    p.quantMercPedido as quantidade,
    p.codFornPedido,
    concat(a.codAssociado, "_", a.razaoAssociado) as cliente,
  concat(f.codForn, "_", f.nomeForn) as  'fornecedor',
    p.codAssocPedido,
    n.codNegoErp as codNegoPedido
    from pedido p
    join mercadoria m 
    join negociacao n on n.codNegociacao = p.codNegoPedido 
    join associado a on a.codAssociado = p.codAssocPedido
    join fornecedor f on f.codForn = p.codFornPedido
    where m.codMercadoria = p.codMercPedido 
      and p.codAssocPedido = ${codeclient}
      and p.codFornPedido = ${codeprovider}
      order by p.codNegoPedido;
    `;

    connection.query(queryConsult, (error, results, fields) => {
      try {
        if (error) {
          console.log("Error Export Negotiation : ", error);
        } else {
          if (results.length > 0) {
            let csvData = `ID;Negociacao;Codigo ERP;Codigo de barras;Produto;Complemento;Valor;Valor (NF unitario);Valor (NF embalagem);Tipo Embalagem;Qtde. Embalagem;Qtde. Minima;Modalidade;Data inicio encarte;Data fim encarte;Termino negociacao;Marca;Estoque;Quantidade\n`;

            csvData += results[1]
              .map((row) => {
                return ` ${row.codMercPedido};${row.nego};"${row.erpcode}";"${row.barcode}";"${row.nomeMercadoria}";"${row.complemento}";;;;;;;;;;;"${row.marca}";;${row.quantidade}`; // Substitua com os nomes das colunas do seu banco de dados
              })
              .join("\n");

            const dateNow = Date.now();

            // Configurar os cabeçalhos de resposta para fazer o download
            res.setHeader(
              "Content-Disposition",
              `attachment; filename=${results[1][0].cliente.replaceAll(" ", "_").toLowerCase()}_${results[1][0].fornecedor.replaceAll(" ", "_").toLowerCase()}.csv`
            );
            res.setHeader("Content-Type", "text/csv");

            // Transmitir o arquivo CSV como resposta
            return res.send(csvData);
          }

          return res.send({ Message: "Sem pedidos" });

          // return res.json(results[1]);
        }
      } catch (error) {
        return res.send({ Mensagem: "Essa loja não possuí pedidos para exportar!" });
      }
    });
    // connection.end();
  },

  async GetExportNegotiationsPerNegotiationClient(req, res) {
    logger.info("Get Export Negotiation ");

    console.log(req.params);

    const { codeclient, codenegotiation } = req.params;


    const queryConsult = `
    SET sql_mode = ''; select
    m.codMercadoria_ext as codMercPedido,
    m.nomeMercadoria,
    m.complemento,
    m.barcode,
    m.erpcode,
    m.marca,
    format(m.precoUnit, 2, 'de_DE') as precoUnit,
    format(m.precoMercadoria, 2, 'de_DE') as precoMercadoria,
    format(m.precoMercadoria * p.quantMercPedido, 2, 'de_DE') as valorTotal,
    m.embMercadoria,
    m.fatorMerc,
    p.quantMercPedido as quantidade,
    a.codAssociado,
    a.razaoAssociado,
    concat(a.codAssociado, "_", a.razaoAssociado) as cliente,
    concat(f.codForn, "_", f.nomeForn) as  'fornecedor',
    n.codNegoErp as codNegoPedido
    from pedido p
    join mercadoria m 
    join negociacao n on n.codNegociacao = p.codNegoPedido 
    join associado a on a.codAssociado = p.codAssocPedido
    join fornecedor f on f.codForn = p.codFornPedido
    where m.codMercadoria = p.codMercPedido 
      and p.codAssocPedido = ${codeclient}
      and m.nego = ${codenegotiation}
      order by p.codNegoPedido;
    `;

    console.log(queryConsult);

    connection.query(queryConsult, (error, results, fields) => {
      try {
        if (error) {
          console.log("Error Export Negotiation : ", error);
        } else {
          if (results.length > 0) {
            let csvData = `ID;Mercadoria;Codigo de barras;Complemento;Valor unitario;Valor;Tipo Embalagem;Quantidade;Total\n`;

            csvData += results[1]
              .map((row) => {
                return ` ${row.codMercPedido};${row.nomeMercadoria};"${row.barcode}";"${row.complemento}";"${row.precoUnit}";"${row.precoMercadoria}";"${row.embMercadoria} | ${row.fatorMerc}";"${row.quantidade}";"${row.valorTotal}"`; // Substitua com os nomes das colunas do seu banco de dados
              })
              .join("\n");


            const dateNow = Date.now();

            // Configurar os cabeçalhos de resposta para fazer o download
            res.setHeader(
              "Content-Disposition",
              `attachment; filename=${results[1][0].cliente.replaceAll(" ", "_").toLowerCase()}_${results[1][0].fornecedor.replaceAll(" ", "_").toLowerCase()}.csv`
            );
            res.setHeader("Content-Type", "text/csv");

            // Transmitir o arquivo CSV como resposta
            return res.send(csvData);
          }

          return res.send({ Message: "Sem pedidos" });

          // return res.json(results[1]);
        }
      } catch (error) {
        return res.send({ Mensagem: "Essa loja não possuí pedidos para exportar!" });
      }
    });
    // connection.end();
  },

  async GetExportNegotiationsPerNegotiation(req, res) {
    logger.info("Get Export Negotiation ");

    console.log(req.params);

    const { codenegotiation } = req.params;


    const queryConsult = `
    SET sql_mode = '';
    select
    a.codAssociado,
    a.razaoAssociado,
    p.codNegoPedido,
    f.razaoForn as fornecedor,
    sum(p.quantMercPedido) quantidade,
    format(sum(p.quantMercPedido * m.precoMercadoria), 2, 'de_DE') as valorTotal
    from pedido p
    join mercadoria m on m.codMercadoria = p.codMercPedido
    join associado a on a.codAssociado = p.codAssocPedido
    join fornecedor f on f.codForn = p.codFornPedido
    where p.codNegoPedido = ${codenegotiation}
    group by p.codNegoPedido, p.codAssocPedido`;

    console.log(queryConsult);

    connection.query(queryConsult, (error, results, fields) => {
      try {
        if (error) {
          console.log("Error Export Negotiation : ", error);
        } else {
          if (results.length > 0) {
            let csvData = `Codigo Associado;Razão Associado;Negociação;Volume Total;Valor Total\n`;

            csvData += results[1]
              .map((row) => {
                return ` ${row.codAssociado};"${row.razaoAssociado}";"${row.codNegoPedido}";"${row.quantidade}";"${row.valorTotal}"`; // Substitua com os nomes das colunas do seu banco de dados
              })
              .join("\n");


            const dateNow = Date.now();

            // Configurar os cabeçalhos de resposta para fazer o download
            res.setHeader(
              "Content-Disposition",
              `attachment; filename=${results[1][0].fornecedor.replaceAll(" ", "_").toLowerCase()}.csv`
            );
            res.setHeader("Content-Type", "text/csv");

            // Transmitir o arquivo CSV como resposta
            return res.send(csvData);
          }

          return res.send({ Message: "Sem pedidos" });

          // return res.json(results[1]);
        }
      } catch (error) {
        return res.send({ Mensagem: "Essa loja não possuí pedidos para exportar!" });
      }
    });
    // connection.end();
  },

  async ExportNegotiationsPerProvider(req, res) {
    logger.info("Get Export Negotiation ");

    console.log(req.params);

    const { provider } = req.params;


    const queryConsult = `
      SET sql_mode = '';
      select
      a.codAssociado,
      a.razaoAssociado,
      p.codNegoPedido,
      f.codForn,
      c.nomeConsult as vendedor,
      f.razaoForn as fornecedor,
      sum(p.quantMercPedido) quantidade,
      format(sum(p.quantMercPedido * m.precoMercadoria), 2, 'de_DE') as valorTotal
      from pedido p
      join mercadoria m on m.codMercadoria = p.codMercPedido
      join associado a on a.codAssociado = p.codAssocPedido
      join fornecedor f on f.codForn = p.codFornPedido
      join consultor c on c.codConsult = p.codConsultPedido
      where p.codFornPedido = ${provider}
      group by p.codNegoPedido, p.codAssocPedido`;

    connection.query(queryConsult, (error, results, fields) => {
      try {
        if (error) {
          console.log("Error Export Negotiation : ", error);
        } else {
          if (results.length > 0) {
            let csvData = `Codigo Associado;Razão Associado;Negociação;Vendedor;Volume Total;Valor Total\n`;

            csvData += results[1]
              .map((row) => {
                return ` ${row.codAssociado};"${row.razaoAssociado}";"${row.codNegoPedido}";"${row.vendedor}";"${row.quantidade}";"${row.valorTotal}"`; // Substitua com os nomes das colunas do seu banco de dados
              })
              .join("\n");


            const dateNow = Date.now();

            // Configurar os cabeçalhos de resposta para fazer o download
            res.setHeader(
              "Content-Disposition",
              `attachment; filename=${results[1][0].fornecedor.replaceAll(" ", "_").toLowerCase()}_geral.csv`
            );
            res.setHeader("Content-Type", "text/csv");

            // Transmitir o arquivo CSV como resposta
            return res.send(csvData);
          }

          return res.send({ Message: "Sem pedidos" });

          // return res.json(results[1]);
        }
      } catch (error) {
        return res.send({ Mensagem: "Essa loja não possuí pedidos para exportar!" });
      }
    });
    // connection.end();
  },

  async GetExportNegotiationPerProvider(req, res) {
    logger.info("Get Export Negotiation ");

    const { codeclient, codenegotiation } = req.params;

    const queryConsult = `
    SET sql_mode = ''; select
    m.codMercadoria_ext as codMercPedido,
    m.nomeMercadoria,
    m.complemento,
    m.barcode,
    m.erpcode,
    m.nego,
    m.marca,
    p.quantMercPedido as quantidade,
    p.codFornPedido,
    concat(a.codAssociado, "_", a.razaoAssociado) as cliente,
  concat(f.codForn, "_", f.nomeForn) as  'fornecedor',
    p.codAssocPedido,
    n.codNegoErp as codNegoPedido
    from pedido p
    join mercadoria m 
    join negociacao n on n.codNegociacao = p.codNegoPedido 
    join associado a on a.codAssociado = p.codAssocPedido
    join fornecedor f on f.codForn = p.codFornPedido
    where m.codMercadoria = p.codMercPedido 
      and p.codAssocPedido = ${codeclient}
      and p.codNegoPedido = ${codenegotiation}
      order by p.codNegoPedido;
    `;

    connection.query(queryConsult, (error, results, fields) => {
      try {
        if (error) {
          console.log("Error Export Negotiation : ", error);
        } else {
          if (results.length > 0) {
            let csvData = `ID;Negociacao;Codigo ERP;Codigo de barras;Produto;Complemento;Valor;Valor (NF unitario);Valor (NF embalagem);Tipo Embalagem;Qtde. Embalagem;Qtde. Minima;Modalidade;Data inicio encarte;Data fim encarte;Termino negociacao;Marca;Estoque;Quantidade\n`;

            csvData += results[1]
              .map((row) => {
                return ` ${row.codMercPedido};${row.nego};"${row.erpcode}";"${row.barcode}";"${row.nomeMercadoria}";"${row.complemento}";;;;;;;;;;;"${row.marca}";;${row.quantidade}`; // Substitua com os nomes das colunas do seu banco de dados
              })
              .join("\n");

            const dateNow = Date.now();

            // Configurar os cabeçalhos de resposta para fazer o download
            res.setHeader(
              "Content-Disposition",
              `attachment; filename=negociacao${results[1][0].codNegoPedido}_${results[1][0].cliente.replaceAll(" ", "_").toLowerCase()}_${results[1][0].fornecedor.replaceAll(" ", "_").toLowerCase()}.csv`
            );
            res.setHeader("Content-Type", "text/csv");

            // Transmitir o arquivo CSV como resposta
            return res.send(csvData);
          }

          return res.send({ Message: "Sem pedidos" });

          // return res.json(results[1]);
        }
      } catch (error) {
        return res.send({ Mensagem: "Essa loja não possuí pedidos para exportar!" });
      }
    });
    // connection.end();
  },

  async GetExportNegotiationsClientTesteaaaaaaaaa(req, res) {
    logger.info("Get Export Negotiation ");

    const { codeclient } = req.params;

    const queryConsult = `
    SET sql_mode = ''; select
    m.codMercadoria_ext as codMercPedido,
    m.nomeMercadoria,
    m.complemento,
    m.barcode,
    m.erpcode,
    m.marca,
    m.nego,
    p.quantMercPedido as quantidade,
    p.codFornPedido,
    concat(a.codAssociado, "_", a.razaoAssociado) as cliente,
    p.codAssocPedido,
    n.codNegoErp as codNegoPedido
    from pedido p
    join mercadoria m 
    join negociacao n on n.codNegociacao = p.codNegoPedido 
join associado a on a.codAssociado = p.codAssocPedido
    where m.codMercadoria = p.codMercPedido 
      and p.codAssocPedido = ${codeclient}
      order by p.codNegoPedido;`;

    connection.query(queryConsult, (error, results, fields) => {
      try {
        if (error) {
          console.log("Error Export Negotiation : ", error);
        } else {
          if (results.length > 0) {
            let csvData = `ID;Negociacao;Codigo ERP;Codigo de barras;Produto;Complemento;Valor;Valor (NF unitario);Valor (NF embalagem);Tipo Embalagem;Qtde. Embalagem;Qtde. Minima;Modalidade;Data inicio encarte;Data fim encarte;Termino negociacao;Marca;Estoque;Quantidade\n`;

            csvData += results[1]
              .map((row) => {
                return ` ${row.codMercPedido};${row.nego};"${row.erpcode}";"${row.barcode}";"${row.nomeMercadoria}";"${row.complemento}";;;;;;;;;;;"${row.marca}";;${row.quantidade}`; // Substitua com os nomes das colunas do seu banco de dados
              })
              .join("\n");

            const dateNow = Date.now();

            // Configurar os cabeçalhos de resposta para fazer o download
            res.setHeader("Content-Disposition", `attachment; filename=${results[1][0].cliente.replaceAll(" ", "_").toLowerCase()}_exportacao.csv`);
            res.setHeader("Content-Type", "text/csv");

            // Transmitir o arquivo CSV como resposta
            return res.send(csvData);
          }

          return res.send({ Message: "Sem pedidos" });

          // return res.json(results[1]);
        }
      } catch (error) {
        return res.send({ Mensagem: "Essa loja não possuí pedidos para exportar!" });
      }
    });
    // connection.end();
  },

  async exportProductsPerNegotiationPerProvider(req, res) {
    logger.info("Get Export Negotiation ");

    const { provider } = req.params;

    const queryConsult = `
    SET sql_mode = ''; select fornecedor.codForn, 
    fornecedor.nomeForn, 
    mercadoria.codMercadoria, 
    mercadoria.nomeMercadoria  as nomeMercadoria,
    mercadoria.embMercadoria, 
    mercadoria.marca, 
    mercadoria.erpcode,
    mercadoria.barcode,
    mercadoria.nego,                                      
    mercadoria.codMercadoria_ext,                                      
    mercadoria.complemento, 
    mercadoria.fatorMerc, 
    format(mercadoria.precoMercadoria, 2,'de_DE') as precoMercadoria, 
    format(mercadoria.precoUnit,2,'de_DE') as precoUnit,
    format(IFNULL(sum(mercadoria.precoMercadoria*pedido.quantMercPedido), 0), 2, 'de_DE') as 'valorTotal', 
    IFNULL(sum(pedido.quantMercPedido),0) as 'volumeTotal' 
    from mercadoria 
    join fornecedor on mercadoria.codFornMerc = fornecedor.codForn 
    join pedido on pedido.codMercPedido = mercadoria.codMercadoria
    where fornecedor.codForn = ${provider}
    group by mercadoria.codMercadoria_ext
    order by mercadoria.nomeMercadoria  
    asc`;

    connection.query(queryConsult, (error, results, fields) => {
      try {
        if (error) {
          console.log("Error Export Negotiation : ", error);
        } else {
          if (results.length > 0) {
            let csvData = `ID;Mercadoria;Marca;Codigo de barras;Complemento;Valor Unitário;Valor Embalagem;Tipo Embalagem | Fator;Quantidade;Valor Total\n`;

            csvData += results[1]
              .map((row) => {
                return ` "${row.codMercadoria_ext}";"${row.nomeMercadoria}";"${row.marca}";"${row.barcode}";"${row.complemento}";"${row.precoUnit}";"${row.precoMercadoria}";"${row.embMercadoria} | ${row.fatorMerc}";"${row.volumeTotal}";"${row.valorTotal}"`; // Substitua com os nomes das colunas do seu banco de dados
              })
              .join("\n");



            const dateNow = Date.now();

            // Configurar os cabeçalhos de resposta para fazer o download
            res.setHeader("Content-Disposition", `attachment; filename=${results[1][0].nomeForn.replaceAll(" ", "_").toLowerCase()}_produtos.csv`);
            res.setHeader("Content-Type", "text/csv");

            // Transmitir o arquivo CSV como resposta
            return res.send(csvData);
          }

          return res.send({ Message: "Sem pedidos" });

          // return res.json(results[1]);
        }
      } catch (error) {
        return res.send({ Mensagem: "Essa loja não possuí pedidos para exportar!" });
      }
    });
    // connection.end();
  },

  async GetExportNegotiationsProvider(req, res) {
    logger.info("Get Export Negotiation Provider");

    const { supplier, buyer, negotiation } = req.params;

    let queryConsult = `
    SET sql_mode = ''; select
      p.codMercPedido as 'product',
      m.nomeMercadoria as 'title',
      m.complemento as 'complement',
      m.barcode ,
      m.nego,
      m.marca as 'brand',
      p.quantMercPedido as 'quantity',
      p.codNegoPedido as 'negotiation',
      n.descNegociacao as 'negotiation_description',
      p.codAssocPedido as 'client',
      a.razaoAssociado as 'client_name'
      from pedido p
      join mercadoria m 
      join associado a on a.codAssociado = p.codAssocPedido
      join negociacao n on n.codNegociacao = p.codNegoPedido
      where m.codMercadoria = p.codMercPedido 
      and p.codFornPedido = ${supplier}
      order by p.codNegoPedido;`;

    if (buyer != "null") {
      queryConsult = `
    SET sql_mode = ''; select
      p.codMercPedido as 'product',
      m.nomeMercadoria as 'title',
      m.complemento as 'complement',
      m.barcode ,
      m.nego,
      m.marca as 'brand',
      p.quantMercPedido as 'quantity',
      p.codNegoPedido as 'negotiation',
      n.descNegociacao as 'negotiation_description',
      p.codAssocPedido as 'client',
      a.razaoAssociado as 'client_name'
      from pedido p
      join mercadoria m 
      join associado a on a.codAssociado = p.codAssocPedido
      join negociacao n on n.codNegociacao = p.codNegoPedido
      where m.codMercadoria = p.codMercPedido 
      and p.codFornPedido = ${supplier}
      and p.codConsultPedido = ${buyer}
      order by p.codNegoPedido;`;
    }

    if (negotiation != "null") {
      queryConsult = `
    SET sql_mode = ''; select
      p.codMercPedido as 'product',
      m.nomeMercadoria as 'title',
      m.complemento as 'complement',
      m.barcode ,
      m.marca as 'brand',
      m.nego,
      p.quantMercPedido as 'quantity',
      p.codNegoPedido as 'negotiation',
      n.descNegociacao as 'negotiation_description',
      p.codAssocPedido as 'client',
      a.razaoAssociado as 'client_name'
      from pedido p
      join mercadoria m 
      join associado a on a.codAssociado = p.codAssocPedido
      join negociacao n on n.codNegociacao = p.codNegoPedido
      where m.codMercadoria = p.codMercPedido 
      and p.codFornPedido = ${supplier}
      and p.codNegoPedido = ${negotiation}
      order by p.codNegoPedido;`;
    }

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Export Negotiation Provider : ", error);
      } else {
        let csvData = `Codigo Produto,Codigo de barras,Descricao do Produto,Complemento,Marca,Quantidade,Negociacao,Descricao da negociacao,Cliente,Razao do Cliente\n`;

        csvData += results[1]
          .map((row) => {
            return ` ${row.product},${row.barcode},${row.title},${row.complement},${row.brand},${row.quantity},${row.nego},${row.negotiation_description},${row.client},${row.client_name}`; // Substitua com os nomes das colunas do seu banco de dados
          })
          .join("\n");

        const dateNow = Date.now();

        res.setHeader("Content-Disposition", `attachment; filename=${dateNow}_negociacoes.csv`);
        res.setHeader("Content-Type", "text/csv");

        return res.send(csvData);
      }
    });
  },

  async GetExportNegotiationsClient(req, res) {
    logger.info("Get Export Negotiation ");

    const { codeclient } = req.params;

    // const queryConsult = `
    // SET sql_mode = ''; select
    //   p.codMercPedido,
    //   concat(m.codMercadoria_ext," - ", m.nomeMercadoria) as nomeMercadoria,
    //   m.complemento,
    //   m.barcode,
    //   m.erpcode,
    //   m.marca,
    //   sum(p.quantMercPedido) as quantidade,
    //   p.codFornPedido,
    //   p.codAssocPedido,
    //   p.codNegoPedido
    //   from pedido p
    //   join mercadoria m on m.codMercadoria = p.codMercPedido
    //   where m.codMercadoria = p.codMercPedido
    //   and p.codAssocPedido = ${codeclient}
    //   group by p.codMercPedido
    //   order by p.codNegoPedido`;

    const queryConsult = `
    SET sql_mode = ''; select
      p.codMercPedido,
      m.nomeMercadoria as nomeMercadoria,
      m.complemento,
      m.barcode,
      m.erpcode,
      m.marca,
      p.quantMercPedido as quantidade,
      p.codFornPedido,
      p.codAssocPedido,
      p.codNegoPedido ,
      p.codMercPedido
      from pedido p
      join mercadoria m 
      where m.codMercadoria = p.codMercPedido 
      and p.codAssocPedido = ${codeclient}
      order by p.codNegoPedido`;

    connection.query(queryConsult, async (error, results, fields) => {
      if (error) {
        console.log("Error Export Negotiation : ", error);
      } else {
        let csvData = `ID;Negociacao;Codigo ERP;Codigo de barras;Produto;Complemento;Valor;Valor (NF unitario);Valor (NF embalagem);Tipo Embalagem;Qtde. Embalagem;Qtde. Minima;Modalidade;Data inicio encarte;Data fim encarte;Termino negociacao;Marca;Estoque;Quantidade\n`;

        //=============================================================
        //=============================================================
        //=============================================================

        count = 0;
        let listMerc = [];
        const queryReusult = await new Promise(async (resolve, reject) => {
          await results[1].map(async (row) => {
            const internQuery = `select codNegociacao from relacionaMercadoria where codMercadoria = ${row.codMercPedido}`;

            const asfdasf = await new Promise(async (resolve, reject) => {
              connection.query(internQuery, (error, resultssss, fields) => {
                if (error) {
                  console.log("Error Select Negotiation to Client: ", error);
                } else {
                  let data = [];
                  for (i = 0; i < resultssss.length; i++) {
                    data.push(resultssss[i]["codNegociacao"]);
                  }

                  if (data.indexOf(row.codNegoPedido) == -1) {
                    // let novaNegociacao = data[0];
                    // if (listMerc.length > 0) {

                    //   for (let i = 0; i < listMerc.length; i++) {

                    //     if (listMerc[i].mercadoria == row.codMercPedido) {
                    //       let negociacao = listMerc[i].negociacao;

                    //       if (negociacao != data[0]) {
                    //         novaNegociacao = data[0];
                    //       } else if (negociacao != data[1]) {
                    //         novaNegociacao = data[1];
                    //       }
                    //       console.log(`---`);
                    //       console.log(data);
                    //       console.log(`Mercadoria: ${row.codMercPedido}`);
                    //       console.log(`Negocicação: ${negociacao}`);
                    //       console.log(`Nova Negocicação: ${novaNegociacao}`);
                    //       console.log(`---`);
                    //     }
                    //   }
                    // }

                    csvData += `${row.codMercPedido};${data[0]};${row.erpcode};${row.barcode};${row.nomeMercadoria};${row.complemento};;;;;;;;;;;${row.marca};;${row.quantidade}\n`; // Substitua com os nomes das colunas do seu banco de dados;
                    // listMerc.push({ mercadoria: row.codMercPedido, negociacao: data[0] });
                  } else {
                    // let novaNegociacao = row.codNegoPedido;
                    // if (listMerc.length > 0) {

                    //   for (let i = 0; i < listMerc.length; i++) {
                    //     if (listMerc[i].mercadoria == row.codMercPedido) {
                    //       let negociacao = listMerc.negociacao;
                    //       if (negociacao != row.codNegoPedido) {
                    //         novaNegociacao = negociacao;
                    //       } else {
                    //         novaNegociacao = data[1];
                    //       }
                    //     }
                    //   }
                    // }

                    csvData += `${row.codMercPedido};${row.codNegoPedido};${row.erpcode};${row.barcode};${row.nomeMercadoria};${row.complemento};;;;;;;;;;;${row.marca};;${row.quantidade}\n`; // Substitua com os nomes das colunas do seu banco de dados;
                    // listMerc.push({ mercadoria: row.codMercPedido, negociacao: row.codNegoPedido });
                  }
                }
                resolve();
              });
            });
            count += 1;
            if (count == results[1].length) {
              resolve();
            }
          });
        });

        console.log("=------------------------ listMerc ----------------------------");
        console.log(listMerc);
        console.log("=------------------------ listMerc ----------------------------");

        //=============================================================
        //=============================================================
        //=============================================================

        // csvData += results[1].map((row) => {
        //   return `${row.codMercPedido};${row.codNegoPedido};${row.erpcode};${row.barcode};${row.nomeMercadoria};${row.complemento};;;;;;;;;;;${row.marca};;${row.quantidade}`; // Substitua com os nomes das colunas do seu banco de dados;
        // }).join('\n');
        const dateNow = Date.now();

        // Configurar os cabeçalhos de resposta para fazer o download
        res.setHeader("Content-Disposition", `attachment; filename = ${dateNow}negociacao.csv`);
        res.setHeader("Content-Type", "text/csv");

        // Transmitir o arquivo CSV como resposta
        return res.send(csvData);

        // return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async GetExportNegotiationsClientTeste(req, res) {
    logger.info("Get Export Negotiation ");

    const { codeclient } = req.params;

    function verificarMercadoria(codigo, lista) {
      for (i = 0; i < lista.length; i++) {
        if (lista[i].mercadoria.codMercPedido == codigo) {
          return i; // A mercadoria foi encontrada na lista.
        }
      }
      return -1;
    }

    const queryConsult = `
    SET sql_mode = ''; select
      p.codMercPedido,
      m.nomeMercadoria as nomeMercadoria,
      m.complemento,
      m.barcode,
      m.erpcode,
      m.marca,
      p.quantMercPedido as quantidade,
      p.codFornPedido,
      p.codAssocPedido,
      p.codNegoPedido ,
      p.codMercPedido
      from pedido p
      join mercadoria m 
      where m.codMercadoria = p.codMercPedido 
      and p.codAssocPedido = ${codeclient}
      order by p.codNegoPedido`;

    let listItens = [];
    let listNegociacoes = [];

    connection.query(queryConsult, async (error, results, fields) => {
      if (error) {
        console.log("Error Export Negotiation : ", error);
      } else {
        //=============================================================
        //=============================================================
        //=============================================================

        // Colocar no objeto:
        // 1. Código da mercadoria
        // 2. Lista de negociações
        // 3. Lista de mercadorias com todas as informações
        // Adicionar parâmetro para identificar se a negociação está correta
        // Se estiver correta remover o item da negociação da lista de negociações
        // E não verificar posteriormente.
        // Se o tamanho do array de negociações for igual a 1, somar as quantidades

        // 4. Verifica na lista de negociações possíveis qual negociação não está vinculada a nenhuma outra mercadoria
        // 5. Vou inserir esse código na mercadoria atual e remover a negociação da lista de negociações
        // 6. Verifica se a negociação daquela mercadoria está dentro das negociações possíveis
        // 7. Se estiver vou remover ela da lista de negociações
        // 8. Se para aquela mercadoria só tiver um negociação possível, vou somar as quantidades
        // 9.

        // console.log("======================= Results =======================");
        // console.log(results[1].length);
        // console.log(results[1]);
        // console.log("======================= Results =======================");
        count = 0;

        const queryReusult = await new Promise(async (resolve, reject) => {
          await results[1].map(async (row) => {
            const internQuery = `select codNegociacao from relacionaMercadoria where codMercadoria = ${row.codMercPedido}`;

            const asfdasf = await new Promise(async (resolve, reject) => {
              connection.query(internQuery, (error, resultssss, fields) => {
                if (error) {
                  console.log("Error Select Negotiation to Client: ", error);
                } else {
                  let data = [];
                  for (i = 0; i < resultssss.length; i++) {
                    data.push(resultssss[i]["codNegociacao"]);
                  }

                  const mercadoria = listNegociacoes.find((item) => item.mercadoria == row.codMercPedido);

                  if (mercadoria == undefined || listNegociacoes.length == 0) {
                    listNegociacoes.push({ mercadoria: row.codMercPedido, negociacao: data });
                  }

                  console.log("mercadoria");
                  console.log(listNegociacoes);
                  console.log("mercadoria");

                  // Verifico se a mercadoria está na lista de mercadorias que será inserida
                  // console.log("******************************");
                  // console.log(row.codMercPedido);
                  // console.log(row.quantidade);
                  // console.log("******************************");

                  let verifica = verificarMercadoria(row.codMercPedido, listItens);
                  // Caso não esteja eu vou adicionar
                  if (verifica != -1) {
                    // console.log("====================================");
                    // console.log(row.codMercPedido);
                    // console.log(listItens[verifica].mercadoria.codNegoPedido);
                    // console.log(row.codNegoPedido);
                    // console.log(listItens[verifica].mercadoria.codNegoPedido == row.codNegoPedido);
                    // console.log("====================================");
                    if (listItens[verifica].mercadoria.codNegoPedido == row.codNegoPedido) {
                      novaQuantidade = listItens[verifica].mercadoria.quantidade + row.quantidade;
                      listItens[verifica].mercadoria.quantidade = novaQuantidade;
                    } else {
                      // Verifico se dentro das negociações possíveis eu tenho a que está naquela mercadoria
                      if (data.indexOf(row.codNegoPedido) == -1) {
                        // Nesse caso a código da negociação é diferente
                        // const valoresDiferentes = data.filter((element) => element != listItens[verifica].codNegoPedido);
                        // console.log("888888888888888888");
                        // console.log(`${row.codNegoPedido} - ${data[0]}`);
                        // console.log("888888888888888888");
                        row.codNegoPedido = data[0];
                        // data.splice(0, 1);
                      } else {
                        // data.splice(data.indexOf(row.codNegoPedido), 1);
                      }
                    }
                  } else {
                    let indexNego = data.indexOf(row.codNegoPedido);
                    if (indexNego == -1) {
                      row.codNegoPedido = data[0];
                      // data.splice(0, 1);
                    } else {
                      // data.splice(indexNego, 1);
                    }
                    // console.log("====================================");
                    // console.log(data);
                    // console.log(row.codNegoPedido);
                    // console.log("====================================");
                    // console.log(`Index Negociação: ${indexNego}`);

                    listItens.push({ mercadoria: row, negociacao: data });
                  }
                }
                resolve();
              });
            });
            count += 1;
            if (count == results[1].length) {
              resolve();
            }
          });
        });

        // console.log("=================================== List Itens =================================== ");
        // console.log(listItens.length);
        // console.log(listItens);
        // console.log("=================================== List Itens =================================== ");

        return res.send({ message: "Success" });
      }
    });
    // connection.end();
  },

  async GetExportNegotiationsClientTesteNovo(req, res) {
    logger.info("GET EXPORT CLIENTS TESTE NOVO");

    const { codeclient } = req.params;

    function verificarMercadoria(codigo, lista) {
      for (i = 0; i < lista.length; i++) {
        console.log(lista[i]);
        if (lista[i].codMercPedido == codigo) {
          return i; // A mercadoria foi encontrada na lista.
        }
      }
      return -1;
    }

    const queryConsult = `
    SET sql_mode = ''; select
      p.codMercPedido,
      m.nomeMercadoria as nomeMercadoria,
      m.complemento,
      m.barcode,
      m.erpcode,
      m.marca,
      p.quantMercPedido as quantidade,
      p.codFornPedido,
      p.codAssocPedido,
      p.codNegoPedido ,
      p.codMercPedido
      from pedido p
      join mercadoria m 
      where m.codMercadoria = p.codMercPedido 
      and p.codAssocPedido = ${codeclient}
      order by p.codNegoPedido`;

    let listItens = [];
    let listNegociacoes = [];

    connection.query(queryConsult, async (error, results, fields) => {
      if (error) {
        console.log("Error Export Negotiation : ", error);
      } else {
        count = 0;

        const queryReusult = await new Promise(async (resolve, reject) => {
          await results[1].map(async (row) => {
            const internQuery = `select codNegociacao from relacionaMercadoria where codMercadoria = ${row.codMercPedido}`;

            const asfdasf = await new Promise(async (resolve, reject) => {
              connection.query(internQuery, (error, resultssss, fields) => {
                if (error) {
                  console.log("Error Select Negotiation to Client: ", error);
                } else {
                  let data = [];
                  for (i = 0; i < resultssss.length; i++) {
                    if (data.indexOf(resultssss[i]["codNegociacao"]) == -1) {
                      data.push(resultssss[i]["codNegociacao"]);
                    }
                  }

                  console.log("\n================================================");
                  console.log(`Mercadoria: ${row.codMercPedido}`);

                  const mercadoria = listNegociacoes.findIndex((item) => item.mercadoria == row.codMercPedido);
                  console.log(`Index: ${mercadoria}`);

                  if (listNegociacoes[mercadoria] == undefined || listNegociacoes.length == 0) {
                    console.log("Primeira inserção na lista de negociações");
                    let indexNego = data.indexOf(row.codNegoPedido);
                    if (indexNego != -1) {
                      data.splice(indexNego, 1);
                    } else {
                      row.codNegoPedido = data[0];
                      data.splice(0, 1);
                    }

                    listNegociacoes.push({ mercadoria: row.codMercPedido, negociacao: data });
                    listItens.push(row);
                  } else {
                    console.log("Else, segunda opção caso lista de negociações não seja vazia");

                    let indexNego = listNegociacoes[mercadoria].negociacao.indexOf(row.codNegoPedido);
                    console.log(`Index da negociação ${indexNego}`);
                    if (indexNego != -1) {
                      listNegociacoes[mercadoria].negociacao.splice(indexNego, 1);
                      listItens.push(row);
                    } else {
                      console.log(`Else para confirmar que lista de negociações está vazia`);

                      // VERIFICAR ESSA CONDIÇÃO NOVAMENTE
                      if (listNegociacoes[mercadoria].negociacao.length > 0) {
                        console.log(`Lista de negociações da Mercadoria ${row.codMercPedido}`);
                        console.log(listNegociacoes[mercadoria].negociacao);
                        row.codNegoPedido = listNegociacoes[mercadoria].negociacao[0];
                        listNegociacoes[mercadoria].negociacao.splice(0, 1);
                        listItens.push(row);
                      } else {
                        let indexLista = verificarMercadoria(row.codMercPedido, listItens);

                        console.log(`Mercadoria: ${listItens[indexLista]}`);
                        console.log(`Mercadoria Detalhes: ${listItens[indexLista].codMercPedido}`);
                        console.log(`Quantidade na negociação anterior : ${listItens[indexLista].quantidade}`);

                        let novaQuantidade = listItens[indexLista].quantidade + row.quantidade;
                        listItens[indexLista].quantidade = novaQuantidade;
                        console.log(`Nova Quantidade: ${novaQuantidade}`);
                      }
                    }
                  }
                }
                resolve();
              });
            });
            count += 1;
            if (count == results[1].length) {
              resolve();
            }
          });
        });

        console.log("\n================================================\n");

        let csvData = `ID;Negociacao;Codigo ERP;Codigo de barras;Produto;Complemento;Valor;Valor (NF unitario);Valor (NF embalagem);Tipo Embalagem;Qtde. Embalagem;Qtde. Minima;Modalidade;Data inicio encarte;Data fim encarte;Termino negociacao;Marca;Estoque;Quantidade\n`;

        csvData += listItens
          .map((row) => {
            return ` ${row.codMercPedido};${row.codNegoPedido};${row.erpcode};${row.barcode};${row.nomeMercadoria};${row.complemento};;;;;;;;;;;${row.marca};;${row.quantidade}`; // Substitua com os nomes das colunas do seu banco de dados
          })
          .join("\n");

        const dateNow = Date.now();

        // Configurar os cabeçalhos de resposta para fazer o download
        res.setHeader("Content-Disposition", `attachment; filename=${dateNow}_negociacoes.csv`);
        res.setHeader("Content-Type", "text/csv");

        console.log("=================================== List Itens =================================== ");
        console.log(listItens.length);
        console.log(listItens);
        console.log("=================================== List Itens =================================== ");

        // Transmitir o arquivo CSV como resposta
        return res.send(csvData);

        // return res.send({ message: "Success" });
      }
    });
    // connection.end();
  },

  async getRelacionaNegociacaoMercadoria(codMercPedido) {
    const internQuery = `select codNegociacao from relacionaMercadoria where codMercadoria = ${codMercPedido}`;
    let negociacao = row.codNegoPedido;
    let data = [];

    connection.query(internQuery, (error, results, fields) => {
      if (error) {
        console.log("Error Select Negotiation to Client: ", error);
      } else {
        for (i = 0; i < results.length; i++) {
          data.push(results[i]["codNegociacao"]);
        }

        // console.log("-----------------------------------------");
        // if (data.indexOf(row.codNegoPedido) == -1) {
        //   console.log(row.codMercPedido);
        //   console.log(data[0]);
        //   negociacao = data[0];

        // }
        // console.log("-----------------------------------------");
      }
    });
    return data;
  },

  async getNegotiationClient(req, res) {
    logger.info("getNegotiationClient");

    const { codclient, codforn } = req.params;

    const queryConsult =
      "SET sql_mode = ''; select codNegociacao,prazo, observacao, descNegociacao, (pedido.codNegoPedido) as 'confirma' from negociacao left outer join pedido on (negociacao.codNegociacao = pedido.codNegoPedido) and pedido.codAssocPedido = " +
      codclient +
      "	where negociacao.codFornNegociacao  = " +
      codforn +
      " GROUP BY negociacao.codNegociacao ORDER BY prazo";

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Negotiation to Client: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getNegotiationsProviderWithMerchandisePerClient(req, res) {
    logger.info("getNegotiationsProviderWithMerchandisePerClient");

    const { codclient, codforn } = req.params;

    const queryConsult =
      "SET sql_mode = ''; select codNegociacao,prazo, observacao, descNegociacao, (pedido.codNegoPedido) as 'confirma' from negociacao left outer join pedido on (negociacao.codNegociacao = pedido.codNegoPedido) and pedido.codAssocPedido = " +
      codclient +
      "	where negociacao.codFornNegociacao  = " +
      codforn +
      " GROUP BY negociacao.codNegociacao ORDER BY prazo";

    connection.query(queryConsult, async (error, results, fields) => {
      if (error) {
        console.log("Error Select Negotiation to Client: ", error);
      } else {
        let allResult = [];
        const queryReusult = await new Promise(async (resolve, reject) => {
          await Promise.all(results[1].map(async (negotiation) => {
            const queryConsult = `SET sql_mode = ''; select mercadoria.codMercadoria as codMercadoria, mercadoria.nomeMercadoria as nomeMercadoria,mercadoria.complemento, mercadoria.marca, mercadoria.precoUnit, mercadoria.embMercadoria, mercadoria.fatorMerc, mercadoria.precoMercadoria as precoMercadoria, IFNULL(SUM(pedido.quantMercPedido), 0) as quantMercadoria FROM mercadoria left outer JOIN pedido ON(mercadoria.codMercadoria = pedido.codMercPedido) and pedido.codAssocPedido =  ${codclient}  and pedido.codNegoPedido = ${negotiation["codNegociacao"]} where mercadoria.nego = ${negotiation["codNegociacao"]} and mercadoria.codFornMerc = ${codforn} GROUP BY mercadoria.codMercadoria ORDER BY nomeMercadoria, marca`;

            const queryMerhcandises = await new Promise(async (resolves, reject) => {
              connection.query(queryConsult, (error, merchandises, fields) => {
                if (error) {
                  console.log("Error Select Merchandise Provider If Client: ", error);
                } else {
                  negotiation.merchandises = merchandises[1];
                  allResult.push(negotiation);
                }
                resolves();
              });
            });
          }));
          console.log(allResult);
          resolve()
        });
        return res.json(allResult);
      }
    });
    // connection.end();
  },

  async getNegotiationClientWithPrice(req, res) {
    logger.info("getNegotiationClientWithPrice");

    const { codclient, codforn } = req.params;

    const queryConsult = `SET sql_mode = ''; 
    select codNegociacao,
    descNegociacao,
    prazo,
    observacao,
    codNegoErp,
    sum(pedido.quantMercPedido * mercadoria.precoMercadoria) as 'total',
    descNegociacao, (pedido.codNegoPedido) as 'confirma'
    from negociacao 
    left outer join pedido on(negociacao.codNegociacao = pedido.codNegoPedido)
    left join mercadoria on pedido.codMercPedido = mercadoria.codMercadoria
    and pedido.codAssocPedido = ${codclient}
    where negociacao.codFornNegociacao = ${codforn}
    GROUP BY negociacao.codNegociacao 
    ORDER BY confirma desc`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Negotiation to Client: ", error);
      } else {

        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getNegotiationClientsWithPriceNotNull(req, res) {
    logger.info("getNegotiationClientsWithPriceNotNull");

    const { codclient, codforn } = req.params;

    const queryConsult = `SET sql_mode = ''; 
    SELECT 
    negociacao.codNegociacao,
    negociacao.descNegociacao,
    negociacao.prazo,
    negociacao.observacao,
    negociacao.codNegoErp,
    SUM(pedido.quantMercPedido * mercadoria.precoMercadoria) AS 'total',
    negociacao.descNegociacao, 
    pedido.codNegoPedido AS 'confirma'
    FROM 
        negociacao
    LEFT OUTER JOIN 
        pedido ON negociacao.codNegociacao = pedido.codNegoPedido
    LEFT JOIN 
        mercadoria ON pedido.codMercPedido = mercadoria.codMercadoria
        AND pedido.codAssocPedido = ${codclient}
    WHERE 
        negociacao.codFornNegociacao = ${codforn}
    GROUP BY 
        negociacao.codNegociacao
    HAVING 
        SUM(pedido.quantMercPedido * mercadoria.precoMercadoria) IS NOT NULL
    ORDER BY 
        confirma DESC;`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Negotiation to Client: ", error);
      } else {

        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async PostInsertNegotiation(req, res) {
    logger.info("Post Save Negotiation");

    const { codNegociacao, descNegociacao, codFornNegociacao, prazo, observacao, codNegoErp } = req.body;

    let data = {
      codNegociacao: codNegociacao,
      descNegociacao: descNegociacao,
      codFornNegociacao: codFornNegociacao,
      prazo: prazo,
      observacao: observacao,
      codNegoErp: codNegoErp,
    };

    let params = {
      table: "negociacao",
      data: data,
    };
    return Insert(params)
      .then(async (resp) => {
        res.status(200).send(`message: Save Success!`);
      })
      .catch((error) => {
        res.status(400).send(error);
      });

    // connection.end();
  },

  async PostInsertNegotiationRelacionaMercadoria(req, res) {
    logger.info("Post Save Negotiation");

    const { codMercadoria, codNegociacao } = req.body;

    let data = {
      codMercadoria: codMercadoria,
      codNegociacao: codNegociacao,
    };

    let params = {
      table: "relacionaMercadoria",
      data: data,
    };
    return Insert(params)
      .then(async (resp) => {
        res.status(200).send(`message: Save Success!`);
      })
      .catch((error) => {
        res.status(400).send(error);
      });

    // connection.end();
  },

  async GetNegotiationsClients(req, res) {
    logger.info("GetNegotiationsClients");

    const { category } = req.params;

    const queryConsult = `select * from negociacao`;

    connectionMultishow.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Negotiation to Client: ", error);
      } else {
        return res.json(results[1]);
      }
    });

    // connection.end();
  },

  async defaultInsert(req, res) {
    logger.info("Get Negotiations Clients");

    return Insert(params)
      .then(async (resp) => {
        res.status(200).send(`message: Save Success!`);
      })
      .catch((error) => {
        res.status(400).send(error);
      });

    // connection.end();
  },

  async changeNegotiationStatus(req, res) {
    const { code } = req.params;

    const queryUpdate = `UPDATE organizador SET ativo = ${code}`;

    connection.query(queryUpdate, (error, results, fields) => {
      if (error) {
        console.log("Error Updating Organization Status: ", error);
        return res.status(500).json({ error: 'Erro ao atualizar status' });
      } else {
        return res.json(results[1]);
      }
    });
  },

  async negotiationStatus(req, res) {
    const { code } = req.params;

    const queryUpdate = `select ativo from organizador`;

    connection.query(queryUpdate, (error, results, fields) => {
      if (error) {
        console.log("Error Get Organization Status: ", error);
        return res.status(500).json({ error: 'Erro ao pegar status' });
      } else {
        return res.json(results[0]);
      }
    });
  }


};

module.exports = Negotiation;
