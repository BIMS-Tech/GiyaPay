// Frontend server (root-level) for Cloud Run
// Serves files from ./frontend and listens on process.env.PORT

require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT || process.env.APP_PORT || 3000);
const FRONTEND_DIR = path.join(__dirname, 'frontend');

// Serve static assets from the frontend directory
app.use(express.static(FRONTEND_DIR));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'GiyaPay Frontend', timestamp: new Date().toISOString() });
});

// For any non-API route, try to serve the requested file; fallback to index.html
app.get('*', (req, res) => {
  // If someone hits an API path on the frontend service, return a helpful 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API is hosted separately', hint: 'Use the backend service URL for /api' });
  }

  const requestedPath = path.join(FRONTEND_DIR, req.path);
  res.sendFile(requestedPath, err => {
    if (err) {
      res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
    }
  });
});

app.listen(PORT, () => {
  console.log(`🎨 Frontend Server listening on port ${PORT}`);
  console.log(`📄 Serving static files from: ${FRONTEND_DIR}`);
});
