module.exports = {
    // Server Configuration
    PORT: process.env.APP_PORT || 3000,        // Frontend server port
    API_PORT: process.env.API_PORT || 3001,    // Backend API server port
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // API Configuration
    API_URL: process.env.API_URL || 'http://localhost:3001',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    
    // Database Configuration
    DB_CONFIG: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        connectionLimit: 10,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true
    },
    
    // Authentication Configuration
    SESSION_SECRET: process.env.SESSION_SECRET,
    SESSION_MAX_AGE: process.env.SESSION_MAX_AGE || 86400000, // 24 hours
    
    // Default Admin User (for initial setup)
    DEFAULT_ADMIN: {
        email: process.env.DEFAULT_ADMIN_EMAIL,
        password: process.env.DEFAULT_ADMIN_PASSWORD
    }
}; 