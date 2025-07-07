const { cmd, commands } = require("../command");
const { getBuffer } = require("../lib/functions");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

cmd({
  pattern: "gdrivedl",
  react: "📥",
  desc: "Download and send Google Drive files directly",
  category: "download",
  filename: __filename,
},
async (robin, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    if (!q) {
      return reply("*🌀ONYX MD - Google Drive Direct Downloader*\n\n*Usage:* .gdrivedl <Google Drive URL>\n\n*Features:*\n• Direct file download and send\n• Supports images, videos, documents\n• Automatic file type detection\n\n*Example:* .gdrivedl https://drive.google.com/file/d/1ABC...");
    }

    const url = q;
    
    // Check if it's a valid Google Drive URL
    if (!url.includes("drive.google.com")) {
      return reply("❌ *Invalid Google Drive URL*\n\nPlease provide a valid Google Drive link.");
    }

    await robin.sendMessage(from, {
      text: "🔄 *Processing Google Drive download...*\n\nPlease wait while I download the file...",
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

    // Create multiple download URLs to try
    const downloadUrls = [
      `https://drive.google.com/uc?export=download&id=${fileId}`,
      `https://drive.google.com/file/d/${fileId}/view`,
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
    ];

    let fileBuffer = null;
    let downloadSuccess = false;
    let finalContentType = null;

    // Try multiple download methods with retry logic
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await robin.sendMessage(from, {
          text: `🔄 *Download attempt ${attempt}/3...*\n\nTrying different download methods...`,
        }, { quoted: mek });

        // Try each download URL
        for (const downloadUrl of downloadUrls) {
          try {
            const response = await axios.get(downloadUrl, {
              responseType: 'arraybuffer',
              timeout: 30000, // 30 seconds timeout
              maxRedirects: 10,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'max-age=0'
              },
              validateStatus: function (status) {
                return status >= 200 && status < 400;
              }
            });

            // Extract file name from Content-Disposition header if available
            if (response.headers && response.headers['content-disposition']) {
              const contentDisposition = response.headers['content-disposition'];
              const match = contentDisposition.match(/filename\*=UTF-8''([^;\n\r]*)/);
              if (match && match[1]) {
                fileName = decodeURIComponent(match[1]);
              } else {
                // Try fallback for plain filename="..."
                const match2 = contentDisposition.match(/filename="([^"]+)"/);
                if (match2 && match2[1]) {
                  fileName = match2[1];
                }
              }
            }

            // Guess extension from content-type if fileName is 'view' or missing extension
            if (response.headers && response.headers['content-type']) {
              finalContentType = response.headers['content-type'];
              if ((fileName === 'view' || !fileName.includes('.')) && finalContentType) {
                const ext = guessExtension(finalContentType);
                if (ext && !fileName.endsWith(ext)) fileName += ext;
              }
            }

            if (response.data && response.data.length > 0) {
              fileBuffer = Buffer.from(response.data);
              downloadSuccess = true;
              console.log(`Download successful on attempt ${attempt} with URL: ${downloadUrl}`);
              break;
            }
          } catch (urlError) {
            console.log(`URL attempt failed: ${downloadUrl} - ${urlError.message}`);
            continue;
          }
        }

        if (downloadSuccess) break;

        // Wait before retry
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (attemptError) {
        console.log(`Download attempt ${attempt} failed:`, attemptError.message);
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    if (!downloadSuccess || !fileBuffer) {
      throw new Error("All download attempts failed");
    }

    const fileSize = fileBuffer.length;
    const sizeInMB = (fileSize / (1024 * 1024)).toFixed(2);

    // Check file size limit (50MB for WhatsApp)
    if (fileSize > 50 * 1024 * 1024) {
      return reply(`❌ *File too large*\n\nFile size: ${sizeInMB} MB\nMaximum allowed: 50 MB\n\nPlease use the link method instead.`);
    }

    // Determine file type and send accordingly
    const fileExtension = fileName.split('.').pop().toLowerCase();
    
    try {
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
        // Send as image
        await robin.sendMessage(from, {
          image: fileBuffer,
          caption: `*📁 File:* ${fileName}\n📏 *Size:* ${sizeInMB} MB\n📥 *Downloaded from Google Drive*\n\n> *By 🌀ONYX MD🔥*`
        }, { quoted: mek });
        
      } else if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(fileExtension)) {
        // Send as video
        await robin.sendMessage(from, {
          video: fileBuffer,
          caption: `*📁 File:* ${fileName}\n📏 *Size:* ${sizeInMB} MB\n📥 *Downloaded from Google Drive*\n\n> *By 🌀ONYX MD🔥*`
        }, { quoted: mek });
        
      } else if (['mp3', 'wav', 'ogg', 'm4a'].includes(fileExtension)) {
        // Send as audio
        await robin.sendMessage(from, {
          audio: fileBuffer,
          mimetype: 'audio/mpeg',
          caption: `*📁 File:* ${fileName}\n📏 *Size:* ${sizeInMB} MB\n📥 *Downloaded from Google Drive*\n\n> *By 🌀ONYX MD🔥*`
        }, { quoted: mek });
        
      } else {
        // Send as document
        await robin.sendMessage(from, {
          document: fileBuffer,
          mimetype: 'application/octet-stream',
          fileName: fileName,
          caption: `*📁 File:* ${fileName}\n📏 *Size:* ${sizeInMB} MB\n📥 *Downloaded from Google Drive*\n\n> *By 🌀ONYX MD🔥*`
        }, { quoted: mek });
      }

      reply("✅ *File downloaded and sent successfully!*\n\nThanks for using 🌀ONYX MD🔥");

    } catch (sendError) {
      console.error("Error sending file:", sendError.message);
      reply("❌ *Error sending file*\n\nFile downloaded but failed to send. Please try again.");
    }

  } catch (error) {
    console.error("Google Drive download plugin error:", error);
    
    // Provide fallback download links
    const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
    
    await robin.sendMessage(from, {
      text: `❌ *Direct download failed*\n\n*Error:* ${error.message}\n\n*Alternative download methods:*\n\n1️⃣ *Direct Link:*\n${directUrl}\n\n2️⃣ *View in Browser:*\n${viewUrl}\n\n3️⃣ *Terminal Command:*\n\`gdown ${fileId}\`\n\n4️⃣ *Try again later* - Google Drive may be temporarily unavailable`,
    }, { quoted: mek });
  }
}); 

// After extracting fileName and before sending the file
// Guess extension from content-type if fileName is 'view' or missing extension
function guessExtension(contentType) {
  if (!contentType) return '';
  if (contentType.includes('pdf')) return '.pdf';
  if (contentType.includes('msword')) return '.doc';
  if (contentType.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')) return '.docx';
  if (contentType.includes('vnd.ms-excel')) return '.xls';
  if (contentType.includes('vnd.openxmlformats-officedocument.spreadsheetml.sheet')) return '.xlsx';
  if (contentType.includes('vnd.ms-powerpoint')) return '.ppt';
  if (contentType.includes('vnd.openxmlformats-officedocument.presentationml.presentation')) return '.pptx';
  if (contentType.includes('zip')) return '.zip';
  if (contentType.includes('rar')) return '.rar';
  if (contentType.includes('image/jpeg')) return '.jpg';
  if (contentType.includes('image/png')) return '.png';
  if (contentType.includes('image/gif')) return '.gif';
  if (contentType.includes('mp4')) return '.mp4';
  if (contentType.includes('mp3')) return '.mp3';
  if (contentType.includes('text/plain')) return '.txt';
  return '';
} 