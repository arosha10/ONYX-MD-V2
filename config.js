const fs = require("fs");
if (fs.existsSync("config.env"))
  require("dotenv").config({ path: "./config.env" });

function convertToBool(text, fault = "true") {
  return text === fault ? true : false;
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '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';

module.exports = {
  SESSION_ID: process.env.SESSION_ID || "P1x2TQIK#4RYP0J-qQMzWLw1RHSjLjytkZ9DWeg61d3pWeXom96s",
  OWNER_NUM: process.env.OWNER_NUM || "94704270689",
  PREFIX: process.env.PREFIX || ".",
  ALIVE_IMG: process.env.ALIVE_IMG || "https://raw.githubusercontent.com/aroshsamuditha/ONYX-MEDIA/refs/heads/main/oNYX%20bOT.jpg",
  ALIVE_MSG: process.env.ALIVE_MSG || "*🌀ONYX MD🔥V2 BY AROSH🌀*\n\n--------I am alive now...!👻-------\n\n > 𝙾𝚗𝚢𝚡 𝙼𝚍 𝚒𝚜 𝚊 𝚋𝚘𝚝 𝚝𝚑𝚊𝚝 𝚠𝚘𝚛𝚔𝚜 𝚘𝚗 𝚆𝚑𝚊𝚝𝚜𝚊𝚙𝚙 𝚌𝚛𝚎𝚊𝚝𝚎𝚍 𝚋𝚢 𝙰𝚛𝚘𝚜𝚑 𝚂𝚊𝚖𝚞𝚍𝚒𝚝𝚑𝚊! 𝚈𝚘𝚞 𝚌𝚊𝚗 𝚐𝚎𝚝 𝚖𝚊𝚗𝚢 𝚋𝚎𝚗𝚎𝚏𝚒𝚝𝚜 𝚏𝚛𝚘𝚖 𝚝𝚑𝚒𝚜 🤑\n\n> Onyx Md යනු Arosh samuditha විසින් නිර්මාණය කරන ලද Whatsapp හී ක්‍රියා කරන බොට් කෙනෙකි ! මෙමගින් ඔබට නොයෙක් ආකාරයේ ප්‍රයෝජන රැසක් ලබාගත හැක 🤑\n\n> Onyx Md என்பது Arosh Samuditha அவர்களால் உருவாக்கப்பட்ட Whatsapp இல் செயல்படும் ஒரு பாட் ஆகும்! இதன் மூலம் நீங்கள் பல நன்மைகளைப் பெறலாம் 🤑\n\n*✅ Github repository = https://github.com/aroshsamuditha/ONYX-MD*\n*✅ Web Site =*\n*✅Youtube =*\n*✅ Tiktok Page = https://www.tiktok.com/@onyxstudio_byarosh?_t=ZS-8xQGlXXfj3o&_r=1*\n\n> By Arosh Samuditha",
  AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true",
  MODE: process.env.MODE || "public",
  AUTO_VOICE: process.env.AUTO_VOICE || "true",
  AUTO_STICKER: process.env.AUTO_STICKER || "true",
  AUTO_REPLY: process.env.AUTO_REPLY || "true",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "AIzaSyDhksN79VZZTsjz3VglIueugHmD6yUoYRI",
  MOVIE_API_KEY: process.env.MOVIE_API_KEY || "sky|1e06f8c7ba61f1b89ec740052ac303c0d4d6d447", //https://api.skymansion.site/movies-dl/

  //-------------------------------------------------------------------------------------------------------------------------------------
  UNSPLASH_API_KEY: process.env.UNSPLASH_API_KEY || "", // Add your Unsplash API key here for better image generation
  FLUX_API_KEY: process.env.FLUX_API_KEY || "", // Add your Flux AI API key for AI image generation
  
  // News Auto-Update Configuration
  AUTO_NEWS_ENABLED: process.env.AUTO_NEWS_ENABLED || "true", // Set to "true" to enable automatic news updates on startup
  AUTO_NEWS_GROUPS: process.env.AUTO_NEWS_GROUPS || "120363403952091638@g.us,120363402058481737@newsletter", // Comma-separated list of group/channel IDs for auto news updates
  AUTO_NEWS_INTERVAL: process.env.AUTO_NEWS_INTERVAL || "30000", // News update interval in milliseconds (default: 30 seconds)
};

module.exports.GITHUB_TOKEN = GITHUB_TOKEN;
 
