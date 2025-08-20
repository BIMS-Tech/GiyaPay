# GiyaPay Blog Management System

A full-stack blog management system with admin panel and public blog pages.

## Features

- **Admin Panel**: Create, edit, publish/unpublish, and delete blog posts
- **Public Blog**: Responsive blog listing and individual post pages
- **Image Upload**: Featured image support with automatic resizing
- **Authentication**: Secure admin login with session management
- **Rich Content**: HTML/CSS support in blog content
- **Status Management**: Draft and published post states

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd giyapay.webflow
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install
   
   # Frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment**
   ```bash
   cd ../backend
   cp environment.template .env
   # Edit .env with your database credentials
   ```

4. **Start the servers**
   ```bash
   # Start backend (from backend directory)
   npm start
   
   # Start frontend (from frontend directory, in new terminal)
   cd ../frontend
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3002
   - Admin Panel: http://localhost:3002/admin/
   - Backend API: http://localhost:3001

## Backend URL Configuration

The frontend automatically detects the backend URL based on the current domain:

### Development (localhost)
- **Frontend**: `http://localhost:3002`
- **Backend**: `http://localhost:3001`

### Production (giyapay.com)
- **Frontend**: `https://giyapay.com`
- **Backend**: `https://giyapaywebbackend-278278033724.asia-east2.run.app`

### How to Control Backend URL

1. **For Local Development**: 
   - The API config automatically uses `http://localhost:3001` when running on localhost
   - No changes needed

2. **For Production**: 
   - The API config automatically uses the Google Cloud Run URL when running on giyapay.com
   - To change the backend URL, edit `frontend/js/api-config.js`:
   ```javascript
   BASE_URL: (() => {
       const hostname = window.location.hostname;
       if (hostname === 'localhost' || hostname === '127.0.0.1') {
           return 'http://localhost:3001'; // Development
       } else if (hostname.includes('giyapay.com')) {
           return 'https://your-new-backend-url.com'; // Production
       } else {
           return 'https://your-new-backend-url.com'; // Fallback
       }
   })(),
   ```

3. **CORS Configuration**:
   - The backend is configured to allow requests from `giyapay.com` domains
   - If you change the frontend domain, update the CORS settings in `backend/api-server.js`

## Environment Variables

Copy `environment.template` to `.env` and update the values:

### Required Variables
- `DB_HOST`: MySQL database host
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `SESSION_SECRET`: Secret key for session encryption
- `DEFAULT_ADMIN_EMAIL`: Initial admin email
- `DEFAULT_ADMIN_PASSWORD`: Initial admin password

### Optional Variables
- `NODE_ENV`: Environment (development/production)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins
- `SESSION_MAX_AGE`: Session timeout in milliseconds

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Get current user

### Blog Posts
- `GET /api/posts` - Get all posts (with optional status filter)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `PUT /api/posts/:id/status` - Update post status (publish/unpublish)
- `DELETE /api/posts/:id` - Delete post

### Health & Stats
- `GET /api/health` - Health check
- `GET /api/blog-stats` - Blog statistics

## File Structure

```
├── backend/
│   ├── api-server.js      # Main API server
│   ├── database.js        # Database operations
│   ├── config.js          # Configuration
│   └── uploads/           # Image uploads
├── frontend/
│   ├── admin/             # Admin panel pages
│   ├── js/                # JavaScript files
│   ├── css/               # Stylesheets
│   └── images/            # Static images
└── environment.template   # Environment variables template
```

## Troubleshooting

### CORS Issues
If you get CORS errors:
1. Check that the frontend domain is in the allowed origins
2. Verify the backend URL is correct in `api-config.js`
3. Ensure the backend is running and accessible

### Database Issues
1. Verify database credentials in `.env`
2. Check database connection with `GET /api/db-test`
3. Ensure MySQL is running and accessible

### Image Upload Issues
1. Check that the `uploads` directory exists and is writable
2. Verify file size limits (default: 5MB)
3. Ensure only image files are being uploaded

## Deployment

### Backend (Google Cloud Run)
1. Build and deploy the backend to Google Cloud Run
2. Update the `BACKEND_URL` in the frontend configuration
3. Set environment variables in Cloud Run

### Frontend (Webflow/Static Hosting)
1. Upload frontend files to your hosting provider
2. Ensure the domain is configured in CORS settings
3. Test all functionality after deployment

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the console logs for errors
3. Verify all environment variables are set correctly
