const axios = require('axios')

const getBuffer = async(url, options) => {
	try {
		options ? options : {}
		var res = await axios({
			method: 'get',
			url,
			headers: {
				'DNT': 1,
				'Upgrade-Insecure-Request': 1,
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
			},
			...options,
			responseType: 'arraybuffer',
			timeout: 60000, // Increased timeout for cloud environments
			maxRedirects: 10,
			validateStatus: function (status) {
				return status >= 200 && status < 400; // Accept redirects
			}
		})
		return res.data
	} catch (e) {
		console.error("getBuffer error:", e.message);
		throw e; // Re-throw the error to be handled by the calling function
	}
}

const getGroupAdmins = (participants) => {
	var admins = []
	for (let i of participants) {
		i.admin !== null  ? admins.push(i.id) : ''
	}
	return admins
}

const getRandom = (ext) => {
	return `${Math.floor(Math.random() * 10000)}${ext}`
}

const h2k = (eco) => {
	var lyrik = ['', 'K', 'M', 'B', 'T', 'P', 'E']
	var ma = Math.log10(Math.abs(eco)) / 3 | 0
	if (ma == 0) return eco
	var ppo = lyrik[ma]
	var scale = Math.pow(10, ma * 3)
	var scaled = eco / scale
	var formatt = scaled.toFixed(1)
	if (/\.0$/.test(formatt))
		formatt = formatt.substr(0, formatt.length - 2)
	return formatt + ppo
}

const isUrl = (url) => {
	return url.match(
		new RegExp(
			/https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)/,
			'gi'
		)
	)
}

const Json = (string) => {
    return JSON.stringify(string, null, 2)
}

const runtime = (seconds) => {
	seconds = Number(seconds)
	var d = Math.floor(seconds / (3600 * 24))
	var h = Math.floor(seconds % (3600 * 24) / 3600)
	var m = Math.floor(seconds % 3600 / 60)
	var s = Math.floor(seconds % 60)
	var dDisplay = d > 0 ? d + (d == 1 ? ' day, ' : ' days, ') : ''
	var hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : ''
	var mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : ''
	var sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : ''
	return dDisplay + hDisplay + mDisplay + sDisplay;
}

const sleep = async(ms) => {
	return new Promise(resolve => setTimeout(resolve, ms))
}

const fetchJson = async (url, options) => {
    try {
        options ? options : {}
        const res = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            ...options
        })
        return res.data
    } catch (err) {
        return err
    }
}

// Function to send and update downloading progress
async function sendDownloadProgress(robin, from, mek, progressMessage) {
  try {
    const progressMsg = await robin.sendMessage(
      from,
      { text: progressMessage },
      { quoted: mek }
    );
    return progressMsg;
  } catch (error) {
    console.error("Failed to send progress message:", error);
    return null;
  }
}

async function updateDownloadProgress(robin, progressMsg, newProgressMessage) {
  try {
    if (progressMsg) {
      // Edit the existing message instead of sending a new one
      await robin.sendMessage(
        progressMsg.key.remoteJid,
        { 
          edit: progressMsg.key,
          text: newProgressMessage 
        }
      );
    }
  } catch (error) {
    console.error("Failed to update progress message:", error);
  }
}

// Function to get progress bar for percentage
function getProgressBar(percent) {
  const progressBars = {
    20: "██",
    40: "████",
    60: "██████",
    80: "████████",
    100: "██████████ ✅"
  };
  return progressBars[percent] || "";
}

// Function to simulate realistic download progress with delays
async function simulateDownloadProgress(robin, progressMsg, startPercent, endPercent, step = 10, type = "song") {
  for (let i = startPercent; i <= endPercent; i += step) {
    const progressBar = getProgressBar(i);
    const message = `🔄 *Downloading ${type}...*\n\n*${i}%* ${progressBar}`;
    
    await updateDownloadProgress(robin, progressMsg, message);
    // Add a small delay between updates (about 0.8 seconds between each 10% increment)
    await new Promise(resolve => setTimeout(resolve, 800));
  }
}

// Function to simulate download progress with specific percentages and duration
async function simulateDownloadProgressCustom(robin, progressMsg, percentages, totalDuration, type = "content") {
  const delayPerStep = totalDuration / (percentages.length - 1);
  for (let i = 0; i < percentages.length; i++) {
    const percent = percentages[i];
    const progressBar = getProgressBar(percent);
    const message = `🔄 *Downloading ${type}...*\n\n*${percent}%* ${progressBar}`;
    await updateDownloadProgress(robin, progressMsg, message);
    if (i < percentages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayPerStep));
    }
  }
}

// Function to simulate download progress with fixed percentages: 20%, 40%, 60%, 80%, 100% over 2.5 seconds
async function simulateDownloadProgressFixed(robin, progressMsg, type = "content") {
  const percentages = [20, 40, 60, 80, 100];
  const totalDuration = 2500;
  const delayPerStep = totalDuration / (percentages.length - 1);

  for (let i = 0; i < percentages.length; i++) {
    const percent = percentages[i];
    let progressBar = getProgressBar(percent);
    let message;
    if (i === 0) {
      // First message: 20 out of 20
      message = `🔄 *Downloading ${type}...*\n\n*20%* ${progressBar}`;
    } else {
      message = `🔄 *Downloading ${type}...*\n\n*${percent}%* ${progressBar}`;
    }
    await updateDownloadProgress(robin, progressMsg, message);
    if (i < percentages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayPerStep));
    }
  }
}

module.exports = { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, sendDownloadProgress, updateDownloadProgress, simulateDownloadProgress, getProgressBar, simulateDownloadProgressCustom, simulateDownloadProgressFixed }
