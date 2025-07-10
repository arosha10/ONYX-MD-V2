const { cmd } = require("../command");
const axios = require("axios");
const { getBuffer } = require("../lib/functions");

cmd(
  {
    pattern: "insta",
    alias: ["instagram", "ig"],
    react: "📸",
    desc: "Download Instagram Video or Reel",
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

      reply("*Downloading your Instagram video...* 📸");

      // Use Shamika API
      const shamikaApiUrl = `https://shamika-api.vercel.app/download/insta?url=${encodeURIComponent(q)}`;
      
      let videoUrl = null;
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
        return reply(`❌ Failed to extract a valid Instagram video URL from Shamika API.\n\nError: ${errorMessage}\n\nPlease try a different link or check if the content is available.`);
      }

      // Log the final video URL
      console.log("[INSTAGRAM] Final video URL:", videoUrl);

      // Download the video to a buffer
      let videoBuffer = null;
      try {
        videoBuffer = await getBuffer(videoUrl);
        if (!videoBuffer || videoBuffer.length < 10000) { // less than 10KB is not a real video
          return reply("❌ Failed to download a valid video. The video may be unavailable or the download link has expired.");
        }
      } catch (bufferErr) {
        console.error("Failed to download video buffer:", bufferErr.message);
        return reply("❌ Failed to download the video file. Please try again later.");
      }

      // Send the video as a buffer
      try {
        await robin.sendMessage(
          from,
          {
            video: videoBuffer,
            caption: "*📸 Instagram Video Downloaded Successfully!*\n\n> *Thanks for using 🌀ONYX MD🔥 Instagram Downloader!*"
          },
          { quoted: mek }
        );
        console.log("✅ Instagram video sent as buffer");
      } catch (sendError) {
        console.error("Failed to send video buffer:", sendError.message);
        return reply("❌ Failed to send the video. The file may be too large or corrupted.");
      }

    } catch (e) {
      console.error("Instagram download error:", e);
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