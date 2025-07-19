const { cmd } = require('../command');

// List of bad words (add/remove as needed)
const badWords = [
    'gandu','pakaya','pako','huththa','huththi','ponnaya','wesi','pacaya','paco', 'madarchod', 'bhosdike', 'bsdk', 'fucker', 'bhosda', 'lauda', 'laude', 'betichod', 'chutiya',
    'maa ki chut', 'behenchod', 'behen ki chut', 'tatto ke saudagar', 'machar ki jhant', 'jhant ka baal',
    'randi', 'chuchi', 'boobs', 'boobies', 'tits', 'idiot', 'nigga', 'fuck', 'dick', 'bitch', 'bastard',
    'asshole', 'asu', 'awyu', 'teri ma ki chut', 'teri maa ki', 'lund', 'lund ke baal', 'mc', 'lodu', 'benchod',
    'shit', 'damn', 'hell', 'piss', 'crap', 'slut', 'whore', 'prick', 'motherfucker', 'cock', 'cunt', 'pussy',
    'twat', 'wanker', 'douchebag', 'jackass', 'moron', 'retard', 'scumbag', 'skank', 'slutty', 'arse', 'bugger',
    'sod off', 'chut', 'laude ka baal', 'madar', 'behen ke lode', 'chodne', 'sala kutta', 'harami', 'randi ki aulad',
    'gaand mara', 'chodu', 'lund le', 'gandu saala', 'kameena', 'haramzada', 'chamiya', 'chodne wala', 'chudai',
    'chutiye ke baap', 'fck', 'fckr', 'fcker', 'fuk', 'fukk', 'fcuk', 'btch', 'bch', 'bsdk', 'f*ck', 'assclown',
    'a**hole', 'f@ck', 'b!tch', 'd!ck', 'n!gga', 'f***er', 's***head', 'a$$', 'l0du', 'lund69', 'spic', 'chink',
    'cracker', 'towelhead', 'gook', 'kike', 'paki', 'honky', 'wetback', 'raghead', 'jungle bunny', 'sand nigger',
    'beaner', 'blowjob', 'handjob', 'cum', 'cumshot', 'jizz', 'deepthroat', 'fap', 'hentai', 'MILF', 'anal',
    'orgasm', 'dildo', 'vibrator', 'gangbang', 'threesome', 'porn', 'sex', 'xxx', 'fag', 'faggot', 'dyke',
    'tranny', 'homo', 'sissy', 'fairy', 'lesbo', 'weed', 'pot', 'coke', 'heroin', 'meth', 'crack', 'dope',
    'bong', 'kush', 'hash', 'trip', 'rolling'
];

// In-memory group config (replace with persistent storage if needed)
const antibadwordGroups = {};

// Monitor all group messages for bad words
cmd({
    on: "body"
}, async (conn, mek, m, { from, body, isGroup, isAdmins, isBotAdmins, reply, sender }) => {
    try {
        // Only process group messages and skip if no antibadword config exists
        if (!isGroup || !antibadwordGroups[from]) {
            return;
        }

        if (isAdmins || isBotAdmins) {
            console.log('[ANTIBADWORD] Sender or bot is admin, skipping.');
            return;
        }
        if (mek.key.fromMe) {
            console.log('[ANTIBADWORD] Message is from bot itself, skipping.');
            return;
        }
        if (!body) {
            console.log('[ANTIBADWORD] No message body, skipping.');
            return;
        }

        // Clean and check message
        const cleanBody = body.toLowerCase().replace(/[^a-z0-9 ]/gi, ' ');
        const containsBadWord = badWords.some(word => cleanBody.split(' ').includes(word) || cleanBody.includes(word));
        console.log(`[ANTIBADWORD] Message: '${body}' | Cleaned: '${cleanBody}' | Contains bad word: ${containsBadWord}`);
        if (containsBadWord) {
            // Delete the message (same as antilink.js)
            try {
                await conn.sendMessage(from, {
                    delete: {
                        remoteJid: from,
                        fromMe: false,
                        id: mek.key.id,
                        participant: sender
                    }
                });
                console.log(`[ANTIBADWORD] Deleted message from ${sender} in ${from}`);
            } catch (err) {
                console.error('[ANTIBADWORD] Error deleting message:', err);
            }
            // Send warning
            try {
                await conn.sendMessage(from, {
                    text: `🚫 *Anti-Badword Protection* 🚫\n\n@${sender.split('@')[0]}, your message contained a prohibited word and has been removed.`,
                    mentions: [sender]
                }, { quoted: mek });
                console.log(`[ANTIBADWORD] Warning sent to ${sender}`);
            } catch (err) {
                console.error('[ANTIBADWORD] Error sending warning:', err);
            }
        }
    } catch (error) {
        console.error("[ANTIBADWORD ERROR]", error);
    }
});

// Command to enable/disable antibadword for the group (admin only)
cmd({
    pattern: "antibadword",
    desc: "Toggle antibadword protection for the group",
    category: "admin",
    filename: "antibadword.js"
}, async (conn, mek, m, { from, isGroup, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups!");
        if (!isAdmins) return reply("❌ Only admins can use this command!");
        if (antibadwordGroups[from]) {
            delete antibadwordGroups[from];
            reply("🚫 *Anti-Badword Protection Disabled*\n\nBad word messages will no longer be deleted in this group.");
            console.log(`[ANTIBADWORD] Disabled for group: ${from}`);
        } else {
            antibadwordGroups[from] = true;
            reply("✅ *Anti-Badword Protection Enabled*\n\nMessages containing bad words will be automatically deleted in this group.");
            console.log(`[ANTIBADWORD] Enabled for group: ${from}`);
        }
    } catch (error) {
        console.error("[ANTIBADWORD COMMAND ERROR]", error);
        reply("❌ An error occurred while processing the command.");
    }
}); 