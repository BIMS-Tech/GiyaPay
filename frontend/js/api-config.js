// API Configuration for Frontend
const API_CONFIG = {
    // Base API URL - change this to point to your API server
    BASE_URL: (() => {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3001'; // Development
        } else if (hostname.includes('giyapay.com')) {
            return 'https://backend.giyapay.com'; // Production (Custom domain)
        } else {
            // Fallback for other domains
            return 'https://backend.giyapay.com';
        }
    })(),
    
    // API Endpoints
    ENDPOINTS: {
        // Authentication
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        ME: '/api/auth/me',
        
        // Blog Posts
        POSTS: '/api/posts',
        POSTS_PREVIEW: '/api/posts/preview',
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
    
    // Helper function to get image URL (now supports base64 data URLs)
    getImageUrl: function(imageData) {
        if (!imageData) return null;
        
        // If it's already a data URL (base64), return as is
        if (imageData.startsWith('data:')) return imageData;
        
        // Legacy support for file paths
        if (imageData.startsWith('http')) return imageData;
        if (imageData.startsWith('/')) return this.BASE_URL + imageData;
        return this.BASE_URL + '/' + imageData;
    },
    
    // Helper function for fetch with default options
    fetch: function(endpoint, options = {}) {
        // Don't set default Content-Type for FormData (let browser set it automatically)
        const isFormData = options.body instanceof FormData;
        
        const defaultOptions = {
            credentials: 'include', // Include cookies for session management
            headers: {
                ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
                ...options.headers
            },
            ...options
        };
        
        const url = this.getUrl(endpoint);
        console.log('=== API CONFIG DEBUG ===');
        console.log('Current hostname:', window.location.hostname);
        console.log('API base URL:', this.BASE_URL);
        console.log('API request to:', url);
        console.log('API request options:', defaultOptions);
        console.log('========================');
        
        return fetch(url, defaultOptions);
    }
};

// Make it available globally
window.API_CONFIG = API_CONFIG; 