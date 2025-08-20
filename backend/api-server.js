// Load environment variables
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const cors = require('cors');
const Database = require('./database');
const config = require('./config');

const app = express();
// Respect Cloud Run PORT; fallback to configured API_PORT or 3001
const API_PORT = Number(process.env.PORT || config.API_PORT || 3001);
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Trust proxy (required for secure cookies behind Cloud Run/Proxies)
app.set('trust proxy', 1);

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure CORS to allow frontend to communicate with API
const defaultAllowed = ['http://localhost:3000', 'http://localhost:3002'];
const envAllowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const allowedOrigins = [...new Set([...defaultAllowed, ...envAllowed])];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow localhost development
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }
        
        // Allow specific origins
        if (allowedOrigins.includes(origin)) return callback(null, true);
        
        return callback(new Error('CORS origin not allowed: ' + origin), false);
    },
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Requested-With']
}));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed!'), false);
    }
});

// Initialize database
const db = new Database();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration with MySQL store
const isProduction = (process.env.NODE_ENV || '').toLowerCase() === 'production';
const sessionStore = new MySQLStore({
    host: config.DB_CONFIG.host,
    port: config.DB_CONFIG.port,
    user: config.DB_CONFIG.user,
    password: config.DB_CONFIG.password,
    database: config.DB_CONFIG.database,
    clearExpired: true,
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: Number(process.env.SESSION_MAX_AGE || 86400000),
    createDatabaseTable: true
});

app.use(session({
    secret: config.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: isProduction, // Only use secure cookies in production
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: Number(process.env.SESSION_MAX_AGE || 86400000)
    }
}));

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/uploads', express.static(UPLOADS_DIR));

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) return next();
    return res.status(401).json({ message: 'Authentication required' });
};

// API Routes only - no static file serving

// Test database connection endpoint
app.get('/api/db-test', async (req, res) => {
    try {
        const isConnected = await db.testConnection();
        res.json({ 
            status: isConnected ? 'connected' : 'disconnected',
            message: isConnected ? 'Database connection successful' : 'Database connection failed'
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: error.message 
        });
    }
});

// Test session endpoint
app.get('/api/session-test', (req, res) => {
    res.json({
        sessionID: req.sessionID,
        session: req.session,
        cookies: req.headers.cookie,
        userAgent: req.headers['user-agent'],
        origin: req.headers.origin,
        referer: req.headers.referer
    });
});

// Authentication Routes
app.post('/api/auth/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt for:', email);

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await db.authenticateUser(email, password);
        
        if (user) {
            console.log('User authenticated, setting session...');
            req.session.userId = user.id;
            req.session.userEmail = user.email;
            
            // Save session explicitly
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.status(500).json({ message: 'Session error' });
                }
                
                console.log('Session saved successfully');
                console.log('Session ID:', req.sessionID);
                console.log('Session data:', req.session);
                
                res.json({ 
                    message: 'Login successful',
                    user: {
                        id: user.id,
                        email: user.email
                    }
                });
            });
        } else {
            console.log('Authentication failed for:', email);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.json({ message: 'Logout successful' });
    });
});

app.get('/api/auth/me', async (req, res) => {
    console.log('Auth check request received');
    console.log('Session ID:', req.sessionID);
    console.log('Session data:', req.session);
    console.log('Cookies:', req.headers.cookie);
    
    if (req.session && req.session.userId) {
        console.log('Session found, user ID:', req.session.userId);
        try {
            const user = await db.getUserById(req.session.userId);
            if (user) {
                console.log('User found:', user.email);
                res.json({ 
                    user: {
                        id: user.id,
                        email: user.email,
                        created_at: user.created_at,
                        last_login: user.last_login
                    }
                });
            } else {
                console.log('User not found in database');
                res.status(401).json({ message: 'User not found' });
            }
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        console.log('No session or no user ID in session');
        res.status(401).json({ message: 'Not authenticated' });
    }
});

// API to get all blog posts (previews)
app.get('/api/posts', async (req, res) => {
    try {
        const status = req.query.status || 'published';
        const posts = await db.getAllBlogPosts(status);
        res.json(posts);
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({ message: 'Error reading blog posts' });
    }
});

// API to get blog stats for dashboard
app.get('/api/blog-stats', requireAuth, async (req, res) => {
    try {
        const stats = await db.getBlogStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching blog stats:', error);
        res.status(500).json({ message: 'Error fetching blog statistics' });
    }
});

// API to get a single blog post by ID
app.get('/api/posts/:id', async (req, res) => {
    try {
        const post = await db.getBlogPostById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Blog post not found' });
        }
        
        // Increment view count
        await db.incrementViews(req.params.id);
        
        res.json(post);
    } catch (error) {
        console.error('Error fetching blog post:', error);
        res.status(500).json({ message: 'Error fetching blog post' });
    }
});

// API to create a new blog post (protected)
app.post('/api/posts', requireAuth, upload.single('featured_image'), async (req, res) => {
    try {
        const { title, summary, content, category, date_published, status } = req.body;

        if (!title || !content || !date_published) {
            return res.status(400).json({ message: 'Title, content, and date are required fields' });
        }

        // Handle uploaded image
        let featured_image = null;
        if (req.file) {
            featured_image = `/uploads/${req.file.filename}`;
        }

        const postData = {
            title,
            summary,
            content,
            featured_image,
            category: category || 'General',
            author_id: req.session.userId,
            date_published,
            status: status || 'published'
        };

        const newPost = await db.createBlogPost(postData);
        
        res.json({ 
            message: 'Blog post created successfully', 
            post: newPost
        });
    } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({ message: 'Error creating blog post' });
    }
});

// API to update a blog post (protected)
app.put('/api/posts/:id', requireAuth, upload.single('featured_image'), async (req, res) => {
    try {
        const postId = req.params.id;
        const { title, summary, content, category, date_published, status } = req.body;

        if (!title || !content || !date_published) {
            return res.status(400).json({ message: 'Title, content, and date are required fields' });
        }

        // Get existing post to preserve image if no new one uploaded
        const existingPost = await db.getBlogPostById(postId);
        if (!existingPost) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        // Handle uploaded image
        let featured_image = existingPost.featured_image; // Keep existing image by default
        if (req.file) {
            featured_image = `/uploads/${req.file.filename}`;
            
            // Delete old image file if it exists
            if (existingPost.featured_image) {
                const oldImagePath = path.join(__dirname, existingPost.featured_image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        const postData = {
            title,
            summary,
            content,
            featured_image,
            category: category || 'General',
            date_published,
            status: status || 'published'
        };

        const success = await db.updateBlogPost(postId, postData);
        
        if (success) {
            res.json({ message: 'Blog post updated successfully' });
        } else {
            res.status(404).json({ message: 'Blog post not found' });
        }
    } catch (error) {
        console.error('Error updating blog post:', error);
        res.status(500).json({ message: 'Error updating blog post' });
    }
});

// API to delete a blog post (protected)
app.delete('/api/posts/:id', requireAuth, async (req, res) => {
    try {
        const postId = req.params.id;
        
        // Get post to delete associated image
        const post = await db.getBlogPostById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        // Delete image file if it exists
        if (post.featured_image) {
            const imagePath = path.join(__dirname, post.featured_image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        const success = await db.deleteBlogPost(postId);
        
        if (success) {
            res.json({ message: 'Blog post deleted successfully' });
        } else {
            res.status(404).json({ message: 'Blog post not found' });
        }
    } catch (error) {
        console.error('Error deleting blog post:', error);
        res.status(500).json({ message: 'Error deleting blog post' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'GiyaPay API Server',
        timestamp: new Date().toISOString()
    });
});

// Start API server
app.listen(API_PORT, () => {
    console.log(`🚀 API Server running on port ${API_PORT}`);
    console.log(`📊 Health check: http://localhost:${API_PORT}/api/health`);
}); 