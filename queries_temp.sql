SET
    sql_mode = '';

SELECT
    CONCAT(
        'UPDATE multishow_b2b.negociacoes_lojas SET id_loja = ',
        nl.id_loja,
        ' WHERE id_negociacao = ',
        nl.id_negociacao,
        ' and id_negociacao_loja = ',
        nl.id_negociacao_loja,
        ';'
    ) AS 'query'
FROM
    negociacao_loja nl
    JOIN associado a ON a.idLoja = nl.id_loja
    JOIN relaciona r ON r.codConsultRelaciona = a.codAssociado
    JOIN consultor c ON c.codConsult = r.codAssocRelaciona
    JOIN acesso ac ON ac.codUsuario = c.codConsult
    LEFT JOIN log l ON l.userAgent = ac.codAcesso
    AND l.route LIKE '%getusermore%'
WHERE
    nl.status = 2
    AND l.id IS NULL
    AND a.codAssociado IN (
        SELECT
            r2.codConsultRelaciona
        FROM
            relaciona r2
            JOIN consultor c2 ON c2.codConsult = r2.codAssocRelaciona
            JOIN acesso ac2 ON ac2.codUsuario = c2.codConsult
            JOIN log l2 ON l2.userAgent = ac2.codAcesso
        WHERE
            l2.route LIKE '%getusermore%'
    )
GROUP BY
    r.codConsultRelaciona;