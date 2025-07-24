const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "news",
    desc: "Get the latest news",
    category: "news",
    filename: __filename,
  },
  async (robin, m, { from }) => {
    const chatId = from || m?.key?.remoteJid || "status@broadcast";
    try {
      const { data } = await axios.get('https://shamika-api.vercel.app/news/gossiplankanews');
      if (data.status && data.result && data.result.title) {
        await robin.sendMessage(chatId, {
          text: `📰 *${data.result.title}*\n\n${data.result.fullDesc}\n\nවැඩි විස්තර: ${data.result.link}\n🗓️ දිනය: ${data.result.date}`
        }, { quoted: m });
      } else {
        await robin.sendMessage(chatId, { text: 'නවතම පුවත ලබාගැනීමට නොහැකි විය.' }, { quoted: m });
      }
    } catch (e) {
      await robin.sendMessage(chatId, { text: 'පුවත් ලබාගැනීමේදී දෝෂයක් ඇතිවිය.' }, { quoted: m });
    }
  }
);
