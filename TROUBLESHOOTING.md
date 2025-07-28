# 🌀 ONYX MD Bot - Troubleshooting Guide

## Connection Issues

If your bot is having trouble connecting to WhatsApp, follow these steps:

### 1. Check Session Status

The bot requires a valid WhatsApp session to connect. If you see connection errors:

```bash
# Generate a new session
npm run generate-session
```

This will display a QR code. Scan it with your WhatsApp to authenticate.

### 2. Common Error Messages

#### "Connection closed, attempting to reconnect..."
- **Cause**: Network issues or session expired
- **Solution**: 
  - Check your internet connection
  - Generate a new session if the issue persists
  - Wait for automatic reconnection (up to 5 attempts)

#### "Connection closed. Reason: 403"
- **Cause**: Session invalidated or banned by WhatsApp
- **Solution**: 
  - **IMMEDIATE ACTION REQUIRED**: Generate a new session
  - Run `npm run generate-session` or use the fix script
  - This error means your current session is no longer valid
  - Do not retry with the same session

#### "Session file not found"
- **Cause**: Missing or corrupted session files
- **Solution**: Run `npm run generate-session` to create a new session

#### "Failed to download session from Mega"
- **Cause**: Invalid SESSION_ID or Mega link issues
- **Solution**: 
  - Check your SESSION_ID in config.js or environment variables
  - Generate a new session instead of using Mega

### 3. Environment Variables

Make sure these are properly set in your `config.env` file:

```env
SESSION_ID=your_session_id_here
OWNER_NUM=your_phone_number_here
PREFIX=.
MODE=public
```

### 4. Network Issues

If you're running on a VPS or cloud platform:

- Ensure port 8000 is open
- Check firewall settings
- Verify the server has internet access

### 5. Dependencies

Make sure all dependencies are installed:

```bash
npm install
```

### 6. Node.js Version

This bot requires Node.js 18.0.0 or higher:

```bash
node --version
```

### 7. Manual Session Generation

If automatic session generation fails:

1. Delete the `auth_info_baileys` folder
2. Run `npm run generate-session`
3. Scan the QR code with WhatsApp
4. Wait for "Session generated successfully" message
5. Run `npm start`

### 8. Logs and Debugging

Enable verbose logging by modifying the logger in `index.js`:

```javascript
logger: P({ level: "debug" }), // Change from "silent" to "debug"
```

### 9. Still Having Issues?

1. Check the console output for specific error messages
2. Verify your WhatsApp account is not banned
3. Try using a different phone number
4. Contact support with the exact error message

## Quick Fix Commands

```bash
# Fresh start
rm -rf auth_info_baileys/
rm -rf node_modules/
npm install
npm run generate-session
npm start
```

## Support

For additional help, check the main README.md file or contact the developer. 