SET sql_mode = '';

SELECT  
    a.codAssociado,
    a.razaoAssociado AS razao,
    a.cnpjAssociado,
    SUM(IF(p.codFornPedido = ${codprovider}, p.quantMercPedido * m.precoMercadoria, 0)) AS valorTotal,
    SUM(IF(p.codFornPedido = ${codprovider}, p.quantMercPedido, 0)) AS volumeTotal
FROM (
    -- Lista de associados cujos consultores estavam no log
    SELECT DISTINCT a.codAssociado, a.razaoAssociado, a.cnpjAssociado
    FROM log l
    JOIN acesso ac ON ac.codAcesso = l.userAgent
    JOIN consultor c ON c.codConsult = ac.codUsuario
    JOIN relaciona r ON r.codAssocRelaciona = c.codConsult
    JOIN associado a ON a.codAssociado = r.codConsultRelaciona
) AS a
LEFT JOIN pedido p ON p.codAssocPedido = a.codAssociado
LEFT JOIN mercadoria m ON m.codMercadoria = p.codMercPedido
GROUP BY a.codAssociado
ORDER BY valorTotal DESC;