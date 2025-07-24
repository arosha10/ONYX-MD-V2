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
      const { data } = await axios.get('https://arosh.vercel.app/news');
      if (data.status && data.result && data.result.title) {
        const newsText = `📰 *${data.result.title}*\n\n${data.result.fullDesc}\n\nවැඩි විස්තර: ${data.result.link}\n🗓️ දිනය: ${data.result.date}`;
        if (data.result.image) {
          await robin.sendMessage(chatId, {
            image: { url: data.result.image },
            caption: newsText
          }, { quoted: m });
        } else {
          await robin.sendMessage(chatId, {
            text: newsText
          }, { quoted: m });
        }
      } else {
        await robin.sendMessage(chatId, { text: 'නවතම පුවත ලබාගැනීමට නොහැකි විය.' }, { quoted: m });
      }
    } catch (e) {
      await robin.sendMessage(chatId, { text: 'පුවත් ලබාගැනීමේදී දෝෂයක් ඇතිවිය.' }, { quoted: m });
    }
  }
);
