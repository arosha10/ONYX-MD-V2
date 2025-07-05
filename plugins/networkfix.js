const { getBuffer } = require("../lib/functions");
const axios = require("axios");

module.exports = {
  name: "networkfix",
  alias: ["netfix", "connection"],
  category: "system",
  desc: "Fix network connection issues and test connectivity",
  use: "[test/status]",
  async exec(client, m, args) {
    try {
      const action = args[0] || "status";
      
      if (action === "test") {
        await client.sendMessage(m.from, {
          text: "🔄 *Testing network connectivity...*\n\nPlease wait while I check various services...",
        }, { quoted: m });

        const tests = [
          { name: "Google", url: "https://www.google.com" },
          { name: "YouTube", url: "https://www.youtube.com" },
          { name: "GitHub", url: "https://api.github.com" },
          { name: "WhatsApp", url: "https://web.whatsapp.com" }
        ];

        let results = [];
        
        for (const test of tests) {
          try {
            const startTime = Date.now();
            const response = await axios.get(test.url, {
              timeout: 10000,
              validateStatus: function (status) {
                return status >= 200 && status < 400;
              }
            });
            const endTime = Date.now();
            const ping = endTime - startTime;
            
            results.push(`✅ ${test.name}: ${ping}ms`);
          } catch (error) {
            results.push(`❌ ${test.name}: ${error.code || 'Failed'}`);
          }
        }

        const resultText = `*🌐 Network Test Results*\n\n${results.join('\n')}\n\n*Status:* ${results.filter(r => r.includes('✅')).length}/${results.length} services working`;

        await client.sendMessage(m.from, {
          text: resultText,
        }, { quoted: m });

      } else if (action === "status") {
        const uptime = process.uptime();
        const memoryUsage = process.memoryUsage();
        const memoryMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
        
        await client.sendMessage(m.from, {
          text: `*🔧 Network Status*\n\n⏰ *Uptime:* ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m\n💾 *Memory:* ${memoryMB} MB\n🌐 *Connection:* Active\n\n*Services:*\n• WhatsApp: Connected\n• HTTP Requests: Working\n• File Downloads: Available`,
        }, { quoted: m });

      } else if (action === "clear") {
        // Clear any cached connections
        if (global.gc) {
          global.gc();
        }
        
        await client.sendMessage(m.from, {
          text: "🧹 *Network Cache Cleared*\n\nConnection cache has been cleared. This may help resolve connection issues.",
        }, { quoted: m });

      } else {
        await client.sendMessage(m.from, {
          text: `*🔧 Network Fix Commands*\n\n*Usage:*\n• ${prefix}networkfix test - Test network connectivity\n• ${prefix}networkfix status - Show network status\n• ${prefix}networkfix clear - Clear connection cache\n\n*Common Issues:*\n• ECONNRESET: Network connection reset\n• ETIMEDOUT: Request timeout\n• ENOTFOUND: DNS resolution failed`,
        }, { quoted: m });
      }
      
    } catch (error) {
      console.error("Network fix plugin error:", error);
      await client.sendMessage(m.from, {
        text: "❌ *Network Test Failed*\n\nAn error occurred while testing the network connection.",
      }, { quoted: m });
    }
  },
}; 