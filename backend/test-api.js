#!/usr/bin/env node

/**
 * Simple API Test Script
 * Tests the basic API endpoints to ensure they're working
 */

const http = require('http');
const https = require('https');

// Configuration
const API_BASE_URL = process.env.API_URL || 'https://backend.giyapay.com';

// Helper function to make HTTP requests
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        
        client.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data
                });
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Test function
async function testAPI() {
    console.log('🧪 Testing GiyaPay API Endpoints...\n');
    console.log(`API Base URL: ${API_BASE_URL}\n`);
    
    const tests = [
        {
            name: 'Health Check',
            url: `${API_BASE_URL}/api/health`,
            expectedStatus: 200
        },
        {
            name: 'Blog Posts Preview (Public)',
            url: `${API_BASE_URL}/api/posts/preview?status=published&limit=5`,
            expectedStatus: 200
        },
        {
            name: 'Blog Posts Full (Public)',
            url: `${API_BASE_URL}/api/posts?status=published&limit=5`,
            expectedStatus: 200
        },
        {
            name: 'Auth Check (Should be 401)',
            url: `${API_BASE_URL}/api/auth/me`,
            expectedStatus: 401
        }
    ];
    
    for (const test of tests) {
        console.log(`📊 Testing: ${test.name}`);
        console.log(`URL: ${test.url}`);
        
        try {
            const result = await makeRequest(test.url);
            
            if (result.statusCode === test.expectedStatus) {
                console.log(`  ✅ Status: ${result.statusCode} (Expected: ${test.expectedStatus})`);
                
                // Try to parse JSON response
                try {
                    const jsonData = JSON.parse(result.data);
                    if (test.name.includes('Preview')) {
                        console.log(`  📄 Response: ${jsonData.posts ? jsonData.posts.length : 0} posts`);
                        console.log(`  📄 Pagination: Page ${jsonData.pagination?.page || 'N/A'}`);
                    } else if (test.name.includes('Health')) {
                        console.log(`  📄 Service: ${jsonData.service || 'N/A'}`);
                    }
                } catch (e) {
                    console.log(`  📄 Response: ${result.data.substring(0, 100)}...`);
                }
            } else {
                console.log(`  ❌ Status: ${result.statusCode} (Expected: ${test.expectedStatus})`);
                console.log(`  📄 Response: ${result.data.substring(0, 200)}...`);
            }
            
            // Show important headers
            if (result.headers['cache-control']) {
                console.log(`  🗄️  Cache-Control: ${result.headers['cache-control']}`);
            }
            if (result.headers['x-cache']) {
                console.log(`  🗄️  X-Cache: ${result.headers['x-cache']}`);
            }
            
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
        }
        
        console.log('');
    }
    
    console.log('✅ API test completed!');
}

// Run the test
if (require.main === module) {
    testAPI().catch(console.error);
}

module.exports = { testAPI, makeRequest };
