const { connection } = require("@server");
const logger = require("@logger");
const axios = require("axios");

const OPENCNPJ_URL = "https://api.opencnpj.org";

// Pequena pausa entre requisições no processamento em lote, para não
// sobrecarregar a API pública de CNPJ.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Executa uma query no banco principal retornando uma Promise.
function query(sql, values = []) {
  return new Promise((resolve, reject) => {
    connection.query(sql, values, (error, results) => {
      if (error) return reject(error);
      return resolve(results);
    });
  });
}

// Mantém apenas os dígitos do CNPJ (remove pontos, barras e traços).
function onlyDigits(cnpj) {
  return (cnpj || "").replace(/\D/g, "");
}

// Consulta a cidade (município) de um CNPJ na API opencnpj.
// Retorna { cidade, uf } ou null quando não encontrado / inválido.
async function fetchCityByCnpj(cnpj) {
  const digits = onlyDigits(cnpj);
  if (digits.length !== 14) {
    return null;
  }

  const { data } = await axios.get(`${OPENCNPJ_URL}/${digits}`, {
    timeout: 10000,
    headers: { Accept: "application/json" },
  });

  const cidade = data && data.municipio ? String(data.municipio).trim() : null;
  if (!cidade) return null;

  return { cidade, uf: data.uf ? String(data.uf).trim() : null };
}

const Cnpj = {
  // Atualiza a cidade de UM associado a partir do seu CNPJ.
  // GET /associado/:codAssociado/cidade-cnpj
  async updateCityByCnpj(req, res) {
    logger.info("Update associate city by CNPJ");

    const { codAssociado } = req.params;

    try {
      const rows = await query(
        "SELECT codAssociado, cnpjAssociado, razaoAssociado, cidade FROM associado WHERE codAssociado = ?",
        [codAssociado]
      );

      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: "Associado não encontrado." });
      }

      const associado = rows[0];

      if (!onlyDigits(associado.cnpjAssociado)) {
        return res.status(422).json({
          success: false,
          message: "Associado sem CNPJ cadastrado.",
          codAssociado: associado.codAssociado,
        });
      }

      const result = await fetchCityByCnpj(associado.cnpjAssociado);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Cidade não encontrada para o CNPJ informado.",
          codAssociado: associado.codAssociado,
          cnpj: associado.cnpjAssociado,
        });
      }

      await query("UPDATE associado SET cidade = ? WHERE codAssociado = ?", [
        result.cidade,
        associado.codAssociado,
      ]);

      return res.status(200).json({
        success: true,
        message: "Cidade atualizada com sucesso.",
        codAssociado: associado.codAssociado,
        razao: associado.razaoAssociado,
        cnpj: associado.cnpjAssociado,
        cidade: result.cidade,
        uf: result.uf,
      });
    } catch (error) {
      logger.error(`Error updateCityByCnpj: ${error}`);
      return res.status(500).json({ success: false, message: "Erro ao consultar/atualizar a cidade." });
    }
  },

  // Percorre TODOS os associados cadastrados e preenche a cidade pelo CNPJ.
  // GET /associados/atualizar-cidades
  //   ?skipFilled=true  -> pula os que já possuem cidade preenchida (re-execução rápida)
  async updateAllCitiesByCnpj(req, res) {
    logger.info("Update all associates city by CNPJ");

    const skipFilled = req.query.skipFilled === "true" || req.query.skipFilled === "1";

    try {
      const associados = await query(
        "SELECT codAssociado, cnpjAssociado, razaoAssociado, cidade FROM associado ORDER BY codAssociado"
      );

      const resumo = {
        total: associados.length,
        atualizados: 0,
        semCnpj: 0,
        pulados: 0,
        falhas: 0,
      };
      const detalhes = [];

      for (const associado of associados) {
        // Já possui cidade e foi pedido para pular os preenchidos.
        if (skipFilled && associado.cidade && String(associado.cidade).trim() !== "") {
          resumo.pulados += 1;
          continue;
        }

        // Sem CNPJ válido não há como consultar.
        if (onlyDigits(associado.cnpjAssociado).length !== 14) {
          resumo.semCnpj += 1;
          detalhes.push({
            codAssociado: associado.codAssociado,
            razao: associado.razaoAssociado,
            status: "sem_cnpj",
          });
          continue;
        }

        try {
          const result = await fetchCityByCnpj(associado.cnpjAssociado);

          if (!result) {
            resumo.falhas += 1;
            detalhes.push({
              codAssociado: associado.codAssociado,
              razao: associado.razaoAssociado,
              status: "nao_encontrado",
            });
          } else {
            await query("UPDATE associado SET cidade = ? WHERE codAssociado = ?", [
              result.cidade,
              associado.codAssociado,
            ]);
            resumo.atualizados += 1;
            detalhes.push({
              codAssociado: associado.codAssociado,
              razao: associado.razaoAssociado,
              cidade: result.cidade,
              uf: result.uf,
              status: "atualizado",
            });
          }
        } catch (err) {
          resumo.falhas += 1;
          detalhes.push({
            codAssociado: associado.codAssociado,
            razao: associado.razaoAssociado,
            status: "erro",
          });
          logger.error(`Error updateAllCitiesByCnpj (cod ${associado.codAssociado}): ${err}`);
        }

        // Respeita a API pública com uma pequena pausa entre chamadas.
        await sleep(200);
      }

      return res.status(200).json({
        success: true,
        message: `Processados ${resumo.total} associados. ${resumo.atualizados} atualizados.`,
        ...resumo,
        detalhes,
      });
    } catch (error) {
      logger.error(`Error updateAllCitiesByCnpj: ${error}`);
      return res.status(500).json({ success: false, message: "Erro ao atualizar as cidades dos associados." });
    }
  },
};

module.exports = Cnpj;
