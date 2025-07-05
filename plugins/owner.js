const { cmd } = require('../command')
const config = require('../config')

cmd({
    pattern: "block",
    alias: ["ban"],
    react: "☠️",  // <- Fixed the missing semicolon here
    desc: "Block a user instantly.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { quoted, reply, isOwner }) => {
    try {
        // Check if the user is the bot owner
        if (!isOwner) return reply("*⚠️ උබ මගේ(බොට්ගේ) ඔව්නර්ද කියහම්🥲*");

        // Check if the command is used on a quoted message
        if (!quoted) return reply("*⚠️ බ්ලොක් කරන්න ඕනි එකාව මේන්ශන් කරපම්🥲*!");

        // Extract the target user from the quoted message
        const target = quoted.sender;

        // Block the target user
        await robin.updateBlockStatus(target, "block");

        // Confirm success
        return reply(`*✅ බ්ලොක් කලා😌💖*: @${target.split('@')[0]}`);
    } catch (e) {
        console.error("Block Error:", e);
        return reply(`❌ Failed to block the user. Error: ${e.message}`);
    }
});

cmd(
  {
    pattern: "resetusers",
    react: "🔄",
    desc: "Reset new users data (Owner only)",
    category: "owner",
    filename: __filename,
  },
  async (robin, mek, m, { from, reply, isOwner }) => {
    if (!isOwner) return reply("❌ This command is only for owner!");
    
    try {
      const fs = require('fs');
      const path = require('path');
      const newUsersPath = path.join(__dirname, '../data/newusers.json');
      
      // Reset to empty object with proper encoding
      fs.writeFileSync(newUsersPath, JSON.stringify({}, null, 2), 'utf8');
      
      reply("✅ New users data has been reset successfully!");
      console.log("New users data reset by owner");
    } catch (error) {
      console.error("Error resetting new users data:", error.message);
      reply("❌ Failed to reset new users data.");
    }
  }
);
