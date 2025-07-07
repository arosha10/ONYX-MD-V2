const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "tiktok",
    alias: ["ttdl", "ttvideo"],
    react: "🎵",
    desc: "Download TikTok Video",
    category: "download",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    {
      from,
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      reply,
    }
  ) => {
    try {
      if (!q) return reply("*Please provide a valid TikTok video URL!* 🎵");

      // Basic TikTok URL validation
      const tiktokRegex = /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/[\w@\-\.]+\/video\/[0-9]+/;
      if (!tiktokRegex.test(q)) {
        return reply("*Invalid TikTok URL! Please provide a valid TikTok video link.* 🎵");
      }

      reply("*Downloading your TikTok video...* 🎵");

      const apiUrl = `https://shamika-api.vercel.app/download/tiktokdl?url=${encodeURIComponent(q)}`;
      let videoUrl = null;
      let errorMessage = "";

      try {
        const response = await axios.get(apiUrl, { timeout: 15000 });
        if (response.data.status && response.data.result && response.data.result.video) {
          videoUrl = response.data.result.video;
        } else {
          errorMessage = response.data.err || "Unknown error from TikTok API.";
        }
      } catch (err) {
        errorMessage = err.message;
      }

      if (!videoUrl) {
        return reply(`*Failed to download TikTok video.* 🎵\n\nReason: ${errorMessage}\n\nPlease try again with a different link.`);
      }

      // Validate the video URL
      try {
        const videoResponse = await axios.head(videoUrl, { timeout: 5000 });
        if (videoResponse.status !== 200) {
          throw new Error('Video URL not accessible');
        }
      } catch (videoErr) {
        return reply("*The extracted video URL is not accessible. The API may have returned an invalid link.* 🎵");
      }

      // Send the video
      await robin.sendMessage(
        from,
        {
          video: { url: videoUrl },
          caption: "*🎵 TikTok Video Downloaded Successfully!*\n\n> *Thanks for using 🌀ONYX MD🔥 TikTok Downloader!*"
        },
        { quoted: mek }
      );
    } catch (e) {
      reply(`*❌ Error: ${e.message || e}*\n\nPlease try again with a different TikTok URL.`);
    }
  }
); 