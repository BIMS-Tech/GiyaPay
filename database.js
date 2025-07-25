const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const config = require('./config');

class Database {
    constructor() {
        this.pool = null;
        this.initialize();
    }

    async initialize() {
        try {
            // Create connection pool
            this.pool = mysql.createPool(config.DB_CONFIG);
            console.log('Connected to MySQL database');
            
            // Test connection
            const connection = await this.pool.getConnection();
            console.log('Database connection test successful');
            connection.release();
            
            // Create tables
            await this.createTables();
            await this.createDefaultAdmin();
            
        } catch (error) {
            console.error('Error initializing database:', error.message);
        }
    }

    async createTables() {
        try {
            // Create users table
            const createUsersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP NULL,
                    is_active BOOLEAN DEFAULT 1
                )
            `;

            const [result] = await this.pool.execute(createUsersTable);
            console.log('Users table created or already exists');

            // Create blog_posts table
            const createBlogPostsTable = `
                CREATE TABLE IF NOT EXISTS blog_posts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(500) NOT NULL,
                    summary TEXT,
                    content LONGTEXT NOT NULL,
                    featured_image VARCHAR(500),
                    category VARCHAR(100) DEFAULT 'General',
                    author_id INT NOT NULL,
                    date_published VARCHAR(100) NOT NULL,
                    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
                    views INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT NULL,
                    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `;

            const [blogResult] = await this.pool.execute(createBlogPostsTable);
            console.log('Blog posts table created or already exists');
            
        } catch (error) {
            console.error('Error creating tables:', error.message);
        }
    }

    async createDefaultAdmin() {
        const { email, password } = config.DEFAULT_ADMIN;
        
        try {
            // Check if admin user already exists
            const [rows] = await this.pool.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (rows.length === 0) {
                // Create default admin user
                const hashedPassword = await bcrypt.hash(password, 10);
                await this.pool.execute(
                    'INSERT INTO users (email, password) VALUES (?, ?)',
                    [email, hashedPassword]
                );
                
                console.log(`✅ Default admin user created: ${email}`);
                console.log(`🔑 Default password: ${password}`);
                console.log('⚠️  Please change the default password after first login!');
            } else {
                console.log('Admin user already exists');
            }
        } catch (error) {
            console.error('Error creating admin user:', error.message);
        }
    }

    // User authentication methods
    async authenticateUser(email, password) {
        try {
            const [rows] = await this.pool.execute(
                'SELECT * FROM users WHERE email = ? AND is_active = 1',
                [email]
            );

            if (rows.length === 0) {
                return null; // User not found
            }

            const user = rows[0];
            const isValid = await bcrypt.compare(password, user.password);
            
            if (isValid) {
                // Update last login
                await this.pool.execute(
                    'UPDATE users SET last_login = NOW() WHERE id = ?',
                    [user.id]
                );
                
                return {
                    id: user.id,
                    email: user.email,
                    created_at: user.created_at,
                    last_login: user.last_login
                };
            } else {
                return null; // Invalid password
            }
        } catch (error) {
            throw error;
        }
    }

    async getUserById(id) {
        try {
            const [rows] = await this.pool.execute(
                'SELECT id, email, created_at, last_login FROM users WHERE id = ? AND is_active = 1',
                [id]
            );
            
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    async changePassword(userId, newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const [result] = await this.pool.execute(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, userId]
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Blog Posts Methods
    async createBlogPost(postData) {
        try {
            const { title, summary, content, featured_image, category, author_id, date_published, status } = postData;
            
            const [result] = await this.pool.execute(
                'INSERT INTO blog_posts (title, summary, content, featured_image, category, author_id, date_published, status, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
                [title, summary, content, featured_image, category || 'General', author_id, date_published, status || 'published']
            );
            
            return { id: result.insertId, ...postData };
        } catch (error) {
            console.error('Error creating blog post:', error.message);
            throw error;
        }
    }

    async getAllBlogPosts(status = 'published') {
        try {
            let query, params;
            
            if (status === 'all') {
                query = 'SELECT bp.*, u.email as author_email FROM blog_posts bp LEFT JOIN users u ON bp.author_id = u.id ORDER BY bp.created_at DESC';
                params = [];
            } else {
                query = 'SELECT bp.*, u.email as author_email FROM blog_posts bp LEFT JOIN users u ON bp.author_id = u.id WHERE bp.status = ? ORDER BY bp.created_at DESC';
                params = [status];
            }
            
            const [rows] = await this.pool.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Error fetching blog posts:', error.message);
            throw error;
        }
    }

    async getBlogPostById(id) {
        try {
            const [rows] = await this.pool.execute(
                'SELECT bp.*, u.email as author_email FROM blog_posts bp LEFT JOIN users u ON bp.author_id = u.id WHERE bp.id = ?',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error fetching blog post by ID:', error.message);
            throw error;
        }
    }

    async updateBlogPost(id, postData) {
        try {
            const { title, summary, content, featured_image, category, date_published, status } = postData;
            
            const [result] = await this.pool.execute(
                'UPDATE blog_posts SET title = ?, summary = ?, content = ?, featured_image = ?, category = ?, date_published = ?, status = ?, updated_at = NOW() WHERE id = ?',
                [title, summary, content, featured_image, category, date_published, status, id]
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating blog post:', error.message);
            throw error;
        }
    }

    async deleteBlogPost(id) {
        try {
            const [result] = await this.pool.execute(
                'DELETE FROM blog_posts WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting blog post:', error.message);
            throw error;
        }
    }

    async incrementViews(id) {
        try {
            const [result] = await this.pool.execute(
                'UPDATE blog_posts SET views = views + 1 WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error incrementing views:', error.message);
            throw error;
        }
    }

    async getBlogStats() {
        try {
            const [totalRows] = await this.pool.execute(
                'SELECT COUNT(*) as total FROM blog_posts WHERE status = "published"'
            );
            
            const [monthlyRows] = await this.pool.execute(
                'SELECT COUNT(*) as monthly FROM blog_posts WHERE status = "published" AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)'
            );
            
            const [viewsRows] = await this.pool.execute(
                'SELECT SUM(views) as total_views FROM blog_posts WHERE status = "published"'
            );
            
            return {
                total: totalRows[0].total,
                monthly: monthlyRows[0].monthly,
                views: viewsRows[0].total_views || 0
            };
        } catch (error) {
            console.error('Error fetching blog stats:', error.message);
            throw error;
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            console.log('Database connection pool closed');
        }
    }

    // Additional utility methods
    async testConnection() {
        try {
            const connection = await this.pool.getConnection();
            const [rows] = await connection.execute('SELECT 1 as test');
            connection.release();
            return rows[0].test === 1;
        } catch (error) {
            console.error('Database connection test failed:', error.message);
            return false;
        }
    }
}

module.exports = Database; 