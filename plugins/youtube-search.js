const { cmd } = require("../command");
const yts = require("yt-search");

cmd(
  {
    pattern: "yts",
    alias: ["youtube"],
    desc: "Search for YouTube videos",
    category: "search",
    react: "🔍",
    filename: __filename,
  },
  async (robin, mek, m, { reply, q }) => {
    if (!q) return reply("❌ Please provide a search term.\n\nExample: `.yt Alan Walker Faded`");

    try {
      const search = await yts(q);
      const videos = search.videos.slice(0, 5); // limit to top 5 results

      if (!videos || videos.length === 0) {
        return reply("❌ No results found.");
      }

      let txt = `*🌀ONYX MD🔥YT SEARCH🔎*\n\n🔎 *YouTube Search Results for:* _${q}_\n\n`;

      videos.forEach((v, i) => {
        txt += `*${i + 1}. ${v.title}*\n`;
        txt += `📺 ${v.url}\n`;
        txt += `⏱️ Duration: ${v.timestamp}\n`;
        txt += `👁️ Views: ${v.views.toLocaleString()}\n`;
        txt += `📅 Published: ${v.ago}\n\n`;
      });

      reply(txt.trim());
    } catch (err) {
      console.error("YouTube Search Error:", err);
      reply("❌ Failed to fetch results. Try again later.");
    }
  }
);
