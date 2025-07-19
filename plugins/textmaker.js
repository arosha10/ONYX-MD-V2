// TextMaker handler for ONYX MD Bot - generates styled text images
const axios = require('axios');
const mumaker = require('mumaker');

async function textmakerCommand(sock, m, q, type) {
    const from = m.key?.remoteJid || m.chat || m.from;
    console.log('textmakerCommand triggered', type, q);
    await sock.sendMessage(from, { text: '*🪄🖼 Making Your Text Image....*' });
    try {
        // Extract the actual text for the caption
        let text = '';
        if (m.quoted?.text) {
            text = m.quoted.text.trim();
        } else if (typeof q === 'string' && q.trim()) {
            text = q.trim();
        } else if (typeof m.body === 'string') {
            text = m.body.trim().split(' ').slice(1).join(' ');
        }
        if (!text) {
            return await sock.sendMessage(from, { text: "Please provide text to generate\nExample: .metallic Nick" });
        }
        try {
            let result;
            console.log('Calling mumaker.ephoto with type:', type, 'and text:', text);
            switch (type) {
                case 'metallic':
                    result = await mumaker.ephoto("https://en.ephoto360.com/impressive-decorative-3d-metal-text-effect-798.html", text);
                    break;
                case 'ice':
                    result = await mumaker.ephoto("https://en.ephoto360.com/ice-text-effect-online-101.html", text);
                    break;
                case 'snow':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-a-snow-3d-text-effect-free-online-621.html", text);
                    break;
                case 'impressive':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html", text);
                    break;
                case 'matrix':
                    result = await mumaker.ephoto("https://en.ephoto360.com/matrix-text-effect-154.html", text);
                    break;
                case 'light':
                    result = await mumaker.ephoto("https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html", text);
                    break;
                case 'neon':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html", text);
                    break;
                case 'devil':
                    result = await mumaker.ephoto("https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html", text);
                    break;
                case 'purple':
                    result = await mumaker.ephoto("https://en.ephoto360.com/purple-text-effect-online-100.html", text);
                    break;
                case 'thunder':
                    result = await mumaker.ephoto("https://en.ephoto360.com/thunder-text-effect-online-97.html", text);
                    break;
                case 'leaves':
                    result = await mumaker.ephoto("https://en.ephoto360.com/green-brush-text-effect-typography-maker-online-153.html", text);
                    break;
                case '1917':
                    result = await mumaker.ephoto("https://en.ephoto360.com/1917-style-text-effect-523.html", text);
                    break;
                case 'arena':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-cover-arena-of-valor-by-mastering-360.html", text);
                    break;
                case 'hacker':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html", text);
                    break;
                case 'sand':
                    result = await mumaker.ephoto("https://en.ephoto360.com/write-names-and-messages-on-the-sand-online-582.html", text);
                    break;
                case 'blackpink':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html", text);
                    break;
                case 'glitch':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html", text);
                    break;
                case 'fire':
                    result = await mumaker.ephoto("https://en.ephoto360.com/flame-lettering-effect-372.html", text);
                    break;
                // New effects
                case 'sketch':
                    result = await mumaker.ephoto("https://en.ephoto360.com/pencil-sketch-text-effect-online-104.html", text);
                    break;
                case 'gold':
                    result = await mumaker.ephoto("https://en.ephoto360.com/gold-text-effect-877.html", text);
                    break;
                case 'cartoon':
                    result = await mumaker.ephoto("https://en.ephoto360.com/cartoon-style-text-effect-923.html", text);
                    break;
                case 'watercolor':
                    result = await mumaker.ephoto("https://en.ephoto360.com/watercolor-text-effect-online-101.html", text);
                    break;
                case 'gradient':
                    result = await mumaker.ephoto("https://en.ephoto360.com/gradient-text-effect-online-100.html", text);
                    break;
                case 'glossy':
                    result = await mumaker.ephoto("https://en.ephoto360.com/glossy-text-effect-online-102.html", text);
                    break;
                case 'shadow':
                    result = await mumaker.ephoto("https://en.ephoto360.com/shadow-text-effect-online-103.html", text);
                    break;
                case '3d':
                    result = await mumaker.ephoto("https://en.ephoto360.com/3d-text-effect-online-105.html", text);
                    break;
                case 'chrome':
                    result = await mumaker.ephoto("https://en.ephoto360.com/chrome-text-effect-online-106.html", text);
                    break;
                case 'graffiti':
                    result = await mumaker.ephoto("https://en.ephoto360.com/graffiti-text-effect-online-107.html", text);
                    break;
                case 'glow':
                    result = await mumaker.ephoto("https://en.ephoto360.com/neon-glow-text-effect-online-879.html", text);
                    break;
                case 'berry':
                    result = await mumaker.ephoto("https://en.ephoto360.com/berry-text-effect-online-1002.html", text);
                    break;
                case 'luxury':
                    result = await mumaker.ephoto("https://en.ephoto360.com/luxury-gold-text-effect-1012.html", text);
                    break;
                case 'comic':
                    result = await mumaker.ephoto("https://en.ephoto360.com/comic-text-effect-online-1042.html", text);
                    break;
                case 'space':
                    result = await mumaker.ephoto("https://en.ephoto360.com/space-3d-text-effect-online-1052.html", text);
                    break;
                case 'halloween':
                    result = await mumaker.ephoto("https://en.ephoto360.com/halloween-text-effect-online-1062.html", text);
                    break;
                case 'summer':
                    result = await mumaker.ephoto("https://en.ephoto360.com/summer-text-effect-online-1072.html", text);
                    break;
                case 'rainbow':
                    result = await mumaker.ephoto("https://en.ephoto360.com/rainbow-text-effect-online-1082.html", text);
                    break;
                case 'wood':
                    result = await mumaker.ephoto("https://en.ephoto360.com/wood-text-effect-online-1092.html", text);
                    break;
                case 'silver':
                    result = await mumaker.ephoto("https://en.ephoto360.com/silver-text-effect-online-1102.html", text);
                    break;
                default:
                    return await sock.sendMessage(from, { text: "Invalid text generator type" });
            }
            console.log('mumaker.ephoto result:', result);
            if (!result || !result.image) {
                throw new Error('No image URL received from the API');
            }
            console.log('Image URL:', result.image);
            if (!/^https?:\/\//.test(result.image)) {
                await sock.sendMessage(from, { text: 'Error: Invalid image URL returned by API.' });
                return;
            }
            await sock.sendMessage(from, { image: { url: result.image }, caption: `${text}\n*GENERATED BY 🌀ONYX MD🔥*` });
        } catch (error) {
            console.error('Error in text generator:', error);
            await sock.sendMessage(from, { text: `Error: ${error.message}` });
        }
    } catch (error) {
        console.error('Error in textmaker command:', error);
        await sock.sendMessage(from, { text: "An error occurred. Please try again later." });
    }
}

// Register all textmaker commands
const { cmd } = require("../command");

const textmakerReaction = "🪄";

cmd({ pattern: "ice", desc: "Ice text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "ice"));
cmd({ pattern: "snow", desc: "Snow text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "snow"));
cmd({ pattern: "metallic", desc: "Metallic text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "metallic"));
cmd({ pattern: "impressive", desc: "Impressive paint text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "impressive"));
cmd({ pattern: "matrix", desc: "Matrix text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "matrix"));
cmd({ pattern: "light", desc: "Light text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "light"));
cmd({ pattern: "neon", desc: "Neon text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "neon"));
cmd({ pattern: "devil", desc: "Devil wings neon text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "devil"));
cmd({ pattern: "purple", desc: "Purple text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "purple"));
cmd({ pattern: "thunder", desc: "Thunder text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "thunder"));
cmd({ pattern: "leaves", desc: "Leaves brush text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "leaves"));
cmd({ pattern: "1917", desc: "1917 style text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "1917"));
cmd({ pattern: "arena", desc: "Arena of Valor cover text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "arena"));
cmd({ pattern: "hacker", desc: "Hacker avatar text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "hacker"));
cmd({ pattern: "sand", desc: "Sand text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "sand"));
cmd({ pattern: "blackpink", desc: "Blackpink logo text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "blackpink"));
cmd({ pattern: "glitch", desc: "Glitch text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "glitch"));
cmd({ pattern: "fire", desc: "Fire text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "fire"));
// New: Pencil Sketch text effect
cmd({ pattern: "sketch", desc: "Pencil Sketch text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "sketch"));
//cmd({ pattern: "gold", desc: "Gold text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "gold"));
//cmd({ pattern: "cartoon", desc: "Cartoon text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "cartoon"));
cmd({ pattern: "watercolor", desc: "Watercolor text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "watercolor"));
//cmd({ pattern: "gradient", desc: "Gradient text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "gradient"));
cmd({ pattern: "glossy", desc: "Glossy text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "glossy"));
cmd({ pattern: "shadow", desc: "Shadow text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "shadow"));
cmd({ pattern: "3d", desc: "3D text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "3d"));
cmd({ pattern: "chrome", desc: "Chrome text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "chrome"));
cmd({ pattern: "graffiti", desc: "Graffiti text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "graffiti"));
//cmd({ pattern: "glow", desc: "Glow text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "glow"));
//cmd({ pattern: "berry", desc: "Berry text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "berry"));
//cmd({ pattern: "luxury", desc: "Luxury gold text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "luxury"));
//cmd({ pattern: "comic", desc: "Comic text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "comic"));
//cmd({ pattern: "space", desc: "Space 3D text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "space"));
//cmd({ pattern: "halloween", desc: "Halloween text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "halloween"));
//cmd({ pattern: "summer", desc: "Summer text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "summer"));
//cmd({ pattern: "rainbow", desc: "Rainbow text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "rainbow"));
//cmd({ pattern: "wood", desc: "Wood text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "wood"));
//cmd({ pattern: "silver", desc: "Silver text effect", category: "textmaker", filename: __filename, react: textmakerReaction }, (sock, m, q) => textmakerCommand(sock, m, q, "silver")); 