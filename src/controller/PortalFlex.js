const portalFlexUrl = process.env.PORTAL_FLEX_URL;
const token = process.env.PORTAL_FLEX_TOKEN;

const negotiation = async (negociacao) => {
  try {
    const { data } = await fetch(
      `${portalFlexUrl}/api/get/Get.php?loginRequestAction=login&loginRequestData[token]=${token}&method=Machine_PublicApi_GradeCompra->view&args[sortCol]=data_ult_modif&args[sortOrder]=ASC&args[page]=1&args[filter][id_grade_compra]=${negociacao}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    ).then((response) => response.json());
    return data[0];
  } catch (error) {
    return { error: "Failed to fetch negotiations" };
  }
};

const negotiations = async () => {
  try {
    const { data } = await fetch(
      `${portalFlexUrl}/api/get/Get.php?loginRequestAction=login&loginRequestData[token]=${token}&method=Machine_PublicApi_GradeCompra->view&args[sortCol]=data_ult_modif&args[sortOrder]=ASC&args[page]=1&args[filter][rp_cod_tab_neg]=010`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    ).then((response) => response.json());
    return data;
  } catch (error) {
    return { error: "Failed to fetch negotiations" };
  }
};

const negotiation_products = async (negociacao) => {
  try {
    const { data } = await fetch(
      `${portalFlexUrl}/api/get/Get.php?loginRequestAction=login&loginRequestData[token]=${token}&method=Machine_PublicApi_GradeCompraItem-%3EviewFull&args%5BsortCol%5D=data_ult_modif&args%5BsortOrder%5D=ASC&args%5Bfilter%5D%5Bid_grade_compra%5D=${negociacao}&args%5Bpage%5D=1`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    ).then((response) => response.json());
    return data;
  } catch (error) {
    return { error: "Failed to fetch negotiations" };
  }
};

const products = async (product) => {
  try {
    const { data } = await fetch(
      `${portalFlexUrl}/api/get/Get.php?loginRequestAction=login&loginRequestData[token]=${token}&method=Machine_PublicApi_Produto-%3EviewFull&args%5BsortCol%5D=data_ult_modif&args%5BsortOrder%5D=ASC&args%5Bpage%5D=1&args%5Bfilter%5D%5Bid_produto%5D=${product}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    ).then((response) => response.json());
    return data[0];
  } catch (error) {
    return { error: "Failed to fetch negotiations" };
  }
};

const prices = async (item) => {
  try {
    const { data } = await fetch(
      `${portalFlexUrl}/api/get/Get.php?loginRequestAction=login&loginRequestData[token]=${token}&method=Machine_PublicApi_GradeCompraItemPrecoUnidade->view&args[filter][id_grade_compra_item]=${item}&args[page]=1`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    ).then((response) => response.json());
    return data;
  } catch (error) {
    return { error: "Failed to fetch negotiations" };
  }
};

const provider = async (provider) => {
  try {
    const { data } = await fetch(
      `${portalFlexUrl}/api/get/Get.php?loginRequestAction=login&loginRequestData%5Btoken%5D=${token}&method=Machine_PublicApi_Cliforn-%3Eview&args%5BsortCol%5D=data_ult_modif&args%5BsortOrder%5D=ASC&args%5Bpage%5D=1&args%5Bfilter%5D%5Bid_cliforn%5D=${provider}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    ).then((response) => response.json());
    return data;
  } catch (error) {
    return { error: "Failed to fetch provider" };
  }
};

const clients = async () => {
  try {
    const { data } = await fetch(
      `${portalFlexUrl}/api/get/Get.php?loginRequestAction=login&loginRequestData%5Btoken%5D=${token}&method=Machine_PublicApi_Cliforn-%3Eview&args%5BsortCol%5D=data_ult_modif&args%5BsortOrder%5D=ASC&args%5Bpage%5D=1&args%5Bfilter%5D%5Btipo_cliforn%5D=cliente`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    ).then((response) => response.json());
    return data;
  } catch (error) {
    return { error: "Failed to fetch clients" };
  }
};

module.exports = {
  negotiation,
  negotiations,
  negotiation_products,
  products,
  prices,
  provider,
  clients,
};
