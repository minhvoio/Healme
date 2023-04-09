var express = require("express");
var router = express.Router();

require("dotenv").config({ path: "local.env" });

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function generateResponse(question, maxWords = 3500, creativity = 0.7) {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    max_tokens: maxWords,
    temperature: creativity,
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
  const question = req.body.question;
  const maxWords = req.body.maxWords;
  const creativity = req.body.creativity;
  const responseText = await generateResponse(question, maxWords, creativity);
  res.send(responseText);
});

module.exports = router;
