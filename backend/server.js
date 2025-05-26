const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// 🔐 Replace this with your actual OpenRouter API key
const OPENROUTER_API_KEY = "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";

app.use(express.json());
app.use(cors());

app.post("/generate", async (req, res) => {
  const { prompt, model } = req.body;

  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const effectiveModel = model || "qwen/qwen-2.5-72b-instruct";

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions ", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: effectiveModel,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text(); // Get exact error from OpenRouter
      console.error("❌ OpenRouter Error Response:", errorText);
      return res.status(500).json({
        error: "OpenRouter API request failed",
        details: errorText
      });
    }

    const data = await response.json();

    // Extract generated text
    const generatedText = data.choices[0]?.message?.content || "No content generated.";
    res.json({ content: generatedText }); // Return content in the expected format
  } catch (err) {
    console.error("⚠️ Server Error:", err.message);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});