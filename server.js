import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// سرو فایل‌های استاتیک از پوشه public
app.use(express.static(path.join(__dirname, 'public')));

let proxies = [];

// تابع برای گرفتن پراکسی‌ها از منابع مختلف
async function fetchProxiesFromSource(url) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    return text.split('\n').map(p => p.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

// بروزرسانی لیست پراکسی‌ها
async function updateProxies() {
  const sources = [
    'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=socks5&timeout=1000&country=all&ssl=all&anonymity=all',
    'https://www.proxy-list.download/api/v1/get?type=socks5',
    'https://raw
