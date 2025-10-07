#!/usr/bin/env node

/**
 * Performance Test Script for GiyaPay Blog API
 * Tests the performance improvements made to the blog loading system
 */

const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';
const TEST_ITERATIONS = 5;

// Helper function to make HTTP requests
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const startTime = performance.now();
        const client = url.startsWith('https') ? https : http;
        
        client.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const endTime = performance.now();
                const responseTime = endTime - startTime;
                
                resolve({
                    statusCode: res.statusCode,
                    responseTime: responseTime,
                    contentLength: data.length,
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
async function runPerformanceTest() {
    console.log('🚀 Starting GiyaPay Blog Performance Test...\n');
    console.log(`API Base URL: ${API_BASE_URL}`);
    console.log(`Test Iterations: ${TEST_ITERATIONS}\n`);
    
    const tests = [
        {
            name: 'Health Check',
            url: `${API_BASE_URL}/api/health`,
            expectedStatus: 200
        },
        {
            name: 'Blog Posts Preview (Lightweight)',
            url: `${API_BASE_URL}/api/posts/preview?status=published&limit=10`,
            expectedStatus: 200
        },
        {
            name: 'Blog Posts Full (Heavy)',
            url: `${API_BASE_URL}/api/posts?status=published&limit=10`,
            expectedStatus: 200
        }
    ];
    
    for (const test of tests) {
        console.log(`📊 Testing: ${test.name}`);
        console.log(`URL: ${test.url}`);
        
        const results = [];
        
        for (let i = 0; i < TEST_ITERATIONS; i++) {
            try {
                const result = await makeRequest(test.url);
                results.push(result);
                
                if (result.statusCode === test.expectedStatus) {
                    console.log(`  ✅ Iteration ${i + 1}: ${result.responseTime.toFixed(2)}ms (${(result.contentLength / 1024).toFixed(2)}KB)`);
                } else {
                    console.log(`  ❌ Iteration ${i + 1}: Status ${result.statusCode} (Expected ${test.expectedStatus})`);
                }
            } catch (error) {
                console.log(`  ❌ Iteration ${i + 1}: Error - ${error.message}`);
            }
        }
        
        // Calculate statistics
        const successfulResults = results.filter(r => r.statusCode === test.expectedStatus);
        if (successfulResults.length > 0) {
            const avgResponseTime = successfulResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulResults.length;
            const minResponseTime = Math.min(...successfulResults.map(r => r.responseTime));
            const maxResponseTime = Math.max(...successfulResults.map(r => r.responseTime));
            const avgContentLength = successfulResults.reduce((sum, r) => sum + r.contentLength, 0) / successfulResults.length;
            
            console.log(`  📈 Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
            console.log(`  📈 Min Response Time: ${minResponseTime.toFixed(2)}ms`);
            console.log(`  📈 Max Response Time: ${maxResponseTime.toFixed(2)}ms`);
            console.log(`  📈 Average Content Size: ${(avgContentLength / 1024).toFixed(2)}KB`);
            
            // Check for caching headers
            const firstResult = successfulResults[0];
            if (firstResult.headers['x-cache']) {
                console.log(`  🗄️  Cache Status: ${firstResult.headers['x-cache']}`);
            }
            if (firstResult.headers['cache-control']) {
                console.log(`  🗄️  Cache Control: ${firstResult.headers['cache-control']}`);
            }
        }
        
        console.log('');
    }
    
    console.log('✅ Performance test completed!');
    console.log('\n💡 Performance Tips:');
    console.log('  - Use /api/posts/preview for faster blog listing');
    console.log('  - Implement pagination to reduce payload size');
    console.log('  - Enable browser caching for static assets');
    console.log('  - Use compression for API responses');
    console.log('  - Consider CDN for image delivery');
}

// Run the test
if (require.main === module) {
    runPerformanceTest().catch(console.error);
}

module.exports = { runPerformanceTest, makeRequest };
