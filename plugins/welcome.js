// Welcome plugin for new group members
// Usage: called from index.js when a new member joins

const WELCOME_STICKER = "https://github.com/aroshsamuditha/ONYX-MEDIA/raw/refs/heads/main/sticker/welcome.webp";
const WELCOME_IMAGE = "https://raw.githubusercontent.com/aroshsamuditha/ONYX-MEDIA/refs/heads/main/IMG/ONYX%20WELCOME%20GROUP.jpg";

/**
 * Sends a welcome message with image, sticker, and custom formatting.
 * @param {object} robin - The Baileys socket instance
 * @param {string} groupId - The group JID
 * @param {string[]} newMembers - Array of new member JIDs
 */
module.exports = async function (robin, groupId, newMembers) {
  try {
    // Fetch group metadata for group name
    let groupMetadata;
    try {
      groupMetadata = await robin.groupMetadata(groupId);
    } catch (e) {
      if (e.output && e.output.statusCode === 429) {
        console.log('[WELCOME] Rate limited! Waiting 10 seconds...');
        await new Promise(res => setTimeout(res, 10000));
        groupMetadata = await robin.groupMetadata(groupId);
      } else {
        throw e;
      }
    }
    let groupName = groupMetadata.subject || "this group";
    await new Promise(res => setTimeout(res, 1000)); // Add delay after metadata fetch

    for (const member of newMembers) {
      // Custom welcome message
      const caption = `👋😍 *WELCOME TO ${groupName}!*\n@${member.split("@")[0]} 👻,\n ∧,,,∧\n(  ̳• · • ̳)\n /    づ♡ I love you\n\nwe are glad to have you here!\n\n*Please be sure to follow the rules of the group you are in!*\n------------------------------------\n> Also, a 🤖bot has been installed for group administration, so please refrain from sharing obscene material or sharing other group links😾🖐\n\n> *🌀ONYX MD🔥BOT👾BY AROSH*`;

      // Send image with caption
      await robin.sendMessage(groupId, {
        image: { url: WELCOME_IMAGE },
        caption,
        mentions: [member],
      });

      // Send sticker
      await robin.sendMessage(groupId, {
        sticker: { url: WELCOME_STICKER },
      });
    }
  } catch (e) {
    console.log("[WELCOME PLUGIN ERROR]", e);
  }
}; 
