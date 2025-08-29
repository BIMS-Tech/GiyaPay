const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'giyapay_blog'
};

async function generateSitemap() {
    let connection;
    
    try {
        // Connect to database
        connection = await mysql.createConnection(dbConfig);
        
        // Get published blog posts
        const [posts] = await connection.execute(
            'SELECT id, title, date_published FROM blog_posts WHERE status = ? ORDER BY date_published DESC',
            ['published']
        );
        
        // Start building sitemap
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main pages -->
  <url>
    <loc>https://giyapay.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <url>
    <loc>https://giyapay.com/blog.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://giyapay.com/faq.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://giyapay.com/contact.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://giyapay.com/privacy-policy.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <!-- FAQ sub-pages -->
  <url>
    <loc>https://giyapay.com/frequently-asked-questions/general.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>https://giyapay.com/frequently-asked-questions/getting-started.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>https://giyapay.com/frequently-asked-questions/pricing.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>https://giyapay.com/frequently-asked-questions/account-activation.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>https://giyapay.com/frequently-asked-questions/payment-link-feature.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>https://giyapay.com/frequently-asked-questions/payments-settlement.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>https://giyapay.com/frequently-asked-questions/finance.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>https://giyapay.com/frequently-asked-questions/transaction-and-settlement-flow.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>https://giyapay.com/frequently-asked-questions/merchant-dashboard-and-downloading-reports.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>https://giyapay.com/frequently-asked-questions/after-sales-request-and-support.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>https://giyapay.com/frequently-asked-questions/concerns-handling.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>https://giyapay.com/frequently-asked-questions/user-journey-for-payor.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>https://giyapay.com/frequently-asked-questions/payment-links-journey.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>https://giyapay.com/frequently-asked-questions/security-level-and-sla.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
        
        // Add blog posts
        if (posts.length > 0) {
            sitemap += '\n  <!-- Blog posts -->';
            
            posts.forEach(post => {
                const lastmod = new Date(post.date_published).toISOString().split('T')[0];
                sitemap += `
  <url>
    <loc>https://giyapay.com/blog-post.html?id=${post.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
            });
        }
        
        sitemap += '\n</urlset>';
        
        // Write sitemap to frontend directory
        const sitemapPath = path.join(__dirname, '../frontend/sitemap.xml');
        fs.writeFileSync(sitemapPath, sitemap);
        
        console.log(`✅ Sitemap generated successfully with ${posts.length} blog posts`);
        console.log(`📁 Sitemap saved to: ${sitemapPath}`);
        
    } catch (error) {
        console.error('❌ Error generating sitemap:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the script
generateSitemap();
