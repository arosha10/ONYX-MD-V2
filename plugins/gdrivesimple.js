const { cmd, commands } = require("../command");
const { getBuffer } = require("../lib/functions");
const axios = require("axios");

cmd({
  pattern: "gdrivesimple",
  react: "📄",
  desc: "Simple Google Drive downloader with better error handling",
  category: "download",
  filename: __filename,
},
async (robin, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    if (!q) {
      return reply("*🌀ONYX MD - Simple Google Drive Downloader*\n\n*Usage:* .gdrivesimple <Google Drive URL>\n\n*Features:*\n• Reliable download method\n• Better error handling\n• Automatic file type detection\n\n*Example:* .gdrivesimple https://drive.google.com/file/d/1ABC...");
    }

    const url = q;
    
    // Check if it's a valid Google Drive URL
    if (!url.includes("drive.google.com")) {
      return reply("❌ *Invalid Google Drive URL*\n\nPlease provide a valid Google Drive link.");
    }

    await robin.sendMessage(from, {
      text: "🔄 *Processing Google Drive download...*\n\nPlease wait while I prepare the download...",
    }, { quoted: mek });

    // Extract file ID from Google Drive URL
    let fileId = "";
    if (url.includes("/file/d/")) {
      fileId = url.split("/file/d/")[1].split("/")[0];
    } else if (url.includes("id=")) {
      fileId = url.split("id=")[1].split("&")[0];
    } else {
      return reply("❌ *Invalid Google Drive URL format*\n\nPlease provide a valid Google Drive sharing link.");
    }

    // Get file name from URL
    let fileName = "gdrive_file";
    if (url.includes("/d/")) {
      const urlParts = url.split("/d/")[1].split("/");
      if (urlParts.length > 1) {
        fileName = decodeURIComponent(urlParts[1]);
      }
    }

    // Use a more reliable download method
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t&uuid=random`;

    try {
      // First, try to get file info
      const infoResponse = await axios.head(downloadUrl, {
        timeout: 15000,
        maxRedirects: 5,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const fileSize = parseInt(infoResponse.headers['content-length'] || '0');
      const sizeInMB = (fileSize / (1024 * 1024)).toFixed(2);

      if (fileSize > 50 * 1024 * 1024) {
        return reply(`❌ *File too large*\n\nFile size: ${sizeInMB} MB\nMaximum allowed: 50 MB\n\nPlease use the link method instead.`);
      }

      await robin.sendMessage(from, {
        text: `📊 *File Information*\n\n📁 *Name:* ${fileName}\n📏 *Size:* ${sizeInMB} MB\n🔄 *Status:* Starting download...`,
      }, { quoted: mek });

      // Download with simpler headers and longer timeout
      const response = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
        timeout: 60000, // 60 seconds
        maxRedirects: 5,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
          'Connection': 'keep-alive'
        }
      });

      if (!response.data || response.data.length === 0) {
        throw new Error("Empty response received");
      }

      const fileBuffer = Buffer.from(response.data);
      const actualSizeInMB = (fileBuffer.length / (1024 * 1024)).toFixed(2);

      // Determine file type and send accordingly
      const fileExtension = fileName.split('.').pop().toLowerCase();
      
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
        // Send as image
        await robin.sendMessage(from, {
          image: fileBuffer,
          caption: `*📁 File:* ${fileName}\n📏 *Size:* ${actualSizeInMB} MB\n📥 *Downloaded from Google Drive*\n\n> *By 🌀ONYX MD🔥*`
        }, { quoted: mek });
        
      } else if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(fileExtension)) {
        // Send as video
        await robin.sendMessage(from, {
          video: fileBuffer,
          caption: `*📁 File:* ${fileName}\n📏 *Size:* ${actualSizeInMB} MB\n📥 *Downloaded from Google Drive*\n\n> *By 🌀ONYX MD🔥*`
        }, { quoted: mek });
        
      } else if (['mp3', 'wav', 'ogg', 'm4a'].includes(fileExtension)) {
        // Send as audio
        await robin.sendMessage(from, {
          audio: fileBuffer,
          mimetype: 'audio/mpeg',
          caption: `*📁 File:* ${fileName}\n📏 *Size:* ${actualSizeInMB} MB\n📥 *Downloaded from Google Drive*\n\n> *By 🌀ONYX MD🔥*`
        }, { quoted: mek });
        
      } else {
        // Send as document
        await robin.sendMessage(from, {
          document: fileBuffer,
          mimetype: 'application/octet-stream',
          fileName: fileName,
          caption: `*📁 File:* ${fileName}\n📏 *Size:* ${actualSizeInMB} MB\n📥 *Downloaded from Google Drive*\n\n> *By 🌀ONYX MD🔥*`
        }, { quoted: mek });
      }

      reply("✅ *File downloaded and sent successfully!*\n\nThanks for using 🌀ONYX MD🔥");

    } catch (downloadError) {
      console.error("Simple download error:", downloadError.message);
      
      // Provide alternative methods
      const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
      
      await robin.sendMessage(from, {
        text: `❌ *Download failed*\n\n*Error:* ${downloadError.message}\n\n*Alternative methods:*\n\n1️⃣ *Direct Link:*\n${directUrl}\n\n2️⃣ *View in Browser:*\n${viewUrl}\n\n3️⃣ *Try again later* - Google Drive may be temporarily unavailable\n\n*Note:* Some files may have restricted access`,
      }, { quoted: mek });
    }

  } catch (error) {
    console.error("Simple Google Drive plugin error:", error);
    reply("❌ *Download Failed*\n\nAn error occurred while processing the Google Drive link. Please check the URL and try again.");
  }
}); 