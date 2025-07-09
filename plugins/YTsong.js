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

      // Search or use direct YouTube link with enhanced error handling
      let search;
      try {
        search = await yts(q);
        if (!search.videos || search.videos.length === 0) {
          return reply("❌ No videos found for your search. Please try a different search term.");
        }
      } catch (searchError) {
        console.error("YouTube search error:", searchError);
        return reply("❌ Failed to search YouTube. Please check your internet connection and try again.");
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

      // Send metadata thumbnail with error handling
      try {
        await robin.sendMessage(
          from,
          { image: { url: data.thumbnail }, caption: desc },
          { quoted: mek }
        );
      } catch (thumbnailError) {
        console.error("Failed to send thumbnail:", thumbnailError.message);
        // Continue without thumbnail if it fails
      }

      // Download MP3 audio with enhanced error handling
      let songData;
      try {
        const quality = "128";
        songData = await ytmp3(url, quality);
        
        if (!songData || !songData.download || !songData.download.url) {
          throw new Error("Invalid song data received from YouTube scraper");
        }
        
        console.log("✅ YouTube song data extracted successfully");
      } catch (downloadError) {
        console.error("YouTube download error:", downloadError);
        return reply("❌ Failed to download the song. The video might be restricted or unavailable.");
      }

      // Validate duration with enhanced parsing
      try {
        let durationParts = data.timestamp.split(":").map(Number);
        let totalSeconds;
        
        if (durationParts.length === 3) {
          totalSeconds = durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2];
        } else if (durationParts.length === 2) {
          totalSeconds = durationParts[0] * 60 + durationParts[1];
        } else {
          totalSeconds = durationParts[0];
        }

        if (totalSeconds > 1800) {
          return reply("⏱ Audio limit is 30 minutes only!");
        }
      } catch (durationError) {
        console.error("Duration parsing error:", durationError);
        // Continue without duration check if parsing fails
      }

      // Send audio as voice message with fallback
      try {
        await robin.sendMessage(
          from,
          {
            audio: { url: songData.download.url },
            mimetype: "audio/mpeg",
          },
          { quoted: mek }
        );
        console.log("✅ Audio sent successfully");
      } catch (audioError) {
        console.error("Failed to send audio:", audioError.message);
        
        // Try alternative method
        try {
          await robin.sendFileUrl(
            from,
            songData.download.url,
            "🌀ONYX MD🔥BY AROSH🌀",
            mek
          );
          console.log("✅ Audio sent via sendFileUrl");
        } catch (altAudioError) {
          console.error("Alternative audio send method failed:", altAudioError.message);
        }
      }

      // Send as document with enhanced error handling
      try {
        await robin.sendMessage(
          from,
          {
            document: { url: songData.download.url },
            mimetype: "audio/mpeg",
            fileName: `${data.title.replace(/[^\w\s]/gi, '')}.mp3`,
            caption: "🌀ONYX MD🔥BY AROSH🌀",
          },
          { quoted: mek }
        );
        console.log("✅ Document sent successfully");
      } catch (docError) {
        console.error("Failed to send document:", docError.message);
        
        // Try alternative document sending method
        try {
          await robin.sendFileUrl(
            from,
            songData.download.url,
            "🌀ONYX MD🔥BY AROSH🌀",
            mek,
            { filename: `${data.title.replace(/[^\w\s]/gi, '')}.mp3` }
          );
          console.log("✅ Document sent via sendFileUrl");
        } catch (altDocError) {
          console.error("Alternative document send method failed:", altDocError.message);
        }
      }

      return reply("> Thanks for using 🌀ONYX MD🔥");
    } catch (e) {
      console.error("Song download error:", e);
      
      // Provide specific error messages
      if (e.code === 'ECONNREFUSED' || e.code === 'ENOTFOUND') {
        reply("❌ Network error: Unable to connect to YouTube. Please check your internet connection.");
      } else if (e.response && e.response.status === 403) {
        reply("❌ Access denied: YouTube is blocking the request. The video might be restricted.");
      } else if (e.response && e.response.status === 404) {
        reply("❌ Video not found: The YouTube URL might be invalid or the video has been removed.");
      } else if (e.code === 'ETIMEDOUT') {
        reply("❌ Timeout: The request took too long. Please try again.");
      } else if (e.message && e.message.includes('503')) {
        reply("❌ Service temporarily unavailable: YouTube may be experiencing issues. Please try again later.");
      } else {
        reply(`❌ Error: ${e.message || e}\n\nPlease try again with a different search term or URL.`);
      }
    }
  }
);