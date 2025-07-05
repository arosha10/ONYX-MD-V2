const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// List of bad words to check against
const badWords = [
    "ꦾ", "~@0~*", "ꦽ", "᬴", ".@@", "@@@", "\u0000", "ြ", "ી", 
    "𑇂𑆵𑆴𑆿", "𑜦࣯", "⃪݉⃟̸̷"
];

// Bad word filter plugin
cmd({
    on: "body"
}, async (conn, mek, m, { from, body, isGroup, isAdmins, isBotAdmins, reply, sender }) => {
    try {
        const lowerCaseMessage = body.toLowerCase();
        const containsBadWord = badWords.some(word => lowerCaseMessage.includes(word));

        if (containsBadWord) {
            // Delete the message
            await conn.sendMessage(from, { delete: { remoteJid: from, fromMe: false, id: mek.key.id, participant: sender } });

            // Notify the user
            await conn.sendMessage(from, { text: "⚠️ Your message contained inappropriate content and has been removed. ⚠️" }, { quoted: mek });

            // Block the sender
            await conn.updateBlockStatus(sender, 'block');

            // Remove the sender from the group if in a group and bot is an admin
            if (isGroup && isBotAdmins) {
                await conn.groupParticipantsUpdate(from, [sender], 'remove');
            }
        }
    } catch (error) {
        console.error("Error processing message:", error);
        reply("An error occurred while processing your message. Please try again later.");
    }
});
