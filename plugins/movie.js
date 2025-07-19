const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

const API_URL = "https://api.skymansion.site/movies-dl/search";
const DOWNLOAD_URL = "https://api.skymansion.site/movies-dl/download";
const API_KEY = config.MOVIE_API_KEY;

// Store pending movie selections in memory (for demo, not persistent)
const pendingSelections = {};

cmd({
    pattern: "movie",
    alias: ["moviedl", "films"],
    react: '🎬',
    category: "download",
    desc: "Search and download movies from PixelDrain (interactive)",
    filename: __filename
}, async (robin, m, mek, { from, q, reply, sender }) => {
    try {
        if (!q || q.trim() === '') return await reply('❌ Please provide a movie name! (e.g., Deadpool)');

        // Fetch movie search results
        const searchUrl = `${API_URL}?q=${encodeURIComponent(q)}&api_key=${API_KEY}`;
        console.log('🎬 Movie search URL:', searchUrl);
        console.log('🎬 API Key (first 10 chars):', API_KEY ? API_KEY.substring(0, 10) + '...' : 'NOT SET');
        
        let response = await fetchJson(searchUrl);
        console.log('🎬 API Response:', response);

        if (!response || !response.SearchResult || !response.SearchResult.result.length) {
            console.log('🎬 No results found in API response');
            return await reply(`❌ No results found for: *${q}*\n\nThis might be due to:\n• API key issues\n• Movie not available\n• API service down\n\nTry a different movie name.`);
        }

        // Show up to 5 results for user to pick
        const results = response.SearchResult.result.slice(0, 5);
        if (results.length === 0) {
            await reply('❌ No valid movie results to show.');
            return;
        }
        // Try to send WhatsApp list message
        try {
            const rows = results.map((movie, i) => ({
                title: `${movie.title} (${movie.year || 'N/A'})`,
                rowId: `moviepick_${movie.id}`,
                description: movie.type ? `Type: ${movie.type}` : undefined
            }));
            const sections = [
                {
                    title: "Select a Movie",
                    rows: rows
                }
            ];
            const listMessage = {
                title: `🎬 Movie Search Results for: ${q}`,
                description: "🌟 Choose the movie you want to download!",
                buttonText: "SELECT MOVIE",
                sections: sections
            };
            await robin.sendMessage(from, { listMessage }, { quoted: mek });
        } catch (err) {
            // Fallback to plain text if list message fails
            let msg = `> *🌀ONYX MD🔥MOVIE HUB🚀*\n\n🎬 *Movie Search Results for:* _${q}_\n\n`;
            results.forEach((movie, i) => {
                msg += `*${i + 1}.* ${movie.title} (${movie.year || 'N/A'})\n`;
            });
            msg += '\nඔබට අවශ්‍ය movie එකේ number එක *.moviepick <number>* ලෙස type කර send කරන්න🎞️';
            await robin.sendMessage(from, { text: msg }, { quoted: mek });
        }
        // Store pending selection
        pendingSelections[from] = {
            results,
            user: sender,
            quotedId: mek.key.id,
            timestamp: Date.now()
        };
        console.log('🎬 Pending selection stored:', { from, user: sender, resultsCount: results.length });
    } catch (error) {
        console.error('Error in movie command:', error);
        await reply('❌ Sorry, something went wrong. Please try again later.');
    }
});

// Listen for list replies to select a movie
cmd({
    pattern: /.*/,
    dontAddCommandList: true,
    filename: __filename
}, async (robin, m, mek, { from, body, sender }) => {
    console.log('🎬 Movie handler triggered:', { from, body, sender, hasPendingSelection: !!pendingSelections[from] });
    
    // Only handle replies to movie search
    if (!pendingSelections[from]) {
        console.log('🎬 No pending selection for this chat');
        return;
    }
    const selection = pendingSelections[from];
    if (sender !== selection.user) return;
    // Accept reply if within 2 minutes of movie list message
    const now = Date.now();
    if (now - selection.timestamp > 2 * 60 * 1000) {
        delete pendingSelections[from];
        return;
    }
    // Check if this is a list reply
    if (m.listResponseMessage && m.listResponseMessage.singleSelectReply) {
        const rowId = m.listResponseMessage.singleSelectReply.selectedRowId;
        if (!rowId || !rowId.startsWith('moviepick_')) return;
        const movieId = rowId.replace('moviepick_', '');
        const selectedMovie = selection.results.find(movie => movie.id == movieId);
        if (!selectedMovie) return;
        delete pendingSelections[from];
        // React to the selection
        await robin.sendMessage(from, { react: { text: '🎬', key: mek.key } });
        // Send downloading message
        await robin.sendMessage(from, { text: `⏬ Downloading your movie: *${selectedMovie.title}*...` }, { quoted: mek });
        try {
            const detailsUrl = `${DOWNLOAD_URL}/?id=${selectedMovie.id}&api_key=${API_KEY}`;
            let detailsResponse = await fetchJson(detailsUrl);
            if (!detailsResponse || !detailsResponse.downloadLinks || !detailsResponse.downloadLinks.result.links.driveLinks.length) {
                return await robin.sendMessage(from, { text: '❌ No download links found.' }, { quoted: mek });
            }
            // Try to find best quality: 720p > 1080p > 480p
            const links = detailsResponse.downloadLinks.result.links.driveLinks;
            let selectedDownload = links.find(link => link.quality === "HD 720p")
                || links.find(link => link.quality === "Full HD 1080p")
                || links.find(link => link.quality === "SD 480p");
            if (!selectedDownload || !selectedDownload.link.startsWith('http')) {
                return await robin.sendMessage(from, { text: '❌ No valid download link available.' }, { quoted: mek });
            }
            // Convert to direct download link
            const fileId = selectedDownload.link.split('/').pop();
            const directDownloadLink = `https://pixeldrain.com/api/file/${fileId}?download`;
            // Download movie (limit: 2.5GB)
            const filePath = path.join(__dirname, `${selectedMovie.title}-${selectedDownload.quality.replace(/\s/g, '')}.mp4`);
            const writer = fs.createWriteStream(filePath);
            const { data, headers } = await axios({
                url: directDownloadLink,
                method: 'GET',
                responseType: 'stream',
                timeout: 60000
            });
            const contentLength = parseInt(headers['content-length'] || '0');
            if (contentLength > 2500 * 1024 * 1024) {
                // Too large, send only the link
                await robin.sendMessage(from, { text: `🎬 *${selectedMovie.title}*\nQuality: ${selectedDownload.quality}\n\nDirect download link:\n${directDownloadLink}\n\n*Note:* File is too large to send directly. Use the link above.` }, { quoted: mek });
                return;
            }
            data.pipe(writer);
            writer.on('finish', async () => {
                await robin.sendMessage(from, {
                    document: fs.readFileSync(filePath),
                    mimetype: 'video/mp4',
                    fileName: `${selectedMovie.title}-${selectedDownload.quality.replace(/\s/g, '')}.mp4`,
                    caption: `🎬 *${selectedMovie.title}*\n📌 Quality: ${selectedDownload.quality}\n✅ *Download Complete!*`,
                    quoted: mek
                });
                fs.unlinkSync(filePath);
            });
            writer.on('error', async (err) => {
                console.error('Download Error:', err);
                await robin.sendMessage(from, { text: '❌ Failed to download movie. Please use the direct link above.' }, { quoted: mek });
            });
        } catch (error) {
            console.error('Error in movie selection:', error);
            await robin.sendMessage(from, { text: '❌ Sorry, something went wrong fetching the movie.' }, { quoted: mek });
        }
        return;
    }
    // Accept if quoted or just a number in the chat, or .moviepick <number>
    let num = null;
    const trimmedBody = body.trim();
    console.log('Movie selection attempt:', { from, body: trimmedBody, hasPendingSelection: !!pendingSelections[from] });
    
    if (/^\.moviepick\s+(\d+)$/.test(trimmedBody)) {
        num = parseInt(trimmedBody.match(/^\.moviepick\s+(\d+)$/)[1]);
        console.log('Parsed .moviepick command:', num);
    } else {
        num = parseInt(trimmedBody);
        console.log('Parsed plain number:', num);
    }
    
    if (isNaN(num) || num < 1 || num > selection.results.length) {
        console.log('Invalid number selection:', { num, resultsLength: selection.results.length });
        return;
    }
    const selectedMovie = selection.results[num - 1];
    console.log('Selected movie:', selectedMovie);
    delete pendingSelections[from];
    
    try {
        // React to the number reply
        await robin.sendMessage(from, { react: { text: '🎬', key: mek.key } });
        // Send downloading message
        await robin.sendMessage(from, { text: `⏬ Downloading your movie: *${selectedMovie.title}*...` }, { quoted: mek });
    } catch (reactError) {
        console.error('Error sending reaction or download message:', reactError);
        // Continue with download even if messaging fails
    }
    try {
        const detailsUrl = `${DOWNLOAD_URL}/?id=${selectedMovie.id}&api_key=${API_KEY}`;
        console.log('Fetching movie details from:', detailsUrl);
        let detailsResponse = await fetchJson(detailsUrl);
        console.log('Movie details response:', detailsResponse);
        
        if (!detailsResponse || !detailsResponse.downloadLinks || !detailsResponse.downloadLinks.result.links.driveLinks.length) {
            console.log('No download links found in response');
            return await robin.sendMessage(from, { text: '❌ No download links found.' }, { quoted: mek });
        }
        // Try to find best quality: 720p > 1080p > 480p
        const links = detailsResponse.downloadLinks.result.links.driveLinks;
        let selectedDownload = links.find(link => link.quality === "HD 720p")
            || links.find(link => link.quality === "Full HD 1080p")
            || links.find(link => link.quality === "SD 480p");
        if (!selectedDownload || !selectedDownload.link.startsWith('http')) {
            return await robin.sendMessage(from, { text: '❌ No valid download link available.' }, { quoted: mek });
        }
        // Convert to direct download link
        const fileId = selectedDownload.link.split('/').pop();
        const directDownloadLink = `https://pixeldrain.com/api/file/${fileId}?download`;
        // Download movie (limit: 2.5GB)
        const filePath = path.join(__dirname, `${selectedMovie.title}-${selectedDownload.quality.replace(/\s/g, '')}.mp4`);
        const writer = fs.createWriteStream(filePath);
        const { data, headers } = await axios({
            url: directDownloadLink,
            method: 'GET',
            responseType: 'stream',
            timeout: 60000
        });
        const contentLength = parseInt(headers['content-length'] || '0');
        if (contentLength > 2500 * 1024 * 1024) {
            // Too large, send only the link
            await robin.sendMessage(from, { text: `🎬 *${selectedMovie.title}*\nQuality: ${selectedDownload.quality}\n\nDirect download link:\n${directDownloadLink}\n\n*Note:* File is too large to send directly. Use the link above.` }, { quoted: mek });
            return;
        }
        data.pipe(writer);
        writer.on('finish', async () => {
            await robin.sendMessage(from, {
                document: fs.readFileSync(filePath),
                mimetype: 'video/mp4',
                fileName: `${selectedMovie.title}-${selectedDownload.quality.replace(/\s/g, '')}.mp4`,
                caption: `🎬 *${selectedMovie.title}*\n📌 Quality: ${selectedDownload.quality}\n✅ *Download Complete!*`,
                quoted: mek
            });
            fs.unlinkSync(filePath);
        });
        writer.on('error', async (err) => {
            console.error('Download Error:', err);
            await robin.sendMessage(from, { text: '❌ Failed to download movie. Please use the direct link above.' }, { quoted: mek });
        });
    } catch (error) {
        console.error('Error in movie selection:', error);
        await robin.sendMessage(from, { text: '❌ Sorry, something went wrong fetching the movie.' }, { quoted: mek });
    }
    return;
});

// Debug/test command for list messages
cmd({
    pattern: "testlist",
    desc: "Send a test WhatsApp list message (for debugging)",
    category: "debug",
    filename: __filename
}, async (robin, m, mek, { from }) => {
    const listMessage = {
        title: "Test List Title",
        description: "This is a test list message. Please select an option.",
        buttonText: "SELECT OPTION",
        sections: [
            {
                title: "Test Section",
                rows: [
                    { title: "Option 1", rowId: "test_1" },
                    { title: "Option 2", rowId: "test_2" }
                ]
            }
        ]
    };
    await robin.sendMessage(from, { listMessage }, { quoted: mek });
});

// Debug/test command for button messages
cmd({
    pattern: "testbutton",
    desc: "Send a test WhatsApp button message (for debugging)",
    category: "debug",
    filename: __filename
}, async (robin, m, mek, { from }) => {
    const buttons = [
        { buttonId: 'id1', buttonText: { displayText: 'Button 1' }, type: 1 },
        { buttonId: 'id2', buttonText: { displayText: 'Button 2' }, type: 1 }
    ];
    const buttonMessage = {
        text: "Test Button Message",
        buttons: buttons,
        headerType: 1
    };
    await robin.sendMessage(from, buttonMessage, { quoted: mek });
});
