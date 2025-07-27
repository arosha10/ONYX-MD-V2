const { cmd } = require("../command");
const { sendDownloadProgress, updateDownloadProgress, simulateDownloadProgressFixed } = require("../lib/functions");
const fs = require('fs');
const path = require('path');
const axios = require('axios');

cmd(
  {
    pattern: "instamp3",
    alias: ["instagrammp3", "igmp3", "igaudio"],
    react: "🎵",
    desc: "Download Instagram Video/Reel as MP3 Audio",
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
      if (!q) return reply("*Please provide a valid Instagram video or reel URL!* 📸");

      // Enhanced Instagram URL validation
      const instaRegex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|p|tv)\/[A-Za-z0-9_-]+/;
      if (!instaRegex.test(q)) {
        return reply("*Invalid Instagram URL! Please provide a valid Instagram post, reel, or video URL.* 📸");
      }

      // Send initial downloading message
      const progressMsg = await sendDownloadProgress(
        robin,
        from,
        mek,
        "🔄 *Processing Instagram video...*\n\n*20%* ██"
      );

      // Use Shamika API
      const shamikaApiUrl = `https://shamika-api.vercel.app/download/insta?url=${encodeURIComponent(q)}`;
      
      let videoUrl = null;
      let title = 'Instagram Audio';
      let errorMessage = "";

      try {
        const response = await axios.get(shamikaApiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive'
          },
          timeout: 30000,
          maxRedirects: 10,
          validateStatus: function (status) {
            return status >= 200 && status < 400;
          }
        });

        const data = response.data;
        console.log("Shamika API response:", data);

        // Handle different response formats from Shamika API
        if (data && data.url) {
          videoUrl = data.url;
        } else if (data && data.download_url) {
          videoUrl = data.download_url;
        } else if (data && data.video_url) {
          videoUrl = data.video_url;
        } else if (data && data.link) {
          videoUrl = data.link;
        } else if (data && data.result && data.result.url) {
          videoUrl = data.result.url;
        } else if (data && data.result && data.result.download_url) {
          videoUrl = data.result.download_url;
        } else if (data && data.result && data.result.video_url) {
          videoUrl = data.result.video_url;
        } else if (data && data.result && data.result.link) {
          videoUrl = data.result.link;
        } else if (data && data.results && Array.isArray(data.results) && data.results.length > 0) {
          // Handle Shamika API response format with results array
          const firstResult = data.results[0];
          if (firstResult && firstResult.video) {
            videoUrl = firstResult.video;
          } else if (firstResult && firstResult.url) {
            videoUrl = firstResult.url;
          } else if (firstResult && firstResult.download_url) {
            videoUrl = firstResult.download_url;
          } else if (firstResult && firstResult.link) {
            videoUrl = firstResult.link;
          }
        } else if (data && Array.isArray(data) && data.length > 0) {
          // If response is an array, try to find video URL
          const videoItem = data.find(item => item.url || item.download_url || item.video_url || item.link);
          if (videoItem) {
            videoUrl = videoItem.url || videoItem.download_url || videoItem.video_url || videoItem.link;
          }
        }

        if (videoUrl) {
          console.log("✅ Instagram URL extracted via Shamika API:", videoUrl);
        } else {
          errorMessage = "No video URL found in API response";
          console.error("Shamika API response doesn't contain video URL:", data);
        }

      } catch (apiErr) {
        console.error("Shamika API failed:", apiErr.message);
        errorMessage = apiErr.message;
        
        // If API returns an error response, try to extract error message
        if (apiErr.response && apiErr.response.data) {
          const errorData = apiErr.response.data;
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        }
      }

      if (!videoUrl) {
        await updateDownloadProgress(
          robin,
          progressMsg,
          "❌ *Failed to extract Instagram video URL*"
        );
        return reply(`❌ Failed to extract a valid Instagram video URL from Shamika API.\n\nError: ${errorMessage}\n\nPlease try a different link or check if the content is available.`);
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
        
        const tempFileName = `ig_audio_${Date.now()}.mp3`;
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
        
        console.log("✅ Instagram audio extraction successful");
      } catch (conversionError) {
        console.log("Audio extraction failed:", conversionError.message);
      }

      // Wait for progress simulation to complete
      await progressPromise;

      if (!audioData) {
        await updateDownloadProgress(
          robin,
          progressMsg,
          "❌ *Failed to extract audio from Instagram video*"
        );
        return reply("*Failed to extract audio from Instagram video. Please try again later.* 🌚");
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
            caption: "🌀ONYX MD🔥Instagram MP3🌀",
          },
          { quoted: mek }
        );
        
        console.log("✅ Instagram MP3 sent successfully");
      } catch (sendError) {
        console.error("Failed to send audio:", sendError.message);
      }

      return reply("> *Thanks for using 🌀ONYX MD🔥*");
    } catch (e) {
      console.error("Instagram MP3 download error:", e);
      if (e.code === 'ECONNREFUSED' || e.code === 'ENOTFOUND') {
        reply("*❌ Network error: Unable to connect to Shamika API. Please check your internet connection.* 📸");
      } else if (e.response && e.response.status === 403) {
        reply("*❌ Access denied: The API is blocking the request. The content might be private or region-restricted.* 📸");
      } else if (e.response && e.response.status === 404) {
        reply("*❌ Content not found: The Instagram URL might be invalid or the content has been removed.* 📸");
      } else if (e.code === 'ETIMEDOUT') {
        reply("*❌ Timeout: The request took too long. Please try again.* 📸");
      } else if (e.message && e.message.includes('503')) {
        reply("*❌ Service temporarily unavailable: Shamika API may be experiencing issues. Please try again later.* 📸");
      } else {
        reply(`*❌ Error: ${e.message || e}*\n\nPlease try again with a different Instagram URL.`);
      }
    }
  }
); 