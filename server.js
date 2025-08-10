// server.js
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());  // فعال کردن CORS

const PORT = 3000;
const proxiesFile = path.join(__dirname, 'proxies.json');

let proxies = [];

// Load proxies from file if exists
if (fs.existsSync(proxiesFile)) {
  proxies = JSON.parse(fs.readFileSync(proxiesFile));
}

console.log(`Server running on port ${PORT}`);
console.log(`Loaded ${proxies.length} proxies from file.`);

async function fetchProxiesFromSource(url) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    return text.split('\n').map(p => p.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

async function updateProxies() {
  const sources = [
    'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=socks5&timeout=1000&country=all&ssl=all&anonymity=all',
    'https://www.proxy-list.download/api/v1/get?type=socks5',
    'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt'
  ];

  let newProxies = [];
  for (const src of sources) {
    const list = await fetchProxiesFromSource(src);
    newProxies.push(...list);
  }

  newProxies = [...new Set(newProxies)];
  const added = newProxies.length - proxies.length;

  if (added > 0) {
    proxies = newProxies;
    fs.writeFileSync(proxiesFile, JSON.stringify(proxies, null, 2));
    console.log(`✅ Added ${added} new proxies, total now ${proxies.length}`);
  }

  return { added, total: proxies.length };
}

// API endpoint to update proxies manually
app.get('/api/fetch-and-add', async (req, res) => {
  const result = await updateProxies();
  res.json(result);
});

// API endpoint to get current proxies list
app.get('/api/proxies', (req, res) => {
  res.json(proxies);
});

// Auto-update every 10 minutes
setInterval(updateProxies, 10 * 60 * 1000);

// Run immediately after start
(async () => {
  await updateProxies();
})();

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
