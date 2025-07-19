# 🚀 Railway Deployment Guide for ONYX MD Bot

This guide will help you deploy your ONYX MD WhatsApp bot on Railway.

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Account**: Your bot code should be on GitHub
3. **WhatsApp Session**: You'll need a valid WhatsApp session ID

## 🔧 Configuration Files Added

The following files have been added to support Railway deployment:

- `railway.json` - Railway-specific configuration
- `nixpacks.toml` - Build configuration for Railway
- `Procfile` - Process management for Railway
- `env.example` - Environment variables template

## 🚀 Deployment Steps

### 1. Prepare Your Repository

Make sure your bot code is pushed to a GitHub repository.

### 2. Connect to Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### 3. Configure Environment Variables

In your Railway project dashboard, go to the "Variables" tab and add the following environment variables:

```env
# Required Variables
SESSION_ID=your_session_id_here
OWNER_NUM=your_owner_number_here

# Optional Variables (with defaults)
PREFIX=.
ALIVE_IMG=https://raw.githubusercontent.com/aroshsamuditha/ONYX-MEDIA/refs/heads/main/oNYX%20bOT.jpg
ALIVE_MSG=*🌀ONYX MD🔥V2 BY AROSH🌀*\n\n--------I am alive now...!👻-------
AUTO_READ_STATUS=true
MODE=public
AUTO_VOICE=true
AUTO_STICKER=true
AUTO_REPLY=true

# API Keys (optional)
GEMINI_API_KEY=your_gemini_api_key_here
MOVIE_API_KEY=your_movie_api_key_here
UNSPLASH_API_KEY=your_unsplash_api_key_here
FLUX_API_KEY=your_flux_api_key_here

# Server Configuration
PORT=8000
NODE_ENV=production
```

### 4. Deploy

1. Railway will automatically detect the Node.js project
2. It will install dependencies and start the bot
3. Monitor the deployment logs for any issues

## 🔍 Health Checks

The bot includes health check endpoints:

- **Main endpoint**: `https://your-app.railway.app/`
- **Health check**: `https://your-app.railway.app/health`

## 📊 Monitoring

### Railway Dashboard
- Monitor your bot's performance in the Railway dashboard
- Check logs for any errors
- Monitor resource usage

### Bot Status
- The bot will send a status message to your owner number when it starts
- Check the logs for connection status

## 🔧 Troubleshooting

### Common Issues

1. **Session Issues**
   - Ensure your `SESSION_ID` is valid
   - Check if the session hasn't expired

2. **Port Issues**
   - Railway automatically assigns a port
   - The bot uses `process.env.PORT` or defaults to 8000

3. **Dependencies**
   - All required dependencies are in `package.json`
   - Railway will install them automatically

4. **Build Issues**
   - Check the build logs in Railway dashboard
   - Ensure all files are properly committed to GitHub

### Logs

Check the Railway logs for:
- Connection errors
- Plugin loading issues
- WhatsApp authentication problems

## 🔄 Updates

To update your bot:

1. Push changes to your GitHub repository
2. Railway will automatically redeploy
3. Monitor the deployment logs

## 📱 Bot Features

Your deployed bot will have all the features from the original ONYX MD bot:

- ✅ WhatsApp messaging
- ✅ Media handling
- ✅ Plugin system
- ✅ Auto-reply
- ✅ Anti-delete
- ✅ And many more features

## 🆘 Support

If you encounter issues:

1. Check the Railway logs
2. Verify your environment variables
3. Ensure your session is valid
4. Check the bot's status messages

## 🎉 Success!

Once deployed, your bot will be available 24/7 on Railway's infrastructure with automatic restarts and monitoring.

---

**Note**: Make sure to keep your session ID and API keys secure. Never commit them to your repository. 