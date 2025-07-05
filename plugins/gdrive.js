const { cmd, commands } = require("../command");
const { getBuffer } = require("../lib/functions");
const axios = require("axios");

cmd({
  pattern: "gdrive",
  react: "📁",
  desc: "Download files from Google Drive",
  category: "download",
  filename: __filename,
},
async (robin, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    if (!q) {
      return reply("*🌀ONYX MD - Google Drive Downloader*\n\n*Usage:* .gdrive <Google Drive URL>\n\n*Example:* .gdrive https://drive.google.com/file/d/1ABC...");
    }

    const url = q;
    
    // Check if it's a valid Google Drive URL
    if (!url.includes("drive.google.com")) {
      return reply("❌ *Invalid Google Drive URL*\n\nPlease provide a valid Google Drive link.");
    }

    await robin.sendMessage(from, {
      text: "🔄 *Processing Google Drive download...*\n\nPlease wait while I fetch the file information...",
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

    // Get file name from URL or use default
    let fileName = "gdrive_file";
    if (url.includes("/d/")) {
      const urlParts = url.split("/d/")[1].split("/");
      if (urlParts.length > 1) {
        fileName = decodeURIComponent(urlParts[1]);
      }
    }

    // Create direct download link
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
    // Create alternative links
    const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
    const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

    await robin.sendMessage(from, {
      text: `✅ *Google Drive Download Ready*\n\n📁 *File:* ${fileName}\n🆔 *File ID:* ${fileId}\n\n*Download Methods:*\n\n1️⃣ *Direct Download:*\n${downloadUrl}\n\n2️⃣ *View in Browser:*\n${viewUrl}\n\n3️⃣ *API Download:*\n${apiUrl}\n\n*Instructions:*\n• Method 1 works for public files\n• Method 2 opens in browser\n• Method 3 requires authentication`,
    }, { quoted: mek });

    // Try to get file size and type
    try {
      const infoResponse = await axios.head(downloadUrl, {
        maxRedirects: 5,
        timeout: 10000,
      });

      const fileSize = infoResponse.headers['content-length'];
      const contentType = infoResponse.headers['content-type'];

      if (fileSize) {
        const sizeInMB = (parseInt(fileSize) / (1024 * 1024)).toFixed(2);
        
        await robin.sendMessage(from, {
          text: `📊 *File Information*\n\n📁 *Name:* ${fileName}\n📏 *Size:* ${sizeInMB} MB\n📋 *Type:* ${contentType || 'Unknown'}\n🆔 *ID:* ${fileId}\n\n*Status:* ✅ File accessible`,
        }, { quoted: mek });
      }
    } catch (error) {
      await robin.sendMessage(from, {
        text: `⚠️ *File Access Limited*\n\nThis file might have restricted access or require authentication.\n\n*Try these alternatives:*\n\n1️⃣ Use the direct link in browser\n2️⃣ Request file access from owner\n3️⃣ Use terminal command: \`gdown ${fileId}\``,
      }, { quoted: mek });
    }

    // Additional download methods
    await robin.sendMessage(from, {
      text: `🛠️ *Advanced Download Methods*\n\n*Terminal Commands:*\n\`gdown ${fileId}\`\n\`wget "${downloadUrl}" -O "${fileName}"\`\n\`curl -L "${downloadUrl}" -o "${fileName}"\`\n\n*Browser Method:*\nReplace 'file/d/' with 'uc?export=download&id=' in the URL`,
    }, { quoted: mek });

  } catch (error) {
    console.error("Google Drive plugin error:", error);
    reply("❌ *Download Failed*\n\nAn error occurred while processing the Google Drive link. Please check the URL and try again.");
  }
}); 