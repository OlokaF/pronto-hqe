const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5173;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.jsx':  'application/javascript; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ttf':  'font/truetype',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.json': 'application/json',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.gs':   'text/plain',
  '.md':   'text/plain',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(ROOT, decodeURIComponent(urlPath));

  // Prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found: ' + urlPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Pronto HQ running at http://localhost:${PORT}`);
});
