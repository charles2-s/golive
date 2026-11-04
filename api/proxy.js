export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, Origin, Accept');
    res.end();
    return;
  }

  const path = req.query.path || '';
  const extraParams = Object.entries(req.query)
    .filter(([k]) => k !== 'path')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  const target = `https://www.golive-asia.com/api/${path}${extraParams ? '?' + extraParams : ''}`;

  try {
    const headers = {
      'Origin': 'https://www.golive-asia.com',
      'Referer': 'https://www.golive-asia.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
    };

    if (req.headers['content-type']) headers['Content-Type'] = req.headers['content-type'];
    if (req.headers['authorization']) headers['Authorization'] = req.headers['authorization'];
    if (req.headers['cookie']) headers['Cookie'] = req.headers['cookie'];

    const response = await fetch(target, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    const contentType = response.headers.get('content-type') || 'application/json';
    const body = await response.text();

    res.status(response.status);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, Origin, Accept');
    res.end(body);
  } catch (err) {
    res.status(502).json({ error: 'Proxy error', message: err.message });
  }
}

export const config = {
  runtime: 'nodejs18.x',
  maxDuration: 30,
};
