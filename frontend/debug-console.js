/**
 * Debug Console Script for GiyaPay Blog
 * Run this in the browser console to diagnose issues
 */

// Debug function to test API configuration
window.debugAPI = function() {
    console.log('🔧 GiyaPay API Debug Console');
    console.log('============================');
    
    // Check if API_CONFIG is loaded
    if (typeof API_CONFIG === 'undefined') {
        console.error('❌ API_CONFIG is not defined');
        console.log('💡 Make sure api-config.js is loaded before this script');
        return;
    }
    
    console.log('✅ API_CONFIG is loaded');
    console.log('Base URL:', API_CONFIG.BASE_URL);
    console.log('Current hostname:', window.location.hostname);
    console.log('Endpoints:', API_CONFIG.ENDPOINTS);
    
    // Test URL construction
    console.log('\n🔗 Testing URL construction:');
    try {
        const testUrl = API_CONFIG.getUrl('/api/health');
        console.log('Health check URL:', testUrl);
        
        const previewUrl = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.POSTS_PREVIEW);
        console.log('Preview URL:', previewUrl);
        
        const postUrl = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.POST_BY_ID(1));
        console.log('Post URL:', postUrl);
    } catch (error) {
        console.error('❌ Error constructing URLs:', error);
    }
    
    // Test fetch function
    console.log('\n🌐 Testing fetch function:');
    API_CONFIG.fetch('/api/health')
        .then(response => {
            console.log('✅ Health check response:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('✅ Health check data:', data);
        })
        .catch(error => {
            console.error('❌ Health check error:', error);
        });
};

// Debug function to test blog loading
window.debugBlog = function() {
    console.log('📝 GiyaPay Blog Debug');
    console.log('====================');
    
    if (typeof API_CONFIG === 'undefined') {
        console.error('❌ API_CONFIG is not available');
        return;
    }
    
    console.log('🔄 Testing blog posts preview...');
    
    API_CONFIG.fetch(`${API_CONFIG.ENDPOINTS.POSTS_PREVIEW}?status=published&limit=5`)
        .then(response => {
            console.log('✅ Blog preview response status:', response.status);
            console.log('✅ Response headers:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response.json();
        })
        .then(data => {
            console.log('✅ Blog preview data:', data);
            console.log(`📄 Found ${data.posts ? data.posts.length : 0} posts`);
            console.log('📄 Pagination:', data.pagination);
        })
        .catch(error => {
            console.error('❌ Blog preview error:', error);
            console.log('💡 Check network tab for more details');
        });
};

// Debug function to check cookies and session
window.debugSession = function() {
    console.log('🍪 Session Debug');
    console.log('================');
    
    console.log('Document cookies:', document.cookie);
    console.log('Current domain:', window.location.hostname);
    console.log('Current protocol:', window.location.protocol);
    
    // Test auth endpoint
    if (typeof API_CONFIG !== 'undefined') {
        console.log('🔄 Testing auth endpoint...');
        
        API_CONFIG.fetch(API_CONFIG.ENDPOINTS.ME)
            .then(response => {
                console.log('✅ Auth response status:', response.status);
                console.log('✅ Response headers:', Object.fromEntries(response.headers.entries()));
                
                if (response.status === 401) {
                    console.log('ℹ️  Expected 401 - not authenticated');
                } else if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error(`Unexpected status: ${response.status}`);
                }
            })
            .then(data => {
                if (data) {
                    console.log('✅ Auth data:', data);
                }
            })
            .catch(error => {
                console.error('❌ Auth error:', error);
            });
    }
};

// Auto-run basic debug on load
if (typeof window !== 'undefined') {
    console.log('🚀 GiyaPay Debug Console loaded');
    console.log('Available commands:');
    console.log('  debugAPI() - Test API configuration');
    console.log('  debugBlog() - Test blog loading');
    console.log('  debugSession() - Test session/cookies');
    console.log('');
    console.log('Run debugAPI() to start debugging...');
}
