const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = __dirname;
const LIVE = 'www.golive-asia.com';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.eot': 'application/vnd.ms-fontobject',
  '.mp4': 'video/mp4', '.pdf': 'application/pdf',
};

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) return send404(res);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback: for routes without a file extension (SPA routes like /home, /discover, /store, etc.)
      // serve index.html so Vue Router can handle client-side routing.
      const ext = path.extname(urlPath);
      if (!ext || ext === '.html') {
        fs.readFile(path.join(ROOT, 'index.html'), (err2, data2) => {
          if (err2) return send404(res);
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(data2);
        });
        return;
      }
      return send404(res);
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}

function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
}

function proxyApi(req, res) {
  const urlPath = req.url;
  const target = `https://${LIVE}${urlPath}`;
  const method = req.method;
  let body = '';
  req.on('data', c => body += c);
  req.on('end', () => {
    const headers = {
      'User-Agent': UA,
      'Referer': `https://${LIVE}/`,
      'Origin': `https://${LIVE}`,
    };
    if (body) {
      headers['Content-Type'] = req.headers['content-type'] || 'application/json';
      headers['Content-Length'] = Buffer.byteLength(body);
    }
    const u = new URL(target);
    const options = {
      hostname: u.hostname, port: 443, path: u.pathname + u.search,
      method, headers,
    };
    const proxyReq = https.request(options, proxyRes => {
      res.writeHead(proxyRes.statusCode, {
        'Content-Type': proxyRes.headers['content-type'] || 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      proxyRes.pipe(res);
    });
    proxyReq.on('error', e => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: String(e) }));
    });
    if (body) proxyReq.write(body);
    proxyReq.end();
  });
}

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  if (urlPath.startsWith('/api/') || urlPath === '/api') {
    return proxyApi(req, res);
  }
  serveStatic(req, res);
});

server.listen(8000, '0.0.0.0', () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  const urls = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        urls.push(`http://${net.address}:8000`);
      }
    }
  }
  console.log('Server running on:');
  urls.forEach(u => console.log('  ' + u));
  console.log('  (also http://localhost:8000)');
});