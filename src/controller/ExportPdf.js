// ═══════════════════════════════════════════════════════════════════════════
// getExportPdf — Versão melhorada
// Dependências: pdfkit-table, fs, path, axios (para download de imagem)
// ═══════════════════════════════════════════════════════════════════════════
const { connection } = require("@server");
const logger = require("@logger");

// ═══════════════════════════════════════════════════════════════════════════
// getExportPdf — Estilo tabela, linhas pretas, dados completos
// Dependências: pdfkit-table, fs, path, axios
// ═══════════════════════════════════════════════════════════════════════════

const PDFDocument = require("pdfkit-table");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

// ── Imagem default do fornecedor ────────────────────────────────────────
const DEFAULT_IMAGE = path.join(__dirname, "assets", "default-supplier.png");

// ── Constantes de layout ────────────────────────────────────────────────
const MX = 28; // margem lateral
const LINE_COLOR = "#000000"; // preto
const TEXT_COLOR = "#000000";
const MUTED = "#444444";
const FONT_B = "Helvetica-Bold";
const FONT_R = "Helvetica";

// ── Helpers ─────────────────────────────────────────────────────────────
const brl = (v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtCnpj = (v) => {
  if (!v) return "—";
  const d = v.replace(/\D/g, "");
  return d.length === 14 ? d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5") : v;
};

const fmtTel = (v) => {
  if (!v) return "—";
  const d = v.replace(/\D/g, "");
  if (d.length === 11) return d.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  if (d.length === 10) return d.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  return v;
};

const safe = (v) => v || "—";

// ── Resolve imagem do fornecedor ────────────────────────────────────────
async function resolveImage(imagePath) {
  if (imagePath && /^https?:\/\//.test(imagePath)) {
    try {
      const r = await axios.get(imagePath, { responseType: "arraybuffer", timeout: 5000 });
      return Buffer.from(r.data);
    } catch (_) {
      /* fallback */
    }
  }
  if (imagePath) {
    const local = path.join(__dirname, "uploads", "suppliers", imagePath);
    if (fs.existsSync(local)) return fs.readFileSync(local);
  }
  if (fs.existsSync(DEFAULT_IMAGE)) return fs.readFileSync(DEFAULT_IMAGE);
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
//  Desenho: linha horizontal preta
// ═══════════════════════════════════════════════════════════════════════════
function hLine(doc, y, x1, x2, width = 0.8) {
  doc.save();
  doc.moveTo(x1, y).lineTo(x2, y).strokeColor(LINE_COLOR).lineWidth(width).stroke();
  doc.restore();
}

// ═══════════════════════════════════════════════════════════════════════════
//  Desenho: linha de dados "Label: Valor"
//  Retorna o próximo Y
// ═══════════════════════════════════════════════════════════════════════════
function infoLine(doc, label, value, x, y, labelW = 90) {
  doc.font(FONT_B).fontSize(8).fillColor(TEXT_COLOR).text(label, x, y, { width: labelW });
  doc
    .font(FONT_R)
    .fontSize(8)
    .fillColor(TEXT_COLOR)
    .text(safe(value), x + labelW, y, { width: 220 });
  return y + 11;
}

// ═══════════════════════════════════════════════════════════════════════════
//  CABEÇALHO — estilo tabela, linhas pretas, compacto
//
//  ════════════════════════════════════════════════════════════════════════
//  [IMG]  Nome Fantasia: xxxxxxx
//         Razão Social:  xxxxxxx
//         CNPJ:          xx.xxx.xxx/xxxx-xx
//         Comprador:     xxxxxxx
//  ────────────────────────────────────────────────────────────────────────
//  CLIENTE / ASSOCIADO                    CONSULTOR
//  Razão Social: xxxxxxx                 Nome: xxxxxxx
//  CNPJ:         xxxxxxx                 Telefone: xxxxxxx
//  Loja:         xxxxxxx                 Email: xxxxxxx
//  Grupo:        xxxxxxx
//  ────────────────────────────────────────────────────────────────────────
//  Negociação: xxxxxxx          Prazo: xx/xx/xxxx
//  Observação: xxxxxxx          Emitido em xx/xx/xxxx xx:xx
//  ════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════

async function drawHeader(doc, data, imgBuffer) {
  const pw = doc.page.width;
  const x1 = MX;
  const x2 = pw - MX;
  let y = 24;

  // ══ Linha dupla superior ══
  hLine(doc, y, x1, x2, 1.5);
  hLine(doc, y + 2.5, x1, x2, 0.5);
  y += 10;

  // ── Imagem do fornecedor ──
  const imgSize = 44;
  const imgX = x1 + 5;
  const imgY = y + 1;

  if (imgBuffer) {
    try {
      doc.image(imgBuffer, imgX, imgY, {
        fit: [imgSize, imgSize],
        align: "center",
        valign: "center",
      });
    } catch (_) {
      // sem imagem, continua
    }
  }

  // ── Dados do fornecedor (sem título, compacto) ──
  const tx = imgBuffer ? imgX + imgSize + 12 : x1 + 5;

  y = infoLine(doc, "Nome Fantasia:", data.nomeForn, tx, y);
  y = infoLine(doc, "Razão Social:", data.razaoForn, tx, y);
  y = infoLine(doc, "CNPJ:", fmtCnpj(data.cnpjForn), tx, y);
  y = infoLine(doc, "Comprador:", data.nomeCompr, tx, y);

  // Garante que y fique abaixo da imagem
  y = Math.max(y, imgY + imgSize + 4);
  y += 2;

  // ── Linha separadora ──
  hLine(doc, y, x1, x2, 0.8);
  y += 6;

  // ── Bloco lado a lado: CLIENTE + CONSULTOR ──
  const colW = (x2 - x1) / 2;
  const leftX = x1 + 5;
  const rightX = x1 + colW + 10;
  const startY = y;

  // -- CLIENTE / ASSOCIADO (esquerda) --
  doc.font(FONT_B).fontSize(9).fillColor(TEXT_COLOR).text("CLIENTE / ASSOCIADO", leftX, y);
  let ly = y + 13;

  ly = infoLine(doc, "Razão Social:", data.razaoAssociado, leftX, ly);
  ly = infoLine(doc, "CNPJ:", fmtCnpj(data.cnpjAssociado), leftX, ly);
  ly = infoLine(doc, "Cód. Loja:", data.idLoja, leftX, ly);
  ly = infoLine(doc, "Grupo:", data.descGrupo, leftX, ly);

  // -- CONSULTOR (direita) --
  doc.font(FONT_B).fontSize(9).fillColor(TEXT_COLOR).text("CONSULTOR", rightX, startY);
  let ry = startY + 13;

  ry = infoLine(doc, "Nome:", data.nomeConsult, rightX, ry);
  ry = infoLine(doc, "Telefone:", fmtTel(data.telConsult), rightX, ry);
  ry = infoLine(doc, "Email:", data.emailConsult, rightX, ry);

  y = Math.max(ly, ry) + 2;

  // ── Linha separadora ──
  hLine(doc, y, x1, x2, 0.8);
  y += 6;

  // ── Bloco: NEGOCIAÇÃO + datas ──
  const negoLabel = `${safe(data.descNegociacao)}`;
  const prazoStr = data.prazo ? new Date(data.prazo).toLocaleDateString("pt-BR") : "—";
  const emissaoStr = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  doc.font(FONT_B).fontSize(8).fillColor(TEXT_COLOR).text("Negociação: ", leftX, y, { continued: true });
  doc.font(FONT_R).text(negoLabel, { continued: false });

  // Prazo e emissão na mesma linha, mais à direita
  doc.font(FONT_B).fontSize(8).fillColor(TEXT_COLOR).text("Prazo: ", rightX, y, { continued: true });
  doc.font(FONT_R).text(prazoStr, { continued: false });

  y += 11;
  doc.font(FONT_B).fontSize(8).fillColor(TEXT_COLOR).text("Observação: ", leftX, y, { continued: true });
  doc.font(FONT_R).fontSize(7.5).text(safe(data.observacao), { continued: false });

  y += 11;

  doc.font(FONT_B).fontSize(7).fillColor(MUTED).text(`Emitido em ${emissaoStr}`, leftX, y);
  y += 8;

  // ══ Linha dupla inferior ══
  hLine(doc, y, x1, x2, 0.5);
  hLine(doc, y + 2.5, x1, x2, 1.5);
  y += 8;

  return y;
}

// ═══════════════════════════════════════════════════════════════════════════
//  Helper — promisifica connection.query
// ═══════════════════════════════════════════════════════════════════════════
const query = (sql, params) => new Promise((resolve, reject) => connection.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows))));

// ──────────────────────────────────────────────────────────────────────────
//  QUERY — Dados completos do contexto (fornecedor, categoria, comprador,
//  associado, grupo, consultor, negociação) para um par cliente/fornecedor
//  numa negociação específica. Tudo numa única query.
// ──────────────────────────────────────────────────────────────────────────
const CONTEXT_SQL = `
  SELECT
    /* Fornecedor */
    f.codForn,
    f.nomeForn,
    f.razaoForn,
    f.cnpjForn,
    f.telForn,
    f.image          AS fornImage,
    cat.descCategoria,

    /* Comprador responsável pelo fornecedor */
    comp.nomeCompr,

    /* Associado (cliente) */
    a.codAssociado,
    a.razaoAssociado,
    a.cnpjAssociado,
    a.idLoja,

    /* Grupo empresarial do associado */
    g.descricao      AS descGrupo,

    /* Consultor (do primeiro pedido encontrado) */
    co.nomeConsult,
    co.telConsult,
    co.emailConsult,

    /* Negociação */
    n.codNegociacao,
    n.descNegociacao,
    n.prazo,
    n.observacao

  FROM pedido p
  JOIN fornecedor  f    ON f.codForn         = p.codFornPedido
  JOIN associado   a    ON a.codAssociado     = p.codAssocPedido
  JOIN negociacao  n    ON n.codNegociacao    = p.codNegoPedido
  LEFT JOIN categoria    cat  ON cat.codCategoria   = f.codCategoria
  LEFT JOIN comprador    comp ON comp.codCompr       = f.codComprFornecedor
  LEFT JOIN grupos_empresariais g ON g.id            = a.id_grupo
  LEFT JOIN consultor    co   ON co.codConsult       = p.codConsultPedido

  WHERE p.codAssocPedido = ?
    AND p.codFornPedido  = ?
    AND p.codNegoPedido  = ?
  LIMIT 1`;

// ──────────────────────────────────────────────────────────────────────────
//  QUERY — Itens do pedido de uma negociação
// ──────────────────────────────────────────────────────────────────────────
const ORDERS_SQL = `
  SET sql_mode = '';
  SELECT
    mercadoria.codMercadoria   AS product,
    mercadoria.nomeMercadoria  AS title,
    mercadoria.barcode,
    mercadoria.embMercadoria   AS packing,
    mercadoria.fatorMerc       AS factor,
    mercadoria.complemento     AS complement,
    mercadoria.marca           AS brand,
    IFNULL(SUM(pedido.quantMercPedido), 0)                              AS quantity,
    mercadoria.precoMercadoria                                           AS price,
    mercadoria.precoUnit                                                 AS unitprice,
    IFNULL(SUM(mercadoria.precoMercadoria * pedido.quantMercPedido), 0)  AS totalprice
  FROM mercadoria
  JOIN pedido ON pedido.codMercPedido = mercadoria.codMercadoria
  WHERE pedido.codAssocPedido = ?
    AND pedido.codFornPedido  = ?
    AND pedido.codNegoPedido  = ?
  GROUP BY mercadoria.codMercadoria
  HAVING totalprice != 0
  ORDER BY mercadoria.nomeMercadoria`;

// ═══════════════════════════════════════════════════════════════════════════
//  Carimba o rodapé em TODAS as páginas já geradas (buffered pages).
//  Desabilita temporariamente a margem inferior para que o texto no pé da
//  página não force a criação de páginas em branco.
// ═══════════════════════════════════════════════════════════════════════════
function stampFooters(doc) {
  const range = doc.bufferedPageRange(); // { start, count }
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);

    const ph = doc.page.height;
    const pw = doc.page.width;
    const oldBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0; // evita quebra de página automática

    hLine(doc, ph - 36, MX, pw - MX, 0.5);

    doc.font(FONT_R).fontSize(6.5).fillColor(MUTED);
    doc.text(`Documento gerado automaticamente — ${new Date().toLocaleDateString("pt-BR")}`, MX, ph - 28, { width: pw - 120, align: "left" });
    doc.text(`Página ${i + 1} de ${range.count}`, pw - 130, ph - 28, {
      width: 102,
      align: "right",
    });

    doc.page.margins.bottom = oldBottom;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  Renderiza UMA negociação (cabeçalho + tabela) na página corrente.
//  Não adiciona página nem desenha rodapé — o chamador é responsável por isso.
//  A tabela usa mais de uma página automaticamente apenas se necessário.
// ═══════════════════════════════════════════════════════════════════════════
async function renderNegotiation(doc, ctx, orders, imgBuffer) {
  // ── Cabeçalho completo ──
  const curY = await drawHeader(doc, ctx, imgBuffer);

  // ── Monta linhas da tabela de produtos (filtra itens vazios) ──
  let valorTotal = 0;
  let qtdTotal = 0;
  const rows = [];

  orders
    .filter((item) => item.quantity > 0 && item.totalprice !== 0)
    .forEach((item, i) => {
      valorTotal += item.totalprice;
      qtdTotal += item.quantity;
      rows.push([
        String(i + 1),
        String(item.product),
        item.barcode || "—",
        item.title,
        `${item.packing} | ${item.factor}`,
        String(item.quantity),
        brl(item.price),
        brl(item.totalprice),
      ]);
    });

  // Linha de total — conta apenas os itens efetivamente listados
  const totalLabel = `TOTAL (${rows.length} itens)`;
  rows.push(["", "", "", totalLabel, "", String(qtdTotal), "", brl(valorTotal)]);
  const totalRowIdx = rows.length - 1;

  // ── Tabela ──
  const table = {
    headers: [
      { label: "#", property: "n", width: 20, align: "center" },
      { label: "Código", property: "cod", width: 38, align: "center" },
      { label: "Cód. Barras", property: "bar", width: 72, align: "center" },
      { label: "Descrição", property: "desc", width: 170, align: "left" },
      { label: "Emb / Fator", property: "emb", width: 58, align: "center" },
      { label: "Qtd", property: "qty", width: 32, align: "center" },
      { label: "Preço", property: "prc", width: 62, align: "right" },
      { label: "Total", property: "tot", width: 80, align: "right" },
    ],
    rows,
  };

  await doc.table(table, {
    y: curY,
    columnSpacing: 4,
    padding: 2,
    hideHeader: false,
    headerColor: "#FFFFFF",
    prepareHeader: () => doc.font(FONT_B).fontSize(7.5).fillColor(TEXT_COLOR),
    prepareRow: (_row, _col, rowIdx) => {
      const isTotal = rowIdx === totalRowIdx;
      if (isTotal) {
        doc.font(FONT_B).fontSize(8).fillColor(TEXT_COLOR);
      } else {
        doc.font(FONT_R).fontSize(7.5).fillColor(TEXT_COLOR);
      }
    },
    divider: {
      header: { disabled: false, width: 1, color: LINE_COLOR },
      horizontal: { disabled: false, width: 0.3, color: "#CCCCCC" },
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
//  FUNÇÃO PRINCIPAL — exporta UMA negociação
// ═══════════════════════════════════════════════════════════════════════════

async function getExportPdf(req, res) {
  logger.info("Get Exports Pdf");
  const { supplier, negotiation, client } = req.params;

  try {
    const [ctxRows, ordersRaw] = await Promise.all([
      query(CONTEXT_SQL, [client, supplier, negotiation]),
      query(ORDERS_SQL, [client, supplier, negotiation]),
    ]);

    const ctx = ctxRows[0];
    const orders = ordersRaw[1]; // index 1 por causa do SET sql_mode

    if (!ctx || !orders || orders.length === 0) {
      return res.status(404).json({ message: "Nenhum pedido encontrado." });
    }

    // ── Resolve imagem ──
    const imgBuffer = await resolveImage(ctx.fornImage);

    // ── Cria o documento ──
    const doc = new PDFDocument({
      margin: MX,
      size: "A4",
      bufferPages: true,
      info: {
        Title: `Pedido — ${ctx.nomeForn || supplier}`,
        Author: "Sistema de Pedidos",
      },
    });

    // ── Renderiza a negociação ──
    await renderNegotiation(doc, ctx, orders, imgBuffer);

    // ── Rodapé em todas as páginas ──
    stampFooters(doc);

    // ── Envia o PDF ──
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="pedido_${supplier}_${client}_${negotiation}.pdf"`);
      res.send(pdfBuffer);
    });

    doc.end();
  } catch (error) {
    console.error("Error Export Negotiation PDF:", error);
    res.status(500).json({ message: "Erro ao gerar o PDF.", error: error.message });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  FUNÇÃO — exporta TODAS as negociações de um par fornecedor + cliente
//  Gera um único PDF com várias negociações, cada uma em sua própria página,
//  no mesmo formato (cabeçalho + dados + tabela) da getExportPdf.
// ═══════════════════════════════════════════════════════════════════════════

async function getExportPdfBySupplierClient(req, res) {
  logger.info("Get Exports Pdf (fornecedor + cliente)");
  const { supplier, client } = req.params;

  // ── Lista todas as negociações distintas do par fornecedor/cliente,
  //     ordenadas por prazo (mais próximo primeiro) ──
  const negotiationsSql = `
    SELECT DISTINCT p.codNegoPedido AS codNegociacao, n.prazo
    FROM pedido p
    JOIN negociacao n ON n.codNegociacao = p.codNegoPedido
    WHERE p.codAssocPedido = ?
      AND p.codFornPedido  = ?
    ORDER BY n.prazo IS NULL, n.prazo ASC, p.codNegoPedido`;

  try {
    const negoRows = await query(negotiationsSql, [client, supplier]);

    if (!negoRows || negoRows.length === 0) {
      return res.status(404).json({ message: "Nenhuma negociação encontrada para este fornecedor e cliente." });
    }

    // ── Carrega o contexto + itens de cada negociação ──
    const negotiations = [];
    for (const { codNegociacao } of negoRows) {
      const [ctxRows, ordersRaw] = await Promise.all([
        query(CONTEXT_SQL, [client, supplier, codNegociacao]),
        query(ORDERS_SQL, [client, supplier, codNegociacao]),
      ]);

      const ctx = ctxRows[0];
      const orders = ordersRaw[1]; // index 1 por causa do SET sql_mode

      // Ignora negociações sem itens válidos
      if (!ctx || !orders || orders.length === 0) continue;

      negotiations.push({ ctx, orders });
    }

    if (negotiations.length === 0) {
      return res.status(404).json({ message: "Nenhum pedido encontrado para este fornecedor e cliente." });
    }

    // ── Resolve a imagem do fornecedor uma única vez (mesmo fornecedor) ──
    const imgBuffer = await resolveImage(negotiations[0].ctx.fornImage);

    // ── Cria o documento ──
    const doc = new PDFDocument({
      margin: MX,
      size: "A4",
      bufferPages: true,
      info: {
        Title: `Negociações — ${negotiations[0].ctx.nomeForn || supplier}`,
        Author: "Sistema de Pedidos",
      },
    });

    // ── Renderiza cada negociação, iniciando sempre em uma nova página ──
    //     (cada negociação usa páginas extras somente se a tabela precisar) ──
    for (let i = 0; i < negotiations.length; i++) {
      if (i > 0) doc.addPage();
      await renderNegotiation(doc, negotiations[i].ctx, negotiations[i].orders, imgBuffer);
    }

    // ── Rodapé em todas as páginas ──
    stampFooters(doc);

    // ── Envia o PDF ──
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="negociacoes_${supplier}_${client}.pdf"`);
      res.send(pdfBuffer);
    });

    doc.end();
  } catch (error) {
    console.error("Error Export Negotiations PDF:", error);
    res.status(500).json({ message: "Erro ao gerar o PDF.", error: error.message });
  }
}

module.exports = { getExportPdf, getExportPdfBySupplierClient };
