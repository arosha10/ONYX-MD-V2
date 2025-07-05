const { cmd } = require("../command");
const gtts = require("gtts");
const fs = require("fs");
const path = require("path");

cmd(
  {
    pattern: "tts",
    alias: ["texttospeech"],
    desc: "Convert text to voice using Google TTS",
    category: "tools",
    react: "🗣️",
    filename: __filename,
  },
  async (robin, mek, m, { reply, q }) => {
    if (!q) return reply("❌ Please provide text to convert.\n\nExample: `.tts Hello, world!`");
    if (q.length > 200) return reply("❌ Text too long. Please keep it under 200 characters.");

    try {
      const tts = new gtts(q, "en");

      // Ensure temp/ directory exists
      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

      const filePath = path.join(tempDir, `tts_${Date.now()}.mp3`);

      tts.save(filePath, async (err) => {
        if (err) {
          console.error("TTS error:", err);
          return reply("❌ Failed to convert text to speech.");
        }

        const audioBuffer = fs.readFileSync(filePath);
        await robin.sendMessage(mek.key.remoteJid, {
          audio: audioBuffer,
          mimetype: "audio/mp4",
          ptt: true, // send as voice note
        }, { quoted: mek });

        fs.unlinkSync(filePath); // delete temp file
      });
    } catch (err) {
      console.error("TTS plugin error:", err);
      reply("❌ An unexpected error occurred.");
    }
  }
);
