select
    CONCAT(
        'UPDATE multishow_b2b.negociacoes_lojas SET id_loja = ',
        nl.id_loja,
        ' WHERE id_negociacao = ',
        nl.id_negociacao,
        ' and id_negociacao_loja = ',
        nl.id_negociacao_loja,
        ';'
    ) as 'query'
from
    log l
    join acesso a on a.codAcesso = l.userAgent
    join consultor c on c.codConsult = a.codUsuario
    join relaciona r on r.codAssocRelaciona = c.codConsult
    join associado aa on aa.codAssociado = r.codConsultRelaciona
    join negociacao_loja nl on nl.id_loja = aa.idLoja
where
    l.route like '%getusermore%'
    and a.direcAcesso = 2
    and nl.status = 0
group by
    nl.id_loja,
    nl.id_negociacao;