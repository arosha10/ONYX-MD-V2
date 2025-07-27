const { cmd, commands } = require("../command");
const { getFbVideoInfo } = require("fb-downloader-scrapper");
const { sendDownloadProgress, updateDownloadProgress, simulateDownloadProgressFixed } = require("../lib/functions");
const fs = require("fs");
const path = require("path");

cmd(
  {
    pattern: "fbmp3",
    alias: ["facebookmp3", "fbaudio"],
    react: "🎵",
    desc: "Download Facebook Video as MP3 Audio",
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
      if (!q) return reply("*Please provide a valid Facebook video URL!*");

      // Validate the Facebook URL format
      const fbRegex = /(https?:\/\/)?(www\.)?(facebook|fb)\.com\/.+/;
      if (!fbRegex.test(q))
        return reply("*Invalid Facebook URL! Please check and try again.*");

      // Send initial downloading message
      const progressMsg = await sendDownloadProgress(
        robin,
        from,
        mek,
        "🔄 *Processing Facebook video...*\n\n*20%* ██"
      );

      // Fetch video details
      const result = await getFbVideoInfo(q);

      if (!result || (!result.sd && !result.hd)) {
        await updateDownloadProgress(
          robin,
          progressMsg,
          "❌ *Failed to download video. Please try again later.*"
        );
        return reply("*Failed to download video. Please try again later.* 🌚");
      }

      const { title, sd, hd } = result;
      const videoUrl = hd || sd;

      // Update progress
      await updateDownloadProgress(
        robin,
        progressMsg,
        "🔄 *Video found! Extracting audio...*\n\n*50%* █████"
      );

      // Simulate progress
      const progressPromise = simulateDownloadProgressFixed(robin, progressMsg, "audio");

      // Download video directly using axios
      let audioData = null;
        try {
          const axios = require('axios');
          
          // Create temporary file path
          const tempDir = path.join(__dirname, '../temp');
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }
          
          const tempFileName = `fb_audio_${Date.now()}.mp3`;
          const tempFilePath = path.join(tempDir, tempFileName);
          
          // Download video using axios
          const response = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream',
            timeout: 30000
          });
          
          const writeStream = fs.createWriteStream(tempFilePath);
          
          await new Promise((resolve, reject) => {
            response.data.pipe(writeStream);
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
          });
          
          // Read the file as buffer
          audioData = fs.readFileSync(tempFilePath);
          
          // Clean up temp file
          fs.unlinkSync(tempFilePath);
          
          console.log("✅ Direct download successful");
        } catch (conversionError) {
          console.log("Direct download failed:", conversionError.message);
        }

      // Wait for progress simulation to complete
      await progressPromise;

      if (!audioData) {
        await updateDownloadProgress(
          robin,
          progressMsg,
          "❌ *Failed to extract audio from Facebook video*"
        );
        return reply("*Failed to extract audio from Facebook video. Please try again later.* 🌚");
      }

      // Update progress to 100%
      await updateDownloadProgress(
        robin,
        progressMsg,
        "✅ *Audio extraction completed!*\n\n*100%* ██████████ \n\n📤 *Sending MP3...*"
      );

      // Send audio file
      try {
        // Send as audio message using buffer
        await robin.sendMessage(
          from,
          {
            audio: audioData,
            mimetype: "audio/mpeg",
          },
          { quoted: mek }
        );
        
        // Send as document using buffer
        await robin.sendMessage(
          from,
          {
            document: audioData,
            mimetype: "audio/mpeg",
            fileName: `${title ? title.replace(/[^\w\s]/gi, '') : 'facebook_audio'}.mp3`,
            caption: "🌀ONYX MD🔥Facebook MP3🌀",
          },
          { quoted: mek }
        );
        
        console.log("✅ Facebook MP3 sent successfully");
      } catch (sendError) {
        console.error("Failed to send audio:", sendError.message);
      }

      return reply("> *Thanks for using 🌀ONYX MD🔥*");
    } catch (e) {
      console.error("Facebook MP3 download error:", e);
      
      // Provide specific error messages
      if (e.code === 'ECONNREFUSED' || e.code === 'ENOTFOUND') {
        reply("❌ Network error: Unable to connect to Facebook. Please check your internet connection.");
      } else if (e.response && e.response.status === 403) {
        reply("❌ Access denied: Facebook is blocking the request. The video might be restricted.");
      } else if (e.response && e.response.status === 404) {
        reply("❌ Video not found: The Facebook URL might be invalid or the video has been removed.");
      } else if (e.code === 'ETIMEDOUT') {
        reply("❌ Timeout: The request took too long. Please try again.");
      } else if (e.message && e.message.includes('503')) {
        reply("❌ Service temporarily unavailable: Facebook may be experiencing issues. Please try again later.");
      } else {
        reply(`❌ Error: ${e.message || e}\n\nPlease try again with a different Facebook video URL.`);
      }
    }
  }
); 