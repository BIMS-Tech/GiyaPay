module.exports = {
    // Server Configuration
    PORT: process.env.APP_PORT || 3000,        // Frontend server port (legacy)
    API_PORT: process.env.API_PORT || 3001,    // Backend API server port
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Database Configuration
    DB_CONFIG: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        connectionLimit: 10
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