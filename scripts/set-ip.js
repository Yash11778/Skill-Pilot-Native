/**
 * set-ip.js
 * Automatically detects the machine's current Wi-Fi/LAN IPv4 address
 * and updates the LOCAL_IP in src/config/network-config.ts.
 *
 * Usage:  node scripts/set-ip.js
 *         npm run set-ip
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const [name, addrs] of Object.entries(interfaces)) {
    for (const addr of addrs) {
      if (
        addr.family === 'IPv4' &&
        !addr.internal &&
        (addr.address.startsWith('192.168.') ||
          addr.address.startsWith('10.') ||
          addr.address.startsWith('172.'))
      ) {
        candidates.push({ name, address: addr.address });
      }
    }
  }

  if (candidates.length === 0) {
    throw new Error('No suitable local network interface found. Are you connected to Wi-Fi or LAN?');
  }

  const preferred = candidates.find(c =>
    /wi-?fi|wlan|en0|en1|wlp/i.test(c.name)
  );
  return (preferred || candidates[0]).address;
}

const PORT = 5001;

try {
  const ip = getLocalIP();
  const configPath = path.resolve(__dirname, '../src/config/network-config.ts');

  // Read existing file and only replace the LOCAL_IP line
  let content = fs.readFileSync(configPath, 'utf8');
  content = content.replace(
    /const LOCAL_IP = '[^']+';/,
    `const LOCAL_IP = '${ip}';`
  );
  fs.writeFileSync(configPath, content, 'utf8');

  console.log(`✅  network-config.ts updated`);
  console.log(`    LOCAL_IP = ${ip}  (port ${PORT})`);
  console.log(`    Production URL unchanged (used in APK builds)`);
} catch (err) {
  console.error('❌  set-ip failed:', err.message);
  process.exit(1);
}
