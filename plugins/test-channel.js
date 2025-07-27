const { cmd } = require("../command");

cmd(
  {
    pattern: "testchannel",
    desc: "Test channel detection",
    category: "test",
    filename: __filename,
  },
  async (robin, m, { from, isGroup, isChannel, sender, isOwner }) => {
    const chatId = from || m?.key?.remoteJid || "status@broadcast";
    
    // Fallback channel detection if isChannel is undefined
    const isChannelDetected = isChannel !== undefined ? isChannel : (chatId.endsWith("@broadcast") || chatId.endsWith("@newsletter"));
    
    console.log(`[TEST CHANNEL] Chat ID: ${chatId}`);
    console.log(`[TEST CHANNEL] isGroup: ${isGroup}`);
    console.log(`[TEST CHANNEL] isChannel: ${isChannel}`);
    console.log(`[TEST CHANNEL] isChannelDetected: ${isChannelDetected}`);
    console.log(`[TEST CHANNEL] sender: ${sender}`);
    console.log(`[TEST CHANNEL] isOwner: ${isOwner}`);
    
    const chatType = isChannelDetected ? "Channel" : isGroup ? "Group" : "Private Chat";
    
    const testMessage = `🔍 *Channel Detection Test*

📱 *Chat Type:* ${chatType}
🆔 *Chat ID:* ${chatId}
👤 *Sender:* ${sender}
👑 *Is Owner:* ${isOwner ? "Yes" : "No"}
👥 *Is Group:* ${isGroup ? "Yes" : "No"}
📢 *Is Channel:* ${isChannel ? "Yes" : "No"}

✅ *Test completed successfully!*`;

    await robin.sendMessage(chatId, { text: testMessage }, { quoted: m });
  }
); 