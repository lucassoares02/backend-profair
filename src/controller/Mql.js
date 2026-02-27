const { connection } = require("@server");
const logger = require("@logger");
const Select = require("@select");
const Insert = require("@insert");

const Mql = {

  async insert(req, res) {
    logger.info("Post Insert Mql");

    const { body } = req

    console.log("Received body:", body);

    // const { symbol, tick, candles, indicators } = req.body;

    // const prompt = buildPrompt(symbol, tick, candles, indicators); // string curta!

    // const response = await openai.chat.completions.create({
    //   model: "gpt-4.1-mini",
    //   messages: [
    //     { role: "system", content: "Você é um assistente de trading quantitativo..." },
    //     { role: "user", content: prompt }
    //   ],
    //   response_format: { type: "json_object" } // peça JSON estrito
    // });

    // const decision = JSON.parse(response.choices[0].message.content);
    // res.json(decision);

  },
};

module.exports = Mql;
