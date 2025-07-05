const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "tr",
    alias: ["translate"],
    desc: "Translate text to specified language",
    category: "tools",
    react: "🌐",
    filename: __filename,
  },
  async (robin, mek, m, { reply, q }) => {
    if (!q) {
      return reply("❌ Please provide language code followed by text.\n\nExample:\n`.tr si Hello, how are you?`");
    }

    const [langCode, ...textParts] = q.trim().split(" ");
    const textToTranslate = textParts.join(" ");

    if (!langCode || !textToTranslate) {
      return reply("❌ Invalid format.\nUse `.tr <language_code> <text>`\nExample: `.tr ta Good morning`");
    }

    try {
      const res = await axios.get("https://translate.googleapis.com/translate_a/single", {
        params: {
          client: "gtx",
          sl: "auto",
          tl: langCode,
          dt: "t",
          q: textToTranslate,
        },
      });

      const translated = res.data[0][0][0];

      await reply(`🌍 Translated to *${langCode}*:\n${translated}`);
    } catch (err) {
      console.error("Translate plugin error:", err);
      reply("❌ Failed to translate. Check your language code or try again.");
    }
  }
);
