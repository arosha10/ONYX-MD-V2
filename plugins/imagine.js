const axios = require('axios');
const { fetchBuffer } = require('../lib/myfunc');
const { cmd } = require('../command');

// Function to enhance the prompt
function enhancePrompt(prompt) {
    // Quality enhancing keywords
    const qualityEnhancers = [
        'high quality',
        'detailed',
        'masterpiece',
        'best quality',
        'ultra realistic',
        '4k',
        'highly detailed',
        'professional photography',
        'cinematic lighting',
        'sharp focus'
    ];

    // Randomly select 3-4 enhancers
    const numEnhancers = Math.floor(Math.random() * 2) + 3; // Random number between 3-4
    const selectedEnhancers = qualityEnhancers
        .sort(() => Math.random() - 0.5)
        .slice(0, numEnhancers);

    // Combine original prompt with enhancers
    return `${prompt}, ${selectedEnhancers.join(', ')}`;
}

// Main image generation function
async function generateImage(conn, mek, m, { from, quoted, body, reply }) {
    try {
        console.log('Image generation command received'); // Debug log
        
        // Get the prompt from the message - handle different command prefixes
        let prompt = '';
        if (body.startsWith('.imagine ')) {
            prompt = body.slice(9).trim(); // Remove ".imagine " prefix
        } else if (body.startsWith('.imggen ')) {
            prompt = body.slice(8).trim(); // Remove ".imggen " prefix
        } else if (body.startsWith('.generate ')) {
            prompt = body.slice(10).trim(); // Remove ".generate " prefix
        }
        
        console.log('Prompt:', prompt); // Debug log
        
        if (!prompt) {
            await conn.sendMessage(from, {
                text: 'Please provide a prompt for the image generation.\nExamples:\n• .imagine a beautiful sunset over mountains\n• .imggen a red dog wearing a hat\n• .generate a futuristic city at night'
            }, {
                quoted: mek
            });
            return;
        }

        // Send processing message
        await conn.sendMessage(from, {
            text: '> *Generating your image...*'
        }, {
            quoted: mek
        });

        // Enhance the prompt with quality keywords
        const enhancedPrompt = enhancePrompt(prompt);
        console.log('Sending API request...'); // Debug log

        // Construct Pollinations API URL
        const width = 1024;
        const height = 1024;
        const nologo = 'true';
        const encodedPrompt = encodeURIComponent(enhancedPrompt);
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=${nologo}`;

        // Make API request to Pollinations
        const response = await axios.get(pollinationsUrl, {
            responseType: 'arraybuffer',
            timeout: 20000 // 20 seconds timeout
        });
        console.log('API response headers:', response.headers); // Debug log

        // Convert response to buffer
        const imageBuffer = Buffer.from(response.data);
        const contentType = response.headers['content-type'];

        if (!contentType.startsWith('image/')) {
            await conn.sendMessage(from, {
                text: '❌ Failed to generate image (API did not return an image). Please try again later.'
            }, { quoted: mek });
            return;
        }
        console.log('Sending image to user...'); // Debug log
        await conn.sendMessage(from, {
            image: imageBuffer,
            mimetype: contentType,
            caption: `*Generated image for prompt: "${prompt}"*\n\n> *Thanks for using 🌀ONYX MD🔥*`
        }, { quoted: mek });

    } catch (error) {
        console.log('Error in image generation command:', error); // Debug log
        
        let errorMessage = '❌ Failed to generate image. Please try again later.';
        
        if (error.code === 'ECONNABORTED') {
            errorMessage = '❌ Request timed out. The image generation is taking too long. Please try again.';
            console.log('Request timed out after 20 seconds');
        } else if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log('API Error Status:', error.response.status);
            console.log('API Error Data:', error.response.data);
            errorMessage = `❌ API Error (${error.response.status}). Please try again later.`;
        } else if (error.request) {
            // The request was made but no response was received
            console.log('No response received from API');
            errorMessage = '❌ No response from image service. Please check your connection and try again.';
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Request setup error:', error.message);
            errorMessage = '❌ Failed to setup image generation request. Please try again.';
        }
        
        await conn.sendMessage(from, {
            text: errorMessage
        }, {
            quoted: mek
        });
    }
}

// Register the imagine command
cmd({
    pattern: "imagine",
    desc: "Generate AI images using Pollinations API",
    category: "ai",
    react: "🎨",
    filename: __filename
}, generateImage);

// Register the imggen command
cmd({
    pattern: "imggen",
    desc: "Generate AI images using Pollinations API (alternative command)",
    category: "ai",
    react: "🎨",
    filename: __filename
}, generateImage);

// Register the generate command
cmd({
    pattern: "generate",
    desc: "Generate AI images using Pollinations API (alternative command)",
    category: "ai",
    react: "🎨",
    filename: __filename
}, generateImage); 