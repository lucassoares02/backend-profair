// import PortalFlex from "@controller/PortalFlex";
const PortalFlex = require("@controller/PortalFlex");

const negotiations = async (req, res) => {
  const { negociacao } = req.params;
  try {
    const response = await PortalFlex.negotiations(negociacao);
    if (response != null) {
      //   let parametrization = {
      //     id_negociacao: response.id_grade_compra,
      //     categoria: response.id_especie,
      //     id_erp_fornecedor: response.fornec_id_cliforn,
      //     data_fim_encarte: response.data_fim,
      //     observacao: `${response.nome} - ${response.observacao}`,
      //     id_erp: response.id_grade_compra,
      //   };
      //   return res.json(parametrization);
      const negotiation_products = await PortalFlex.negotiation_products(response.id_grade_compra);

      let products_info = [];
      for (const product of negotiation_products) {
        const prices = await PortalFlex.prices(product.id_grade_compra_item);
        const product_info = await PortalFlex.products(product.id_produto);
        const parametrization = {
          id_fornecedor: response.fornec_id_cliforn,
          produto: product_info.descricao_produto,
          embalagem: product_info._ref.emba[product_info.id_emba].emba,
          embalagem_qtde: product_info._ref.emba[product_info.id_emba].qtde_unit_embalagem,
          valor_nf_embalagem: (prices[0].valor_unit * product_info._ref.emba[product_info.id_emba].qtde_unit_embalagem).toFixed(4),
          valor_nf_unitario: prices[0].valor_unit,
          codigo_barras: product_info.cod_gtin,
          complemento: product_info.complemento ?? "",
          marca: product_info.ref_marca_1633_titulo,
          id_erp: product_info.id_produto,
          id_produto: product_info.id_produto,
          id_negociacao: response.id_grade_compra,
        };
        products_info.push(parametrization);
      }

      return res.json(products_info);
    }
    return res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch negotiations" });
  }
};

module.exports = {
  negotiations,
};
