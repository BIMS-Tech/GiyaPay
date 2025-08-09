// Frontend server (root-level) for Cloud Run
// Zero-dependency static file server using Node core modules only
// Serves files from ./frontend and listens on process.env.PORT

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = Number(process.env.PORT || process.env.APP_PORT || 3000);
const FRONTEND_DIR = path.join(__dirname, 'frontend');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=UTF-8'
};

function sendJSON(res, status, payload) {
  const data = JSON.stringify(payload);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=UTF-8', 'Content-Length': Buffer.byteLength(data) });
  res.end(data);
}

function safeJoin(base, target) {
  const resolvedPath = path.resolve(base, '.' + target);
  if (!resolvedPath.startsWith(base)) return null; // prevent path traversal
  return resolvedPath;
}

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('Not Found');
      return;
    }

    const stream = fs.createReadStream(filePath);
    stream.on('open', () => {
      res.writeHead(200, { 'Content-Type': contentType });
      stream.pipe(res);
    });
    stream.on('error', () => {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('Internal Server Error');
    });
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname || '/';

  // Health check
  if (pathname === '/health') {
    return sendJSON(res, 200, { status: 'healthy', service: 'GiyaPay Frontend', timestamp: new Date().toISOString() });
  }

  // API guard (this service only serves static frontend)
  if (pathname.startsWith('/api/')) {
    return sendJSON(res, 404, { error: 'API is hosted separately', hint: 'Use the backend service URL for /api' });
  }

  // Resolve requested path safely
  let filePath = safeJoin(FRONTEND_DIR, pathname);
  if (!filePath) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=UTF-8' });
    return res.end('Bad Request');
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      // If directory, try index.html
      const indexPath = path.join(filePath, 'index.html');
      return serveFile(res, indexPath);
    }

    if (!err && stats.isFile()) {
      return serveFile(res, filePath);
    }

    // Fallback to root index.html for SPA-style routes
    const fallback = path.join(FRONTEND_DIR, 'index.html');
    serveFile(res, fallback);
  });
});

server.listen(PORT, () => {
  console.log(`🎨 Frontend Server (no deps) listening on port ${PORT}`);
  console.log(`📄 Serving static files from: ${FRONTEND_DIR}`);
});
