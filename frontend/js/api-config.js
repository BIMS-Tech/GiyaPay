// API Configuration for Frontend
const API_CONFIG = {
    // Base API URL - change this to point to your API server
    BASE_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3001'  // Development
        : 'https://giyapaywebbackend-278278033724.asia-east2.run.app', // Production (Cloud Run backend)
    
    // API Endpoints
    ENDPOINTS: {
        // Authentication
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        ME: '/api/auth/me',
        
        // Blog Posts
        POSTS: '/api/posts',
        POST_BY_ID: (id) => `/api/posts/${id}`,
        
        // Blog Stats
        BLOG_STATS: '/api/blog-stats',
        
        // Database Test
        DB_TEST: '/api/db-test',
        
        // Health Check
        HEALTH: '/api/health'
    },
    
    // Helper function to get full URL
    getUrl: function(endpoint) {
        return this.BASE_URL + endpoint;
    },
    
    // Helper function for fetch with default options
    fetch: function(endpoint, options = {}) {
        const defaultOptions = {
            credentials: 'include', // Include cookies for session management
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        return fetch(this.getUrl(endpoint), defaultOptions);
    }
};

// Make it available globally
window.API_CONFIG = API_CONFIG; 