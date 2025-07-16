const { cmd } = require('../command');
const config = require('../config');

// WhatsApp group link patterns
const whatsappLinkPatterns = [
    /https?:\/\/(chat\.whatsapp\.com|wa\.me)\/[a-zA-Z0-9]+/i,
    /https?:\/\/whatsapp\.com\/invite\/[a-zA-Z0-9]+/i,
    /https?:\/\/t\.me\/joinchat\/[a-zA-Z0-9_-]+/i, // Telegram links (optional)
    /https?:\/\/discord\.gg\/[a-zA-Z0-9]+/i, // Discord links (optional)
];

// Antilink plugin
cmd({
    on: "body"
}, async (conn, mek, m, { from, body, isGroup, isAdmins, isBotAdmins, reply, sender }) => {
    try {
        // Only check in groups
        if (!isGroup) return;
        
        // Skip if sender is admin or bot admin
        if (isAdmins || isBotAdmins) return;
        
        // Check if message contains any WhatsApp group links
        const containsLink = whatsappLinkPatterns.some(pattern => pattern.test(body));
        
        if (containsLink) {
            // Delete the message
            await conn.sendMessage(from, { 
                delete: { 
                    remoteJid: from, 
                    fromMe: false, 
                    id: mek.key.id, 
                    participant: sender 
                } 
            });

            // Send warning message
            await conn.sendMessage(from, { 
                text: `⚠️ *Anti-Link Protection* ⚠️\n\n@${sender.split('@')[0]} your message contained a group link and has been removed.\n\n*Note:* Only admins are allowed to share group links.` 
            }, { 
                quoted: mek,
                mentions: [sender]
            });

            console.log(`[ANTI-LINK] Deleted link from ${sender} in ${from}`);
        }
    } catch (error) {
        console.error("[ANTI-LINK ERROR]", error);
    }
});

// Command to toggle antilink for specific groups (admin only)
cmd({
    pattern: "antilink",
    desc: "Toggle antilink protection for the group",
    category: "admin",
    filename: "antilink.js"
}, async (conn, mek, m, { from, isGroup, isAdmins, reply }) => {
    try {
        if (!isGroup) {
            return reply("❌ This command can only be used in groups!");
        }
        
        if (!isAdmins) {
            return reply("❌ Only admins can use this command!");
        }
        
        // For now, antilink is always enabled
        // You can extend this to store group-specific settings in a JSON file
        reply("✅ *Anti-Link Protection*\n\n🔒 Group links are automatically deleted when posted by non-admins.\n\n*Status:* Always Active");
        
    } catch (error) {
        console.error("[ANTI-LINK COMMAND ERROR]", error);
        reply("❌ An error occurred while processing the command.");
    }
}); 