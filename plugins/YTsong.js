const { cmd, commands } = require("../command");
const yts = require("yt-search");
const { ytmp3 } = require("@vreden/youtube_scraper");


const normalizeYouTubeUrl = (inputUrl) => {
  try {
    let videoId = null;

    if (!inputUrl.startsWith("http")) {
      inputUrl = "https://" + inputUrl;
    }

    const urlObj = new URL(inputUrl);
    const hostname = urlObj.hostname.replace("www.", "");

    if (hostname === "youtu.be") {
      videoId = urlObj.pathname.slice(1);
    } else if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (urlObj.pathname === "/watch") {
        videoId = urlObj.searchParams.get("v");
      } else if (urlObj.pathname.startsWith("/embed/")) {
        videoId = urlObj.pathname.split("/embed/")[1];
      } else if (urlObj.pathname.startsWith("/shorts/")) {
        videoId = urlObj.pathname.split("/shorts/")[1];
      }
    }

    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return `https://www.youtube.com/watch?v=${videoId}`;
    }

    const match = inputUrl.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) {
      return `https://www.youtube.com/watch?v=${match[1]}`;
    }

    return inputUrl;
  } catch {
    return inputUrl;
  }
};

cmd(
  {
    pattern: "song",
    react: "🎵",
    desc: "Download Song",
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
      isGroup,
      sender,
      senderNumber,
      botNumber2,
      botNumber,
      pushname,
      isMe,
      isOwner,
      groupMetadata,
      groupName,
      participants,
      groupAdmins,
      isBotAdmins,
      isAdmins,
      reply,
    }
  ) => {
    try {
      if (!q) return reply("නමක් හරි ලින්ක් එකක් හරි දෙන්න 🫠");

      // Search or use direct YouTube link
      const search = await yts(q);
      if (!search.videos || search.videos.length === 0) {
        return reply("❌ No videos found for your search. Please try a different search term.");
      }
      
      const data = search.videos[0];
      if (!data || !data.url) {
        return reply("❌ Invalid video data received. Please try again.");
      }
      const url = normalizeYouTubeUrl(data.url);

      // Song metadata description
      let desc = `
🌀ONYX MD🔥SONG DOWNLOADER🌀

🌀 title : ${data.title}
📄 description : ${data.description}
⏰ time : ${data.timestamp}
⭕ ago : ${data.ago}
👁 views : ${data.views}
⛓‍💥 url : ${data.url}

> Made By Arosh Samuditha
`;

      // Send metadata thumbnail
      await robin.sendMessage(
        from,
        { image: { url: data.thumbnail }, caption: desc },
        { quoted: mek }
      );

      // Download MP3 audio
      const quality = "128";
      const songData = await ytmp3(url, quality);

      // Validate duration
      let durationParts = data.timestamp.split(":").map(Number);
      let totalSeconds =
        durationParts.length === 3
          ? durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2]
          : durationParts[0] * 60 + durationParts[1];

      if (totalSeconds > 1800) {
        return reply("⏱ Audio limit is 30 minutes only!");
      }

      // Send audio as voice message
      await robin.sendMessage(
        from,
        {
          audio: { url: songData.download.url },
          mimetype: "audio/mpeg",
        },
        { quoted: mek }
      );

      // Optionally send as document
      await robin.sendMessage(
        from,
        {
          document: { url: songData.download.url },
          mimetype: "audio/mpeg",
          fileName: `${data.title}.mp3`,
          caption: "🌀ONYX MD🔥BY AROSH🌀",
        },
        { quoted: mek }
      );

      return reply("> Thanks for using 🌀ONYX MD🔥");
    } catch (e) {
      console.log(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);