import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

let proxies = [];

// تابع کمکی برای گرفتن پراکسی‌ها از منابع مختلف
async function fetchProxiesFromSource(url) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    return text.split('\n').map(p => p.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

// آپدیت لیست پراکسی‌ها از منابع
async function updateProxies() {
  const sources = [
    'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=socks5&timeout=1000&country=all&ssl=all&anonymity=all',
    'https://www.proxy-list.download/api/v1/get?type=socks5',
    'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt'
  ];

  let allProxies = [];
  for (const src of sources) {
    const fetched = await fetchProxiesFromSource(src);
    allProxies = allProxies.concat(fetched);
  }

  // حذف پراکسی‌های تکراری
  proxies = Array.from(new Set(allProxies));
}

// هر 30 دقیقه آپدیت می‌کنیم پراکسی‌ها رو
updateProxies();
setInterval(updateProxies, 30 * 60 * 1000);

// API برای دریافت پراکسی‌ها
app.get('/api/proxies', (req, res) => {
  res.json(proxies);
});

// برای تمام مسیرهای دیگه، صفحه اصلی رو بفرست
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
