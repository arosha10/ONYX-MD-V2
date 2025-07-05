const { cmd } = require("../command");
const axios = require("axios");

const API_KEY = "1b7769af5d3c551ab5b2ac99cd5f58e2"; // Replace with your GNews or NewsData.io key
const BASE_URL = `https://gnews.io/api/v4/top-headlines?lang=en&max=5&token=${API_KEY}`;

cmd(
  {
    pattern: "news",
    desc: "Get latest news headlines",
    category: "info",
    filename: __filename,
  },
  async (robin, m, { from, isGroup }) => {
    try {
      const chatId = from || m?.key?.remoteJid;
      if (!chatId) {
        console.error("❌ Cannot resolve chat ID (from)");
        return;
      }

      const res = await axios.get(BASE_URL);
      const articles = res.data.articles;

      if (!articles?.length) {
        return await robin.sendMessage(chatId, { text: "No news found!" }, { quoted: m });
      }

      let msg = "*📰 Top News Headlines:*\n\n";
      for (let i = 0; i < articles.length; i++) {
        msg += `*${i + 1}. ${articles[i].title}*\n${articles[i].url}\n\n`;
      }

      await robin.sendMessage(chatId, { text: msg.trim() }, { quoted: m });
    } catch (err) {
      console.error("News plugin error:", err.stack || err);
      try {
        const fallbackId = m?.key?.remoteJid || "status@broadcast";
        await robin.sendMessage(fallbackId, { text: "❌ Failed to fetch news." }, { quoted: m });
      } catch (e) {
        console.error("❌ Failed to send fallback error message:", e.message);
      }
    }
  }
);
