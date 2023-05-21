var express = require("express");
var router = express.Router();

require("dotenv").config({ path: "local.env" });
const langdetect = require("langdetect");
const { Configuration, OpenAIApi } = require("openai");
const verifyToken = require("../middlewares/verifyToken");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function generateResponse(question, maxWords = 3500, creativity = 0.7) {
  const language = detectLanguage(question); // Detect language
  const specializeQuestion = getSpecializeQuestion(question, language);
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    max_tokens: maxWords,
    temperature: creativity,
    messages: [
      {
        role: "user",
        content: specializeQuestion,
      },
    ],
  });
  const result = completion.data.choices[0].message;
  return { result, language };
}

function detectLanguage(question) {
  const getLanguageObject = langdetect.detect(question);
  const detectedLanguage = getLanguageObject[0].lang;
  const supportedLanguages = ["en", "vi", "zh-cn", "fr"];
  if (supportedLanguages.includes(detectedLanguage)) {
    return detectedLanguage;
  }
  // Default to Vietnamese if language detection fails or unsupported language
  return "vi";
}

function getSpecializeQuestion(question, language) {
  let specializeQuestion = "";
  if (language === "en") {
    specializeQuestion =
      "I have " +
      question +
      `. Please guide me on how to treat the condition. Also, provide citations and only select sources with reliable medical information.`;
  } else if (language === "vi") {
    specializeQuestion =
      "Tôi bị " +
      question +
      `. Hãy hướng dẫn tôi cách trị bệnh. Đồng thời trích dẫn nguồn và chỉ chọn nguồn có thông tin y tế đáng tin cậy.`;
  } else if (language === "zh-cn") {
    specializeQuestion =
      "我患有" +
      question +
      `。请指导我如何治疗这种情况。同时，请提供引用和只选择可靠的医学资料来源。`;
  } else if (language === "fr") {
    specializeQuestion =
      "Je suis atteint(e) de " +
      question +
      `. Veuillez me guider sur la façon de traiter cette condition. Fournissez également des citations et ne sélectionnez que des sources d'informations médicales fiables.`;
  }
  return specializeQuestion;
}

router.post("/", async (req, res) => {
  const question = req.body.question;
  const maxWords = req.body.maxWords;
  const creativity = req.body.creativity;
  const { result, language } = await generateResponse(
    question,
    maxWords,
    creativity
  );
  res.send({ result, language });
});

module.exports = router;
