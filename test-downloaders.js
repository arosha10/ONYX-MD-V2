const axios = require('axios');

// Test function to check if Instagram URLs can be accessed
async function testInstagramAccess() {
  console.log("🧪 Testing Instagram access...");
  
  const testUrls = [
    "https://www.instagram.com/p/C0X8QYQNQZQ/",
    "https://www.instagram.com/reel/C0X8QYQNQZQ/"
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`Testing URL: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 20000,
        maxRedirects: 10,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      });
      
      console.log(`✅ Success: Status ${response.status}`);
      
      // Check if page contains video content
      const content = response.data;
      const hasVideo = content.includes('video_url') || content.includes('cdninstagram.com');
      console.log(`📹 Video content detected: ${hasVideo}`);
      
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
    }
  }
}

// Test function to check if YouTube URLs can be accessed
async function testYouTubeAccess() {
  console.log("\n🧪 Testing YouTube access...");
  
  const testUrls = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ"
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`Testing URL: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 20000,
        maxRedirects: 10,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      });
      
      console.log(`✅ Success: Status ${response.status}`);
      
      // Check if page contains video content
      const content = response.data;
      const hasVideo = content.includes('video') || content.includes('player');
      console.log(`📹 Video content detected: ${hasVideo}`);
      
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
    }
  }
}

// Test function to check network connectivity
async function testNetworkConnectivity() {
  console.log("\n🧪 Testing network connectivity...");
  
  const testUrls = [
    "https://www.google.com",
    "https://www.instagram.com",
    "https://www.youtube.com"
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`Testing connectivity to: ${url}`);
      const response = await axios.head(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      console.log(`✅ Success: Status ${response.status}`);
      
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
    }
  }
}

// Main test function
async function runTests() {
  console.log("🚀 Starting downloader tests for cloud environment...\n");
  
  await testNetworkConnectivity();
  await testInstagramAccess();
  await testYouTubeAccess();
  
  console.log("\n✅ All tests completed!");
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testInstagramAccess, testYouTubeAccess, testNetworkConnectivity }; 