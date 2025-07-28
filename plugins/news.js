/**
 * 📰 ONYX MD News Plugin
 * 
 * A comprehensive news aggregation system that fetches and delivers the latest news 
 * from multiple Sri Lankan news sources. Provides both on-demand news retrieval 
 * and automated 24/7 news updates for WhatsApp groups and channels.
 * 
 * 🎯 Features:
 * - Fetches news from 4 major sources simultaneously
 * - 24/7 automated news updates every 30 seconds
 * - Prevents duplicate news posts
 * - Supports both groups and channels
 * - Includes direct links to original articles
 * - Graceful error handling and fallbacks
 * 
 * 📰 News Sources:
 * 1. ONYX News Service - https://arosh.vercel.app/news
 * 2. Neth News - https://arosh.vercel.app/neth-news/latest
 * 3. Lankadeepa - https://arosh.vercel.app/lankadeepa-news/latest
 * 4. News First Sinhala - https://arosh.vercel.app/newsfirst-sinhala/latest
 * 
 * 🎮 Commands:
 * - .news - Get latest news from all sources
 * - .newson - Enable 24/7 news updates
 * - .newsoff - Disable 24/7 news updates
 * - .newscheck - Check service status
 * 
 * 👨‍💻 Developer: Arosh Samuditha
 * 🤖 Bot: ONYX MD
 * 
 * 📊 Message Format:
 * Each news post includes title, content, date, source, and direct link to original article
 * with consistent ONYX MD branding and developer attribution.
 */

const { cmd } = require("../command");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const config = require("../config");

// Store active groups and their last news titles to prevent duplicates
let activeGroups = {};
let lastNewsTitles = {};

// Path to the auto news configuration file
const autoNewsConfigPath = path.join(__dirname, "../data/autonews.json");

/**
 * Loads the automatic news configuration from the JSON file
 */
function loadAutoNewsConfig() {
  try {
    if (fs.existsSync(autoNewsConfigPath)) {
      const data = fs.readFileSync(autoNewsConfigPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading auto news config:", error.message);
  }
  return {
    enabled: false,
    groups: [],
    interval: 30000,
    lastUpdate: null,
    settings: {
      autoStart: false,
      preventDuplicates: true,
      maxNewsPerUpdate: 5
    }
  };
}

/**
 * Saves the automatic news configuration to the JSON file
 */
function saveAutoNewsConfig(config) {
  try {
    fs.writeFileSync(autoNewsConfigPath, JSON.stringify(config, null, 2), 'utf8');
  } catch (error) {
    console.error("Error saving auto news config:", error.message);
  }
}

/**
 * Initializes automatic news updates based on configuration
 */
function initializeAutoNews(bot) {
  const autoConfig = loadAutoNewsConfig();
  
  // Check if auto news is enabled via environment variable
  const envAutoNewsEnabled = config.AUTO_NEWS_ENABLED === "true";
  const envAutoNewsGroups = config.AUTO_NEWS_GROUPS ? config.AUTO_NEWS_GROUPS.split(',').map(g => g.trim()) : [];
  
  if (envAutoNewsEnabled && envAutoNewsGroups.length > 0) {
    console.log("[AUTO NEWS] Environment-based auto news enabled");
    autoConfig.enabled = true;
    autoConfig.groups = envAutoNewsGroups;
    autoConfig.settings.autoStart = true;
    saveAutoNewsConfig(autoConfig);
  }
  
  if (autoConfig.enabled && autoConfig.settings.autoStart && autoConfig.groups.length > 0) {
    console.log(`[AUTO NEWS] Starting automatic news updates for ${autoConfig.groups.length} groups`);
    
    // Add groups to active groups
    autoConfig.groups.forEach(groupId => {
      activeGroups[groupId] = true;
    });
    
    // Start the interval if not already running
    if (!activeGroups.interval) {
      const interval = parseInt(autoConfig.interval) || 30000;
      activeGroups.interval = setInterval(async () => {
        for (const groupId in activeGroups) {
          if (activeGroups[groupId] && groupId !== 'interval') {
            await checkAndPostNews(bot, groupId);
          }
        }
      }, interval);
      
      console.log(`[AUTO NEWS] News update interval started (${interval}ms)`);
    }
  }
}

/**
 * Fetches the latest news from all 4 integrated news sources simultaneously.
 * Uses Promise.allSettled() to handle API failures gracefully without stopping other requests.
 * 
 * @returns {Array} Array of news objects with title, content, image, date, source, and URL
 */
async function getLatestNews() {
  try {
    // Fetch from all 4 news APIs in parallel for better performance
    const [onyxNews, nethNews, lankadeepaNews, newsFirstNews] = await Promise.allSettled([
      axios.get('https://arosh.vercel.app/news'),
      axios.get('https://arosh.vercel.app/neth-news/latest'),
      axios.get('https://arosh.vercel.app/lankadeepa-news/latest'),
      axios.get('https://arosh.vercel.app/newsfirst-sinhala/latest')
    ]);

    const newsItems = [];

    // Process ONYX News Service API response
    if (onyxNews.status === 'fulfilled' && onyxNews.value.data && onyxNews.value.data.title) {
      newsItems.push({
        title: onyxNews.value.data.title,
        content: onyxNews.value.data.description || onyxNews.value.data.content,
        image: onyxNews.value.data.image,
        date: onyxNews.value.data.date || new Date().toLocaleDateString(),
        source: "ONYX News Service",
        url: onyxNews.value.data.url || "https://arosh.vercel.app/"
      });
    }

    // Process Neth News API response
    if (nethNews.status === 'fulfilled' && nethNews.value.data && nethNews.value.data.title) {
      newsItems.push({
        title: nethNews.value.data.title,
        content: nethNews.value.data.description,
        image: nethNews.value.data.imageUrl,
        date: nethNews.value.data.publishDate || new Date().toLocaleDateString(),
        source: "Neth News",
        url: nethNews.value.data.url || "https://www.nethnews.lk/"
      });
    }

    // Process Lankadeepa News API response
    if (lankadeepaNews.status === 'fulfilled' && lankadeepaNews.value.data && lankadeepaNews.value.data.title) {
      newsItems.push({
        title: lankadeepaNews.value.data.title,
        content: lankadeepaNews.value.data.description,
        image: lankadeepaNews.value.data.imageUrl,
        date: lankadeepaNews.value.data.publishDate || new Date().toLocaleDateString(),
        source: "Lankadeepa",
        url: lankadeepaNews.value.data.url || "https://www.lankadeepa.lk/"
      });
    }

    // Process News First Sinhala API response
    if (newsFirstNews.status === 'fulfilled' && newsFirstNews.value.data && newsFirstNews.value.data.title) {
      newsItems.push({
        title: newsFirstNews.value.data.title,
        content: newsFirstNews.value.data.description,
        image: newsFirstNews.value.data.imageUrl,
        date: newsFirstNews.value.data.publishDate || new Date().toLocaleDateString(),
        source: "News First Sinhala",
        url: newsFirstNews.value.data.url || "https://sinhala.newsfirst.lk/"
      });
    }

    // Return all news items
    if (newsItems.length > 0) {
      return newsItems;
    }

  } catch (error) {
    console.error("Error fetching news:", error.message);
  }
  
  // Fallback news if all APIs fail
  return [{
    title: "News Update",
    content: "Latest news from ONYX. For real-time updates, visit official news sources.",
    image: "https://via.placeholder.com/400x300/0066cc/ffffff?text=ONYX+News",
    date: new Date().toLocaleDateString(),
    source: "ONYX News Service",
    url: "https://arosh.vercel.app/"
  }];
}

/**
 * Checks for new news and posts them to the specified group/channel.
 * Prevents duplicate posts by tracking previously sent news titles.
 * 
 * @param {Object} bot - The bot instance for sending messages
 * @param {string} groupId - The group/channel ID to post news to
 */
async function checkAndPostNews(bot, groupId) {
  const newsItems = await getLatestNews();
  
  // Initialize title tracking array for this group if it doesn't exist
  if (!lastNewsTitles[groupId]) {
    lastNewsTitles[groupId] = [];
  }

  for (const news of newsItems) {
    if (!lastNewsTitles[groupId].includes(news.title)) {
      try {
        const newsText = `*NEWS UPDATE (${news.source})*\n\n📰 *${news.title}*\n\n${news.content}\n\n📅 *Date:* ${news.date}\n📰 *Source:* ${news.source}\n🔗 *Read More:* ${news.url}\n\n> *ONYX MD BY AROSH SAMUDITHA*`;
        
        if (news.image) {
          await bot.sendMessage(groupId, {
            image: { url: news.image },
            caption: newsText
          });
        } else {
          await bot.sendMessage(groupId, { text: newsText });
        }

        lastNewsTitles[groupId].push(news.title);
        
        if (lastNewsTitles[groupId].length > 50) {
          lastNewsTitles[groupId].shift();
        }

        // Add delay between news posts to avoid spam
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error("Error sending news to group:", error.message);
      }
    }
  }
}

/**
 * .news Command
 * 
 * Fetches and displays the latest news from all 4 integrated news sources.
 * Sends each news item separately with complete details including images,
 * publication dates, source attribution, and direct links to original articles.
 * 
 * Features:
 * - Parallel API fetching for faster response
 * - Individual news posts for each source
 * - Image support with fallback to text-only
 * - Summary message with source count
 * - Comprehensive error handling
 */
cmd(
  {
    pattern: "news",
    desc: "Get the latest news from all sources",
    category: "news",
    filename: __filename,
  },
  async (arosh, m, { from, isGroup, isChannel }) => {
    const chatId = from || m?.key?.remoteJid || "status@broadcast";
    
    // Fallback channel detection if isChannel is undefined
    const isChannelDetected = isChannel !== undefined ? isChannel : (chatId.endsWith("@broadcast") || chatId.endsWith("@newsletter"));
    
    // Debug logging
    console.log(`[NEWS COMMAND] Chat ID: ${chatId}, isGroup: ${isGroup}, isChannel: ${isChannel}, isChannelDetected: ${isChannelDetected}`);
    
    try {
      // Send initial message
      await arosh.sendMessage(chatId, { 
        text: `📰 *Fetching Latest News... (ONYX MD)*\n\n⏳ Please wait while I gather news from all sources...\n\n> *By Arosh Samuditha*` 
      }, { quoted: m });

      const newsItems = await getLatestNews();
      
      if (newsItems && newsItems.length > 0) {
        // Send each news item
        for (const news of newsItems) {
          const newsText = `*NEWS UPDATE (${news.source})*\n\n📰 *${news.title}*\n\n${news.content}\n\n📅 *Date:* ${news.date}\n📰 *Source:* ${news.source}\n🔗 *Read More:* ${news.url}\n\n> *ONYX MD BY AROSH SAMUDITHA*`;
          
          if (news.image) {
            try {
              await arosh.sendMessage(chatId, {
                image: { url: news.image },
                caption: newsText
              }, { quoted: m });
            } catch (imageError) {
              console.log(`[NEWS COMMAND] Failed to send image, sending text only:`, imageError.message);
              await arosh.sendMessage(chatId, { text: newsText }, { quoted: m });
            }
          } else {
            await arosh.sendMessage(chatId, { text: newsText }, { quoted: m });
          }

          // Add delay between news posts
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Send summary message
        const summaryText = `📊 *News Summary (ONYX MD)*\n\n✅ *Total News Sources:* ${newsItems.length}\n📰 *Sources:* ${newsItems.map(item => item.source).join(', ')}\n\n🔄 *Use .newson to enable 24/7 news updates*\n\n> *By Arosh Samuditha*`;
        await arosh.sendMessage(chatId, { text: summaryText }, { quoted: m });

      } else {
        await arosh.sendMessage(chatId, { text: '❌ *No news available at the moment (ONYX MD)*\n\nPlease try again later.\n\n> *By Arosh Samuditha*' }, { quoted: m });
      }
    } catch (e) {
      console.error('[NEWS COMMAND ERROR]:', e.message);
      await arosh.sendMessage(chatId, { text: '❌ *Error fetching news (ONYX MD)*\n\nPlease try again later.\n\n> *By Arosh Samuditha*' }, { quoted: m });
    }
  }
);

/**
 * .newson Command
 * 
 * Enables 24/7 automated news updates for the current group or channel.
 * Posts news from all 4 sources every 30 seconds automatically.
 * 
 * Features:
 * - Admin permission validation for groups
 * - Channel support with permission handling
 * - Prevents duplicate news posts
 * - Automatic interval management
 * - Graceful error handling
 * 
 * Permission Requirements:
 * - Groups: User must be admin or bot owner
 * - Channels: Bot must have admin permissions
 */
cmd({
  pattern: 'newson',
  desc: "Enable 24/7 news updates in this group/channel",
  react: '📰',
  filename: __filename
}, async (arosh, message, args, { from, isGroup, isChannel, participants, sender, isOwner }) => {
  // Fallback channel detection if isChannel is undefined
  const isChannelDetected = isChannel !== undefined ? isChannel : (from.endsWith("@broadcast") || from.endsWith("@newsletter"));
  
  // Check if it's a group or channel
  if (isGroup || isChannelDetected) {
    let isAdmin = false;
    
    if (isGroup) {
      // For groups, check if user is admin
      isAdmin = participants.some(p => p.id === sender && p.admin) || sender === arosh.user.jid || isOwner;
    } else if (isChannelDetected) {
      // For channels, allow the command if the bot is an admin
      // Since sender is the channel ID in channels, we check if bot can send messages
      isAdmin = true; // Allow in channels by default, bot will fail if not admin
    }
    
    if (isAdmin) {
      if (!activeGroups[from]) {
        activeGroups[from] = true;
        const type = isChannelDetected ? "channel" : "group";
        await arosh.sendMessage(from, { 
          text: `📰 *24/7 News Service Activated! (ONYX MD)* 🎉\n\nNews updates will be posted every 30 seconds in this ${type}.\n\n*Service Features:*\n• Automatic news updates from 4 sources\n• Latest breaking news\n• ONYX News Service\n• Neth News\n• Lankadeepa\n• News First Sinhala\n\n> *By Arosh Samuditha*` 
        });
        
        if (!activeGroups.interval) {
          activeGroups.interval = setInterval(async () => {
            for (const groupId in activeGroups) {
              if (activeGroups[groupId] && groupId !== 'interval') {
                await checkAndPostNews(arosh, groupId);
              }
            }
          }, 30000); // Check every 30 seconds
        }
      } else {
        await arosh.sendMessage(from, { text: "📰 *24/7 News service is already activated! (ONYX MD)*\n\n> *By Arosh Samuditha*" });
      }
    } else {
      const type = isChannelDetected ? "channel" : "group";
      await arosh.sendMessage(from, { text: `🚫 *This command can only be used by ${type} admins or the bot owner. (ONYX MD)*\n\n> *By Arosh Samuditha*` });
    }
  } else {
    await arosh.sendMessage(from, { text: "❌ *This command can only be used in groups or channels. (ONYX MD)*\n\n> *By Arosh Samuditha*" });
  }
});

/**
 * .newsoff Command
 * 
 * Disables 24/7 automated news updates for the current group or channel.
 * Removes the group/channel from the active list and cleans up resources.
 * 
 * Features:
 * - Admin permission validation
 * - Automatic interval cleanup if no active groups remain
 * - Channel support with permission handling
 * - Resource management
 */
cmd({
  pattern: "newsoff",
  desc: "Disable 24/7 news updates in this group/channel",
  react: '🛑',
  filename: __filename
}, async (arosh, message, args, { from, isGroup, isChannel, participants, sender, isOwner }) => {
  // Fallback channel detection if isChannel is undefined
  const isChannelDetected = isChannel !== undefined ? isChannel : (from.endsWith("@broadcast") || from.endsWith("@newsletter"));
  
  // Check if it's a group or channel
  if (isGroup || isChannelDetected) {
    let isAdmin = false;
    
    if (isGroup) {
      // For groups, check if user is admin
      isAdmin = participants.some(p => p.id === sender && p.admin) || sender === arosh.user.jid || isOwner;
    } else if (isChannelDetected) {
      // For channels, allow the command if the bot is an admin
      isAdmin = true; // Allow in channels by default, bot will fail if not admin
    }
    
    if (isAdmin) {
      if (activeGroups[from]) {
        delete activeGroups[from];
        const type = isChannelDetected ? "channel" : "group";
        await arosh.sendMessage(from, { text: `🛑 *24/7 News service deactivated in this ${type}. (ONYX MD)*\n\n> *By Arosh Samuditha*` });

        if (Object.keys(activeGroups).length === 1 && activeGroups.interval) {
          clearInterval(activeGroups.interval);
          delete activeGroups.interval;
        }
      } else {
        await arosh.sendMessage(from, { text: "🛑 *24/7 News service is not active in this group/channel. (ONYX MD)*\n\n> *By Arosh Samuditha*" });
      }
    } else {
      const type = isChannelDetected ? "channel" : "group";
      await arosh.sendMessage(from, { text: `🚫 *This command can only be used by ${type} admins or the bot owner. (ONYX MD)*\n\n> *By Arosh Samuditha*` });
    }
  } else {
    await arosh.sendMessage(from, { text: "❌ *This command can only be used in groups or channels. (ONYX MD)*\n\n> *By Arosh Samuditha*" });
  }
});

/**
 * .newscheck Command
 * 
 * Checks the current status of the 24/7 news service for the group or channel.
 * Provides quick feedback on whether automated news updates are active.
 * 
 * Features:
 * - Quick status check
 * - Works in both groups and channels
 * - Clear status messaging
 * - Channel detection support
 */
cmd({
  pattern: "newscheck",
  desc: "Check if the 24/7 news service is active in this group/channel",
  react: '🔍',
  filename: __filename
}, async (arosh, message, args, { from, isGroup, isChannel }) => {
  // Fallback channel detection if isChannel is undefined
  const isChannelDetected = isChannel !== undefined ? isChannel : (from.endsWith("@broadcast") || from.endsWith("@newsletter"));
  
  if (isGroup || isChannelDetected) {
    if (activeGroups[from]) {
      const type = isChannelDetected ? "channel" : "group";
      await arosh.sendMessage(from, { text: `📰 *The 24/7 news service is currently active in this ${type}. (ONYX MD)*\n\n> *By Arosh Samuditha*` });
    } else {
      await arosh.sendMessage(from, { text: "🛑 *The 24/7 news service is not active in this group/channel. (ONYX MD)*\n\n> *By Arosh Samuditha*" });
    }
  } else {
    await arosh.sendMessage(from, { text: "❌ *This command can only be used in groups or channels. (ONYX MD)*\n\n> *By Arosh Samuditha*" });
  }
});

/**
 * .autonewson Command
 * 
 * Enables automatic news updates that persist across bot restarts.
 * This command sets up the group/channel to receive news updates automatically
 * without requiring manual activation after each restart.
 * 
 * Features:
 * - Persistent configuration across restarts
 * - Admin permission validation
 * - Automatic startup on bot connection
 * - Configuration file management
 */
cmd({
  pattern: "autonewson",
  desc: "Enable persistent automatic news updates (survives bot restarts)",
  react: '🔧',
  filename: __filename
}, async (arosh, message, args, { from, isGroup, isChannel, participants, sender, isOwner }) => {
  // Fallback channel detection if isChannel is undefined
  const isChannelDetected = isChannel !== undefined ? isChannel : (from.endsWith("@broadcast") || from.endsWith("@newsletter"));
  
  // Check if it's a group or channel
  if (isGroup || isChannelDetected) {
    let isAdmin = false;
    
    if (isGroup) {
      // For groups, check if user is admin
      isAdmin = participants.some(p => p.id === sender && p.admin) || sender === arosh.user.jid || isOwner;
    } else if (isChannelDetected) {
      // For channels, allow the command if the bot is an admin
      isAdmin = true; // Allow in channels by default, bot will fail if not admin
    }
    
    if (isAdmin) {
      const autoConfig = loadAutoNewsConfig();
      
      if (!autoConfig.groups.includes(from)) {
        autoConfig.groups.push(from);
        autoConfig.enabled = true;
        autoConfig.settings.autoStart = true;
        saveAutoNewsConfig(autoConfig);
        
        // Also add to active groups for immediate activation
        activeGroups[from] = true;
        
        const type = isChannelDetected ? "channel" : "group";
        await arosh.sendMessage(from, { 
          text: `🔧 *Automatic News Service Activated! (ONYX MD)* 🎉\n\nThis ${type} will now receive news updates automatically, even after bot restarts.\n\n*Features:*\n• Persistent across bot restarts\n• Automatic startup\n• 24/7 news updates\n• No manual activation needed\n\n> *By Arosh Samuditha*` 
        });
        
        // Start interval if not already running
        if (!activeGroups.interval) {
          const interval = parseInt(autoConfig.interval) || 30000;
          activeGroups.interval = setInterval(async () => {
            for (const groupId in activeGroups) {
              if (activeGroups[groupId] && groupId !== 'interval') {
                await checkAndPostNews(arosh, groupId);
              }
            }
          }, interval);
        }
      } else {
        await arosh.sendMessage(from, { text: "🔧 *Automatic news service is already configured for this group/channel! (ONYX MD)*\n\n> *By Arosh Samuditha*" });
      }
    } else {
      const type = isChannelDetected ? "channel" : "group";
      await arosh.sendMessage(from, { text: `🚫 *This command can only be used by ${type} admins or the bot owner. (ONYX MD)*\n\n> *By Arosh Samuditha*` });
    }
  } else {
    await arosh.sendMessage(from, { text: "❌ *This command can only be used in groups or channels. (ONYX MD)*\n\n> *By Arosh Samuditha*" });
  }
});

/**
 * .autonewsoff Command
 * 
 * Disables automatic news updates and removes the group/channel from persistent configuration.
 * This will prevent the group/channel from receiving automatic news updates after bot restarts.
 * 
 * Features:
 * - Removes from persistent configuration
 * - Admin permission validation
 * - Immediate deactivation
 * - Configuration cleanup
 */
cmd({
  pattern: "autonewsoff",
  desc: "Disable persistent automatic news updates",
  react: '🔧',
  filename: __filename
}, async (arosh, message, args, { from, isGroup, isChannel, participants, sender, isOwner }) => {
  // Fallback channel detection if isChannel is undefined
  const isChannelDetected = isChannel !== undefined ? isChannel : (from.endsWith("@broadcast") || from.endsWith("@newsletter"));
  
  // Check if it's a group or channel
  if (isGroup || isChannelDetected) {
    let isAdmin = false;
    
    if (isGroup) {
      // For groups, check if user is admin
      isAdmin = participants.some(p => p.id === sender && p.admin) || sender === arosh.user.jid || isOwner;
    } else if (isChannelDetected) {
      // For channels, allow the command if the bot is an admin
      isAdmin = true; // Allow in channels by default, bot will fail if not admin
    }
    
    if (isAdmin) {
      const autoConfig = loadAutoNewsConfig();
      
      if (autoConfig.groups.includes(from)) {
        // Remove from persistent configuration
        autoConfig.groups = autoConfig.groups.filter(g => g !== from);
        
        // If no groups left, disable auto news
        if (autoConfig.groups.length === 0) {
          autoConfig.enabled = false;
          autoConfig.settings.autoStart = false;
        }
        
        saveAutoNewsConfig(autoConfig);
        
        // Also remove from active groups
        delete activeGroups[from];
        
        const type = isChannelDetected ? "channel" : "group";
        await arosh.sendMessage(from, { text: `🔧 *Automatic news service deactivated for this ${type}. (ONYX MD)*\n\nThis ${type} will no longer receive automatic news updates after bot restarts.\n\n> *By Arosh Samuditha*` });

        // Clean up interval if no active groups remain
        if (Object.keys(activeGroups).length === 1 && activeGroups.interval) {
          clearInterval(activeGroups.interval);
          delete activeGroups.interval;
        }
      } else {
        await arosh.sendMessage(from, { text: "🔧 *Automatic news service is not configured for this group/channel. (ONYX MD)*\n\n> *By Arosh Samuditha*" });
      }
    } else {
      const type = isChannelDetected ? "channel" : "group";
      await arosh.sendMessage(from, { text: `🚫 *This command can only be used by ${type} admins or the bot owner. (ONYX MD)*\n\n> *By Arosh Samuditha*` });
    }
  } else {
    await arosh.sendMessage(from, { text: "❌ *This command can only be used in groups or channels. (ONYX MD)*\n\n> *By Arosh Samuditha*" });
  }
});

/**
 * .autonewslist Command
 * 
 * Shows the list of groups/channels configured for automatic news updates.
 * Only accessible by bot owner for security.
 * 
 * Features:
 * - Owner-only access
 * - Lists all configured groups
 * - Shows configuration status
 * - Security protection
 */
cmd({
  pattern: "autonewslist",
  desc: "List all groups configured for automatic news updates (Owner only)",
  react: '📋',
  filename: __filename
}, async (arosh, message, args, { from, isOwner }) => {
  if (!isOwner) {
    await arosh.sendMessage(from, { text: "🚫 *This command can only be used by the bot owner. (ONYX MD)*\n\n> *By Arosh Samuditha*" });
    return;
  }
  
  const autoConfig = loadAutoNewsConfig();
  
  if (autoConfig.groups.length === 0) {
    await arosh.sendMessage(from, { text: "📋 *No groups are configured for automatic news updates. (ONYX MD)*\n\n> *By Arosh Samuditha*" });
    return;
  }
  
  let listText = `📋 *Automatic News Configuration (ONYX MD)*\n\n*Configured Groups/Channels:*\n`;
  
  autoConfig.groups.forEach((groupId, index) => {
    const isActive = activeGroups[groupId] ? "✅ Active" : "❌ Inactive";
    listText += `${index + 1}. ${groupId} - ${isActive}\n`;
  });
  
  listText += `\n*Settings:*\n• Auto Start: ${autoConfig.settings.autoStart ? "✅ Enabled" : "❌ Disabled"}\n• Interval: ${autoConfig.interval}ms\n• Prevent Duplicates: ${autoConfig.settings.preventDuplicates ? "✅ Enabled" : "❌ Disabled"}\n\n> *By Arosh Samuditha*`;
  
  await arosh.sendMessage(from, { text: listText });
});

/**
 * .getjid Command
 * 
 * Shows the JID (WhatsApp ID) of the current chat.
 * Useful for getting group/channel IDs for configuration.
 * 
 * Features:
 * - Works in private chats, groups, and channels
 * - Shows chat type and ID
 * - Helpful for configuration setup
 */
cmd({
  pattern: "getjid",
  desc: "Get the JID of current chat (for configuration)",
  react: '🆔',
  filename: __filename
}, async (arosh, message, args, { from, isGroup, isChannel }) => {
  // Debug logging
  console.log(`[GETJID DEBUG] From: ${from}`);
  console.log(`[GETJID DEBUG] isGroup: ${isGroup}`);
  console.log(`[GETJID DEBUG] isChannel: ${isChannel}`);
  
  // Fallback channel detection if isChannel is undefined
  const isChannelDetected = isChannel !== undefined ? isChannel : (from.endsWith("@broadcast") || from.endsWith("@newsletter"));
  
  console.log(`[GETJID DEBUG] isChannelDetected: ${isChannelDetected}`);
  
  let chatType = "Private Chat";
  if (isGroup) chatType = "Group";
  else if (isChannelDetected) chatType = "Channel";
  
  const jidInfo = `🆔 *Chat Information (ONYX MD)*\n\n*Chat Type:* ${chatType}\n*JID:* \`${from}\`\n\n*Copy this JID for configuration*\n\n> *By Arosh Samuditha*`;
  
  await arosh.sendMessage(from, { text: jidInfo });
});

/**
 * .testchannel Command
 * 
 * Test command to verify channel detection and message routing.
 * Only works in channels to test if messages stay within the channel.
 * 
 * Features:
 * - Channel-only command
 * - Tests message routing
 * - Debug information
 */
cmd({
  pattern: "testchannel",
  desc: "Test channel detection and message routing (Channel only)",
  react: '🧪',
  filename: __filename
}, async (arosh, message, args, { from, isGroup, isChannel }) => {
  // Debug logging
  console.log(`[TESTCHANNEL DEBUG] From: ${from}`);
  console.log(`[TESTCHANNEL DEBUG] isGroup: ${isGroup}`);
  console.log(`[TESTCHANNEL DEBUG] isChannel: ${isChannel}`);
  console.log(`[TESTCHANNEL DEBUG] from.endsWith("@broadcast"): ${from.endsWith("@broadcast")}`);
  console.log(`[TESTCHANNEL DEBUG] from.endsWith("@newsletter"): ${from.endsWith("@newsletter")}`);
  console.log(`[TESTCHANNEL DEBUG] from.includes("@newsletter"): ${from.includes("@newsletter")}`);
  
  // Enhanced channel detection
  const isChannelDetected = isChannel !== undefined ? isChannel : (from.endsWith("@broadcast") || from.endsWith("@newsletter") || from.includes("@newsletter"));
  
  console.log(`[TESTCHANNEL DEBUG] isChannelDetected: ${isChannelDetected}`);
  
  if (!isChannelDetected) {
    await arosh.sendMessage(from, { text: "🧪 *This command only works in channels! (ONYX MD)*\n\n> *By Arosh Samuditha*" });
    return;
  }
  
  const testInfo = `🧪 *Channel Test Successful! (ONYX MD)*\n\n*Channel JID:* \`${from}\`\n*isChannel Parameter:* ${isChannel}\n*Detected Channel:* ${isChannelDetected}\n\n✅ *Message routing is working correctly!*\n\n> *By Arosh Samuditha*`;
  
  await arosh.sendMessage(from, { text: testInfo });
});

// Export the initialization function for use in index.js
module.exports = { initializeAutoNews };
