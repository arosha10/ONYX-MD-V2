const fs = require("fs");

function convertToBool(text, fault = "true") {
  return text === fault ? true : false;
}

// GitHub token should be stored as an environment variable, not in code
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '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';

module.exports = {
  SESSION_ID: "qF0SRDbZ#9tx5giKmJV6dnVvg68--kYhkqS6cKsSS-lQCXEEOWvk",
  OWNER_NUM: "94753984608",
  PREFIX: ".",
  ALIVE_IMG: "https://raw.githubusercontent.com/aroshsamuditha/ONYX-MEDIA/refs/heads/main/oNYX%20bOT.jpg",
  ALIVE_MSG: "*🌀ONYX MD🔥V2 BY AROSH🌀*\n\n--------I am alive now...!👻-------\n\n > 𝙾𝚗𝚢𝚡 𝙼𝚍 𝚒𝚜 𝚊 𝚋𝚘𝚝 𝚝𝚑𝚊𝚝 𝚠𝚘𝚛𝚔𝚜 𝚘𝚗 𝚆𝚑𝚊𝚝𝚜𝚊𝚙𝚙 𝚌𝚛𝚎𝚊𝚝𝚎𝚍 𝚋𝚢 𝙰𝚛𝚘𝚜𝚑 𝚂𝚊𝚖𝚞𝚍𝚒𝚝𝚑𝚊! 𝚈𝚘𝚞 𝚌𝚊𝚗 𝚐𝚎𝚝 𝚖𝚊𝚗𝚢 𝚋𝚎𝚗𝚎𝚏𝚒𝚝𝚜 𝚏𝚛𝚘𝚖 𝚝𝚑𝚒𝚜 🤑\n\n> Onyx Md යනු Arosh samuditha විසින් නිර්මාණය කරන ලද Whatsapp හී ක්‍රියා කරන බොට් කෙනෙකි ! මෙමගින් ඔබට නොයෙක් ආකාරයේ ප්‍රයෝජන රැසක් ලබාගත හැක 🤑\n\n> Onyx Md என்பது Arosh Samuditha அவர்களால் உருவாக்கப்பட்ட Whatsapp இல் செயல்படும் ஒரு பாட் ஆகும்! இதன் மூலம் நீங்கள் பல நன்மைகளைப் பெறலாம் 🤑\n\n*✅ Github repository = https://github.com/aroshsamuditha/ONYX-MD*\n*✅ Web Site =*\n*✅Youtube =*\n*✅ Tiktok Page = https://www.tiktok.com/@onyxstudio_byarosh?_t=ZS-8xQGlXXfj3o&_r=1*\n\n> By Arosh Samuditha",
  AUTO_READ_STATUS: "true",
  MODE: "public",
  AUTO_VOICE: "true",
  AUTO_STICKER: "true",
  AUTO_REPLY: "true",
  GEMINI_API_KEY: "AIzaSyDhksN79VZZTsjz3VglIueugHmD6yUoYRI",
  MOVIE_API_KEY: "sky|1e06f8c7ba61f1b89ec740052ac303c0d4d6d447", //https://api.skymansion.site/movies-dl/

  //-------------------------------------------------------------------------------------------------------------------------------------
  UNSPLASH_API_KEY: "", // Add your Unsplash API key here for better image generation
  FLUX_API_KEY: "", // Add your Flux AI API key for AI image generation
};

module.exports.GITHUB_TOKEN = GITHUB_TOKEN;
 
