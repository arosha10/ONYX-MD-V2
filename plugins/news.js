const axios = require("axios");
const fs = require("fs");
const path = require("path");

// List of WhatsApp group/channel IDs to broadcast news to
const GROUP_IDS = [
  "1203630xxxxxx@g.us", // Example group ID
  "1203630yyyyyy@g.us"  // Add your real group/channel IDs here
];

const LAST_NEWS_FILE = path.join(__dirname, '../data/lastnews.json');
let lastNewsId = null;

// Load last sent news ID from file (if exists)
try {
  if (fs.existsSync(LAST_NEWS_FILE)) {
    const file = fs.readFileSync(LAST_NEWS_FILE, 'utf8');
    const json = JSON.parse(file);
    lastNewsId = json.lastNewsId;
  }
} catch (e) {
  console.error('Failed to load last news ID:', e.message);
}

async function sendNewsToGroups(robin, news) {
  // Format date for better readability
  let formattedDate = 'ලබාගත නොහැක';
  if (news.date) {
    try {
      const d = new Date(news.date);
      if (!isNaN(d)) {
        formattedDate = d.toLocaleDateString('si-LK', { year: 'numeric', month: 'long', day: 'numeric' });
      }
    } catch {}
  }
  const linkText = news.link ? news.link : 'ලබාගත නොහැක';
  const newsText = `📰 *${news.title || 'No title'}*\n\n${news.description || ''}\n\nවැඩි විස්තර: ${linkText}\n🗓️ දිනය: ${formattedDate}`;
  for (const groupId of GROUP_IDS) {
    try {
      if (news.image) {
        await robin.sendMessage(groupId, {
          image: { url: news.image },
          caption: newsText
        });
      } else {
        await robin.sendMessage(groupId, {
          text: newsText
        });
      }
    } catch (e) {
      console.error(`Failed to send news to ${groupId}:`, e.message);
    }
  }
}

// This function will be called with the WhatsApp connection (robin) instance
async function startNewsPolling(robin) {
  setInterval(async () => {
    try {
      const { data } = await axios.get('https://arosh.vercel.app/news');
      if (data && data.title && data.title !== lastNewsId) {
        await sendNewsToGroups(robin, data);
        lastNewsId = data.title;
        fs.writeFileSync(LAST_NEWS_FILE, JSON.stringify({ lastNewsId }), 'utf8');
      }
    } catch (e) {
      console.error('Error fetching or sending news:', e.message);
    }
  }, 60 * 1000); // Poll every 60 seconds
}

// Export a function to be called from index.js after robin is ready
module.exports = startNewsPolling;
