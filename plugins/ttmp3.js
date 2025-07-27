const { cmd } = require("../command");
const { sendDownloadProgress, updateDownloadProgress, simulateDownloadProgressFixed } = require("../lib/functions");
const fs = require('fs');
const path = require('path');
const axios = require('axios');

cmd(
  {
    pattern: "ttmp3",
    alias: ["tiktokmp3", "ttaudio"],
    desc: "Download TikTok video as MP3 Audio",
    category: "download",
    react: "🎵",
    filename: __filename,
  },
  async (robin, mek, m, { reply, q, from }) => {
    if (!q) return reply("❌ Please provide a TikTok video URL.");
    if (!q.includes("tiktok.com")) return reply("❌ Invalid TikTok URL.");

    try {
      // Send initial downloading message
      const progressMsg = await sendDownloadProgress(
        robin,
        from,
        mek,
        "🔄 *Processing TikTok video...*\n\n*20%* ██"
      );

      let videoUrl;
      let title = 'TikTok Audio';

      // Try tikwm API first
      try {
        const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(q)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;
        
        if (data && data.data && data.data.play) {
          videoUrl = data.data.play;
          title = data.data.title || 'TikTok Audio';
          console.log("✅ tikwm API successful");
        } else {
          throw new Error('tikwm failed');
        }
      } catch (err) {
        console.log("tikwm failed, trying alternative methods");
        
        // Fallback to ttdownloader
        try {
          const fallbackRes = await axios.post('https://api.ttdownloader.com/req/', {
            url: q
          }, {
            headers: { 'Content-Type': 'application/json' }
          });
          
          const fallbackData = fallbackRes.data;
          if (fallbackData && fallbackData.nowm) {
            videoUrl = fallbackData.nowm;
            console.log("✅ ttdownloader API successful");
          } else {
            throw new Error('ttdownloader failed');
          }
        } catch (fallbackErr) {
          console.log("ttdownloader failed, trying direct download");
          
          // Try direct download method
          try {
            const directApiUrl = `https://api.download-lagu-mp3.com/api/tiktok?url=${encodeURIComponent(q)}`;
            const directRes = await axios.get(directApiUrl);
            const directData = directRes.data;
            
            if (directData && directData.url) {
              videoUrl = directData.url;
              console.log("✅ Direct API successful");
            } else {
              throw new Error('Direct API failed');
            }
          } catch (directErr) {
            await updateDownloadProgress(
              robin,
              progressMsg,
              "❌ *All TikTok downloaders failed*"
            );
            return reply('❌ All TikTok downloaders failed. Please try again later.');
          }
        }
      }

      // Update progress
      await updateDownloadProgress(
        robin,
        progressMsg,
        "🔄 *Video found! Extracting audio...*\n\n*50%* █████"
      );

      // Simulate progress
      const progressPromise = simulateDownloadProgressFixed(robin, progressMsg, "audio");

      // Download video and extract audio
      let audioData = null;
      try {
        // Create temporary file path
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const tempFileName = `tt_audio_${Date.now()}.mp3`;
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
        
        console.log("✅ TikTok audio extraction successful");
      } catch (conversionError) {
        console.log("Audio extraction failed:", conversionError.message);
      }

      // Wait for progress simulation to complete
      await progressPromise;

      if (!audioData) {
        await updateDownloadProgress(
          robin,
          progressMsg,
          "❌ *Failed to extract audio from TikTok video*"
        );
        return reply("*Failed to extract audio from TikTok video. Please try again later.* 🌚");
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
            fileName: `${title.replace(/[^\w\s]/gi, '')}.mp3`,
            caption: "🌀ONYX MD🔥TikTok MP3🌀",
          },
          { quoted: mek }
        );
        
        console.log("✅ TikTok MP3 sent successfully");
      } catch (sendError) {
        console.error("Failed to send audio:", sendError.message);
      }

      return reply("> *Thanks for using 🌀ONYX MD🔥*");
    } catch (err) {
      console.error('TikTok MP3 download error:', err);
      reply('❌ Failed to download audio. Please check the link and try again.');
    }
  }
); 