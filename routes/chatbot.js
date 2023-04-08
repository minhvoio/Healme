var express = require("express");
var router = express.Router();

require("dotenv").config({ path: "local.env" });

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function generateResponse(question) {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: question,
      },
    ],
  });
  const result = completion.data.choices[0].message.content;
  return result;
}

router.post("/", async (req, res) => {
  const ask = req.body.question;
  const responseText = await generateResponse(ask);
  res.send(responseText);
});

module.exports = router;
