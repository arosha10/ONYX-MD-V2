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
      if (data.title) {
        const newsText = `*NEWS UPDATE (ONYX) ✅*\n\n📰 *${data.title}*\n\n${data.description}\n\n> *BY AROSH SAMUDITHA*`;
        if (data.image) {
          await robin.sendMessage(chatId, {
            image: { url: data.image },
            caption: newsText
          }, { quoted: m });
        } else {
          await robin.sendMessage(chatId, { text: newsText }, { quoted: m });
        }
      } else {
        await robin.sendMessage(chatId, { text: 'නවතම පුවත ලබාගැනීමට නොහැකි විය.' }, { quoted: m });
      }
    } catch (e) {
      await robin.sendMessage(chatId, { text: 'පුවත් ලබාගැනීමේදී දෝෂයක් ඇතිවිය.' }, { quoted: m });
    }
  }
);
