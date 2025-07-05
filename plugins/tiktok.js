const { cmd } = require("../command");
const { ttdl } = require("ruhend-scraper");

cmd(
  {
    pattern: "tt",
    alias: ["tiktok"],
    desc: "Download TikTok video",
    category: "download",
    react: "🎁",
    filename: __filename,
  },
  async (robin, mek, m, { reply, q }) => {
    if (!q) return reply("❌ Please provide a TikTok video URL.");
    if (!q.includes("tiktok.com")) return reply("❌ Invalid TikTok URL.");

    try {
      const data = await ttdl(q);
      if (!data || !data.video) {
        return reply("❌ Could not fetch TikTok video.");
      }
      await robin.sendFileUrl(
        mek.key.remoteJid,
        data.video,
        `🎬 ${data.title || "TikTok Video"}\n> *Thanks for using 🌀ONYX MD🔥*`,
        mek
      );
    } catch (err) {
      console.error("TikTok download error:", err);
      reply("❌ Failed to download video. Please check the link and try again.");
    }
  }
);
