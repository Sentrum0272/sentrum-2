async function generateWithOllama({ industry, location, topic, tone, cta }) {
  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gemma3",
      messages: [
        {
          role: "system",
          content:
            "你是一位台灣企業內容行銷編輯。請只輸出 JSON，不要輸出其他說明。"
        },
        {
          role: "user",
          content: `
請根據以下資訊產出 JSON。
產業：${industry}
地區：${location}
主題：${topic}
語氣：${tone}
CTA：${cta}

請輸出欄位：
title
summary
content
seoTitle
seoDescription

要求：
1. 使用繁體中文（台灣用語）
2. content 必須是 HTML，至少包含 3 個 h2 與對應 p
3. 適合企業官網 SEO 文章
4. 不要使用 markdown
5. 只輸出 JSON
          `.trim()
        }
      ],
      format: "json",
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama API 錯誤：${response.status}`);
  }

  const result = await response.json();
  const text = result?.message?.content?.trim();

  if (!text) {
    throw new Error("Ollama 沒有回傳內容");
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    console.error("Ollama 原始回傳：", text);
    throw new Error("Ollama 回傳不是有效 JSON");
  }

  return {
    title: parsed.title || "",
    summary: parsed.summary || "",
    content: parsed.content || "",
    seoTitle: parsed.seoTitle || "",
    seoDescription: parsed.seoDescription || ""
  };
}

window.OllamaClient = {
  generateWithOllama
};