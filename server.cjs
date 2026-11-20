// Tiny static server for the Live Translator (no dependencies).
// The page must be served from http://localhost so the browser remembers
// the microphone permission and can restart listening without asking again.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 5177;
const ROOT = __dirname;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log(`Live Translator running at http://localhost:${PORT}`);
  console.log('Keep this window open. Close it to shut the app down.');
});
