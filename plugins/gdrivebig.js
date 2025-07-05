const { cmd, commands } = require("../command");
const { getBuffer } = require("../lib/functions");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

cmd({
  pattern: "gdrivebig",
  react: "📦",
  desc: "Download large Google Drive files with streaming",
  category: "download",
  filename: __filename,
},
async (robin, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    if (!q) {
      return reply("*🌀ONYX MD - Large File Google Drive Downloader*\n\n*Usage:* .gdrivebig <Google Drive URL>\n\n*Features:*\n• Handles large files (up to 100MB)\n• Streaming download\n• Progress tracking\n• Automatic file type detection\n\n*Example:* .gdrivebig https://drive.google.com/file/d/1ABC...");
    }

    const url = q;
    
    // Check if it's a valid Google Drive URL
    if (!url.includes("drive.google.com")) {
      return reply("❌ *Invalid Google Drive URL*\n\nPlease provide a valid Google Drive link.");
    }

    await robin.sendMessage(from, {
      text: "🔄 *Processing large file download...*\n\nPlease wait while I download the file...",
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

    // Create direct download URL
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    try {
      // First, get file info to check size
      const headResponse = await axios.head(downloadUrl, {
        timeout: 10000,
        maxRedirects: 5,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
        }
      });

      const fileSize = parseInt(headResponse.headers['content-length'] || '0');
      const sizeInMB = (fileSize / (1024 * 1024)).toFixed(2);

      // Check file size limit (100MB for large files)
      if (fileSize > 100 * 1024 * 1024) {
        return reply(`❌ *File too large*\n\nFile size: ${sizeInMB} MB\nMaximum allowed: 100 MB\n\nPlease use the link method instead.`);
      }

      // Send progress message
      await robin.sendMessage(from, {
        text: `📊 *File Information*\n\n📁 *Name:* ${fileName}\n📏 *Size:* ${sizeInMB} MB\n🔄 *Status:* Downloading...`,
      }, { quoted: mek });

      // Download the file with progress tracking
      const response = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
        timeout: 120000, // 2 minutes timeout
        maxRedirects: 5,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
        },
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (percentCompleted % 25 === 0) { // Update every 25%
            robin.sendMessage(from, {
              text: `📥 *Download Progress:* ${percentCompleted}%`,
            }, { quoted: mek }).catch(() => {}); // Ignore errors for progress updates
          }
        }
      });

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

      reply("✅ *Large file downloaded and sent successfully!*\n\nThanks for using 🌀ONYX MD🔥");

    } catch (downloadError) {
      console.error("Large file download error:", downloadError.message);
      
      // Fallback: provide download links
      const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
      
      await robin.sendMessage(from, {
        text: `❌ *Large file download failed*\n\n*File:* ${fileName}\n*Error:* ${downloadError.message}\n\n*Alternative download methods:*\n\n1️⃣ *Direct Link:*\n${directUrl}\n\n2️⃣ *View in Browser:*\n${viewUrl}\n\n3️⃣ *Terminal Command:*\n\`gdown ${fileId}\``
      }, { quoted: mek });
    }

  } catch (error) {
    console.error("Large Google Drive download plugin error:", error);
    reply("❌ *Download Failed*\n\nAn error occurred while processing the Google Drive link. Please check the URL and try again.");
  }
}); 