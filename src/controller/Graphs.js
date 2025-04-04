const { connection } = require("@server");
const logger = require("@logger");
const Select = require("@select");
const Insert = require("@insert");
// const PDFDocument = require("pdfkit");
const fs = require("fs");
const PDFDocument = require("pdfkit-table");
const path = require("path");

const Graphs = {
  async getPercentageClients(req, res) {
    logger.info("Get Percentage Clients");

    const { codprovider } = req.params;

    const queryConsult = `SET sql_mode = ''; SELECT (COUNT(DISTINCT pedido.codAssocPedido) * 100.0) / (SELECT COUNT(*) FROM associado) AS porcentagem, COUNT(DISTINCT pedido.codAssocPedido) AS realizados, (SELECT COUNT(*) FROM associado) AS total FROM pedido WHERE pedido.codFornPedido = ${codprovider}`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Percentage Clients: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getPercentagePovidersByClients(req, res) {
    logger.info("Get Percentage Providers by Clients");

    const { codbuyer } = req.params;

    const queryConsult = `
    SET sql_mode = ''; SELECT (COUNT(DISTINCT pedido.codFornPedido ) * 100.0) / (SELECT COUNT(*) 
    FROM fornecedor f) AS porcentagem,
    COUNT(DISTINCT pedido.codFornPedido) AS realizados, 
    (SELECT COUNT(*) FROM fornecedor f2) AS total
    FROM pedido 
    WHERE pedido.codComprPedido  = ${codbuyer}
    `;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Percentage Providers by Clients: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getPercentageClientsOrganization(req, res) {
    logger.info("Get Percentage Clients Organization");

    const queryConsult = ` SET sql_mode = ''; SELECT 
    (COUNT(DISTINCT pedido.codAssocPedido) * 100.0) / (SELECT COUNT(*) FROM associado) AS porcentagem, 
    COUNT(DISTINCT pedido.codAssocPedido) AS realizados, (SELECT COUNT(*) FROM associado) AS total FROM pedido`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Percentage Clients: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getPercentageProvidersOrganization(req, res) {
    logger.info("Get Percentage Providers Organization");

    const queryConsult = `
    SET sql_mode = ''; SELECT 
    (COUNT(DISTINCT pedido.codFornPedido) * 100.0) / (SELECT COUNT(*) FROM fornecedor) AS porcentagem, 
    COUNT(DISTINCT pedido.codFornPedido) AS realizados, 
    (SELECT COUNT(*) FROM fornecedor f) AS total FROM pedido `;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Percentage Providers: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },

  async getTotalValueClients(req, res) {
    logger.info("Get Total Value Clients");

    const { codprovider } = req.params;

    const queryConsult = `SET sql_mode = ''; SELECT a.razao, FORMAT(SUM(IFNULL(m.precoMercadoria * p.quantMercPedido, 0)), 2, 'de_DE') AS 'valorTotal' FROM associado AS a LEFT JOIN pedido AS p ON p.codAssocPedido = a.codAssociado LEFT JOIN relacionafornecedor AS rf ON rf.codFornecedor = p.codFornPedido LEFT JOIN mercadoria AS m ON m.codMercadoria = p.codMercPedido AND rf.codFornecedor = ${codprovider} GROUP BY a.codAssociado, a.cnpjAssociado, a.razao ORDER BY SUM(IFNULL(m.precoMercadoria * p.quantMercPedido, 0)) DESC;`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Total Value Clients: ", error);
      } else {
        return res.json(results[1]);
      }
    });
    // connection.end();
  },
  async getExportPdfOld(req, res) {
    logger.info("Get Exports Pdf");

    // Lista de mercadorias
    const listaMercadorias = [
      {
        nome: "Arroz",
        quantidade: 3,
        unidade: "CX",
        precoUnitario: 30.0,
      },
      {
        nome: "Feijão",
        quantidade: 2,
        unidade: "KG",
        precoUnitario: 12.5,
      },
      {
        nome: "Leite",
        quantidade: 1,
        unidade: "L",
        precoUnitario: 5.0,
      },
    ];

    // Criar um novo documento PDF
    const doc = new PDFDocument({ margin: 30, size: "A4" });

    const table = {
      title: "Pedido",
      subtitle: "Mercantil BNH",
      headers: [
        { label: "Código", property: "name", width: 60, renderer: null },
        { label: "Description", property: "description", width: 210, renderer: null },
        { label: "Quantidade", property: "quantity", width: 70, renderer: null },
        { label: "Fator", property: "factor", width: 70, renderer: null },
        { label: "Preço", property: "price", width: 100, renderer: null },
        { label: "Total", property: "total", width: 80, renderer: null },
      ],
      rows: [
        ["1", "Mercadoria 1", "1", "CX", "R$105,99", "R$105,99"],
        ["23534", "Mercadoria 2", "2", "CX", "R$45,00", "R$90,00"],
        // [...],
      ],
    };

    // the magic
    doc.table(table, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
    });

    // Criar um buffer para armazenar o conteúdo do PDF
    const chunks = [];
    doc.on("data", (chunk) => {
      chunks.push(chunk);
    });

    doc.on("end", () => {
      // Junte todos os chunks em um único Buffer
      const pdfBuffer = Buffer.concat(chunks);
      // Definir cabeçalhos para enviar o PDF como resposta HTTP
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'inline; filename="documento.pdf"');
      // Enviar o PDF como resposta
      res.send(pdfBuffer);
    });

    // Finalizar o documento PDF
    doc.end();
  },

  async getExportPdf(req, res) {
    logger.info("Get Exports Pdf");
    const { supplier, negotiation, client } = req.params;

    let queryConsult = `
    SET sql_mode = ''; SELECT 
    mercadoria.codMercadoria as product,
    mercadoria.nomeMercadoria as title,
    mercadoria.barcode,
    mercadoria.embMercadoria as packing,
    mercadoria.fatorMerc as factor,
    mercadoria.complemento as  complement,
    mercadoria.marca as brand,  
    a.codAssociado  as client,
    a.razaoAssociado as client_name,
    f.codForn as provider,
    f.nomeForn as provider_name,
    IFNULL(SUM(pedido.quantMercPedido), 0) as 'quantity', 
    mercadoria.precoMercadoria as price,
    mercadoria.precoUnit as unitprice,
    IFNULL(SUM(mercadoria.precoMercadoria * pedido.quantMercPedido), 0) as 'totalprice' 
    FROM 
        mercadoria 
    JOIN 
        pedido ON pedido.codMercPedido = mercadoria.codMercadoria 
    JOIN
    	associado a ON pedido.codAssocPedido = a.codAssociado 
    JOIN 
    	fornecedor f ON pedido.codFornPedido = f.codForn 
    WHERE 
        pedido.codAssocPedido = ${client}
        AND pedido.codfornpedido =  ${supplier} 
        AND pedido.codNegoPedido =  ${negotiation}  
    GROUP BY 
        mercadoria.codMercadoria
        
    HAVING 
    totalprice != 0
    ORDER BY 
        quantMercPedido;`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Export Negotiation : ", error);
      } else {
        let valorTotal = 0;
        let testefull = [];
        let clientQuery = `${results[1][0].client} - ${results[1][0].client_name}`;
        let providerQuery = `${results[1][0].provider} - ${results[1][0].provider_name}`;

        results[1].map((item) => {
          let itemP = [];
          itemP.push(item.product);
          itemP.push(item.barcode);
          itemP.push(item.title);
          itemP.push(`${item.packing} | ${item.factor}`);
          itemP.push(item.quantity);
          itemP.push(
            item.price.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          );
          itemP.push(
            item.totalprice.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          );

          valorTotal += item.totalprice;

          testefull.push(itemP);
        });

        let itemP = [];
        itemP.push("Total");
        itemP.push("");
        itemP.push("");
        itemP.push("");
        itemP.push("");
        itemP.push("");
        itemP.push(
          valorTotal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })
        );

        testefull.push(itemP);

        const doc = new PDFDocument({ margin: 20, size: "A4" });

        const table = {
          title: providerQuery,
          subtitle: clientQuery,
          headers: [
            { label: "Produto", property: "name", width: 40, renderer: null },
            { label: "Código de barras", property: "barcode", width: 70, renderer: null },
            { label: "Descrição", property: "description", width: 200, renderer: null },
            { label: "Fator", property: "brand", width: 50, renderer: null },
            { label: "Quantidade", property: "quantity", width: 60, renderer: null },
            { label: "Preço", property: "price", width: 60, renderer: null },
            { label: "Valor Total", property: "total", width: 80, renderer: null },
          ],
          rows: testefull,
        };

        // the magic
        doc.table(table, {
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
        });

        // Criar um buffer para armazenar o conteúdo do PDF
        const chunks = [];
        doc.on("data", (chunk) => {
          chunks.push(chunk);
        });

        doc.on("end", () => {
          // Junte todos os chunks em um único Buffer
          const pdfBuffer = Buffer.concat(chunks);
          // Definir cabeçalhos para enviar o PDF como resposta HTTP
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", 'inline; filename="documento.pdf"');
          // Enviar o PDF como resposta
          res.send(pdfBuffer);
        });

        // Finalizar o documento PDF
        doc.end();
      }
    });
  },


  async getExportPdfTesteLayoutDeep(req, res) {
    logger.info("Get Exports Pdf");
    const { supplier, negotiation, client } = req.params;

    let queryConsult = `
    SET sql_mode = ''; SELECT 
    mercadoria.codMercadoria as product,
    mercadoria.nomeMercadoria as title,
    mercadoria.barcode,
    mercadoria.embMercadoria as packing,
    mercadoria.fatorMerc as factor,
    mercadoria.complemento as  complement,
    mercadoria.marca as brand,  
    a.codAssociado  as client,
    a.razaoAssociado as client_name,
    f.codForn as provider,
    f.nomeForn as provider_name,
    IFNULL(SUM(pedido.quantMercPedido), 0) as 'quantity', 
    mercadoria.precoMercadoria as price,
    mercadoria.precoUnit as unitprice,
    IFNULL(SUM(mercadoria.precoMercadoria * pedido.quantMercPedido), 0) as 'totalprice' 
    FROM 
        mercadoria 
    JOIN 
        pedido ON pedido.codMercPedido = mercadoria.codMercadoria 
    JOIN
    	associado a ON pedido.codAssocPedido = a.codAssociado 
    JOIN 
    	fornecedor f ON pedido.codFornPedido = f.codForn 
    WHERE 
        pedido.codAssocPedido = ${client}
        AND pedido.codfornpedido =  ${supplier} 
        AND pedido.codNegoPedido =  ${negotiation}  
    GROUP BY 
        mercadoria.codMercadoria
        
    HAVING 
    totalprice != 0
    ORDER BY 
        quantMercPedido;`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Export Negotiation : ", error);
      } else {
        let valorTotal = 0;
        let testefull = [];
        let clientQuery = `${results[1][0].client} - ${results[1][0].client_name}`;
        let providerQuery = `${results[1][0].provider} - ${results[1][0].provider_name}`;

        results[1].map((item) => {
          let itemP = [];
          itemP.push(item.product);
          itemP.push(item.barcode);
          itemP.push(item.title);
          itemP.push(`${item.packing} | ${item.factor}`);
          itemP.push(item.quantity);
          itemP.push(
            item.price.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          );
          itemP.push(
            item.totalprice.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          );

          valorTotal += item.totalprice;

          testefull.push(itemP);
        });

        let itemP = [];
        itemP.push("Total");
        itemP.push("");
        itemP.push("");
        itemP.push("");
        itemP.push("");
        itemP.push("");
        itemP.push(
          valorTotal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })
        );

        testefull.push(itemP);

        const doc = new PDFDocument({ margin: 20, size: "A4" });
        const fs = require('fs');

        // Adicionar cabeçalho personalizado
        function addHeader(doc) {
          // Adicionar imagem (substitua pelo caminho da sua imagem)
          if (fs.existsSync('/src/assets/logo.png')) {
            doc.image('/src/assets/logo.png', 20, 20, { width: 100 });
          }

          // Informações da empresa
          doc.font('Helvetica-Bold')
            .fontSize(12)
            .text('Nome da Empresa', 130, 30);

          doc.font('Helvetica')
            .fontSize(10)
            .text('Endereço: Rua Exemplo, 123', 130, 45)
            .text('Telefone: (11) 1234-5678', 130, 60)
            .text('CNPJ: 12.345.678/0001-90', 130, 75);

          // Data e hora atual
          const now = new Date();
          const dateTimeString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();

          doc.font('Helvetica-Oblique')
            .fontSize(8)
            .text(`Gerado em: ${dateTimeString}`, 400, 30, { align: 'right' });

          // Linha divisória
          doc.moveTo(20, 100)
            .lineTo(580, 100)
            .stroke();

          // Título do documento
          doc.font('Helvetica-Bold')
            .fontSize(14)
            .text('RELATÓRIO DE PRODUTOS', { align: 'center' })
            .moveDown(0.5);

          // Informações do fornecedor e cliente
          doc.font('Helvetica-Bold')
            .fontSize(10)
            .text(`Fornecedor: ${providerQuery}`, { align: 'left' });

          doc.font('Helvetica-Bold')
            .fontSize(10)
            .text(`Cliente: ${clientQuery}`, { align: 'left' })
            .moveDown(1);
        }

        // Chamar a função para adicionar o cabeçalho
        addHeader(doc);

        // Configurar a tabela
        const table = {
          headers: [
            { label: "Produto", property: "name", width: 40, renderer: null },
            { label: "Código de barras", property: "barcode", width: 70, renderer: null },
            { label: "Descrição", property: "description", width: 200, renderer: null },
            { label: "Fator", property: "brand", width: 50, renderer: null },
            { label: "Quantidade", property: "quantity", width: 60, renderer: null },
            { label: "Preço", property: "price", width: 60, renderer: null },
            { label: "Valor Total", property: "total", width: 80, renderer: null },
          ],
          rows: testefull,
        };

        // Adicionar a tabela ao documento
        doc.table(table, {
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
          prepareRow: (row, indexColumn, indexRow, rectRow) => {
            doc.font("Helvetica").fontSize(8);
          }
        });

        // Adicionar rodapé
        doc.font('Helvetica-Oblique')
          .fontSize(8)
          .text('© 2023 Minha Empresa - Todos os direitos reservados', { align: 'center' });

        // Criar buffer para o PDF
        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(chunks);
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", 'inline; filename="documento.pdf"');
          res.send(pdfBuffer);
        });

        doc.end();
      }
    });
  },


  async getExportPdfTesteLayoutGpt(req, res) {
    logger.info("Get Exports Pdf");
    const { supplier, negotiation, client } = req.params;

    let queryConsult = `
    SET sql_mode = ''; SELECT 
    mercadoria.codMercadoria as product,
    mercadoria.nomeMercadoria as title,
    mercadoria.barcode,
    mercadoria.embMercadoria as packing,
    mercadoria.fatorMerc as factor,
    mercadoria.complemento as  complement,
    mercadoria.marca as brand,  
    a.codAssociado  as client,
    a.razaoAssociado as client_name,
    f.codForn as provider,
    f.nomeForn as provider_name,
    IFNULL(SUM(pedido.quantMercPedido), 0) as 'quantity', 
    mercadoria.precoMercadoria as price,
    mercadoria.precoUnit as unitprice,
    IFNULL(SUM(mercadoria.precoMercadoria * pedido.quantMercPedido), 0) as 'totalprice' 
    FROM 
        mercadoria 
    JOIN 
        pedido ON pedido.codMercPedido = mercadoria.codMercadoria 
    JOIN
    	associado a ON pedido.codAssocPedido = a.codAssociado 
    JOIN 
    	fornecedor f ON pedido.codFornPedido = f.codForn 
    WHERE 
        pedido.codAssocPedido = ${client}
        AND pedido.codfornpedido =  ${supplier} 
        AND pedido.codNegoPedido =  ${negotiation}  
    GROUP BY 
        mercadoria.codMercadoria
        
    HAVING 
    totalprice != 0
    ORDER BY 
        quantMercPedido;`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Export Negotiation : ", error);
      } else {
        let valorTotal = 0;
        let testefull = [];
        let clientQuery = `${results[1][0].client} - ${results[1][0].client_name}`;
        let providerQuery = `${results[1][0].provider} - ${results[1][0].provider_name}`;

        results[1].map((item) => {
          let itemP = [];
          itemP.push(item.product);
          itemP.push(item.barcode);
          itemP.push(item.title);
          itemP.push(`${item.packing} | ${item.factor}`);
          itemP.push(item.quantity);
          itemP.push(
            item.price.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          );
          itemP.push(
            item.totalprice.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          );

          valorTotal += item.totalprice;

          testefull.push(itemP);
        });

        let itemP = [];
        itemP.push("Total");
        itemP.push("");
        itemP.push("");
        itemP.push("");
        itemP.push("");
        itemP.push("");
        itemP.push(
          valorTotal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })
        );

        testefull.push(itemP);

        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(chunks);
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", 'inline; filename="documento.pdf"');
          res.send(pdfBuffer);
        });

        // ** CABEÇALHO **

        // Inserir uma imagem no topo (ajuste o caminho conforme necessário)
        const logoPath = path.join(__dirname, "/src/assets/logo.png"); // Certifique-se de ter um logo na pasta do projeto
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 20, 20, { width: 100 });
        }

        // Nome da empresa
        doc
          .font("Helvetica-Bold")
          .fontSize(16)
          .text("Nome da Empresa", 140, 30)
          .fontSize(10)
          .text("Rua Exemplo, 123 - Cidade - Estado", 140, 50)
          .text("Email: contato@empresa.com | Tel: (00) 1234-5678", 140, 65)
          .moveDown();

        // Linha separadora
        doc.moveTo(20, 90).lineTo(570, 90).stroke();

        // ** INFORMAÇÕES DO DOCUMENTO **

        // Data e hora
        const now = new Date().toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo",
        });

        doc
          .font("Helvetica")
          .fontSize(12)
          .text(`Data: ${now}`, 420, 100, { align: "right" });

        doc
          .font("Helvetica-Bold")
          .fontSize(14)
          .text("Pedido de Compra", 20, 110)
          .moveDown(0.5);

        // Cliente e fornecedor
        doc
          .font("Helvetica")
          .fontSize(12)
          .text(`Fornecedor: ${providerQuery}`, 20, 130)
          .text(`Cliente: ${clientQuery}`, 20, 145)
          .moveDown(1);

        // ** LINHA SEPARADORA ANTES DA TABELA **
        doc.moveTo(20, 170).lineTo(570, 170).stroke();

        // ** TABELA DE PRODUTOS **
        const table = {
          headers: [
            { label: "Produto", property: "name", width: 80 },
            { label: "Código de barras", property: "barcode", width: 90 },
            { label: "Descrição", property: "description", width: 160 },
            { label: "Fator", property: "brand", width: 50 },
            { label: "Quantidade", property: "quantity", width: 60 },
            { label: "Preço", property: "price", width: 60 },
            { label: "Valor Total", property: "total", width: 80 },
          ],
          rows: testefull,
        };

        // Aplicando estilos à tabela
        doc.table(table, {
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
          prepareRow: (row, i) => doc.font("Helvetica").fontSize(8),
        });

        // Finalizar o documento PDF
        doc.end();
      };
    });
  },

  async getExportPdfBackup(req, res) {
    logger.info("Get Exports Pdf");
    const { codforn } = req.params;

    const queryConsult = `
        SET sql_mode = ''; select
          p.codMercPedido,
          concat(m.codMercadoria_ext," - ", m.nomeMercadoria) as nomeMercadoria,
          m.complemento,
          m.barcode,
          m.erpcode,
          m.marca,
          p.quantMercPedido as quantidade,
          p.codFornPedido,
          p.codAssocPedido,
          p.codNegoPedido ,
          p.codMercPedido
          from pedido p
          join mercadoria m 
          where m.codMercadoria = p.codMercPedido 
          order by p.codNegoPedido;`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Export Negotiation : ", error);
      } else {
        // Criar um novo documento PDF
        const doc = new PDFDocument({ margin: 30, size: "A4" });

        // Configurar os cabeçalhos de resposta para fazer o download
        res.setHeader("Content-Disposition", `attachment; filename="negociacoes.pdf"`);
        res.setHeader("Content-Type", "application/pdf");

        // Pipe o PDF para a resposta HTTP
        doc.pipe(res);

        // Escrever os dados no PDF
        doc.font("Helvetica-Bold").fontSize(12).text("ID Negociacao Codigo ERP Codigo de Barras Produto Complemento Marca Quantidade", { align: "left" });

        results[1].forEach((row) => {
          doc.fontSize(10).text(`${row.codMercPedido} ${row.codNegoPedido} ${row.erpcode} ${row.barcode} ${row.nomeMercadoria} ${row.complemento} ${row.marca} ${row.quantidade}`, {
            align: "left",
          });
        });

        // Finalizar o documento PDF
        doc.end();
      }
    });
  },

  async getTotalInformations(req, res) {
    logger.info("Get Total Informations");

    const queryConsult = `SET sql_mode = ''; select
      sum(pedido.quantMercPedido * mercadoria.precoMercadoria) as total
      from pedido 
      join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido 
      union 
      SELECT COUNT(*) AS total
FROM (
  SELECT asd.codAssociado
  FROM log l
  JOIN acesso a ON a.codAcesso = l.userAgent
  JOIN consultor c ON c.codConsult = a.codUsuario
  JOIN relaciona r ON r.codAssocRelaciona = c.codConsult
  JOIN associado asd ON asd.codAssociado = r.codConsultRelaciona
  GROUP BY asd.codAssociado
) AS resultado
      union
      select 
      count(fornecedor.codForn) as fornecedores
      from fornecedor
      union
      select 
      count(mercadoria.codMercadoria) as mercadorias
      from mercadoria;`;
    // const queryConsult = `SET sql_mode = ''; select
    //   sum(pedido.quantMercPedido * mercadoria.precoMercadoria) as total
    //   from pedido 
    //   join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido 
    //   union 
    //   select
    //   count(associado.codAssociado) as associados
    //   from associado
    //   union
    //   select 
    //   count(fornecedor.codForn) as fornecedores
    //   from fornecedor
    //   union
    //   select 
    //   count(mercadoria.codMercadoria) as mercadorias
    //   from mercadoria;`;

    connection.query(queryConsult, (error, results, fields) => {
      if (error) {
        console.log("Error Select Total Informations: ", error);
      } else {
        let data = [];
        const titles = ["Total negociado", "Associados", "Fonecedores", "Mercadorias"];

        i = 0;
        for (i = 0; i < results[1].length; i++) {
          data.push({
            title: titles[i],
            addInfo: "",
            icon: "",
            color: "",
            total: results[1][i]["total"] != null ? results[1][i]["total"] : 0,
          });
        }
        res.json(data);
      }
    });
    // connection.end();
  },
};

module.exports = Graphs;
