const { cmd, commands } = require("../command");

// List of trusted APK sources
const apkSources = [
  { name: "APKPure", url: q => `https://apkpure.com/search?q=${encodeURIComponent(q)}` },
  { name: "APKMirror", url: q => `https://www.apkmirror.com/?post_type=app_release&searchtype=apk&s=${encodeURIComponent(q)}` },
  { name: "F-Droid", url: q => `https://f-droid.org/en/packages/?q=${encodeURIComponent(q)}` },
  { name: "APKMonk", url: q => `https://www.apkmonk.com/search?q=${encodeURIComponent(q)}` },
  { name: "Uptodown", url: q => `https://en.uptodown.com/android/search/${encodeURIComponent(q)}` },
  { name: "Aptoide", url: q => `https://en.aptoide.com/search?query=${encodeURIComponent(q)}` },
  { name: "APKCombo", url: q => `https://apkcombo.com/en/search/?q=${encodeURIComponent(q)}` },
  { name: "APKHere", url: q => `https://www.apkhere.com/search?q=${encodeURIComponent(q)}` },
  { name: "AppAgg", url: q => `https://appagg.com/android/?q=${encodeURIComponent(q)}` },
];

// Main APK search command
cmd(
  {
    pattern: "apk",
    react: "📱",
    desc: "Search and download APK files",
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
    let sent = false;
    try {
      console.log(`[APK] Command received: .apk ${q}`);
      if (!q) {
        sent = true;
        return reply("🔍 *Please provide an app name to search*");
      }

      let resultMessage = `📱 *APK DOWNLOADER*\n\n`;
      resultMessage += `🔍 *Search:* ${q}\n`;
      resultMessage += `🌐 *App Info Preview:* https://www.google.com/search?q=${encodeURIComponent(q + ' android app')}\n\n`;
      resultMessage += `📥 *Download from trusted sources:*\n`;
      apkSources.forEach(src => {
        resultMessage += `• ${src.name}: ${src.url(q)}\n`;
      });
      resultMessage += `\n💡 *Instructions:*\n`;
      resultMessage += `1️⃣ Click any link above\n`;
      resultMessage += `2️⃣ Search for your app\n`;
      resultMessage += `3️⃣ Download the APK file\n`;
      resultMessage += `4️⃣ Install on your device\n\n`;
      resultMessage += `⚠️ *Safety Tips:*\n`;
      resultMessage += `• Only download from trusted sources\n`;
      resultMessage += `• Enable "Unknown Sources" in settings\n`;
      resultMessage += `• Scan files with antivirus\n\n`;
      resultMessage += `> *Made By Arosh Samuditha*`;

      await robin.sendMessage(
        from,
        { text: resultMessage },
        { quoted: mek }
      );
      sent = true;
      console.log(`[APK] Links sent for: ${q}`);
    } catch (e) {
      console.error("[APK] Plugin error:", e);
      if (!sent) {
        sent = true;
        reply(`❌ *Error:* ${e.message || "Failed to search for APK files"}`);
      }
    } finally {
      // Fallback: If nothing was sent, always reply something
      if (!sent) {
        reply("❗ *Sorry, something went wrong. Please try again later or use the links below:*\n\n" +
          apkSources.map(src => `• ${src.name}: ${src.url("android")}`).join("\n") +
          "\n\n> *Made By Arosh Samuditha*");
      }
    }
  }
);

// Direct APK download command
cmd(
  {
    pattern: "apkdl",
    react: "📥",
    desc: "Direct APK download with app name",
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
    let sent = false;
    try {
      console.log(`[APKDL] Command received: .apkdl ${q}`);
      if (!q) {
        sent = true;
        return reply("📱 *Please provide an app name for direct download*");
      }

      await reply("🔍 *Searching for direct download link...*");

      const appName = q.trim();
      let downloadMessage = `📱 *DIRECT APK DOWNLOAD*\n\n`;
      downloadMessage += `📦 *App:* ${appName}\n`;
      downloadMessage += `🌐 *App Info Preview:* https://www.google.com/search?q=${encodeURIComponent(appName + ' android app')}\n\n`;
      downloadMessage += `📥 *Download Links:*\n`;
      apkSources.forEach(src => {
        downloadMessage += `• ${src.name}: ${src.url(appName)}\n`;
      });
      downloadMessage += `\n💡 *Quick Download:*\n`;
      downloadMessage += `1️⃣ Click any link above\n`;
      downloadMessage += `2️⃣ Find your app in search results\n`;
      downloadMessage += `3️⃣ Click download button\n`;
      downloadMessage += `4️⃣ Install APK on your device\n\n`;
      downloadMessage += `⚠️ *Important:*\n`;
      downloadMessage += `• Enable "Install from Unknown Sources"\n`;
      downloadMessage += `• Check app permissions before installing\n`;
      downloadMessage += `• Use antivirus to scan downloaded files\n\n`;
      downloadMessage += `> *Made By Arosh Samuditha*`;

      await robin.sendMessage(
        from,
        { text: downloadMessage },
        { quoted: mek }
      );
      sent = true;
      console.log(`[APKDL] Links sent for: ${appName}`);
    } catch (e) {
      console.error("[APKDL] Direct download error:", e);
      if (!sent) {
        sent = true;
        reply(`❌ *Error:* ${e.message || "Failed to generate download links"}`);
      }
    } finally {
      // Fallback: If nothing was sent, always reply something
      if (!sent) {
        reply("❗ *Sorry, something went wrong. Please try again later or use the links below:*\n\n" +
          apkSources.map(src => `• ${src.name}: ${src.url("android")}`).join("\n") +
          "\n\n> *Made By Arosh Samuditha*");
      }
    }
  }
); 