const functions = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");

exports.chatWithAI = onRequest({ region: "asia-northeast1", secrets: ["OPENROUTER_KEY"], cors: true }, async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send('');
    return;
  }

  try {
    const { default: fetch } = await import('node-fetch');
    const apiKey = process.env.OPENROUTER_KEY;

    if (!apiKey) {
      throw new Error("APIキーがサーバーの環境変数に設定されていません。");
    }

    const { messages, modelName } = req.body.data;
    if (!messages || !modelName) {
      throw new Error("リクエストに必要なデータが不足しています。");
    }

    const apiUrl = "https://openrouter.ai/api/v1/chat/completions";

    // ▼▼▼【最終修正】ヘッダーをcurlテストで成功したものと同じ、最小限の内容に修正▼▼▼
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };
    // ▲▲▲【最終修正ここまで】▲▲▲

    const requestBody = { model: modelName, messages: messages };

    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    const responseData = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("API Error from OpenRouter:", responseData);
      res.status(apiResponse.status).json({ error: `AI APIからのエラー: ${responseData.error?.message || apiResponse.statusText}` });
      return;
    }

    res.status(200).json({ data: responseData });

  } catch (error) {
    console.error("Function crashed:", error);
    res.status(500).json({ error: `Cloud Functionの内部エラー: ${error.message}` });
  }
});