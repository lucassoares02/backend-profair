const { connection } = require("@server");
const logger = require("@logger");
const Select = require("@select");
const Insert = require("@insert");

const Client = {



  async allAccess(req, res) {
    logger.info("Get All Clients");

    const params = req.body;
    console.log(params);

    const queryConsult = "select * from acesso";

    try {
      connection.ping(error => {
        if (error) {
          console.error('Conexão perdida. Tentando reconectar...', error);
          connectDatabase(); // Recria a conexão
          reject(error);
          return;
        }
      });
    } catch (error) {

    }

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Users: ", error);
      } else {
        return res.json(results);
      }
    });


    // connection.end();
  },

  async checkCodeUser(req, res) {
    logger.info("Get Check Code User");

    const { code } = req.params;

    const queryConsult =
      `SELECT EXISTS (SELECT 1 FROM acesso WHERE codAcesso = ${code}) AS exist;`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Users: ", error);
      } else {
        return res.json(results);
      }
    });
    // connection.end();
  },

  async getAllClient(req, res) {
    logger.info("Get All Clients");

    const params = req.body;
    console.log(params);

    const queryConsult =
      "SET sql_mode = ''; select relaciona.codAssocRelaciona, consultor.nomeConsult, relaciona.codConsultRelaciona, associado.razaoAssociado,  associado.cnpjAssociado, FORMAT(ifnull(sum(mercadoria.precoMercadoria*pedido.quantMercPedido), 0 ), 2, 'de_DE') as 'valorTotal', ifnull(sum(pedido.quantMercPedido), 0) as 'volumeTotal' from associado join relaciona on relaciona.codConsultRelaciona = associado.codAssociado join consultor on consultor.codConsult = relaciona.codAssocRelaciona left join pedido on pedido.codAssocPedido = relaciona.codConsultRelaciona left join mercadoria on codMercadoria = pedido.codMercPedido group by relaciona.codConsultRelaciona order by sum(mercadoria.precoMercadoria*pedido.quantMercPedido) desc";

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Users: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getOneClient(req, res) {
    logger.info("Get One Clients");

    const { codacesso, consultant_id, supplier_id, client_id, associate_id } = req.params;

    const queryConsult =
      `SET sql_mode = ''; select acesso.codAcesso,
      acesso.direcAcesso, 
     associado.razaoAssociado AS nomeForn,
      associado.cnpjAssociado AS cnpjForn,
      acesso.codUsuario, 
     o.ativo,
     associado.codAssociado AS codForn,
      consultor.nomeConsult,
      consultor.cpfConsult 
     FROM acesso
      JOIN consultor ON acesso.codUsuario = consultor.codConsult 
     JOIN associado ON consultor.codFornConsult = associado.codAssociado 
     join organizador o on o.codOrg = acesso.codOrganization
     WHERE acesso.codAcesso = ${codacesso};`

    try {
      connection.query(queryConsult, (error, results, fields) => {
        if (error) {
          logger.error("Error Select Client: ", error);
        } else {
          return res.json(results[1]);
        }
      });

    } catch (error) {
      logger.error(`Error Select Client: ${error}`)
    }
  },


  async getOneClientNew(req, res) {
    logger.info("Get One Clients");

    const { user, consultant_id, supplier_id } = req.params;

    const insertNegotiation = `
      INSERT INTO negotiation_windows (
        consultant_id,
        supplier_id,
        client_id,
        start_at
      ) VALUES (${consultant_id}, ${supplier_id}, ${user}, NOW());
    `;

    console.log(insertNegotiation);

    const queryConsult = `
    SET sql_mode = ''; select
    relaciona.codAssocRelaciona as codAssociado,
    concat(relaciona.codConsultRelaciona, " - ", associado.razaoAssociado) as cnpjAssociado,
    consultor.nomeConsult, 
    relaciona.codConsultRelaciona,
    associado.razaoAssociado,
    associado.cnpjAssociado as cnpj, 
    IFNULL(sum(mercadoria.precoMercadoria*pedido.quantMercPedido),0) as 'valor',
    IFNULL(sum(pedido.quantMercPedido), 0) as 'volume'
    from consultor
    inner join relaciona on consultor.codConsult = relaciona.codAssocRelaciona
    inner join associado on associado.codAssociado = relaciona.codConsultRelaciona 
    left join pedido on pedido.codAssocPedido = relaciona.codConsultRelaciona 
    left join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido 
    where relaciona.codAssocRelaciona = ${user}
    group by relaciona.codConsultRelaciona 
    order by valor 
    desc`;

    try {
      // Primeiro insere os dados na tabela negotiation_windows
      connection.query(insertNegotiation, (insertErr) => {
        if (insertErr) {
          logger.error("Erro ao inserir negotiation_window:", insertErr);
          return res.status(500).json({ error: "Erro ao registrar período de negociação" });
        }

        // Depois executa o select normalmente
        connection.query(queryConsult, (selectErr, results) => {
          if (selectErr) {
            logger.error("Erro ao buscar dados do cliente:", selectErr);
            return res.status(500).json({ error: "Erro ao buscar dados" });
          }

          return res.json(results[1]); // ou results[0], dependendo de como o driver do MySQL retorna múltiplas queries
        });
      }
      );

    } catch (error) {
      logger.error(`Erro inesperado: ${error}`);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  },


  async getClientConsult(req, res) {
    logger.info("Get Clients to Consult");

    const { codconsultor } = req.params;

    const queryConsult =
      "SET sql_mode = ''; select codAssociado, cnpjAssociado, razaoAssociado, codAssociado, FORMAT(ifnull(sum(mercadoria.precoMercadoria*pedido.quantMercPedido),0), 2, 'de_DE') as 'valorTotal', ifnull(sum(pedido.quantMercPedido), 0) as 'volumeTotal' from associado left join pedido on pedido.codAssocPedido = associado.codAssociado left join relacionafornecedor on relacionafornecedor.codFornecedor = pedido.codFornPedido left join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido and relacionafornecedor.codConsultor =" +
      codconsultor +
      " group by associado.codAssociado order by sum(mercadoria.precoMercadoria*pedido.quantMercPedido) desc";

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Clients to Consult: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getStoreConsultant(req, res) {
    logger.info("Get Store to Consult");

    const { codconsultor } = req.params;

    const queryConsult = `
    SET sql_mode = ''; select
    relaciona.codAssocRelaciona as codAssociado,
    concat(relaciona.codConsultRelaciona, " - ", associado.razaoAssociado) as cnpjAssociado,
    consultor.nomeConsult, 
    relaciona.codConsultRelaciona,
    associado.razaoAssociado,
    associado.cnpjAssociado as cnpj, 
    IFNULL(sum(mercadoria.precoMercadoria*pedido.quantMercPedido),0) as 'valor',
    IFNULL(sum(pedido.quantMercPedido), 0) as 'volume'
    from consultor
    inner join relaciona on consultor.codConsult = relaciona.codAssocRelaciona
    inner join associado on associado.codAssociado = relaciona.codConsultRelaciona 
    left join pedido on pedido.codAssocPedido = relaciona.codConsultRelaciona 
    left join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido 
    where relaciona.codAssocRelaciona = ${codconsultor}
    group by relaciona.codConsultRelaciona 
    order by valor 
    desc`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Store to Consult: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getClientMerchandise(req, res) {
    logger.info("Get Clients to Merchandise");

    const { codmercadoria, codnegotiation } = req.params;

    const queryConsult = `
    SET sql_mode = ''; select 
    mercadoria.codMercadoria, 
    mercadoria.codFornMerc,
    mercadoria.nomeMercadoria,
    mercadoria.embMercadoria,
    associado.razaoAssociado as razao,
    associado.codAssociado,
    mercadoria.precoMercadoria as precoMercadoria, 
    IFNULL(SUM(pedido.quantMercPedido), 0) as fatorMerc,
    IFNULL(sum(mercadoria.precoMercadoria*pedido.quantMercPedido),0) as 'valorTotal'
    from mercadoria 
    left outer join pedido on mercadoria.codMercadoria = pedido.codMercPedido 
    left join associado on associado.codAssociado = pedido.codAssocPedido
    where mercadoria.codMercadoria = ${codmercadoria} 
    group by pedido.codAssocPedido
    order by sum(mercadoria.precoMercadoria*pedido.quantMercPedido) 
    desc`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Clients to Merchandise: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getClientMerchandiseTrading(req, res) {
    logger.info("Get Clients to Merchandise");

    const { codmercadoria, codnegotiation } = req.params;

    const queryConsult = `
    SET sql_mode = ''; select 
    mercadoria.codMercadoria, 
    mercadoria.codFornMerc,
    mercadoria.nomeMercadoria,
    mercadoria.embMercadoria,
    associado.razaoAssociado as razao,
    associado.codAssociado,
    mercadoria.precoMercadoria as precoMercadoria, 
    IFNULL(SUM(pedido.quantMercPedido), 0) as fatorMerc,
    IFNULL(sum(mercadoria.precoMercadoria*pedido.quantMercPedido),0) as 'valorTotal'
    from mercadoria 
    left outer join pedido on mercadoria.codMercadoria = pedido.codMercPedido 
    left join associado on associado.codAssociado = pedido.codAssocPedido
    where mercadoria.codMercadoria = ${codmercadoria} 
    and pedido.codNegoPedido = ${codnegotiation}
    group by pedido.codAssocPedido
    order by sum(mercadoria.precoMercadoria*pedido.quantMercPedido) 
    desc`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Clients to Merchandise: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getStoresCategory(req, res) {
    logger.info("Get Clients to Category");

    const { codprovider } = req.params;

    const queryConsult =
      "SET sql_mode = ''; select relaciona.codAssocRelaciona, consultor.nomeConsult, relaciona.codConsultRelaciona, associado.razaoAssociado, associado.cnpjAssociado, FORMAT( IFNULL(sum(mercadoria.precoMercadoria*pedido.quantMercPedido), 0), 2, 'de_DE') as 'valorTotal',  IFNULL(sum(pedido.quantMercPedido), 0) as 'volumeTotal' from associado join relaciona on relaciona.codConsultRelaciona = associado.codAssociado join consultor on consultor.codConsult = relaciona.codAssocRelaciona left join pedido on pedido.codAssocPedido = relaciona.codConsultRelaciona join fornecedor on fornecedor.codForn = pedido.codFornPedido left join mercadoria on codMercadoria = pedido.codMercPedido where fornecedor.codForn = " +
      codprovider +
      " group by relaciona.codConsultRelaciona order by sum(mercadoria.precoMercadoria*pedido.quantMercPedido) desc";

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Clients to Category: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getAllStores(req, res) {
    logger.info("Get All Stores");

    // const queryConsult = `
    // SET sql_mode = ''; select
    // relaciona.codAssocRelaciona,
    // consultor.nomeConsult,
    // relaciona.codConsultRelaciona,
    // associado.razaoAssociado as razao,
    // associado.cnpjAssociado,
    // IFNULL(sum(mercadoria.precoMercadoria*pedido.quantMercPedido), 0) as 'valorTotal',
    // IFNULL(sum(pedido.quantMercPedido), 0) as 'volumeTotal'
    // from associado
    // join relaciona on relaciona.codConsultRelaciona = associado.codAssociado
    // join consultor on consultor.codConsult = relaciona.codAssocRelaciona
    // left join pedido on pedido.codAssocPedido = relaciona.codConsultRelaciona
    // left join mercadoria on codMercadoria = pedido.codMercPedido
    // group by relaciona.codConsultRelaciona
    // order by sum(mercadoria.precoMercadoria*pedido.quantMercPedido)
    // desc`;
    const queryConsult = `
    SET sql_mode = ''; select
    associado.codAssociado,
    associado.razaoAssociado as razao,
    associado.cnpjAssociado, 
    IFNULL(sum(mercadoria.precoMercadoria*pedido.quantMercPedido), 0) as 'valorTotal',
    IFNULL(sum(pedido.quantMercPedido), 0) as 'volumeTotal' 
    from associado  
    left join pedido on pedido.codAssocPedido = associado.codAssociado
    left join mercadoria on codMercadoria = pedido.codMercPedido   
    group by associado.codAssociado
    order by sum(mercadoria.precoMercadoria*pedido.quantMercPedido) 
    desc`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select All Stores: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getStoresPresentbyProvider(req, res) {
    logger.info("Get Stores by Provider");

    const { codprovider } = req.params;

    const queryConsult = `SET sql_mode = '';
    SELECT  
        a.codAssociado,
        a.razaoAssociado AS razao,
        a.cnpjAssociado,
        SUM(IF(p.codFornPedido = ${codprovider}, p.quantMercPedido * m.precoMercadoria, 0)) AS valorTotal,
        SUM(IF(p.codFornPedido = ${codprovider}, p.quantMercPedido, 0)) AS volumeTotal
    FROM (
        SELECT DISTINCT a.codAssociado, a.razaoAssociado, a.cnpjAssociado
        FROM acesso ac
        JOIN consultor c ON c.codConsult = ac.codUsuario
        JOIN relaciona r ON r.codAssocRelaciona = c.codConsult
        JOIN associado a ON a.codAssociado = r.codConsultRelaciona
        where ac.is_present = 1
    ) AS a
    LEFT JOIN pedido p ON p.codAssocPedido = a.codAssociado
    LEFT JOIN mercadoria m ON m.codMercadoria = p.codMercPedido
    GROUP BY a.codAssociado
    ORDER BY valorTotal DESC;`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Stores by Provider: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getStoresbyProvider(req, res) {
    logger.info("Get Stores by Provider");

    const { codprovider } = req.params;

    const queryConsult = `SET sql_mode = ''; select  
    p.codPedido ,
    a.codAssociado ,
    a.razaoAssociado  as razao,
    a.cnpjAssociado ,
    sum(IFNULL(p.quantMercPedido * m.precoMercadoria, 0)) as 'valorTotal',
    sum(IFNULL(p.quantMercPedido, 0)) as 'volumeTotal'
    from associado a
    left join pedido p on p.codAssocPedido = a.codAssociado 
    left join mercadoria m  on m.codMercadoria = p.codMercPedido
    and p.codFornPedido = ${codprovider}
    group by a.codAssociado 
    order by valorTotal
    desc`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Stores by Provider: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async postUser(req, res) {
    logger.info("Insert User");

    const params = req.body;

    Insert(params)
      .then(async (resp) => {
        return await Select({ table: "user", where: { id: resp.insertId } })
          .then((resp) => {
            return res.json(resp[0]);
          })
          .catch((error) => {
            return res.json(error);
          });
      })
      .catch((error) => {
        return res.json(error);
      });
  },

  async updateUsers(req, res) {
    logger.info("Post Update Users");
    const { cod, hash, name, document, phone, email } = req.body;

    if (cod != null) {

      const queryUpdate = `START TRANSACTION;
        UPDATE consultor 
        SET nomeConsult = '${name}',
            cpfConsult = '${document}',
            telConsult = '${phone}',
            emailConsult = '${email}'
        WHERE codConsult = ${cod};

        UPDATE acesso 
        SET codAcesso = ${hash} 
        WHERE codUsuario = ${cod};
        COMMIT; SHOW ERRORS;
        `;


      console.log(queryUpdate);

      connection.query(queryUpdate, (error, results, fields) => {
        if (error) {
          console.log("Error Update Users: ", error);
          return res.status(400).send(`message: ${error}`);
        } else {
          console.log("updated");
          return res.json({ "message": "updated" });
        }
      });
    } else {
      return res.status(400).send(`message: Nothing Result!`);
    }

  },


  // Remover
  async updatePerson(req, res) {
    logger.info("Post Update Person");
    const { cod, type, hash, name, company, typeUser, document } = req.body;

    if (hash != null) {

      const queryUpdate = `update acesso set 
      codAcesso = ${hash} where codUsuario = ${cod}`;

      console.log(queryUpdate);

      connection.query(queryUpdate, (error, results) => {
        if (error) {
          console.log("Error Update Person: ", error);
          return res.status(400).send(`message: ${error}`);
        } else {
          console.log("updated");
          return res.json({ "message": "updated" });
        }
      });
    } else {
      return res.status(400).send(`message: Nothing Result!`);
    }

  },

  async postInsertPerson(req, res) {
    logger.info("Post Insert Person");

    const { cod, nome, email, empresa, tel, cpf, type, hash } = req.body;

    const queryInsert = `INSERT INTO 
    consultor 
        (codConsult, nomeConsult,	cpfConsult,	telConsult,	codFornConsult,	emailConsult) 
    VALUES (${cod},'${nome}', '${cpf}', '${tel}', '${empresa}', '${email}')`;

    console.log("queryInsert");
    console.log(queryInsert);

    //=============================================================
    //=============================================================
    //=============================================================

    let result = true;
    let response = "";

    connection.query(queryInsert, (error, results) => {
      if (error) {
        result = false;
        console.log("Error Insert Person: ", error);
        return;
      } else {
        console.log("inserido consultor");
        response = results;
        return;
      }
    });

    //=============================================================
    //=============================================================
    //=============================================================

    if (result) {
      const queryAccess = `insert into acesso (codAcesso, direcAcesso, codUsuario, codOrganization) values(${hash}, ${type}, ${cod}, 158)`;

      console.log("queryAccess");
      console.log(queryAccess);

      connection.query(queryAccess, (error, results) => {
        if (error) {
          console.log("Error Insert Acesso: ", error);
          result = false;
          return;
        } else {
          console.log("inserido acesso");
          return;
        }
      });
    }

    //=============================================================
    //=============================================================
    //=============================================================

    if (result) {
      await Client.insertRelationUsersProvider(cod, empresa, type);
      return res.json({ "message": "saved" });
    } else {
      return res.status(400).send(`message: Nothing Result!`);
    }
  },


  async insertRelationProviderClient(req, res) {
    logger.info("Post Update Provider Person");
    const { cod, empresa, type } = req.body;

    console.log(cod);
    console.log(empresa);
    console.log(type);

    if (cod != null) {
      await Client.insertRelationProvider(cod, empresa, type);
      return res.json({ "message": "updated" });


    }
  },

  async getAllStoresGraph(req, res) {
    logger.info("Get All Stores Graphs");

    const queryConsult = `
    SET sql_mode = ''; select 
    pedido.codPedido ,
    associado.cnpjAssociado ,
    associado.codAssociado ,
    consultor.nomeConsult,
    pedido.codFornPedido,
    associado.razaoAssociado as razao,
    sum(pedido.quantMercPedido * mercadoria.precoMercadoria) as 'valorTotal',
    TIME_FORMAT(SUBTIME(pedido.dataPedido, '03:00:00'),'%H:%i') as 'horas' 
    from consultor 
    join pedido on consultor.codConsult = pedido.codComprPedido 
    join associado on pedido.codAssocPedido = associado.codAssociado 
    join mercadoria on pedido.codMercPedido = mercadoria.codMercadoria
    group by associado.codAssociado 
    order by valorTotal 
    desc limit 10
    `;

    // `SET sql_mode = ''; select
    // relaciona.codAssocRelaciona,
    // consultor.nomeConsult,
    // relaciona.codConsultRelaciona,
    // associado.razaoAssociado as razao,
    // associado.cnpjAssociado,
    // IFNULL(sum(mercadoria.precoMercadoria*pedido.quantMercPedido), 0) as 'valorTotal',
    // IFNULL(sum(pedido.quantMercPedido), 0) as 'volumeTotal'
    // from associado
    // join relaciona on relaciona.codConsultRelaciona = associado.codAssociado
    // join consultor on consultor.codConsult = relaciona.codAssocRelaciona
    // left join pedido on pedido.codAssocPedido = relaciona.codConsultRelaciona
    // left join mercadoria on codMercadoria = pedido.codMercPedido
    // group by relaciona.codConsultRelaciona
    // order by sum(mercadoria.precoMercadoria*pedido.quantMercPedido)
    // desc limit 10`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select All Stores Graphs: ", error);
      } else {
        let item = [];

        let total = 0;

        for (let j = 0; j < results[1].length; j++) {
          total += results[1][j]["valorTotal"];
        }

        i = 0;
        for (i = 0; i < results[1].length; i++) {
          item.push({
            razao: results[1][i]["razao"],
            percentage: Math.floor((results[1][i]["valorTotal"] / total) * 100) + "%",
            value: results[1][i]["valorTotal"],
          });
        }

        response = {
          item: item,
          total: total,
        };

        return res.json(response);
      }
    });
    // connection.end();
  },


  async getAllProvidersGraph(req, res) {
    logger.info("Get All Providers Graphs");

    const queryConsult = `
    SET sql_mode = ''; select 
    pedido.codPedido ,
    fornecedor.cnpjForn as 'cnpjAssociado' ,
    fornecedor.codForn as 'codAssociado',
    consultor.nomeConsult,
    pedido.codFornPedido,
    fornecedor.razaoForn as 'razao',
    sum(pedido.quantMercPedido * mercadoria.precoMercadoria) as 'valorTotal',
    TIME_FORMAT(SUBTIME(pedido.dataPedido, '03:00:00'),'%H:%i') as 'horas' 
    from consultor 
    join pedido on consultor.codConsult = pedido.codComprPedido 
    join fornecedor on pedido.codFornPedido = fornecedor.codForn 
    join mercadoria on pedido.codMercPedido = mercadoria.codMercadoria
    group by fornecedor.codForn
    order by valorTotal 
    desc limit 10
    `;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select All Stores Graphs: ", error);
      } else {
        let item = [];

        let total = 0;

        for (let j = 0; j < results[1].length; j++) {
          total += results[1][j]["valorTotal"];
        }

        i = 0;
        for (i = 0; i < results[1].length; i++) {
          item.push({
            razao: results[1][i]["razao"],
            percentage: Math.floor((results[1][i]["valorTotal"] / total) * 100) + "%",
            value: results[1][i]["valorTotal"],
          });
        }

        response = {
          item: item,
          total: total,
        };

        return res.json(response);
      }
    });
    // connection.end();
  },

  async getAllStoresGraphHour(req, res) {
    logger.info("Get All Stores Graphs");

    const queryConsult = `SET sql_mode = ''; select 
    date_format(SUBTIME(dataPedido, '03:00:00'), '%Y-%m-%d %H:%i')  as hour,
    SUM(p.quantMercPedido * m.precoMercadoria) as value
    from pedido p
    join mercadoria m on m.codMercadoria = p.codMercPedido 
    group by hour
    order by hour`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select All Stores Graphs: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getAllStoresGraphEvolution(req, res) {
    logger.info("Get All Stores Graphs");

    const queryConsult = `SET sql_mode = ''; 
      WITH time_intervals AS (
          SELECT 
              date_format(SUBTIME(dataPedido, '03:00:00'), '%Y-%m-%d %H:%i') as hour,
              SUM(p.quantMercPedido * m.precoMercadoria) as value
          FROM pedido p
          JOIN mercadoria m ON m.codMercadoria = p.codMercPedido
          GROUP BY hour
      )
      SELECT 
          hour,
          SUM(value) OVER (ORDER BY hour ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as value
      FROM time_intervals
      ORDER BY hour;
      `;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select All Stores Graphs: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getSellGraphHourProvider(req, res) {
    logger.info("Get Stores Graphs Provider");

    const { codeprovider } = req.params;

    const queryConsult = `SET sql_mode = '';
    SELECT
        date_format(SUBTIME(dataPedido, '03:00:00'), '%Y-%m-%d %H:%i') AS hour,
        SUM(p.quantMercPedido * m.precoMercadoria) AS value,
        SUM(SUM(p.quantMercPedido * m.precoMercadoria)) OVER (
            ORDER BY dataPedido
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS total_value
    FROM pedido p
    JOIN mercadoria m ON m.codMercadoria = p.codMercPedido
    WHERE codFornPedido = ${codeprovider}
    GROUP BY hour
    ORDER BY hour;`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select All Stores Graphs: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getValueTotalFair(req, res) {
    logger.info("Get All Value Fair");

    const queryConsult = `SET sql_mode = ''; select 
    SUM(p.quantMercPedido * m.precoMercadoria) as value
    from pedido p
    join mercadoria m on m.codMercadoria = p.codMercPedido 
    order by value`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select All Value Fair: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },


  insertRelationUsersProvider(cod, empresa, type) {
    console.log("Insert Relation Provider");

    console.log("\n---------------------------------------------------");
    console.log(cod);
    console.log("---------------------------------------------------\n");

    let dataConsultor = [];

    dataConsultor.push({
      codConsultor: cod,
      codFornecedor: empresa,
    })



    let params = {
      table: "relacionafornecedor",
      data: dataConsultor,
    };

    console.log(params)


    try {
      return new Promise((resolve, reject) => {
        return Insert(params)
          .then(async (resp) => {
            resolve(resp);
          })
          .catch((error) => {
            res.status(400).send(error);
          });
      });
    } catch (error) {
      console.log(`Error Insert Negotiation: ${error}`)
    }

  },

    insertRelationProvider(cod, empresas, type) {
    console.log("Insert Relation Provider");

    console.log("\n---------------------------------------------------");
    console.log(cod);
    console.log("---------------------------------------------------\n");

    let dataAssociado = [];
    let dataConsultor = [];

    for (let index = 0; index < empresas.length; index++) {
      const empresa = empresas[index];

      if (type == 1) {
        dataConsultor.push({
          codConsultor: cod,
          codFornecedor: empresa.codForn,
        })
      } else {
        dataAssociado.push({
          codAssocRelaciona: cod,
          codConsultRelaciona: empresa.codForn,
        });
      }
    }



    let params = {
      table: type == 1 ? "relacionafornecedor" : "relaciona",
      data: type == 1 ? dataConsultor : dataAssociado,
    };

    console.log(params)


    try {
      return new Promise((resolve, reject) => {
        return Insert(params)
          .then(async (resp) => {
            resolve(resp);
          })
          .catch((error) => {
            res.status(400).send(error);
          });
      });
    } catch (error) {
      console.log(`Error Insert Negotiation: ${error}`)
    }

  },

  insertRelationProvider2(cod, empresas, type) {
    console.log("Insert Relation Provider");

    console.log("\n---------------------------------------------------");
    console.log(cod);
    console.log("---------------------------------------------------\n");

    let dataAssociado = [];
    let dataConsultor = [];

    for (let index = 0; index < empresas.length; index++) {
      const empresa = empresas[index];

      if (type == 1) {
        dataConsultor.push({
          codConsultor: cod,
          codFornecedor: empresa,
        })
      } else {
        dataAssociado.push({
          codAssocRelaciona: cod,
          codConsultRelaciona: empresa,
        });
      }
    }



    let params = {
      table: type == 1 ? "relacionafornecedor" : "relaciona",
      data: type == 1 ? dataConsultor : dataAssociado,
    };

    console.log(params)


    try {
      return new Promise((resolve, reject) => {
        return Insert(params)
          .then(async (resp) => {
            resolve(resp);
          })
          .catch((error) => {
            res.status(400).send(error);
          });
      });
    } catch (error) {
      console.log(`Error Insert Negotiation: ${error}`)
    }

  },

  async postInsertUser(req, res) {
    logger.info("Post Insert User");

    const { nome, email, empresas, tel, cpf, type, hash } = req.body;

    let query = "";
    let parseEmpresas = [];

    if (type == 3) {
      query = `START TRANSACTION;
          INSERT INTO consultor 
              (nomeConsult, cpfConsult, telConsult, codFornConsult, emailConsult) 
          VALUES 
              ('${nome}', '${cpf}', '${tel}', '158', '${email}');SET @consultorId = LAST_INSERT_ID();
  
          INSERT INTO acesso 
              (codAcesso, direcAcesso, codUsuario, codOrganization) 
          VALUES 
              (${hash}, ${type}, LAST_INSERT_ID(), 158);
          COMMIT;
        `;

    } else {
      parseEmpresas = JSON.parse(empresas);

      query = `START TRANSACTION;
          INSERT INTO consultor 
              (nomeConsult, cpfConsult, telConsult, codFornConsult, emailConsult) 
          VALUES 
              ('${nome}', '${cpf}', '${tel}', '${parseEmpresas[0]}', '${email}');SET @consultorId = LAST_INSERT_ID();
  
          INSERT INTO acesso 
              (codAcesso, direcAcesso, codUsuario, codOrganization, is_present) 
          VALUES 
              (${hash}, ${type}, LAST_INSERT_ID(), 158,0);
          COMMIT; SHOW WARNINGS;
          SELECT @consultorId AS consultor; 
        `;

    }


    console.log("queryAccess");
    console.log(query);

    console.log("asf")

    try {
      await connection.query(query, async (error, results, fields) => {
        if (error) {
          console.log("Error Insert Acesso: ", error);
          return res.status(400).send(`message: Error Insert!`);
        } else {
          if (type != 3) {

            await Client.insertRelationProvider(results[results.length - 1][0].consultor, parseEmpresas, type);
            return res.json({ "message": "saved" });


          } else {
            return res.json({ "message": "saved" });

          }
          return;
        }
      });
    } catch (error) {
      console.log(`Error Insert User: ${error}`)
    }


  },


};

module.exports = Client;
