# 🗞️ Automatic News Updates Feature

## Overview
The ONYX MD bot now supports **automatic news updates** that can be configured to send news updates to specific groups/channels 24/7, even after bot restarts. This eliminates the need to manually run the `.newson` command every time the bot restarts.

## 🚀 Features

### ✅ Persistent Configuration
- News settings are saved to a configuration file
- Survives bot restarts and updates
- No manual re-activation required

### ✅ Multiple Configuration Methods
1. **Environment Variables** - Set up via config.env
2. **Commands** - Configure via bot commands
3. **JSON Configuration** - Direct file editing

### ✅ Smart Duplicate Prevention
- Tracks previously sent news titles
- Prevents spam and duplicate posts
- Configurable duplicate prevention settings

### ✅ Flexible Group Management
- Support for multiple groups/channels
- Individual group enable/disable
- Owner-only management commands

## 📋 Commands

### Basic News Commands
- `.news` - Get latest news from all sources
- `.newson` - Enable 24/7 news updates (temporary)
- `.newsoff` - Disable 24/7 news updates
- `.newscheck` - Check current news service status

### Automatic News Commands (New!)
- `.autonewson` - Enable persistent automatic news updates
- `.autonewsoff` - Disable persistent automatic news updates
- `.autonewslist` - List all configured groups (Owner only)

## ⚙️ Configuration

### Method 1: Environment Variables (Recommended)

Add these to your `config.env` file:

```env
# Enable automatic news updates
AUTO_NEWS_ENABLED=true

# Comma-separated list of group/channel IDs
AUTO_NEWS_GROUPS=120363403952091638@g.us,120363161513685998@newsletter

# Update interval in milliseconds (default: 30000 = 30 seconds)
AUTO_NEWS_INTERVAL=30000
```

### Method 2: Bot Commands

1. **Enable for a group:**
   ```
   .autonewson
   ```
   (Must be admin in the group)

2. **Disable for a group:**
   ```
   .autonewsoff
   ```
   (Must be admin in the group)

3. **Check configuration:**
   ```
   .autonewslist
   ```
   (Owner only)

### Method 3: Direct File Editing

Edit `data/autonews.json`:

```json
{
  "enabled": true,
  "groups": [
    "120363403952091638@g.us",
    "120363161513685998@newsletter"
  ],
  "interval": 30000,
  "lastUpdate": null,
  "settings": {
    "autoStart": true,
    "preventDuplicates": true,
    "maxNewsPerUpdate": 5
  }
}
```

## 🔧 Setup Instructions

### Step 1: Enable Automatic News
Choose one of the configuration methods above. The environment variable method is recommended for production.

### Step 2: Add Target Groups
Add the group/channel IDs where you want news updates to be sent. You can get the group ID by:
- Using `.newscheck` in the group
- Checking the bot logs when a message is sent

### Step 3: Restart the Bot
The automatic news service will start automatically when the bot connects.

### Step 4: Verify Setup
Use `.autonewslist` (owner only) to verify the configuration.

## 📊 Configuration Options

| Setting | Description | Default | Example |
|---------|-------------|---------|---------|
| `AUTO_NEWS_ENABLED` | Enable/disable automatic news | `false` | `true` |
| `AUTO_NEWS_GROUPS` | Target groups/channels | `""` | `"group1@g.us,group2@g.us"` |
| `AUTO_NEWS_INTERVAL` | Update frequency (ms) | `30000` | `60000` (1 minute) |

## 🛡️ Security Features

### Permission Requirements
- **Groups**: User must be admin or bot owner
- **Channels**: Bot must have admin permissions
- **Configuration**: Owner-only access to sensitive commands

### Rate Limiting
- Built-in delays between news posts
- Duplicate prevention system
- Configurable update intervals

## 🔍 Troubleshooting

### News Not Sending
1. Check if the group is in the configuration: `.autonewslist`
2. Verify bot permissions in the group
3. Check bot logs for error messages

### Duplicate Posts
- The system automatically prevents duplicates
- Check the `preventDuplicates` setting
- Clear the `lastNewsTitles` cache if needed

### Configuration Not Saving
1. Ensure the `data/` directory exists
2. Check file permissions
3. Verify JSON syntax in `autonews.json`

## 📝 Logs

The bot will log automatic news activities:

```
[AUTO NEWS] Environment-based auto news enabled
[AUTO NEWS] Starting automatic news updates for 2 groups
[AUTO NEWS] News update interval started (30000ms)
```

## 🎯 Use Cases

### News Channels
- Set up dedicated news channels
- Automatic breaking news updates
- 24/7 news coverage

### Group Updates
- Keep group members informed
- Regular news summaries
- Community engagement

### Business Applications
- Company news updates
- Industry news monitoring
- Client communication

## 🔄 Migration from Manual News

If you're currently using `.newson` manually:

1. **Keep existing setup**: The manual commands still work
2. **Add automatic setup**: Use `.autonewson` in your groups
3. **Test**: Verify automatic updates work after restart
4. **Remove manual**: Stop using `.newson` if desired

## 📞 Support

For issues or questions:
- Check the bot logs for error messages
- Verify configuration syntax
- Ensure proper permissions
- Contact the bot owner for assistance

---

**Developed by Arosh Samuditha**  
**ONYX MD Bot**  
*Making news updates effortless and automatic* 📰✨ 