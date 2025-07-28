const mineflayer = require('mineflayer');
const fs = require('fs');
const path = require('path');

const botsFolder = './bots';

function loadBot(configPath) {
  const config = JSON.parse(fs.readFileSync(configPath));
  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port || 25565,
    username: config.username,
    auth: config.auth || 'offline',
    version: config.version || false
  });

  bot.once('spawn', () => {
    console.log(`🟢 [${config.username}] Logged in and spawned.`);

    // Anti-AFK
    if (config.antiAfk) {
      setInterval(() => {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
      }, 15000);
    }
  });

  bot.on('end', () => {
    console.log(`🔁 [${config.username}] Disconnected. Reconnecting in ${config.reconnectDelay || 60000}ms...`);
    setTimeout(() => loadBot(configPath), config.reconnectDelay || 60000);
  });

  bot.on('error', err => {
    console.log(`❌ [${config.username}] Error:`, err.message);
  });
}

// Load all bot configs
fs.readdirSync(botsFolder)
  .filter(file => file.endsWith('.json'))
  .forEach(file => {
    loadBot(path.join(botsFolder, file));
  });
