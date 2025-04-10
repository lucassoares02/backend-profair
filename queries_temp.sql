SELECT
    n.*,
    cn.categoria,
    f.id_erp as id_erp_fornecedor
FROM
    multishow_b2b.negociacoes n
    JOIN multishow_b2b.categorias_negociacoes cn on cn.id_categoria_negociacao = n.id_categoria_negociacao
    join multishow_b2b.fornecedores f on f.id_fornecedor = n.id_fornecedor
where
    n.created_at > '2025-03-20 14:15:15'    