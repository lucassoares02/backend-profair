const { connection } = require("@server");
const logger = require("@logger");
const Select = require("@select");
const Insert = require("@insert");
const saveLogs = require('@logs');

const User = {
  async getUserDoubleCompany(req, res) {
    logger.info("GET USER DOUBLE COMPANY");
    // const { codacesso, platform, action } = req.body;
    const { codacesso } = req.body;

    try {
      saveLogs("codacesso", "action", 1);
    } catch (error) {
      console.log(`Error Save Logs: ${error}`);
    }


    const queryConsult = "select codAcesso, codOrganization, direcAcesso from acesso where codAcesso = " + codacesso;

    connection.query(queryConsult, async (error, resultsTop, fields) => {
      if (error) {
        return res.status(400).send(error);
      } else {
        console.log(resultsTop);
        if (resultsTop.length > 0) {
          if (resultsTop[0].direcAcesso == 1) {
            const queryProvider = `
            set sql_mode = '';
            select
            acesso.codAcesso,
              acesso.direcAcesso,
              fornecedor.nomeForn,
              fornecedor.cnpjForn,
              acesso.codUsuario,
              fornecedor.codForn,
              consultor.nomeConsult,
              consultor.cpfConsult,
              FORMAT(IFNULL(sum(mercadoria.precoMercadoria * pedido.quantMercPedido), 0), 2, 'de_DE') as 'valorPedido' 
            from acesso 
            join consultor on acesso.codUsuario = consultor.codConsult 
            join relacionafornecedor on consultor.codConsult = relacionafornecedor.codConsultor	
            join fornecedor on relacionafornecedor.codFornecedor = fornecedor.codForn 
            left join pedido on pedido.codFornPedido = fornecedor.codForn 
            left join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido 
            where acesso.codAcesso = ${codacesso}
            group by fornecedor.codForn
            order by fornecedor.nomeForn desc;
            `;

            connection.query(queryProvider, (error, results) => {
              if (error) {
                return res.status(400).send(error);
              } else {
                return res.json(results[1]);
              }
            });
            // connection.end();
          } else if (resultsTop[0].direcAcesso == 2) {
            const queryClient = `
              SET sql_mode = ''; 

              SELECT 
                  dados.codAcesso,
                  dados.direcAcesso,
                  IF(dados.total_associados > 1,
                      CONCAT(dados.codAssociado, ' - ', dados.razaoAssociado),
                      dados.razaoAssociado
                  ) AS nomeForn,
                  dados.cnpjAssociado AS cnpjForn,
                  dados.codUsuario, 
                  dados.codAssociado AS codForn,
                  dados.nomeConsult,
                  dados.cpfConsult,
                  FORMAT(IFNULL(SUM(dados.precoMercadoria * dados.quantMercPedido), 0), 2, 'de_DE') as valorPedido 
              FROM (
                  SELECT 
                      acesso.codAcesso,
                      acesso.direcAcesso,
                      associado.codAssociado,
                      associado.razaoAssociado,
                      associado.cnpjAssociado,
                      acesso.codUsuario,
                      consultor.nomeConsult,
                      consultor.cpfConsult,
                      mercadoria.precoMercadoria,
                      pedido.quantMercPedido,
                      (SELECT COUNT(DISTINCT a.codAssociado)
                      FROM acesso ac
                      JOIN consultor c ON ac.codUsuario = c.codConsult
                      JOIN relaciona r ON r.codAssocRelaciona = c.codConsult
                      JOIN associado a ON a.codAssociado = r.codConsultRelaciona
                      WHERE ac.codAcesso = '${codacesso}') AS total_associados
                  FROM acesso
                  JOIN consultor ON acesso.codUsuario = consultor.codConsult 
                  JOIN relaciona ON relaciona.codAssocRelaciona = consultor.codConsult
                  JOIN associado ON associado.codAssociado = relaciona.codConsultRelaciona
                  LEFT JOIN pedido ON pedido.codAssocPedido = associado.codAssociado 
                  LEFT JOIN mercadoria ON mercadoria.codMercadoria = pedido.codMercPedido
                  WHERE acesso.codAcesso = '${codacesso}'
              ) AS dados
              GROUP BY dados.codAssociado
              ORDER BY valorPedido DESC;
            `;
            // const queryClient = `
            //   SET sql_mode = ''; 
            //   SELECT acesso.codAcesso,
            //   acesso.direcAcesso,
            //   associado.razaoAssociado AS nomeForn,
            //   associado.cnpjAssociado AS cnpjForn,
            //   acesso.codUsuario, 
            //   associado.codAssociado AS codForn,
            //   consultor.nomeConsult, consultor.cpfConsult, 
            //   FORMAT(IFNULL(sum(mercadoria.precoMercadoria*pedido.quantMercPedido), 0), 2, 'de_DE') as valorPedido 
            //   FROM acesso
            //   join consultor on acesso.codUsuario = consultor.codConsult 
            //   join relaciona on relaciona.codAssocRelaciona = consultor.codConsult
            //   join associado on associado.codAssociado = relaciona.codConsultRelaciona
            //   left join pedido on pedido.codAssocPedido = associado.codAssociado 
            //   left join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido
            //   WHERE acesso.codAcesso = '${codacesso}'
            //   group by associado.codAssociado
            //   order by valorPedido desc;
            // `;

            // `SET sql_mode = ''; SELECT acesso.codAcesso, acesso.direcAcesso, associado.razaoAssociado AS nomeForn, associado.cnpjAssociado AS cnpjForn, acesso.codUsuario, associado.codAssociado AS codForn, consultor.nomeConsult, consultor.cpfConsult, FORMAT(IFNULL(sum(mercadoria.precoMercadoria*pedido.quantMercPedido), 0), 2, 'de_DE') as valorPedido FROM acesso join consultor on acesso.codUsuario = consultor.codConsult join relaciona on relaciona.codAssocRelaciona = consultor.codConsult join associado on associado.codAssociado = relaciona.codConsultRelaciona left join pedido on pedido.codAssocPedido = associado.codAssociado left join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido WHERE acesso.codAcesso = '${codacesso}'`;

            queryUpdate = `update negociacao_loja set active = 1 where `;

            connection.query(queryClient, (error, results) => {
              if (error) {
                return res.status(400).send(error);
              } else {
                return res.json(results[1]);
              }
            });
            // connection.end();
          } else if (resultsTop[0].direcAcesso == 3) {
            // const queryOrganization = "SET sql_mode = ''; SELECT acesso.codAcesso, acesso.direcAcesso, organizador.nomeOrg AS nomeForn, organizador.cnpjOrg AS cnpjForn, acesso.codUsuario,  organizador.codOrg AS codForn, consultor.nomeConsult, consultor.cpfConsult, consultor.emailConsult, FORMAT(IFNULL(sum(mercadoria.precoMercadoria*pedido.quantMercPedido), 0), 2, 'de_DE') as 'valorPedido' FROM acesso join consultor on acesso.codUsuario = consultor.codConsult join organizador on organizador.codOrg = consultor.codFornConsult left join pedido on pedido.codOrganizador = organizador.codOrg left join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido where codOrganizador = " + results[0].codOrganization + " and acesso.codAcesso = " + codacesso;
            // const queryOrganization = "SET sql_mode = ''; SELECT acesso.codAcesso, acesso.direcAcesso, organizador.nomeOrg AS nomeForn, organizador.cnpjOrg AS cnpjForn, acesso.codUsuario,  organizador.codOrg AS codForn, consultor.nomeConsult, consultor.cpfConsult, FORMAT(IFNULL(sum(mercadoria.precoMercadoria*pedido.quantMercPedido), 0), 2, 'de_DE') as 'valorPedido' FROM acesso join consultor on acesso.codUsuario = consultor.codConsult join organizador on organizador.codOrg = consultor.codFornConsult left join pedido on pedido.codOrganizador = organizador.codOrg left join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido and acesso.codAcesso = " + codacesso;
            const queryOrganization = `
            SET sql_mode = '';
            SELECT 
            acesso.codAcesso, 
            acesso.direcAcesso, 
            organizador.nomeOrg AS nomeForn, 
            organizador.cnpjOrg AS cnpjForn, 
            acesso.codUsuario,  organizador.codOrg AS codForn, 
            consultor.nomeConsult, 
            consultor.cpfConsult,
            FORMAT(IFNULL(sum(mercadoria.precoMercadoria*pedido.quantMercPedido), 0), 2, 'de_DE') as valorPedido 
            FROM acesso 
            join consultor on acesso.codUsuario = consultor.codConsult 
            join organizador on organizador.codOrg = consultor.codFornConsult 
            left join pedido on pedido.codOrganizador = organizador.codOrg 
            left join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido
            where organizador.codOrg = ${resultsTop[0].codOrganization} 
            and acesso.codAcesso = ${codacesso}`;

            connection.query(queryOrganization, (error, results) => {
              if (error) {
                return res.status(400).send(error);
              } else {
                return res.json(results[1]);
              }
            });
            // connection.end();
          }
        } else {
          res.json({ results: 0 });
        }
      }
      return 0;
    });
    // connection.end();
  },

  async getUser(req, res) {
    logger.info("Post Request User");
    try {
      saveLogs("req.headers.codacesso", "req.headers.action", 1);
    } catch (error) {
      console.log(`Error Save Logs: ${error}`);
    }
    const { codacesso } = req.body;

    const queryConsult = "select codAcesso, codOrganization, direcAcesso from acesso where codAcesso = " + codacesso;

    connection.query(queryConsult, async (error, results, fields) => {
      if (error) {
        return res.status(400).send(error);
      } else {
        if (results.length > 0) {

          // add token in table acesso in field token
          const queryUpdate = `UPDATE acesso SET is_present = 1 WHERE codAcesso = ${codacesso}`;
          await connection.query(queryUpdate, (error, resultsUpdate) => {
            if (error) { console.log(`Error insert token acesso: ${error}`) } else { }
          });

          if (results[0].direcAcesso == 1) {
            const queryProvider = `
            SET sql_mode = ''; select 
            acesso.codAcesso, 
            acesso.direcAcesso,
            fornecedor.nomeForn,
            fornecedor.cnpjForn,
            acesso.codUsuario,
            fornecedor.codForn, 
            consultor.nomeConsult,
            consultor.emailConsult,
            consultor.cpfConsult, 
            FORMAT(IFNULL(sum(mercadoria.precoMercadoria*pedido.quantMercPedido), 0), 2, 'de_DE') as 'valorPedido' 
            from acesso join consultor on acesso.codUsuario = consultor.codConsult
            join relacionafornecedor on consultor.codConsult = relacionafornecedor.codConsultor
              join fornecedor on relacionafornecedor.codFornecedor = fornecedor.codForn 
            left join pedido on pedido.codFornPedido = fornecedor.codForn
            left join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido 
            where acesso.codAcesso = ${codacesso}
            `;

            connection.query(queryProvider, (error, results) => {
              if (error) {
                return res.status(400).send(error);
              } else {
                return res.json(results[1]);
              }
            });
            // connection.end();
          } else if (results[0].direcAcesso == 2) {
            const queryClient = `SET sql_mode = ''; SELECT acesso.codAcesso, acesso.direcAcesso, associado.razaoAssociado AS nomeForn, associado.cnpjAssociado AS cnpjForn, acesso.codUsuario, associado.codAssociado AS codForn, consultor.nomeConsult, consultor.emailConsult, consultor.cpfConsult, FORMAT(IFNULL(sum(mercadoria.precoMercadoria*pedido.quantMercPedido), 0), 2, 'de_DE') as valorPedido FROM acesso join consultor on acesso.codUsuario = consultor.codConsult join relaciona on relaciona.codAssocRelaciona = consultor.codConsult join associado on associado.codAssociado = relaciona.codConsultRelaciona left join pedido on pedido.codAssocPedido = associado.codAssociado left join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido WHERE acesso.codAcesso = '${codacesso}'`;

            connection.query(queryClient, (error, results) => {
              if (error) {
                return res.status(400).send(error);
              } else {
                return res.json(results[1]);
              }
            });
            // connection.end();
          } else if (results[0].direcAcesso == 3) {
            const queryOrganization = `SET sql_mode = '';
            SELECT
                acesso.codAcesso,
                acesso.direcAcesso,
                organizador.nomeOrg AS nomeForn,
                organizador.cnpjOrg AS cnpjForn,
                acesso.codUsuario,
                organizador.codOrg AS codForn,
                consultor.nomeConsult,
                consultor.cpfConsult,
                consultor.emailConsult,
                -- Soma o valor total dos pedidos
                FORMAT(
                    IFNULL(
                        SUM(mercadoria.precoMercadoria * pedido.quantMercPedido),
                        0
                    ),
                    2,
                    'de_DE'
                ) AS valorPedido
            FROM acesso
            -- Junta as tabelas
            JOIN consultor ON acesso.codUsuario = consultor.codConsult
            JOIN organizador ON organizador.codOrg = consultor.codFornConsult
            LEFT JOIN pedido ON pedido.codOrganizador = organizador.codOrg
            LEFT JOIN mercadoria ON mercadoria.codMercadoria = pedido.codMercPedido
            WHERE acesso.codAcesso = ${codacesso};
            `;

            connection.query(queryOrganization, (error, results) => {
              if (error) {
                return res.status(400).send(error);
              } else {
                return res.json(results[1]);
              }
            });
            // connection.end();
          }
        } else {
          res.json({ results: 0 });
        }
      }
      return 0;
    });
    // connection.end();
  },

  async getUserWeb(req, res) {
    logger.info("Post Request User");
    // const { codacesso, action, platform } = req.body;
    const { codacesso } = req.body;

    try {
      saveLogs("codacesso", "action", 1);
    } catch (error) {
      console.log(`Error Save Logs: ${error}`);
    }

    const queryConsult = "select codAcesso, codOrganization, direcAcesso from acesso where codAcesso = " + codacesso;

    connection.query(queryConsult, async (error, results, fields) => {
      if (error || results.length == 0) {
        console.log(error);
        return res.status(400).send(error);
      } else {
        console.log(results);
        if (results[0].direcAcesso == 1) {
          const queryProvider =
            "SET sql_mode = ''; select acesso.codAcesso, acesso.direcAcesso, fornecedor.nomeForn, fornecedor.cnpjForn, acesso.codUsuario, fornecedor.codForn, consultor.nomeConsult, consultor.cpfConsult, FORMAT(IFNULL(sum(mercadoria.precoMercadoria*pedido.quantMercPedido), 0), 2, 'de_DE') as 'valorPedido' from acesso join consultor on acesso.codUsuario = consultor.codConsult join relacionafornecedor on consultor.codConsult = relacionafornecedor.codConsultor	join fornecedor on relacionafornecedor.codFornecedor = fornecedor.codForn left join pedido on pedido.codFornPedido = fornecedor.codForn left join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido where acesso.codAcesso = " +
            codacesso;

          connection.query(queryProvider, (error, results) => {
            if (error) {
              return "Error Insert User Client: ", error;
            } else {
              return res.json(results[1]);
            }
          });
          // connection.end();
        } else if (results[0].direcAcesso == 2) {
          const queryClient =
            "SET sql_mode = ''; SELECT acesso.codAcesso, acesso.direcAcesso, associado.razaoAssociado AS nomeForn, associado.cnpjAssociado AS cnpjForn, acesso.codUsuario, associado.codAssociado AS codForn, consultor.nomeConsult, consultor.cpfConsult, FORMAT(IFNULL(sum(mercadoria.precoMercadoria*pedido.quantMercPedido), 0), 2, 'de_DE') as 'valorPedido' FROM acesso join consultor on acesso.codUsuario = consultor.codConsult join relaciona on relaciona.codAssocRelaciona = consultor.codConsult join associado on associado.codAssociado = relaciona.codConsultRelaciona left join pedido on pedido.codAssocPedido = associado.codAssociado left join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido WHERE acesso.codAcesso = " +
            codacesso;

          connection.query(queryClient, (error, results) => {
            if (error) {
              return "Error Update User Client: ", error;
            } else {
              return res.json(results[1]);
            }
          });
          // connection.end();
        } else if (results[0].direcAcesso == 3) {
          const queryOrganization = `SET sql_mode = '';
            SELECT 
            acesso.codAcesso, 
            acesso.direcAcesso, 
            organizador.nomeOrg AS nomeForn, 
            organizador.cnpjOrg AS cnpjForn, 
            acesso.codUsuario,  organizador.codOrg AS codForn, 
            consultor.nomeConsult, 
            consultor.cpfConsult
            FROM acesso 
            join consultor on acesso.codUsuario = consultor.codConsult 
            join organizador on organizador.codOrg = consultor.codFornConsult 
            where organizador.codOrg = ${results[0].codOrganization} 
            and acesso.codAcesso = ${codacesso}`;

          connection.query(queryOrganization, (error, results) => {
            if (error) {
              return "Error Update User Client: ", error;
            } else {
              return res.json(results[1]);
            }
          });
          // connection.end();
        }
      }
      return 0;
    });
    // connection.end();
  },

  async getAllUsersOrg(req, res) {
    logger.info("Get All Users Fair");

    const queryConsult = `SET sql_mode = ''; 
    SELECT acesso.codAcesso, 
    acesso.is_present as present,
    acesso.direcAcesso, organizador.nomeOrg AS nomeForn, 
    organizador.cnpjOrg AS cnpjForn, acesso.codUsuario,  
    organizador.codOrg AS codForn, consultor.nomeConsult, 
    consultor.telConsult as 'phone', 
    consultor.emailConsult as 'email',
    consultor.cpfConsult 
    FROM acesso 
    join consultor on acesso.codUsuario = consultor.codConsult 
    join organizador on organizador.codOrg = consultor.codFornConsult
    where organizador.codOrg = 158 
    group by consultor.codConsult order by present desc`;

    connection.query({ sql: queryConsult, timeout: 15000 }, (error, results, fields) => {
      if (error) {
        return res.status(400).send(error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getConsultsProvider(req, res) {
    logger.info("Get Consults Provider");

    const { provider } = req.params;

    const queryConsult = `select * from consultor c
    join relacionafornecedor rf on rf.codConsultor = c.codConsult
    where rf.codFornecedor = ${provider}`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        return res.status(400).send(error);
      } else {
        return res.json(results);
      }
    });
    // connection.end();
  },

  async getAllUsersProvider(req, res) {
    logger.info("Get All Users Fair");

    const queryConsult = `SET sql_mode = ''; select acesso.is_present as present, acesso.codAcesso, acesso.direcAcesso, fornecedor.nomeForn, fornecedor.cnpjForn, acesso.codUsuario, fornecedor.codForn, consultor.nomeConsult, consultor.telConsult as 'phone', consultor.emailConsult as 'email', consultor.cpfConsult from acesso join consultor on acesso.codUsuario = consultor.codConsult join relacionafornecedor on consultor.codConsult = relacionafornecedor.codConsultor	join fornecedor on relacionafornecedor.codFornecedor = fornecedor.codForn left join pedido on pedido.codFornPedido = fornecedor.codForn left join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido group by consultor.codConsult order by present desc`;

    connection.query({ sql: queryConsult, timeout: 15000 }, (error, results, fields) => {
      if (error) {
        return res.status(400).send(error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getProviderUser(req, res) {
    logger.info("Get Provier User");

    const { code, type } = req.params;

    let queryConsult = "";

    if (type == 1) {
      queryConsult = `SELECT f.codForn, concat(f.codForn, " - ",f.nomeForn) AS 'razao', f.cnpjForn
      FROM fornecedor f
      JOIN relacionafornecedor r ON r.codFornecedor = f.codForn
      WHERE r.codConsultor = ${code}`;

    } else if (type == 2) {
      queryConsult = `    SELECT f.codAssociado as 'codForn', concat(f.codAssociado, " - ",f.razaoAssociado) AS 'razao', 
        f.cnpjAssociado as 'cnpjForn'
        FROM associado f
        JOIN relaciona r ON r.codConsultRelaciona = f.codAssociado
        WHERE r.codAssocRelaciona =  ${code}`;
    }

    // const queryConsult = `select f.codForn, f.nomeForn as 'razao', f.cnpjForn
    //   from fornecedor f
    //   join relacionafornecedor r on r.codFornecedor = f.codForn
    //   where r.codConsultor = ${code}`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        return res.status(400).send(error);
      } else {
        return res.json(results);
      }
    });
    // connection.end();
  },

  async getUsersProviderNotInList(req, res) {
    logger.info("Get Users Provider Not in List Fair");

    const queryConsult = `
    SET sql_mode = '';
    SELECT 
    acesso.codAcesso, 
    acesso.direcAcesso,  
    acesso.codUsuario, 
    relacionafornecedor.codFornecedor, 
    consultor.nomeConsult,
    consultor.cpfConsult
    FROM 
        acesso 
    JOIN 
        consultor ON acesso.codUsuario = consultor.codConsult 
    JOIN 
        relacionafornecedor ON consultor.codConsult = relacionafornecedor.codConsultor 
    WHERE 
        relacionafornecedor.codFornecedor NOT IN (SELECT f.codForn FROM fornecedor f)
    GROUP BY 
        consultor.codConsult;`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        return res.status(400).send(error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getAllUsersAssociate(req, res) {
    logger.info("Get All Users Fair");

    const queryConsult = `SET sql_mode = ''; SELECT acesso.is_present as present,  acesso.codAcesso, acesso.direcAcesso, associado.razaoAssociado AS nomeForn, associado.cnpjAssociado AS cnpjForn, acesso.codUsuario, associado.codAssociado AS codForn, consultor.telConsult as 'phone', consultor.emailConsult as 'email', consultor.nomeConsult, consultor.cpfConsult, FORMAT(IFNULL(sum(mercadoria.precoMercadoria*pedido.quantMercPedido), 0), 2, 'de_DE') as 'valorPedido' FROM acesso join consultor on acesso.codUsuario = consultor.codConsult join relaciona on relaciona.codAssocRelaciona = consultor.codConsult join associado on associado.codAssociado = relaciona.codConsultRelaciona left join pedido on pedido.codAssocPedido = associado.codAssociado left join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido group by consultor.codConsult order by present desc`;
    // const queryConsult = `SET sql_mode = '';
    //   SELECT
    //     acesso.codAcesso,
    //     acesso.direcAcesso,
    //     associado.razaoAssociado AS nomeForn,
    //     associado.cnpjAssociado AS cnpjForn,
    //     acesso.codUsuario,
    //     associado.codAssociado AS codForn,
    //     consultor.telConsult as 'phone',
    //     consultor.emailConsult as 'email',
    //     consultor.nomeConsult,
    //     consultor.cpfConsult,
    //     FORMAT(
    //       IFNULL(
    //         SUM(mercadoria.precoMercadoria * pedido.quantMercPedido),
    //         0
    //       ),
    //       2,
    //       'de_DE'
    //     ) AS 'valorPedido',

    //     -- 👇 Aqui entra o IF que retorna TRUE se houver log
    //     IF(COUNT(log.id) > 0, TRUE, FALSE) AS present

    //   FROM acesso
    //   JOIN consultor ON acesso.codUsuario = consultor.codConsult
    //   JOIN relaciona ON relaciona.codAssocRelaciona = consultor.codConsult
    //   JOIN associado ON associado.codAssociado = relaciona.codConsultRelaciona
    //   LEFT JOIN log ON log.userAgent = acesso.codAcesso
    //   LEFT JOIN pedido ON pedido.codAssocPedido = associado.codAssociado
    //   LEFT JOIN mercadoria ON mercadoria.codMercadoria = pedido.codMercPedido
    //   GROUP BY consultor.codConsult;`;

    connection.query({ sql: queryConsult, timeout: 15000 }, (error, results, fields) => {
      if (error) {
        return res.status(400).send(error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getNegotiationWindowUser(req, res) {
    logger.info("Get All Users Fair");

    const queryConsult = `SELECT
      nw.client_id,
      nw.supplier_id,
      c.nomeConsult,
      s.nomeConsult,
      f.nomeForn,
      TIMEDIFF(nw.end_at, nw.start_at) AS diff_time,
      nw.start_at as 'Inicio',
      nw.end_at as 'Fim'
      FROM negotiation_windows nw
      join consultor c on c.codConsult = nw.client_id
      join consultor s on s.codConsult = nw.consultant_id
      join fornecedor f on f.codForn = nw.supplier_id
      where nw.client_id = 4`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        return res.status(400).send(error);
      } else {
        return res.json(results);
      }
    });
    // connection.end();
  },
};

module.exports = User;
