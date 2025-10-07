/**
 * Performance Monitoring Script for GiyaPay Blog
 * Tracks Core Web Vitals and other performance metrics
 */

(function() {
    'use strict';
    
    // Performance monitoring configuration
    const config = {
        sampleRate: 1.0, // 100% sampling rate for now
        endpoint: '/api/performance-metrics', // You can add this endpoint later
        debug: true
    };
    
    // Check if performance API is available
    if (!window.performance || !window.performance.getEntriesByType) {
        console.warn('Performance API not available');
        return;
    }
    
    // Core Web Vitals tracking
    function trackCoreWebVitals() {
        // First Contentful Paint (FCP)
        const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
        if (fcpEntry) {
            logMetric('FCP', fcpEntry.startTime);
        }
        
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                logMetric('LCP', lastEntry.startTime);
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        }
        
        // First Input Delay (FID)
        if ('PerformanceObserver' in window) {
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    logMetric('FID', entry.processingStart - entry.startTime);
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });
        }
        
        // Cumulative Layout Shift (CLS)
        if ('PerformanceObserver' in window) {
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                logMetric('CLS', clsValue);
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
    }
    
    // Track resource loading performance
    function trackResourcePerformance() {
        const resources = performance.getEntriesByType('resource');
        const resourceMetrics = {
            totalResources: resources.length,
            totalSize: 0,
            loadTime: 0,
            slowResources: []
        };
        
        resources.forEach((resource) => {
            resourceMetrics.totalSize += resource.transferSize || 0;
            resourceMetrics.loadTime += resource.duration;
            
            // Track slow resources (>1s)
            if (resource.duration > 1000) {
                resourceMetrics.slowResources.push({
                    name: resource.name,
                    duration: resource.duration,
                    size: resource.transferSize || 0
                });
            }
        });
        
        logMetric('ResourceMetrics', resourceMetrics);
    }
    
    // Track blog-specific metrics
    function trackBlogMetrics() {
        // Time to blog content load
        const blogLoadStart = performance.now();
        
        // Check if blog posts are loaded
        const checkBlogLoaded = () => {
            const blogContainer = document.querySelector('.w-tab-pane.w--tab-active');
            if (blogContainer && blogContainer.children.length > 0) {
                const blogLoadTime = performance.now() - blogLoadStart;
                logMetric('BlogLoadTime', blogLoadTime);
                
                // Count loaded posts
                const posts = blogContainer.querySelectorAll('.article');
                logMetric('BlogPostsLoaded', posts.length);
            } else {
                // Check again in 100ms
                setTimeout(checkBlogLoaded, 100);
            }
        };
        
        checkBlogLoaded();
    }
    
    // Log metric function
    function logMetric(name, value) {
        const metric = {
            name: name,
            value: value,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        if (config.debug) {
            console.log(`📊 Performance Metric: ${name} = ${value}`);
        }
        
        // Store in sessionStorage for debugging
        try {
            const existingMetrics = JSON.parse(sessionStorage.getItem('performanceMetrics') || '[]');
            existingMetrics.push(metric);
            sessionStorage.setItem('performanceMetrics', JSON.stringify(existingMetrics));
        } catch (e) {
            console.warn('Could not store performance metrics:', e);
        }
        
        // Send to analytics endpoint (if available) - disabled for now
        // if (config.endpoint && typeof API_CONFIG !== 'undefined') {
        //     API_CONFIG.fetch(config.endpoint, {
        //         method: 'POST',
        //         body: JSON.stringify(metric)
        //     }).catch(err => {
        //         if (config.debug) {
        //             console.warn('Could not send performance metric:', err);
        //         }
        //     });
        // }
    }
    
    // Initialize performance monitoring
    function init() {
        // Wait for page load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startMonitoring);
        } else {
            startMonitoring();
        }
    }
    
    function startMonitoring() {
        // Track Core Web Vitals
        trackCoreWebVitals();
        
        // Track resource performance after page load
        window.addEventListener('load', () => {
            setTimeout(trackResourcePerformance, 1000);
            trackBlogMetrics();
        });
        
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                logMetric('PageHidden', performance.now());
            } else {
                logMetric('PageVisible', performance.now());
            }
        });
    }
    
    // Expose debugging functions
    window.getPerformanceMetrics = function() {
        try {
            return JSON.parse(sessionStorage.getItem('performanceMetrics') || '[]');
        } catch (e) {
            return [];
        }
    };
    
    window.clearPerformanceMetrics = function() {
        sessionStorage.removeItem('performanceMetrics');
    };
    
    // Start monitoring
    init();
    
    // Log initialization
    if (config.debug) {
        console.log('🚀 Performance monitoring initialized');
        console.log('Available functions: getPerformanceMetrics(), clearPerformanceMetrics()');
    }
})();
