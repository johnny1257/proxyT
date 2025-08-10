const fetch = require('node-fetch');

const proxySources = [
  'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=socks5&timeout=1000&country=all&ssl=all&anonymity=all',
  'https://www.proxy-list.download/api/v1/get?type=socks5',
  'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt'
];

async function fetchProxies() {
  for (const url of proxySources) {
    console.log(`Trying to fetch proxies from: ${url}`);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`Failed to fetch from ${url}: status ${res.status}`);
        continue;
      }
      const text = await res.text();
      if (!text.trim()) {
        console.log(`Empty response from ${url}`);
        continue;
      }
      const proxies = text.split('\n').filter(line => line.trim() !== '').map(line => {
        const [host, port] = line.trim().split(':');
        return { host, port, type: 'socks5' };
      });
      console.log(`Fetched ${proxies.length} proxies from ${url}`);
      if (proxies.length > 0) return proxies;
    } catch (err) {
      console.log(`Error fetching proxies from ${url}:`, err.message);
    }
  }
  console.log('No proxies fetched from any source.');
  return [];
}

module.exports = { fetchProxies };
