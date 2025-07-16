// ONYX-MD-V2 Group Management Plugin
const { cmd, commands } = require("../command");

// Group Info
cmd({
  pattern: "groupinfo",
  react: "ℹ",
  desc: "Show group information",
  category: "group",
  filename: __filename,
}, async (robin, mek, m, {
  from, quoted, reply
}) => {
  try {
    if (!from.endsWith('@g.us')) {
      return reply("❌ This command can only be used in groups!");
    }
    const metadata = await robin.groupMetadata(from);
    let ppUrl;
    try {
      ppUrl = await robin.profilePictureUrl(from, 'image');
    } catch (error) {
      ppUrl = null;
    }
    const creationDate = new Date(metadata.creation * 1000).toLocaleString();
    const admins = metadata.participants.filter(p => p.admin).map(p => `👑 ${p.id.split('@')[0]}`);
    const members = metadata.participants.filter(p => !p.admin).map(p => `👤 ${p.id.split('@')[0]}`);
    const captionText = `> *🌀ONYX MD🔥GROUP INFOℹ*\n\n *💠Title -* ${metadata.subject}\n *⭕Created -* ${creationDate}\n *✅ ID -* ${metadata.id.replace('@g.us', '')}\n *🧑‍🧒‍🧒Participants -* ${metadata.participants.length}\n\n 👑Admins - (${admins.length}):\n${admins.map(a => `➲ ${a}`).join('\n')}\n\n *📌Members -* (${members.length}):\n${members.map(m => `❆ ${m}`).join('\n')}\n\n\n*BY AROSH SAMUDITHA*`;
    if (ppUrl) {
      await robin.sendMessage(from, { image: { url: ppUrl }, caption: captionText, mimetype: 'image/jpeg' }, { quoted: mek });
    } else {
      await robin.sendMessage(from, { text: captionText }, { quoted: mek });
    }
  } catch (error) {
    console.error("GroupInfo Error:", error);
    reply("❌ Error fetching group information. Please try again later.");
  }
});

// Tag All
cmd({
  pattern: "tagall",
  react: "📢",
  desc: "Tag all group members",
  category: "group",
  filename: __filename,
}, async (robin, mek, m, {
  from, quoted, reply, sender, isGroup, isAdmins, groupMetadata, userSetting
}) => {
  try {
    if (!from.endsWith('@g.us')) return reply("❌ This command can only be used in groups!");
    const metadata = await robin.groupMetadata(from);
    const participants = metadata.participants;
    const mentions = participants.map(p => p.id);
    let messageText = "";
    const prefix = userSetting?.PREFIX || '.';
    const fullMessage = m?.body || "";
    if (fullMessage) {
      const commandRegex = new RegExp(`^\\${prefix}tagall\\s*(.*)`, 'i');
      const match = fullMessage.match(commandRegex);
      messageText = match?.[1]?.trim() || "";
    }
    const formattedMessage = `> *🌀ONYX MD🔥TAG ALL 📌*\n\n *ℹGroup -* ${metadata.subject}\n *👥Members -* ${participants.length}\n\n${messageText ? ` *✉Message -*\n ${messageText}\n` : '➲'}\n\n\n*BY AROSH SAMUDITHA*`;
    await robin.sendMessage(from, { text: formattedMessage, mentions }, { quoted: mek });
  } catch (error) {
    console.error("TagAll Error:", error);
    reply("❌ Error sending tagall message. Please try again later.");
  }
});

// Helper to get bot JID and LID
function getBotJids(robin, userSetting) {
  const botJid = robin.user?.id || userSetting?.BOT_LID;
  const botLid = botJid.replace('@s.whatsapp.net', '@lid');
  return { botJid, botLid };
}

// Mute Group
cmd({
  pattern: "mute",
  react: "🔒",
  desc: "Mute group (admins only)",
  category: "group",
  filename: __filename,
}, async (robin, mek, m, {
  from, quoted, reply, sender, isAdmins, userSetting
}) => {
  try {
    if (!from.endsWith('@g.us')) return reply("❌ This command can only be used in groups!");
    const metadata = await robin.groupMetadata(from);
    console.log('[DEBUG] All Participants:');
    metadata.participants.forEach(p => {
      console.log(`- ${p.id} | admin: ${p.admin}`);
    });
    // Improved admin detection
    const participant = metadata.participants.find(
      p => p.id.split('@')[0] === sender.split('@')[0]
    );
    console.log('[DEBUG] Sender:', sender);
    console.log('[DEBUG] Matched participant:', participant);
    const isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
    const { botJid, botLid } = getBotJids(robin, userSetting);
    const botp = metadata.participants.find(p => p.id === botJid || p.id === botLid);
    const isBotAdmin = botp?.admin === 'admin' || botp?.admin === 'superadmin';
    console.log('[DEBUG] Bot JID:', botJid, '| Bot LID:', botLid);
    console.log('[DEBUG] Group Admins:', metadata.participants.filter(p => p.admin).map(p => p.id));
    if (!isAdmin) return reply("❌ Only group admins can use this command!");
    await robin.groupSettingUpdate(from, 'announcement');
    reply("🔒 Group is now muted (only admins can send messages)");
  } catch (error) {
    console.error("Mute Error:", error);
    reply("❌ Error muting group. Please try again later.");
  }
});

// Unmute Group
cmd({
  pattern: "unmute",
  react: "🔓",
  desc: "Unmute group (admins only)",
  category: "group",
  filename: __filename,
}, async (robin, mek, m, {
  from, quoted, reply, sender, isAdmins, userSetting
}) => {
  try {
    if (!from.endsWith('@g.us')) return reply("❌ This command can only be used in groups!");
    const metadata = await robin.groupMetadata(from);
    console.log('[DEBUG] All Participants:');
    metadata.participants.forEach(p => {
      console.log(`- ${p.id} | admin: ${p.admin}`);
    });
    const participant = metadata.participants.find(p => p.id === sender);
    const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
    const { botJid, botLid } = getBotJids(robin, userSetting);
    const botp = metadata.participants.find(p => p.id === botJid || p.id === botLid);
    const isBotAdmin = botp?.admin === 'admin' || botp?.admin === 'superadmin';
    console.log('[DEBUG] Bot JID:', botJid, '| Bot LID:', botLid);
    console.log('[DEBUG] Group Admins:', metadata.participants.filter(p => p.admin).map(p => p.id));
    if (!isAdmin) return reply("❌ Only group admins can use this command!");
    await robin.groupSettingUpdate(from, 'not_announcement');
    reply("🔓 Group is now unmuted (everyone can send messages)");
  } catch (error) {
    console.error("Unmute Error:", error);
    reply("❌ Error unmuting group. Please try again later.");
  }
});

// Kick Member
cmd({
  pattern: "kick",
  react: "🦿",
  desc: "Kick member (admins only)",
  category: "group",
  filename: __filename,
}, async (robin, mek, m, {
  from, quoted, reply, sender, isAdmins, userSetting
}) => {
  try {
    if (!from.endsWith('@g.us')) return reply("❌ This command can only be used in groups!");
    const metadata = await robin.groupMetadata(from);
    console.log('[DEBUG] All Participants:');
    metadata.participants.forEach(p => {
      console.log(`- ${p.id} | admin: ${p.admin}`);
    });
    const allParticipants = metadata.participants || [];
    // Improved admin detection
    const participant = allParticipants.find(
      p => p.id.split('@')[0] === sender.split('@')[0]
    );
    console.log('[DEBUG] Sender:', sender);
    console.log('[DEBUG] Matched participant:', participant);
    const isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
    const { botJid, botLid } = getBotJids(robin, userSetting);
    const botParticipant = allParticipants.find(p => p.id === botJid || p.id === botLid);
    console.log('[DEBUG] Bot JID:', botJid, '| Bot LID:', botLid);
    console.log('[DEBUG] Group Admins:', allParticipants.filter(p => p.admin).map(p => p.id));
    if (!isAdmin) return reply("❌ Only group admins can use this command!");
    const msgData = m;
    const quotedUser = msgData.quoted?.sender || null;
    const mentionedJids = msgData.mentionedJid || [];
    let usersToKick = [];
    if (quotedUser) usersToKick.push(quotedUser);
    if (mentionedJids.length > 0) usersToKick.push(...mentionedJids);
    usersToKick = usersToKick.filter(jid => {
      if (jid === botJid || jid === botLid) return false;
      const target = allParticipants.find(p => p.id === jid);
      if (!target) return false;
      return !(target.admin === 'admin' || target.admin === 'superadmin');
    });
    if (usersToKick.length === 0) return reply("❌ Please mention or reply to the user you want to kick!");
    await robin.groupParticipantsUpdate(from, usersToKick, "remove");
    reply(`✅ Kicked ${usersToKick.length} user(s)!`);
  } catch (err) {
    console.error("Kick Error:", err);
    reply("❌ Failed to kick. Something went wrong.");
  }
});

// Add Member
cmd({
  pattern: "add",
  react: "➕",
  desc: "Add member (admins only)",
  category: "group",
  filename: __filename,
}, async (robin, mek, m, {
  from, quoted, reply, sender, isAdmins, userSetting
}) => {
  try {
    if (!from.endsWith('@g.us')) return reply("❌ This command can only be used in groups!");
    const metadata = await robin.groupMetadata(from);
    console.log('[DEBUG] All Participants:');
    metadata.participants.forEach(p => {
      console.log(`- ${p.id} | admin: ${p.admin}`);
    });
    const allParticipants = metadata.participants || [];
    const participant = allParticipants.find(p => p.id === sender);
    const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
    const { botJid, botLid } = getBotJids(robin, userSetting);
    const botParticipant = allParticipants.find(p => p.id === botJid || p.id === botLid);
    console.log('[DEBUG] Bot JID:', botJid, '| Bot LID:', botLid);
    console.log('[DEBUG] Group Admins:', allParticipants.filter(p => p.admin).map(p => p.id));
    if (!isAdmin) return reply("❌ Only group admins can use this command!");
    
    const bodyText = m.body || '';
    const prefix = userSetting?.PREFIX || '.';
    const match = bodyText.match(new RegExp(`^\\${prefix}add\\s+(\\d{8,})`, 'i'));
    if (!match || !match[1]) return reply(`❌ Please use the command like this: ${prefix}add 94xxxxxxx`);
    const numberToAdd = match[1].replace(/\D/g, '');
    if (numberToAdd.length < 8) return reply("❌ Invalid WhatsApp number!");
    const userJid = numberToAdd + '@s.whatsapp.net';
    try {
      await robin.groupParticipantsUpdate(from, [userJid], "add");
      reply(`✅ Successfully added ${numberToAdd} to the group!`);
    } catch (addError) {
      console.error("Add Error:", addError);
      reply(`❌ Failed to add ${numberToAdd}. Maybe they have private account or blocked me.`);
    }
  } catch (error) {
    console.error("Add Command Error:", error);
    reply("❌ Error adding user. Please try again later.");
  }
});

// Promote Member
cmd({
  pattern: "promote",
  react: "⬆",
  desc: "Promote member to admin (admins only)",
  category: "group",
  filename: __filename,
}, async (robin, mek, m, {
  from, quoted, reply, sender, isAdmins, userSetting
}) => {
  try {
    if (!from.endsWith('@g.us')) return reply("❌ This command can only be used in groups!");
    const metadata = await robin.groupMetadata(from);
    console.log('[DEBUG] All Participants:');
    metadata.participants.forEach(p => {
      console.log(`- ${p.id} | admin: ${p.admin}`);
    });
    const allParticipants = metadata.participants || [];
    // Improved admin detection
    const participant = allParticipants.find(
      p => p.id.split('@')[0] === sender.split('@')[0]
    );
    console.log('[DEBUG] Sender:', sender);
    console.log('[DEBUG] Matched participant:', participant);
    const isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
    const { botJid, botLid } = getBotJids(robin, userSetting);
    const botParticipant = allParticipants.find(p => p.id === botJid || p.id === botLid);
   
    console.log('[DEBUG] Bot JID:', botJid, '| Bot LID:', botLid);
    console.log('[DEBUG] Group Admins:', allParticipants.filter(p => p.admin).map(p => p.id));
    if (!isAdmin) return reply("❌ Only group admins can use this command!");
    
    const quotedUser = m.quoted?.sender || null;
    const mentionedJids = m.mentionedJid || [];
    let usersToPromote = [];
    if (quotedUser) usersToPromote.push(quotedUser);
    if (mentionedJids.length > 0) usersToPromote.push(...mentionedJids);
    usersToPromote = usersToPromote.filter(jid => jid !== botJid && jid !== botLid);
    if (usersToPromote.length === 0) return reply("❌ Please mention or reply to the user you want to promote!");
    usersToPromote = usersToPromote.filter(jid => {
      const target = allParticipants.find(p => p.id === jid);
      return target && target.admin !== 'admin' && target.admin !== 'superadmin';
    });
    if (usersToPromote.length === 0) return reply("❌ The selected users are already admins!");
    await robin.groupParticipantsUpdate(from, usersToPromote, "promote");
    reply(`✅ Successfully promoted ${usersToPromote.length} user(s) to admin!`);
  } catch (error) {
    console.error("Promote Error:", error);
    reply("❌ Error promoting user. Please try again later.");
  }
});

// Demote Member
cmd({
  pattern: "demote",
  react: "⬇",
  desc: "Demote admin to member (admins only)",
  category: "group",
  filename: __filename,
}, async (robin, mek, m, {
  from, quoted, reply, sender, isAdmins, userSetting
}) => {
  try {
    if (!from.endsWith('@g.us')) return reply("❌ This command can only be used in groups!");
    const metadata = await robin.groupMetadata(from);
    console.log('[DEBUG] All Participants:');
    metadata.participants.forEach(p => {
      console.log(`- ${p.id} | admin: ${p.admin}`);
    });
    const allParticipants = metadata.participants || [];
    // Improved admin detection
    const participant = allParticipants.find(
      p => p.id.split('@')[0] === sender.split('@')[0]
    );
    console.log('[DEBUG] Sender:', sender);
    console.log('[DEBUG] Matched participant:', participant);
    const isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
    const { botJid, botLid } = getBotJids(robin, userSetting);
    const botParticipant = allParticipants.find(p => p.id === botJid || p.id === botLid);
    
    console.log('[DEBUG] Bot JID:', botJid, '| Bot LID:', botLid);
    console.log('[DEBUG] Group Admins:', allParticipants.filter(p => p.admin).map(p => p.id));
    if (!isAdmin) return reply("❌ Only group admins can use this command!");
    
    const quotedUser = m.quoted?.sender || null;
    const mentionedJids = m.mentionedJid || [];
    let usersToDemote = [];
    if (quotedUser) usersToDemote.push(quotedUser);
    if (mentionedJids.length > 0) usersToDemote.push(...mentionedJids);
    usersToDemote = usersToDemote.filter(jid => jid !== botJid && jid !== botLid);
    if (usersToDemote.length === 0) return reply("❌ Please mention or reply to the user you want to demote!");
    usersToDemote = usersToDemote.filter(jid => {
      const target = allParticipants.find(p => p.id === jid);
      return target && (target.admin === 'admin' || target.admin === 'superadmin');
    });
    if (usersToDemote.length === 0) return reply("❌ The selected users are not admins!");
    await robin.groupParticipantsUpdate(from, usersToDemote, "demote");
    reply(`✅ Successfully demoted ${usersToDemote.length} user(s) from admin!`);
  } catch (error) {
    console.error("Demote Error:", error);
    reply("❌ Error demoting user. Please try again later.");
  }
});
