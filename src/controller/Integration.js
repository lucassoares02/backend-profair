// import PortalFlex from "@controller/PortalFlex";
const PortalFlex = require("@controller/PortalFlex");
const Insert = require("@insert");
const { format } = require("date-fns");

const send = (table, data) => {
  let params = {
    table: table,
    data: data,
  };

  try {
    return new Promise((resolve, reject) => {
      return Insert(params)
        .then(async (resp) => {
          resolve(resp);
        })
        .catch((error) => {
          reject(error);
        });
    });
  } catch (error) {
    console.log(`Error Insert ${table}: ${error}`);
  }
};

const negotiations = async (req, res) => {
  try {
    const data = await PortalFlex.negotiations();

    const items = [];

    if (data && data.length > 0) {
      for (const negotiation of data) {
        console.log(negotiation);
        items.push({
          codNegociacao: negotiation["id_grade_compra"],
          descNegociacao: negotiation["nome"],
          codFornNegociacao: negotiation["fornec_id_cliforn"],
          prazo: format(new Date(negotiation["data_ref_fim"]), "yyyy-MM-dd HH:mm:ss.SSSSSS"),
          observacao: negotiation["observacao"],
          codNegoErp: negotiation["rp_transacao"],
        });
      }
    }

    send("negociacao", items);

    return res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch negotiations" });
  }
};

const products = async (req, res) => {
  const { negociacao } = req.params;
  try {
    const response = await PortalFlex.negotiation(negociacao);
    if (response != null) {
      const negotiation_products = await PortalFlex.negotiation_products(response.id_grade_compra);

      let products_info = [];
      for (const product of negotiation_products) {
        const prices = await PortalFlex.prices(product.id_grade_compra_item);
        const product_info = await PortalFlex.products(product.id_produto);

        // const parametrization = {
        //   id_fornecedor: response.fornec_id_cliforn,
        //   produto: product_info.descricao_produto,
        //   embalagem: product_info._ref.emba[product_info.id_emba].emba,
        //   embalagem_qtde: product_info._ref.emba[product_info.id_emba].qtde_unit_embalagem,
        //   valor_nf_embalagem: (prices[0].valor_unit * product_info._ref.emba[product_info.id_emba].qtde_unit_embalagem).toFixed(4),
        //   valor_nf_unitario: prices[0].valor_unit,
        //   codigo_barras: product_info.cod_gtin,
        //   complemento: product_info.complemento ?? "",
        //   marca: product_info.ref_marca_1633_titulo,
        //   id_erp: product_info.id_produto,
        //   id_produto: product_info.id_produto,
        //   id_negociacao: response.id_grade_compra,
        // };
        const parametrization = {
          codFornMerc: response.fornec_id_cliforn,
          nomeMercadoria: product_info.descricao_produto,
          embMercadoria: product_info._ref.emba[product_info.id_emba].emba,
          fatorMerc: product_info._ref.emba[product_info.id_emba].qtde_unit_embalagem,
          precoMercadoria: (prices[0].valor_unit * product_info._ref.emba[product_info.id_emba].qtde_unit_embalagem).toFixed(4),
          precoUnit: prices[0].valor_unit,
          barcode: product_info.cod_gtin,
          complemento: product_info.complemento ?? "",
          marca: product_info.ref_marca_1633_titulo,
          erpcode: product_info.id_produto,
          nego: response.id_grade_compra,
          codMercadoria_ext: product_info.id_produto,
          novo_codMercadoria: product_info.id_produto,
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

const provider = async (req, res) => {
  const { provider } = req.params;
  try {
    const items = [];
    const data = await PortalFlex.provider(provider);

    if (data != null && data.length > 0) {
      for (const provider of data) {
        items.push({
          codForn: provider.id_cliforn,
          nomeForn: provider.jur_nome_fantasia,
          razaoForn: provider.nome_razsocial,
          cnpjForn: provider.cpf_cnpj,
          telForn: "",
          codCategoria: 1,
          codComprFornecedor: 1,
          image: "https://static.vecteezy.com/system/resources/previews/012/986/755/non_2x/abstract-circle-logo-icon-free-png.png",
          color: "0XFF0763F7",
        });
      }
    }

    return res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch provider" });
  }
};

const clients = async (req, res) => {
  try {
    const items = [];
    const data = await PortalFlex.clients();

    // codAssociado
    // razaoAssociado
    // cnpjAssociado
    // idLoja
    // id_grupo

    if (data != null && data.length > 0) {
      for (const client of data) {
        items.push({
          codAssociado: client.id_cliforn,
          razaoAssociado: client.nome_razsocial,
          cnpjAssociado: client.cpf_cnpj,
          idLoja: client.rp_cod_cli,
          idGrupo: client.rp_cod_forn,
        });
      }
    }

    return res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch clients" });
  }
};

module.exports = {
  products,
  negotiations,
  provider,
  clients,
};
