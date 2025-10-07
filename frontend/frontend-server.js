// Frontend server for Cloud Run (inside /frontend)
// Zero-dependency static file server using Node core modules only
// Serves files from this directory and listens on process.env.PORT

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const zlib = require('zlib');

const PORT = Number(process.env.PORT || process.env.APP_PORT || 3002);
const FRONTEND_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.xml': 'application/xml; charset=UTF-8',
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

    // Set appropriate cache headers based on file type
    const cacheHeaders = {};
    if (ext === '.css' || ext === '.js') {
      cacheHeaders['Cache-Control'] = 'public, max-age=31536000, immutable'; // 1 year for versioned assets
    } else if (ext === '.html') {
      cacheHeaders['Cache-Control'] = 'public, max-age=3600'; // 1 hour for HTML
    } else if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.svg' || ext === '.ico') {
      cacheHeaders['Cache-Control'] = 'public, max-age=31536000'; // 1 year for images
    } else {
      cacheHeaders['Cache-Control'] = 'public, max-age=86400'; // 1 day for other files
    }

    // Add ETag for better caching
    const etag = `"${stats.mtime.getTime()}-${stats.size}"`;
    cacheHeaders['ETag'] = etag;

    // Check if client has cached version
    const ifNoneMatch = res.req.headers['if-none-match'];
    if (ifNoneMatch === etag) {
      res.writeHead(304, cacheHeaders);
      res.end();
      return;
    }

    // Check if client accepts gzip compression
    const acceptEncoding = res.req.headers['accept-encoding'] || '';
    const shouldCompress = acceptEncoding.includes('gzip') && 
                          (ext === '.html' || ext === '.css' || ext === '.js' || ext === '.json' || ext === '.xml' || ext === '.txt');

    const stream = fs.createReadStream(filePath);
    stream.on('open', () => {
      const headers = { 'Content-Type': contentType, ...cacheHeaders };
      
      if (shouldCompress) {
        headers['Content-Encoding'] = 'gzip';
        const gzip = zlib.createGzip();
        res.writeHead(200, headers);
        stream.pipe(gzip).pipe(res);
      } else {
        res.writeHead(200, headers);
        stream.pipe(res);
      }
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
      const indexPath = path.join(filePath, 'index.html');
      return serveFile(res, indexPath);
    }

    if (!err && stats.isFile()) {
      return serveFile(res, filePath);
    }

    // Fallback to root index.html for unknown routes
    const fallback = path.join(FRONTEND_DIR, 'index.html');
    serveFile(res, fallback);
  });
});

server.listen(PORT, () => {
  console.log(`🎨 Frontend Server (no deps) listening on port ${PORT}`);
  console.log(`📄 Serving static files from: ${FRONTEND_DIR}`);
}); 