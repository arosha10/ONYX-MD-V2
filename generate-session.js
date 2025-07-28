const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const P = require("pino");
const qrcode = require("qrcode-terminal");

async function generateSession() {
  console.log("🔄 Generating new WhatsApp session...");
  
  // Ensure auth directory exists
  if (!fs.existsSync("./auth_info_baileys/")) {
    fs.mkdirSync("./auth_info_baileys/", { recursive: true });
  }
  
  try {
    const { state, saveCreds } = await useMultiFileAuthState("./auth_info_baileys/");
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
      logger: P({ level: "silent" }),
      browser: Browsers.macOS("Firefox"),
      auth: state,
      version,
    });
    
    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        console.log("\n📱 Scan this QR code with your WhatsApp:");
        qrcode.generate(qr, { small: true });
      }
      
      if (connection === "close") {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log("Connection closed due to ", lastDisconnect?.error, ", reconnecting ", shouldReconnect);
        
        if (shouldReconnect) {
          generateSession();
        }
      } else if (connection === "open") {
        console.log("✅ WhatsApp session generated successfully!");
        console.log("📁 Session files saved in ./auth_info_baileys/");
        console.log("🔄 You can now restart your bot with: npm start");
        process.exit(0);
      }
    });
    
    sock.ev.on("creds.update", saveCreds);
    
  } catch (error) {
    console.error("❌ Error generating session:", error);
    process.exit(1);
  }
}

// Run the session generator
generateSession(); 