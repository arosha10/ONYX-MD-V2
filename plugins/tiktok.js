const { cmd } = require("../command");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const path = require('path');
const axios = require('axios');

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
      let videoUrl;
      let caption = '🎬 TikTok Video\n> *Thanks for using 🌀ONYX MD🔥*'; // Default caption
      // Try tikwm API first
      try {
        const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(q)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();
        if (data && data.data && data.data.play) {
          videoUrl = data.data.play;
          caption = `🎬 ${data.data.title || 'TikTok Video'}\n> *Thanks for using 🌀ONYX MD🔥*`;
        } else {
          throw new Error('tikwm failed');
        }
      } catch (err) {
        // Fallback to ttdownloader
        try {
          const fallbackRes = await fetch('https://api.ttdownloader.com/req/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: q })
          });
          const fallbackData = await fallbackRes.json();
          if (fallbackData && fallbackData.nowm) {
            videoUrl = fallbackData.nowm;
            caption = `🎬 TikTok Video\n> *Thanks for using 🌀ONYX MD🔥*`;
          } else {
            throw new Error('Fallback failed');
          }
        } catch (fallbackErr) {
          return reply('❌ All TikTok downloaders failed. Please try again later.');
        }
      }

      // Download-then-upload approach
      const tempFile = path.join(__dirname, `temp_tiktok_${Date.now()}.mp4`);
      const response = await axios.get(videoUrl, { responseType: 'stream' });
      const writer = fs.createWriteStream(tempFile);
      response.data.pipe(writer);
      writer.on('finish', async () => {
        await robin.sendMessage(
          mek.key.remoteJid,
          { video: fs.readFileSync(tempFile), mimetype: 'video/mp4', caption },
          { quoted: mek }
        );
        fs.unlinkSync(tempFile); // Clean up
      });
      writer.on('error', () => {
        reply('❌ Failed to download and send the video.');
      });
    } catch (err) {
      console.error('TikTok download error:', err);
      reply('❌ Failed to download video. Please check the link and try again.');
    }
  }
);
