const { cmd, commands } = require("../command");
const yts = require("yt-search");
const { ytmp4 } = require("@vreden/youtube_scraper");
const { sendDownloadProgress, updateDownloadProgress, simulateDownloadProgressFixed } = require("../lib/functions");

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
    pattern: "video",
    react: "📽",
    desc: "Download Video",
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
      if (!q) return reply("*නමක් හරි ලින්ක් එකක් හරි දෙන්න* 🫠");

      // Search for the video
      const search = await yts(q);
      if (!search.videos || search.videos.length === 0) {
        return reply("❌ No videos found for your search. Please try a different search term.");
      }
      
      const data = search.videos[0];
      if (!data || !data.url) {
        return reply("❌ Invalid video data received. Please try again.");
      }
      const url = normalizeYouTubeUrl(data.url);

      // Video metadata description
      let desc = `
*🌀ONYX MD🔥VIDEO DOWNLOADER🌀*

🌀 *title* : ${data.title}
📄 *description* : ${data.description}
⏰ *time* : ${data.timestamp}
⭕ *ago* : ${data.ago}
👁 *views* : ${data.views}
⛓‍💥 *url* : ${data.url}

> *Made By Arosh Samuditha*
`;

      // Send metadata thumbnail message
      await robin.sendMessage(
        from,
        { image: { url: data.thumbnail }, caption: desc },
        { quoted: mek }
      );

      // Send initial downloading message
      const progressMsg = await sendDownloadProgress(
        robin,
        from,
        mek,
        "\ud83d\udd04 *Downloading video...*\n\n*20%* ██"
      );

      // Simulate progress at 10%, 50%, 80%, 100% over 2.5 seconds
      const progressPromise = simulateDownloadProgressFixed(robin, progressMsg, "video");

      // Download the video using only shamika-api
      let videoData;
      try {
        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
        const apiUrl = `https://shamika-api.vercel.app/download/ytmp4/?url=${encodeURIComponent(url)}`;
        
        const apiRes = await fetch(apiUrl);
        const apiJson = await apiRes.json();
        
        if (
          apiJson.status &&
          apiJson.result &&
          apiJson.result.download &&
          apiJson.result.download.url
        ) {
          videoData = { download: { url: apiJson.result.download.url } };
          console.log("✅ shamika-api successful");
          
          // Wait for progress simulation to complete
          await progressPromise;
        } else {
          console.error("shamika-api full response:", apiJson);
          throw new Error(
            typeof apiJson.result === 'object'
              ? JSON.stringify(apiJson.result)
              : (apiJson.result || 'shamika-api failed')
          );
        }
      } catch (downloadError) {
        console.error("shamika-api error:", downloadError);
        return reply("❌ Failed to download the video. The video might be restricted or unavailable.");
      }

      // Validate video duration (limit: 30 minutes)
      let durationParts = data.timestamp.split(":").map(Number);
      let totalSeconds =
        durationParts.length === 3
          ? durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2]
          : durationParts[0] * 60 + durationParts[1];

      if (totalSeconds > 1800) {
        return reply("⏱️ video limit is 30 minitues");
      }

      // Update progress to 100% and send completion message
      await updateDownloadProgress(
        robin,
        progressMsg,
        "✅ *Download completed!*\n\n*100%* ██████████ \n\n📤 *Sending video...*"
      );

      // Send video file
      try {
        await robin.sendMessage(
          from,
          {
            video: { url: videoData.download.url },
            mimetype: "video/mp4",
            caption: "*🌀ONYX MD🔥BY AROSH🌀*",
          },
          { quoted: mek }
        );
      } catch (videoError) {
        console.error("Failed to send video:", videoError.message);
        return reply("❌ Failed to send video file. Please try again.");
      }

      // Send as a document (optional)
      try {
        await robin.sendMessage(
          from,
          {
            document: { url: videoData.download.url },
            mimetype: "video/mp4",
            fileName: `${data.title}.mp4`,
            caption: "*🌀ONYX MD🔥BY AROSH🌀*",
          },
          { quoted: mek }
        );
      } catch (docError) {
        console.error("Failed to send document:", docError.message);
        // Don't return here, just log the error
      }

      return reply("> *Thanks for using 🌀ONYX MD🔥*");
    } catch (e) {
      console.error("YTvideo plugin error:", e);
      
      // Provide more specific error messages
      if (e.message.includes("No videos found")) {
        reply("❌ No videos found for your search. Please try a different search term.");
      } else if (e.message.includes("download")) {
        reply("❌ Failed to download the video. The video might be restricted or unavailable.");
      } else if (e.message.includes("network")) {
        reply("❌ Network error. Please check your internet connection and try again.");
      } else {
        reply(`❌ Error: ${e.message || "Unknown error occurred"}`);
      }
    }
  }
);
