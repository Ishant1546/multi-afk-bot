const mineflayer = require('mineflayer');
const fs = require('fs');
const path = require('path');

// Auto read all *.json configs in current directory
const configs = fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.json'))
  .map(file => {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, file)));
    data.ign = path.parse(file).name;
    return data;
  });

configs.forEach(config => {
  const bot = mineflayer.createBot({
    host: config.ip,
    port: config.port || 25565,
    username: config.username,
    auth: config.auth, // 'offline' for cracked
    password: config.password || undefined
  });

  bot.once('login', () => {
    console.log(`✅ [${config.ign}] Logged in to ${config.ip}`);
    if (config.antiAfk) antiAfk(bot);
  });

  bot.on('spawn', () => {
    console.log(`🟢 [${config.ign}] Spawned`);
  });

  bot.on('end', () => {
    console.log(`🔄 [${config.ign}] Disconnected. Reconnecting in 60s...`);
    setTimeout(() => {
      process.exit(1); // Let Replit / PM2 / system restart it
    }, 60000);
  });

  bot.on('error', err => {
    console.log(`❌ [${config.ign}] Error:`, err.message);
  });

  function antiAfk(bot) {
    setInterval(() => {
      if (!bot || !bot.entity) return;
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 300);
    }, 15000);
  }
});
