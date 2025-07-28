const { cmd } = require("../command");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

cmd(
  {
    pattern: "apk",
    desc: "Download APK file for any app",
    category: "downloader",
    use: "<app name>",
    filename: __filename,
  },
  async (robin, mek, m, { from, args, quoted, body, isCmd, command, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    const chatId = from || m?.key?.remoteJid || "status@broadcast";
    
    // Debug logging
    console.log(`[APK DOWNLOADER] Chat ID: ${chatId}`);
    console.log(`[APK DOWNLOADER] Args received:`, args);
    console.log(`[APK DOWNLOADER] Body received:`, body);
    console.log(`[APK DOWNLOADER] Q received:`, q);
    console.log(`[APK DOWNLOADER] Message body:`, m?.message?.conversation || m?.message?.extendedTextMessage?.text || 'No body found');
    
          try {
        // Ensure args is an array and handle undefined case
        const safeArgs = Array.isArray(args) ? args : [];
        
        // Check if app name is provided
        if (!safeArgs[0]) {
          return await robin.sendMessage(chatId, { 
            text: `❌ *Please provide an app name! (ONYX MD)*\n\n*Usage:* .apk <app name>\n*Example:* .apk WhatsApp\n\n*Example:* .apk Instagram\n\n> *By Arosh Samuditha*` 
          }, { quoted: mek });
        }

        const appName = safeArgs.join(" ");
        
        // Send initial message
        await robin.sendMessage(chatId, { 
          text: `🔍 *Searching for ${appName}... (ONYX MD)*\n\n⏳ Please wait while I fetch the app details...\n\n> *By Arosh Samuditha*` 
        }, { quoted: mek });

      // Step 1: Fetch app details from the API
      const apiUrl = `https://arosh.vercel.app/direct-download?q=${encodeURIComponent(appName)}`;
      console.log(`[APK DOWNLOADER] Fetching app details from: ${apiUrl}`);
      
      const response = await axios.get(apiUrl, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

                   if (!response.data || !response.data.success) {
        return await robin.sendMessage(chatId, { 
          text: `❌ *App not found! (ONYX MD)*\n\nCould not find "${appName}" in the app store.\n\n*Try:*\n• Check the spelling\n• Use a different app name\n• Try a more popular app\n\n> *By Arosh Samuditha*` 
        }, { quoted: mek });
      }

      const appData = response.data;
      
             // Step 2: Send app details with photo
       const detailsMessage = `📱 *App Details Found! (ONYX MD)*\n\n📛 *Name:* ${appData.name || appName}\n📦 *Package:* ${appData.package || 'N/A'}\n⭐ *Rating:* ${appData.rating || 'N/A'}\n📊 *Downloads:* ${appData.downloads || 'N/A'}\n📏 *Size:* ${appData.size || 'N/A'}\n🔄 *Version:* ${appData.version || 'N/A'}\n\n⏳ *Downloading APK file...*\n\n> *By Arosh Samuditha*`;

                   // Send app details with image if available
      if (appData.icon || appData.image) {
        try {
          await robin.sendMessage(chatId, {
            image: { url: appData.icon || appData.image },
            caption: detailsMessage
          }, { quoted: mek });
        } catch (imageError) {
          console.log(`[APK DOWNLOADER] Failed to send image, sending text only:`, imageError.message);
          await robin.sendMessage(chatId, { text: detailsMessage }, { quoted: mek });
        }
      } else {
        await robin.sendMessage(chatId, { text: detailsMessage }, { quoted: mek });
      }

      // Step 3: Download APK file
                   if (!appData.download_url && !appData.apk_url) {
        return await robin.sendMessage(chatId, { 
          text: `❌ *Download URL not available! (ONYX MD)*\n\nThis app doesn't have a downloadable APK file.\n\n*Possible reasons:*\n• App is not available for direct download\n• App requires Play Store installation\n• App is region-restricted\n\n> *By Arosh Samuditha*` 
        }, { quoted: mek });
      }

      const downloadUrl = appData.download_url || appData.apk_url;
      console.log(`[APK DOWNLOADER] Downloading APK from: ${downloadUrl}`);

      // Create temp directory if it doesn't exist
      const tempDir = path.join(__dirname, '..', 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Download APK file
      const fileName = `${appData.package || appName.replace(/\s+/g, '_')}_${Date.now()}.apk`;
      const filePath = path.join(tempDir, fileName);

      const apkResponse = await axios.get(downloadUrl, {
        responseType: 'stream',
        timeout: 60000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      const writer = fs.createWriteStream(filePath);
      apkResponse.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

                    // Step 4: Send APK file
       const fileSize = fs.statSync(filePath).size;
       const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

       const successMessage = `✅ *APK Download Complete! (ONYX MD)*\n\n📱 *App:* ${appData.name || appName}\n📦 *Package:* ${appData.package || 'N/A'}\n📏 *File Size:* ${fileSizeMB} MB\n🔄 *Version:* ${appData.version || 'N/A'}\n\n📥 *APK file attached below*\n\n> *By Arosh Samuditha*`;

       await robin.sendMessage(chatId, {
         document: { url: `file://${filePath}` },
         mimetype: 'application/vnd.android.package-archive',
         fileName: fileName,
         caption: successMessage
       }, { quoted: mek });

      // Clean up the temporary file after 30 seconds
      setTimeout(() => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[APK DOWNLOADER] Cleaned up temporary file: ${fileName}`);
          }
        } catch (cleanupError) {
          console.error(`[APK DOWNLOADER] Error cleaning up file:`, cleanupError.message);
        }
      }, 30000);

    } catch (error) {
      console.error('[APK DOWNLOADER ERROR]:', error.message);
      
             let errorMessage = '❌ *Error downloading APK! (ONYX MD)*\n\n';
       
       if (error.response && error.response.status === 404) {
         errorMessage += 'App not found. Please check the app name and try again.';
       } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
         errorMessage += 'Network error. Please check your internet connection.';
       } else if (error.code === 'ETIMEDOUT') {
         errorMessage += 'Request timed out. Please try again.';
       } else if (error.message.includes('timeout')) {
         errorMessage += 'Download timed out. Please try again.';
       } else {
         errorMessage += 'An unexpected error occurred. Please try again later.';
       }
       
       errorMessage += '\n\n> *By Arosh Samuditha*';

             await robin.sendMessage(chatId, { text: errorMessage }, { quoted: mek });
    }
  }
);

// Alternative command for better compatibility
cmd(
  {
    pattern: "apkdl",
    desc: "Download APK file (alternative command)",
    category: "downloader",
    use: "<app name>",
    filename: __filename,
  },
  async (robin, mek, m, { from, args, quoted, body, isCmd, command, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    // Reuse the same logic as the main apk command
    const chatId = from || m?.key?.remoteJid || "status@broadcast";
    
    // Debug logging
    console.log(`[APK DOWNLOADER] Chat ID: ${chatId}`);
    console.log(`[APK DOWNLOADER] Args received:`, args);
    console.log(`[APK DOWNLOADER] Body received:`, body);
    console.log(`[APK DOWNLOADER] Q received:`, q);
    console.log(`[APK DOWNLOADER] Message body:`, m?.message?.conversation || m?.message?.extendedTextMessage?.text || 'No body found');
    
    try {
      // Ensure args is an array and handle undefined case
      const safeArgs = Array.isArray(args) ? args : [];
      
      if (!safeArgs[0]) {
        return await robin.sendMessage(chatId, { 
          text: `❌ *Please provide an app name! (ONYX MD)*\n\n*Usage:* .apkdl <app name>\n*Example:* .apkdl WhatsApp\n\n> *By Arosh Samuditha*` 
        }, { quoted: mek });
      }

      const appName = safeArgs.join(" ");
      
             await robin.sendMessage(chatId, { 
         text: `🔍 *Searching for ${appName}... (ONYX MD)*\n\n⏳ Please wait while I fetch the app details...\n\n> *By Arosh Samuditha*` 
       }, { quoted: mek });

      const apiUrl = `https://arosh.vercel.app/direct-download?q=${encodeURIComponent(appName)}`;
      const response = await axios.get(apiUrl, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

             if (!response.data || !response.data.success) {
         return await robin.sendMessage(chatId, { 
           text: `❌ *App not found! (ONYX MD)*\n\nCould not find "${appName}" in the app store.\n\n> *By Arosh Samuditha*` 
         }, { quoted: mek });
       }

      const appData = response.data;
      
             const detailsMessage = `📱 *App Details Found! (ONYX MD)*\n\n📛 *Name:* ${appData.name || appName}\n📦 *Package:* ${appData.package || 'N/A'}\n⭐ *Rating:* ${appData.rating || 'N/A'}\n📊 *Downloads:* ${appData.downloads || 'N/A'}\n📏 *Size:* ${appData.size || 'N/A'}\n🔄 *Version:* ${appData.version || 'N/A'}\n\n⏳ *Downloading APK file...*\n\n> *By Arosh Samuditha*`;

             if (appData.icon || appData.image) {
         try {
           await robin.sendMessage(chatId, {
             image: { url: appData.icon || appData.image },
             caption: detailsMessage
           }, { quoted: mek });
         } catch (imageError) {
           await robin.sendMessage(chatId, { text: detailsMessage }, { quoted: mek });
         }
       } else {
         await robin.sendMessage(chatId, { text: detailsMessage }, { quoted: mek });
       }

             if (!appData.download_url && !appData.apk_url) {
         return await robin.sendMessage(chatId, { 
           text: `❌ *Download URL not available! (ONYX MD)*\n\nThis app doesn't have a downloadable APK file.\n\n> *By Arosh Samuditha*` 
         }, { quoted: mek });
       }

      const downloadUrl = appData.download_url || appData.apk_url;
      const tempDir = path.join(__dirname, '..', 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const fileName = `${appData.package || appName.replace(/\s+/g, '_')}_${Date.now()}.apk`;
      const filePath = path.join(tempDir, fileName);

      const apkResponse = await axios.get(downloadUrl, {
        responseType: 'stream',
        timeout: 60000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      const writer = fs.createWriteStream(filePath);
      apkResponse.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      const fileSize = fs.statSync(filePath).size;
      const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

             const successMessage = `✅ *APK Download Complete! (ONYX MD)*\n\n📱 *App:* ${appData.name || appName}\n📦 *Package:* ${appData.package || 'N/A'}\n📏 *File Size:* ${fileSizeMB} MB\n🔄 *Version:* ${appData.version || 'N/A'}\n\n📥 *APK file attached below*\n\n> *By Arosh Samuditha*`;

             await robin.sendMessage(chatId, {
         document: { url: `file://${filePath}` },
         mimetype: 'application/vnd.android.package-archive',
         fileName: fileName,
         caption: successMessage
       }, { quoted: mek });

      setTimeout(() => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (cleanupError) {
          console.error(`[APK DOWNLOADER] Error cleaning up file:`, cleanupError.message);
        }
      }, 30000);

         } catch (error) {
       console.error('[APK DOWNLOADER ERROR]:', error.message);
       await robin.sendMessage(chatId, { 
         text: `❌ *Error downloading APK! (ONYX MD)*\n\nPlease check the app name and try again.\n\n> *By Arosh Samuditha*` 
       }, { quoted: mek });
     }
  }
); 