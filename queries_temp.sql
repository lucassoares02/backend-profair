SET
  sql_mode = '';

SELECT
  acesso.codAcesso,
  acesso.direcAcesso,
  associado.razaoAssociado AS nomeForn,
  associado.cnpjAssociado AS cnpjForn,
  acesso.codUsuario,
  associado.codAssociado AS codForn,
  consultor.telConsult as 'phone',
  consultor.emailConsult as 'email',
  consultor.nomeConsult,
  consultor.cpfConsult,
  FORMAT(
    IFNULL(
      sum(
        mercadoria.precoMercadoria * pedido.quantMercPedido
      ),
      0
    ),
    2,
    'de_DE'
  ) as 'valorPedido'
FROM
  acesso
  join consultor on acesso.codUsuario = consultor.codConsult
  join relaciona on relaciona.codAssocRelaciona = consultor.codConsult
  join associado on associado.codAssociado = relaciona.codConsultRelaciona
  left join pedido on pedido.codAssocPedido = associado.codAssociado
  left join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido
group by
  consultor.codConsult