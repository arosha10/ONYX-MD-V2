const { cmd } = require("../command");
const { instagramGetUrl } = require("instagram-url-direct");
const axios = require("axios");

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

      let videoUrl = null;
      let errorMessage = "";

      // Method 1: Try instagram-url-direct with enhanced error handling
      try {
        const result = await instagramGetUrl(q);
        if (result && result.url_list && result.url_list.length > 0) {
          videoUrl = result.url_list[0];
          console.log("✅ Instagram URL extracted via instagram-url-direct");
        }
      } catch (err) {
        console.error("instagram-url-direct failed:", err.message);
        errorMessage = err.message;
      }

      // Method 2: Enhanced fallback with multiple user agents and better error handling
      if (!videoUrl) {
        const userAgents = [
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ];

        for (const userAgent of userAgents) {
          try {
            const response = await axios.get(q, {
              headers: {
                'User-Agent': userAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'no-cache'
              },
              timeout: 20000, // Increased timeout for cloud environments
              maxRedirects: 10,
              validateStatus: function (status) {
                return status >= 200 && status < 400; // Accept redirects
              }
            });

            const pageContent = response.data;
            
            // Enhanced pattern matching for video URLs
            const patterns = [
              /"video_url":"([^"]+)"/,
              /"video":{"url":"([^"]+)"/,
              /"contentUrl":"([^"]*instagram[^"]*)"/,
              /"src":"([^"]*instagram[^"]*)"/,
              /"url":"([^"]*instagram[^"]*)"/,
              /"video_url":"([^"]*cdninstagram[^"]*)"/,
              /"video":{"url":"([^"]*cdninstagram[^"]*)"/,
              /(https?:\/\/[^"'\s]*cdninstagram\.com[^"'\s]*\.mp4)/,
              /(https?:\/\/[^"'\s]*instagram[^"'\s]*\.mp4)/
            ];
            
            for (const pattern of patterns) {
              const match = pageContent.match(pattern);
              if (match && match[1]) {
                const extractedUrl = match[1].replace(/\\/g, '');
                if (extractedUrl.includes('instagram.com') || extractedUrl.includes('cdninstagram.com')) {
                  videoUrl = extractedUrl;
                  console.log("✅ Instagram URL extracted via fallback method");
                  break;
                }
              }
            }
            
            if (videoUrl) break;
          } catch (fallbackErr) {
            console.error(`Fallback method failed with ${userAgent}:`, fallbackErr.message);
            continue;
          }
        }
      }

      // Method 3: Try using a different API approach
      if (!videoUrl) {
        try {
          // Try to use a different approach with Instagram's mobile API
          const mobileUrl = q.replace('www.instagram.com', 'm.instagram.com');
          const response = await axios.get(mobileUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Accept-Encoding': 'gzip, deflate, br',
              'Connection': 'keep-alive'
            },
            timeout: 15000
          });

          const pageContent = response.data;
          const videoMatch = pageContent.match(/(https?:\/\/[^"'\s]*cdninstagram\.com[^"'\s]*\.mp4)/);
          if (videoMatch) {
            videoUrl = videoMatch[1];
            console.log("✅ Instagram URL extracted via mobile API");
          }
        } catch (mobileErr) {
          console.error("Mobile API method failed:", mobileErr.message);
        }
      }

      if (!videoUrl) {
        const errorDetails = errorMessage ? `\n\nError details: ${errorMessage}` : "";
        return reply(`*Failed to download Instagram video.* 📸\n\nPossible reasons:\n• Private or restricted content\n• Invalid or expired link\n• Instagram blocking requests\n• Network issues\n• Content may be region-restricted${errorDetails}\n\nPlease try again with a different link.`);
      }

      // Validate the video URL with enhanced error handling
      try {
        const videoResponse = await axios.head(videoUrl, { 
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          validateStatus: function (status) {
            return status >= 200 && status < 400;
          }
        });
        
        if (videoResponse.status !== 200) {
          throw new Error(`Video URL returned status ${videoResponse.status}`);
        }
        
        // Check content type
        const contentType = videoResponse.headers['content-type'];
        if (!contentType || !contentType.includes('video')) {
          console.warn("Warning: URL may not be a video file");
        }
        
      } catch (videoErr) {
        console.error("Video URL validation failed:", videoErr.message);
        return reply("*The extracted video URL is not accessible. Instagram may have changed their structure or the content is restricted.* 📸");
      }

      // Send the video with improved error handling
      try {
        await robin.sendMessage(
          from,
          { 
            video: { url: videoUrl }, 
            caption: "*📸 Instagram Video Downloaded Successfully!*\n\n> *Thanks for using 🌀ONYX MD🔥 Instagram Downloader!*" 
          },
          { quoted: mek }
        );
        
        console.log("✅ Instagram video sent successfully");
        
      } catch (sendError) {
        console.error("Failed to send video:", sendError.message);
        
        // Try alternative sending method
        try {
          await robin.sendFileUrl(
            from,
            videoUrl,
            "*📸 Instagram Video Downloaded Successfully!*\n\n> *Thanks for using 🌀ONYX MD🔥 Instagram Downloader!*",
            mek
          );
          console.log("✅ Instagram video sent via sendFileUrl");
        } catch (altSendError) {
          console.error("Alternative send method also failed:", altSendError.message);
          return reply("*❌ Failed to send the video. The file may be too large or corrupted.* 📸");
        }
      }

    } catch (e) {
      console.error("Instagram download error:", e);
      
      // Provide specific error messages for different scenarios
      if (e.code === 'ECONNREFUSED' || e.code === 'ENOTFOUND') {
        reply("*❌ Network error: Unable to connect to Instagram. Please check your internet connection.* 📸");
      } else if (e.response && e.response.status === 403) {
        reply("*❌ Access denied: Instagram is blocking the request. The content might be private or region-restricted.* 📸");
      } else if (e.response && e.response.status === 404) {
        reply("*❌ Content not found: The Instagram URL might be invalid or the content has been removed.* 📸");
      } else if (e.code === 'ETIMEDOUT') {
        reply("*❌ Timeout: The request took too long. Please try again.* 📸");
      } else if (e.message && e.message.includes('503')) {
        reply("*❌ Service temporarily unavailable: Instagram may be experiencing issues. Please try again later.* 📸");
      } else {
        reply(`*❌ Error: ${e.message || e}*\n\nPlease try again with a different Instagram URL.`);
      }
    }
  }
); 