const { cmd } = require("../command");

cmd(
  {
    pattern: "debugchannel",
    desc: "Debug channel detection and parameter passing",
    category: "debug",
    filename: __filename,
  },
  async (robin, m, { from, isGroup, isChannel, sender, isOwner }) => {
    const chatId = from || m?.key?.remoteJid || "status@broadcast";
    
    // Test all possible channel detection methods
    const endsWithBroadcast = chatId.endsWith("@broadcast");
    const endsWithNewsletter = chatId.endsWith("@newsletter");
    const endsWithGus = chatId.endsWith("@g.us");
    
    // Fallback detection
    const isChannelDetected = isChannel !== undefined ? isChannel : (endsWithBroadcast || endsWithNewsletter);
    
    console.log(`[DEBUG CHANNEL] ========== DETAILED DEBUG ==========`);
    console.log(`[DEBUG CHANNEL] Chat ID: ${chatId}`);
    console.log(`[DEBUG CHANNEL] endsWith("@broadcast"): ${endsWithBroadcast}`);
    console.log(`[DEBUG CHANNEL] endsWith("@newsletter"): ${endsWithNewsletter}`);
    console.log(`[DEBUG CHANNEL] endsWith("@g.us"): ${endsWithGus}`);
    console.log(`[DEBUG CHANNEL] isGroup parameter: ${isGroup}`);
    console.log(`[DEBUG CHANNEL] isChannel parameter: ${isChannel}`);
    console.log(`[DEBUG CHANNEL] isChannelDetected: ${isChannelDetected}`);
    console.log(`[DEBUG CHANNEL] sender: ${sender}`);
    console.log(`[DEBUG CHANNEL] isOwner: ${isOwner}`);
    console.log(`[DEBUG CHANNEL] ======================================`);
    
    const chatType = isChannelDetected ? "Channel" : isGroup ? "Group" : "Private Chat";
    
    const debugMessage = `🔍 *Channel Detection Debug*

📱 *Chat ID:* ${chatId}
📋 *Chat Type:* ${chatType}

🔧 *Detection Results:*
• endsWith("@broadcast"): ${endsWithBroadcast ? "✅" : "❌"}
• endsWith("@newsletter"): ${endsWithNewsletter ? "✅" : "❌"}
• endsWith("@g.us"): ${endsWithGus ? "✅" : "❌"}

📊 *Parameters:*
• isGroup: ${isGroup ? "✅" : "❌"}
• isChannel: ${isChannel ? "✅" : "❌"}
• isChannelDetected: ${isChannelDetected ? "✅" : "❌"}

👤 *User Info:*
• Sender: ${sender}
• Is Owner: ${isOwner ? "✅" : "❌"}

✅ *Debug completed!*`;

    await robin.sendMessage(chatId, { text: debugMessage }, { quoted: m });
  }
); 