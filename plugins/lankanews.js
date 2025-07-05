const { cmd } = require("../command");
const axios = require("axios");

const API_KEY = "pub_cee86fbdcacb4f02a5dfb9e6664792d4"; // Replace with your key from https://newsdata.io/
const BASE_URL = `https://newsdata.io/api/1/news?country=lk&language=en&apikey=${API_KEY}`;

cmd(
  {
    pattern: "lankanews",
    desc: "Get top news from Sri Lanka",
    category: "news",
    filename: __filename,
  },
  async (robin, m, { from }) => {
    const chatId = from || m?.key?.remoteJid || "status@broadcast";

    try {
      const res = await axios.get(BASE_URL);
      const news = res.data.results;

      if (!news || news.length === 0) {
        return await robin.sendMessage(chatId, { text: "❌ No Sri Lankan news found." }, { quoted: m });
      }

      let msg = "*🇱🇰 Top Sri Lankan News:*\n\n";
      news.slice(0, 5).forEach((n, i) => {
        msg += `*${i + 1}. ${n.title}*\n${n.link}\n\n`;
      });

      await robin.sendMessage(chatId, { text: msg.trim() }, { quoted: m });
    } catch (err) {
      console.error("🛑 Lankan news error:", err.message);
      try {
        await robin.sendMessage(chatId, { text: "❌ Failed to fetch Lankan news." }, { quoted: m });
      } catch (e) {
        console.error("❌ Fallback send failed:", e.message);
      }
    }
  }
);
