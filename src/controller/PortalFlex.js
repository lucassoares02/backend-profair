const portalFlexUrl = process.env.PORTAL_FLEX_URL;
const token = process.env.PORTAL_FLEX_TOKEN;

const negotiations = async (negociacao) => {
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

module.exports = {
  negotiations,
  negotiation_products,
  products,
  prices,
};
