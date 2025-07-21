#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const RESTART_INTERVAL = 6 * 60 * 60 * 1000 + 10 * 60 * 1000; // 6 hours 10 minutes in milliseconds
const LOG_FILE = path.join(__dirname, 'restart.log');

// Function to log messages
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(LOG_FILE, logMessage);
}

// Function to restart the application
function restartApplication() {
  log('🔄 Starting application restart process...');
  
  // Kill existing process if running
  try {
    const pid = fs.readFileSync(path.join(__dirname, '.pid'), 'utf8').trim();
    process.kill(pid, 'SIGTERM');
    log(`📤 Sent SIGTERM to process ${pid}`);
    
    // Wait a bit for graceful shutdown
    setTimeout(() => {
      try {
        process.kill(pid, 'SIGKILL');
        log(`💀 Sent SIGKILL to process ${pid}`);
      } catch (e) {
        // Process already dead
      }
    }, 5000);
  } catch (e) {
    log('ℹ️ No existing process found or PID file missing');
  }
  
  // Start new process
  setTimeout(() => {
    const child = spawn('node', ['index.js'], {
      stdio: 'inherit',
      detached: true
    });
    
    // Save PID
    fs.writeFileSync(path.join(__dirname, '.pid'), child.pid.toString());
    log(`✅ Application restarted with PID: ${child.pid}`);
    
    // Detach from parent
    child.unref();
  }, 10000); // Wait 10 seconds before starting new process
}

// Function to start the application initially
function startApplication() {
  log('🚀 Starting application for the first time...');
  
  const child = spawn('node', ['index.js'], {
    stdio: 'inherit',
    detached: true
  });
  
  // Save PID
  fs.writeFileSync(path.join(__dirname, '.pid'), child.pid.toString());
  log(`✅ Application started with PID: ${child.pid}`);
  
  // Detach from parent
  child.unref();
}

// Main execution
log('🔄 ONYX MD Restart Manager Started');
log(`⏰ Restart interval set to: ${RESTART_INTERVAL / (60 * 60 * 1000)} hours`);

// Start application initially
startApplication();

// Set up periodic restart
setInterval(() => {
  log('⏰ Scheduled restart triggered');
  restartApplication();
}, RESTART_INTERVAL);

// Handle process termination
process.on('SIGINT', () => {
  log('🛑 Restart manager shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('🛑 Restart manager received SIGTERM...');
  process.exit(0);
});

log('✅ Restart manager is running and will restart every 6 hours 10 minutes'); 