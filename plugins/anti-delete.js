const config = require('../config');

// Import messageStore from index.js if available
let messageStore;
try {
  messageStore = require('../index').messageStore;
} catch {
  messageStore = {};
}

module.exports = function setupAntiDelete(robin) {
  if (config.ANTI_DELETE !== 'true') return;

  robin.ev.on('messages.delete', async (deleteEvent) => {
    try {
      const key = (deleteEvent.keys && deleteEvent.keys[0]) || (deleteEvent.messages && deleteEvent.messages[0]?.key);
      if (!key) return;
      const from = key.remoteJid;
      const sender = key.participant || key.remoteJid;
      if (key.fromMe) return;

      // Look up the original message
      const deletedMsg = messageStore[key.id];
      if (!deletedMsg || !deletedMsg.message) return;

      // Forward the deleted message
      await robin.sendMessage(from, {
        forward: deletedMsg,
        text: `🛡️ *Anti-Delete*\n@${sender.split('@')[0]} deleted a message!\nHere is the deleted message:`
      }, { mentions: [sender] });
    } catch (err) {
      console.error('[ANTI-DELETE ERROR]', err);
    }
  });
}; 