const { cmd, commands } = require("../command");

// Kick command (renamed to avoid conflict with owner.js)
cmd({
    pattern: "remove",
    alias: ["kick"],
    react: "⚠",
    desc: "Remove a mentioned user from the group.",
    category: "group",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply, sender }) => {
    try {
        // Check if it's a group
        if (!from.endsWith('@g.us')) return reply("⚠ This command can only be used in a group!");
        
        // Get group metadata
        const groupMetadata = await robin.groupMetadata(from);
        const allParticipants = groupMetadata.participants || [];
        
        // Check if sender is admin
        const participant = allParticipants.find(p => p.id === sender);
        const isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
        
        if (!isAdmin) return reply("⚠ Only group admins can use this command!");
        
        // Check if user is quoted or mentioned
        const quotedUser = m.quoted?.sender || null;
        const mentionedJids = m.mentionedJid || [];
        let usersToKick = [];
        
        if (quotedUser) usersToKick.push(quotedUser);
        if (mentionedJids.length > 0) usersToKick.push(...mentionedJids);
        
        if (usersToKick.length === 0) return reply("⚠ Please reply to a message or mention the user you want to remove!");
        
        // Filter out admins and the bot itself
        usersToKick = usersToKick.filter(jid => {
            const target = allParticipants.find(p => p.id === jid);
            if (!target) return false;
            return !(target.admin === 'admin' || target.admin === 'superadmin');
        });
        
        if (usersToKick.length === 0) return reply("⚠ Cannot remove admins from the group!");
        
        // Remove the users
        await robin.groupParticipantsUpdate(from, usersToKick, "remove");
        return reply(`✅ Successfully removed ${usersToKick.length} user(s) from the group!`);
        
    } catch (e) {
        console.error("Remove Error:", e);
        reply(`❌ Failed to remove the user. Error: ${e.message}`);
    }
});

// Group info command
cmd({
    pattern: "ginfo",
    alias: ["groupinfo"],
    react: "ℹ️",
    desc: "Get group information",
    category: "group",
    filename: __filename
},
async (robin, mek, m, { from, reply }) => {
    try {
        if (!from.endsWith('@g.us')) return reply("⚠ This command can only be used in a group!");
        
        const groupMetadata = await robin.groupMetadata(from);
        const participants = groupMetadata.participants || [];
        const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
        const members = participants.filter(p => !p.admin);
        
        const info = `*Group Information*\n\n` +
                    `*Name:* ${groupMetadata.subject}\n` +
                    `*Description:* ${groupMetadata.desc || 'No description'}\n` +
                    `*Participants:* ${participants.length}\n` +
                    `*Admins:* ${admins.length}\n` +
                    `*Members:* ${members.length}\n` +
                    `*Created:* ${new Date(groupMetadata.creation * 1000).toLocaleDateString()}\n` +
                    `*Group ID:* ${from}`;
        
        return reply(info);
        
    } catch (e) {
        console.error("Group Info Error:", e);
        reply(`❌ Failed to get group information. Error: ${e.message}`);
    }
});

// List admins command
cmd({
    pattern: "admins",
    alias: ["listadmins"],
    react: "👥",
    desc: "List all group admins",
    category: "group",
    filename: __filename
},
async (robin, mek, m, { from, reply }) => {
    try {
        if (!from.endsWith('@g.us')) return reply("⚠ This command can only be used in a group!");
        
        const groupMetadata = await robin.groupMetadata(from);
        const participants = groupMetadata.participants || [];
        const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
        
        if (admins.length === 0) return reply("ℹ️ No admins found in this group.");
        
        let adminList = "*Group Admins:*\n\n";
        admins.forEach((admin, index) => {
            const number = admin.id.split('@')[0];
            adminList += `${index + 1}. @${number}\n`;
        });
        
        return reply(adminList);
        
    } catch (e) {
        console.error("Admins List Error:", e);
        reply(`❌ Failed to get admins list. Error: ${e.message}`);
    }
});