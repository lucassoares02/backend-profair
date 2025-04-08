SET
    sql_mode = '';

SELECT
    (COUNT(DISTINCT pedido.codAssocPedido) * 100.0) / (
         SELECT COUNT(DISTINCT r.codConsultRelaciona) AS total
       FROM log l
       JOIN acesso a ON a.codAcesso = l.userAgent
       JOIN relaciona r ON r.codAssocRelaciona = a.codUsuario
    ) AS porcentagem,
    COUNT(DISTINCT pedido.codAssocPedido) AS realizados,
    (
       SELECT COUNT(DISTINCT r.codConsultRelaciona) AS total
       FROM log l
       JOIN acesso a ON a.codAcesso = l.userAgent
       JOIN relaciona r ON r.codAssocRelaciona = a.codUsuario
    ) AS total
FROM
    pedido
WHERE
    pedido.codFornPedido = 10766