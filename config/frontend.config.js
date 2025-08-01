// Frontend Server Configuration
require('dotenv').config();

module.exports = {
    // Server Configuration
    PORT: process.env.APP_PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Static Files Configuration
    STATIC_DIR: process.cwd(), // Serve from root directory
    UPLOAD_DIR: 'uploads', // Uploads directory
    
    // API Configuration
    API_URL: process.env.API_URL || 'http://localhost:3001',
    
    // CORS Configuration (if needed for frontend)
    CORS_OPTIONS: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
    },
    
    // Health Check Configuration
    HEALTH_ENDPOINT: '/health',
    
    // Error Handling
    ERROR_PAGES: {
        404: '404.html',
        401: '401.html'
    },
    
    // Logging Configuration
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    
    // Security Headers
    SECURITY_HEADERS: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
    }
}; 