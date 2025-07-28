const { cmd } = require("../command");
const axios = require("axios");

let activeGroups = {};
let lastNewsTitles = {};

async function getLatestNews() {
  try {
    const { data } = await axios.get('https://arosh.vercel.app/news');
    if (data.title) {
      return {
        title: data.title,
        content: data.description,
        image: data.image,
        date: new Date().toLocaleDateString(),
        source: "ONYX News Service"
      };
    }
  } catch (error) {
    console.error("Error fetching news:", error.message);
  }
  
  // Fallback news if API fails
  return {
    title: "News Update",
    content: "Latest news from ONYX. For real-time updates, visit official news sources.",
    image: "https://via.placeholder.com/400x300/0066cc/ffffff?text=ONYX+News",
    date: new Date().toLocaleDateString(),
    source: "ONYX News Service"
  };
}

async function checkAndPostNews(bot, groupId) {
  const news = await getLatestNews();
  
  if (!lastNewsTitles[groupId]) {
    lastNewsTitles[groupId] = [];
  }

  if (!lastNewsTitles[groupId].includes(news.title)) {
    try {
      const newsText = `*NEWS UPDATE (ONYX) ✅*\n\n📰 *${news.title}*\n\n${news.content}\n\n> *BY AROSH SAMUDITHA*`;
      
      if (news.image) {
        await bot.sendMessage(groupId, {
          image: { url: news.image },
          caption: newsText
        });
      } else {
        await bot.sendMessage(groupId, { text: newsText });
      }

      lastNewsTitles[groupId].push(news.title);
      
      if (lastNewsTitles[groupId].length > 20) {
        lastNewsTitles[groupId].shift();
      }
    } catch (error) {
      console.error("Error sending news to group:", error.message);
    }
  }
}

cmd(
  {
    pattern: "news",
    desc: "Get the latest news",
    category: "news",
    filename: __filename,
  },
  async (robin, m, { from }) => {
    const chatId = from || m?.key?.remoteJid || "status@broadcast";
    try {
      const { data } = await axios.get('https://arosh.vercel.app/news');
      if (data.title) {
        const newsText = `*NEWS UPDATE (ONYX) ✅*\n\n📰 *${data.title}*\n\n${data.description}\n\n> *BY AROSH SAMUDITHA*`;
        if (data.image) {
          await robin.sendMessage(chatId, {
            image: { url: data.image },
            caption: newsText
          }, { quoted: m });
        } else {
          await robin.sendMessage(chatId, { text: newsText }, { quoted: m });
        }
      } else {
        await robin.sendMessage(chatId, { text: 'නවතම පුවත ලබාගැනීමට නොහැකි විය.' }, { quoted: m });
      }
    } catch (e) {
      await robin.sendMessage(chatId, { text: 'පුවත් ලබාගැනීමේදී දෝෂයක් ඇතිවිය.' }, { quoted: m });
    }
  }
);

cmd({
  pattern: 'newson',
  desc: "Enable 24/7 news updates in this group/channel",
  react: '📰',
  filename: __filename
}, async (bot, message, args, { from, isGroup, isChannel, participants }) => {
  // Check if it's a group or channel
  if (isGroup || isChannel) {
    let isAdmin = false;
    
    if (isGroup) {
      // For groups, check if user is admin
      isAdmin = participants.some(p => p.id === message.sender && p.admin) || message.sender === bot.user.jid;
    } else if (isChannel) {
      // For channels, check if user is admin or bot owner
      isAdmin = message.sender === bot.user.jid || message.sender === bot.user.id;
    }
    
    if (isAdmin) {
      if (!activeGroups[from]) {
        activeGroups[from] = true;
        const type = isChannel ? "channel" : "group";
        await bot.sendMessage(from, { 
          text: `📰 *24/7 News Service Activated!* 🎉\n\nNews updates will be posted every 30 seconds in this ${type}.\n\n*Service Features:*\n• Automatic news updates\n• Latest breaking news\n• ONYX News Service\n• By Arosh Samuditha` 
        });
        
        if (!activeGroups.interval) {
          activeGroups.interval = setInterval(async () => {
            for (const groupId in activeGroups) {
              if (activeGroups[groupId] && groupId !== 'interval') {
                await checkAndPostNews(bot, groupId);
              }
            }
          }, 30000); // Check every 30 seconds
        }
      } else {
        await bot.sendMessage(from, { text: "📰 *24/7 News service is already activated!*" });
      }
    } else {
      const type = isChannel ? "channel" : "group";
      await bot.sendMessage(from, { text: `🚫 *This command can only be used by ${type} admins or the bot owner.*` });
    }
  } else {
    await bot.sendMessage(from, { text: "❌ *This command can only be used in groups or channels.*" });
  }
});

cmd({
  pattern: "newsoff",
  desc: "Disable 24/7 news updates in this group/channel",
  react: '🛑',
  filename: __filename
}, async (bot, message, args, { from, isGroup, isChannel, participants }) => {
  // Check if it's a group or channel
  if (isGroup || isChannel) {
    let isAdmin = false;
    
    if (isGroup) {
      // For groups, check if user is admin
      isAdmin = participants.some(p => p.id === message.sender && p.admin) || message.sender === bot.user.jid;
    } else if (isChannel) {
      // For channels, check if user is admin or bot owner
      isAdmin = message.sender === bot.user.jid || message.sender === bot.user.id;
    }
    
    if (isAdmin) {
      if (activeGroups[from]) {
        delete activeGroups[from];
        const type = isChannel ? "channel" : "group";
        await bot.sendMessage(from, { text: `🛑 *24/7 News service deactivated in this ${type}.*` });

        if (Object.keys(activeGroups).length === 1 && activeGroups.interval) {
          clearInterval(activeGroups.interval);
          delete activeGroups.interval;
        }
      } else {
        await bot.sendMessage(from, { text: "🛑 *24/7 News service is not active in this group/channel.*" });
      }
    } else {
      const type = isChannel ? "channel" : "group";
      await bot.sendMessage(from, { text: `🚫 *This command can only be used by ${type} admins or the bot owner.*` });
    }
  } else {
    await bot.sendMessage(from, { text: "❌ *This command can only be used in groups or channels.*" });
  }
});

cmd({
  pattern: "newscheck",
  desc: "Check if the 24/7 news service is active in this group/channel",
  react: '🔍',
  filename: __filename
}, async (bot, message, args, { from, isGroup, isChannel }) => {
  if (isGroup || isChannel) {
    if (activeGroups[from]) {
      const type = isChannel ? "channel" : "group";
      await bot.sendMessage(from, { text: `📰 *The 24/7 news service is currently active in this ${type}.*` });
    } else {
      await bot.sendMessage(from, { text: "🛑 *The 24/7 news service is not active in this group/channel.*" });
    }
  } else {
    await bot.sendMessage(from, { text: "❌ *This command can only be used in groups or channels.*" });
  }
});
