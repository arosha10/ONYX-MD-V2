const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'tiktok',
  alias: ['tt', 'tiktokdl'],
  category: 'downloader',
  desc: 'Download TikTok video without watermark',
  use: '<url>',
  async exec({ sock, msg, args }) {
    try {
      if (!args[0]) return msg.reply('Please provide a TikTok URL!');
      
      const url = args[0];
      if (!url.includes('tiktok.com')) return msg.reply('Please provide a valid TikTok URL!');
      
      await msg.reply('⏳ Downloading TikTok video...');
      
      // Using a simple API approach instead of Playwright
      const apiUrl = `https://api.douyin.wtf/api?url=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl);
      
      if (response.data.status_code !== 0) {
        return msg.reply('❌ Failed to download TikTok video. Please try again.');
      }
      
      const videoData = response.data.data;
      const videoUrl = videoData.nwm_video_url || videoData.video_data.nwm_video_url;
      
      if (!videoUrl) {
        return msg.reply('❌ No video URL found. The video might be private or unavailable.');
      }
      
      // Download the video
      const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });
      const fileName = `tiktok_${Date.now()}.mp4`;
      const filePath = path.join(__dirname, '..', 'temp', fileName);
      
      // Ensure temp directory exists
      const tempDir = path.dirname(filePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const writer = fs.createWriteStream(filePath);
      videoResponse.data.pipe(writer);
      
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
      
      // Send the video
      await sock.sendMessage(msg.from, {
        video: { url: `file://${filePath}` },
        caption: `🎵 *TikTok Download*\n\n📝 *Description:* ${videoData.desc || 'No description'}\n👤 *Author:* ${videoData.author?.nickname || 'Unknown'}\n❤️ *Likes:* ${videoData.statistics?.like_count || 'Unknown'}\n💬 *Comments:* ${videoData.statistics?.comment_count || 'Unknown'}\n🔄 *Shares:* ${videoData.statistics?.share_count || 'Unknown'}`,
        gifPlayback: false
      }, { quoted: msg });
      
      // Clean up the temporary file
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 5000);
      
    } catch (error) {
      console.error('TikTok download error:', error);
      await msg.reply('❌ Error downloading TikTok video. Please try again later.');
    }
  }
}; 