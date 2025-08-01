// Load environment variables
require('dotenv').config();

const express = require('express');
const path = require('path');
const config = require('./config');

const app = express();
const FRONTEND_PORT = config.PORT || 3000; // Use APP_PORT for frontend

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Handle client-side routing - serve index.html for non-API routes
app.get('*', (req, res, next) => {
    // Skip API routes - let them 404 naturally since this is frontend server
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ 
            error: 'API endpoints are served on a different port',
            api_server: process.env.API_URL || 'http://localhost:3001'
        });
    }
    
    // For other routes, try to serve the file or fallback to index.html
    const filePath = path.join(__dirname, req.path);
    res.sendFile(filePath, (err) => {
        if (err) {
            // If file doesn't exist, serve index.html (for SPA routing)
            res.sendFile(path.join(__dirname, 'index.html'));
        }
    });
});

// Health check for frontend server
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'GiyaPay Frontend Server',
        timestamp: new Date().toISOString()
    });
});

// Start frontend server
app.listen(FRONTEND_PORT, () => {
    console.log(`🎨 Frontend Server running on http://localhost:${FRONTEND_PORT}`);
    console.log(`📄 Serving static files from: ${__dirname}`);
    console.log(`🔗 API Server should be running on: ${process.env.API_URL || 'http://localhost:3001'}`);
}); 