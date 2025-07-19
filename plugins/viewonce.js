// ViewOnce handler for ONYX MD Bot - allows saving view-once images/videos
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

// Channel info for message context
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363161513685998@newsletter',
            newsletterName: 'KnightBot MD',
            serverMessageId: -1
        }
    }
};

async function viewOnceCommand(sock, m) {
    const from = m.key?.remoteJid || m.chat || m.from;
    try {
        // Get quoted message with better error handling
        const quotedMessage = m.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
                            m.message?.imageMessage ||
                            m.message?.videoMessage;

        if (!quotedMessage) {
            await sock.sendMessage(from, { 
                text: '❌ Please reply to a view once message!'
            });
            return;
        }

        // Enhanced view once detection
        const isViewOnceImage = quotedMessage.imageMessage?.viewOnce === true || 
                              quotedMessage.viewOnceMessage?.message?.imageMessage ||
                              m.message?.viewOnceMessage?.message?.imageMessage;
                              
        const isViewOnceVideo = quotedMessage.videoMessage?.viewOnce === true || 
                              quotedMessage.viewOnceMessage?.message?.videoMessage ||
                              m.message?.viewOnceMessage?.message?.videoMessage;

        // Get the actual message content
        let mediaMessage;
        if (isViewOnceImage) {
            mediaMessage = quotedMessage.imageMessage || 
                         quotedMessage.viewOnceMessage?.message?.imageMessage ||
                         m.message?.viewOnceMessage?.message?.imageMessage;
        } else if (isViewOnceVideo) {
            mediaMessage = quotedMessage.videoMessage || 
                         quotedMessage.viewOnceMessage?.message?.videoMessage ||
                         m.message?.viewOnceMessage?.message?.videoMessage;
        }

        if (!mediaMessage) {
            console.log('Message structure:', JSON.stringify(m, null, 2));
            await sock.sendMessage(from, { 
                text: '> *එක් වරක් බැලීමේ පණිවිඩය හඳුනාගත නොහැකි විය! කරුණාකර ඔබ එක් වරක් බැලීමේ රූපයකට/වීඩියෝවකට පිළිතුරු දුන් බවට වග බලා ගන්න.*'
            });
            return;
        }

        // Handle view once image
        if (isViewOnceImage) {
            try {
                console.log('📸 Processing view once image...');
                const stream = await downloadContentFromMessage(mediaMessage, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                const caption = mediaMessage.caption || '';
                
                console.log('Sending to:', from);
                await sock.sendMessage(from, { 
                    image: buffer
                });
                console.log('✅ View once image processed successfully');
                return;
            } catch (err) {
                console.error('❌ Error downloading image:', err);
                await sock.sendMessage(from, { 
                    text: '❌ Failed to process view once image! Error: ' + err.message
                });
                return;
            }
        }

        // Handle view once video
        if (isViewOnceVideo) {
            try {
                console.log('📹 Processing view once video...');
                
                // Create temp directory if it doesn't exist
                const tempDir = path.join(__dirname, '../temp');
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir);
                }

                const tempFile = path.join(tempDir, `temp_${Date.now()}.mp4`);
                const stream = await downloadContentFromMessage(mediaMessage, 'video');
                const writeStream = fs.createWriteStream(tempFile);
                
                for await (const chunk of stream) {
                    writeStream.write(chunk);
                }
                writeStream.end();

                // Wait for file to be written
                await new Promise((resolve) => writeStream.on('finish', resolve));

                const caption = mediaMessage.caption || '';

                await sock.sendMessage(from, { 
                    video: fs.readFileSync(tempFile),
                    caption: `*ONYX MD ONE VIEWS 👁️*\n*Type:* Video 📹\n${caption ? `*Caption:* ${caption}` : ''}`
                });

                // Clean up temp file
                fs.unlinkSync(tempFile);
                
                console.log('✅ View once video processed successfully');
                return;
            } catch (err) {
                console.error('❌ Error processing video:', err);
                await sock.sendMessage(from, { 
                    text: '❌ Failed to process view once video! Error: ' + err.message
                });
                return;
            }
        }

        // If we get here, it wasn't a view once message
        await sock.sendMessage(from, { 
            text: '❌ This is not a view once message! Please reply to a view once image/video.'
        });

    } catch (error) {
        console.error('❌ Error in viewonce command:', error);
        await sock.sendMessage(from, { 
            text: '❌ Error processing view once message! Error: ' + error.message
        });
    }
}

// Register the command for the bot
const { cmd } = require("../command");
cmd({
    pattern: "viewonce",
    alias: ["vv", "vo", "antivo", "anti-viewonce"],
    react: "👁️",
    desc: "View and save view-once images/videos",
    category: "utility",
    filename: __filename,
}, viewOnceCommand);
