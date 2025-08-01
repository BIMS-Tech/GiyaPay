# GiyaPay Website

A modern payment gateway website with separated frontend and backend architecture.

## 📁 Project Structure

```
giyapay.webflow/
├── frontend/                 # Frontend static files
│   ├── *.html              # All HTML pages
│   ├── css/                # Stylesheets
│   ├── js/                 # JavaScript files
│   ├── images/             # Images and assets
│   ├── admin/              # Admin panel pages
│   ├── frequently-asked-questions/  # FAQ pages
│   ├── frontend-server.js  # Frontend server
│   └── package.json        # Frontend dependencies
├── backend/                 # Backend API server
│   ├── api-server.js       # API server
│   ├── server.js           # Legacy server
│   ├── database.js         # Database operations
│   ├── config.js           # Configuration
│   ├── database.sqlite     # SQLite database
│   ├── uploads/            # Uploaded files
│   └── package.json        # Backend dependencies
├── start-servers.js        # Startup script for both servers
├── package.json            # Root package.json
└── .env                    # Environment variables
```

## 🚀 Quick Start

### Option 1: Start Both Servers Together
```bash
npm start
# or
node start-servers.js
```

### Option 2: Start Servers Separately

**Terminal 1 - Frontend:**
```bash
npm run frontend
# or
cd frontend && npm start
```

**Terminal 2 - Backend:**
```bash
npm run backend
# or
cd backend && npm start
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## 📦 Installation

### Install All Dependencies
```bash
npm run install:all
```

### Install Individual Components
```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend && npm install

# Backend dependencies
cd backend && npm install
```

## 🔧 Development

### Frontend Development
```bash
cd frontend
npm run dev
```

### Backend Development
```bash
cd backend
npm run dev
```

## 📋 Available Scripts

### Root Level
- `npm start` - Start both servers
- `npm run frontend` - Start frontend only
- `npm run backend` - Start backend only
- `npm run dev` - Start both servers in development
- `npm run install:all` - Install all dependencies

### Frontend
- `npm start` - Start frontend server
- `npm run dev` - Start in development mode

### Backend
- `npm start` - Start API server
- `npm run dev` - Start in development mode
- `npm run server` - Start legacy server

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
APP_PORT=3000  # Frontend server port
API_PORT=3001  # Backend API server port
NODE_ENV=development

# API Configuration
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# Database Configuration
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=3306

# Authentication Configuration
SESSION_SECRET=your_session_secret_key
SESSION_MAX_AGE=86400000

# Default Admin User
DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
DEFAULT_ADMIN_PASSWORD=your_admin_password
```

## 🏗️ Architecture Benefits

### ✅ **Separated Concerns**
- **Frontend**: Static files, HTML, CSS, JS
- **Backend**: API endpoints, database, business logic

### ✅ **Scalability**
- Can deploy frontend and backend to different servers
- Independent scaling of each component
- Load balancing capabilities

### ✅ **Development**
- Clear separation of frontend and backend code
- Independent development teams
- Easier debugging and maintenance

### ✅ **Security**
- API isolated from public static files
- Better access control
- Separate security configurations

## 🛠️ Technology Stack

### Frontend
- **HTML5/CSS3** - Static website
- **JavaScript** - Client-side functionality
- **Express.js** - Static file server

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **Multer** - File uploads
- **CORS** - Cross-origin requests
- **Express Session** - Authentication

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Blog Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get specific post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Health Check
- `GET /api/health` - Server health status
- `GET /api/db-test` - Database connection test

## 🚀 Deployment

### Frontend Deployment
- Can be deployed to any static hosting service
- CDN for better performance
- No server-side dependencies

### Backend Deployment
- Requires Node.js environment
- Database connection
- Environment variables configuration

## 📞 Support

For issues or questions, please contact the development team. 