# GiyaPay Domain Setup and Authentication

## Domain Configuration

### Backend Domain
- **Domain**: `backend.giyapay.com`
- **Purpose**: Dedicated API server for authentication and blog management
- **Protocol**: HTTPS (required for secure cookies in production)

### Frontend Domain
- **Domain**: `giyapay.com` or `www.giyapay.com`
- **Purpose**: Main website and admin interface
- **Protocol**: HTTPS

## Authentication Flow

1. **Login Request**: Frontend (`giyapay.com`) → Backend (`backend.giyapay.com`)
2. **Session Creation**: Backend creates session and sets secure cookie
3. **Cookie Domain**: `.giyapay.com` (allows sharing across subdomains)
4. **Authentication Check**: Frontend checks session via `/api/auth/me` endpoint

## Key Configuration Changes

### Frontend (`frontend/js/api-config.js`)
```javascript
BASE_URL: (() => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001'; // Development
    } else if (hostname.includes('giyapay.com')) {
        return 'https://backend.giyapay.com'; // Production
    } else {
        return 'https://backend.giyapay.com'; // Fallback
    }
})(),
```

### Backend (`backend/api-server.js`)
```javascript
// CORS Configuration
const defaultAllowed = [
    'http://localhost:3000', 
    'http://localhost:3002',
    'https://giyapay.com',
    'https://www.giyapay.com'
];

// Session Configuration
app.use(session({
    cookie: { 
        secure: isProduction,
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        domain: isProduction ? '.giyapay.com' : undefined,
        maxAge: Number(process.env.SESSION_MAX_AGE || 86400000)
    }
}));
```

## Testing the Setup

1. **Health Check**: Visit `https://backend.giyapay.com/api/health`
2. **Connection Test**: Use the "Test Backend Connection" button on login page
3. **Session Test**: Visit `https://backend.giyapay.com/api/session-test`

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check that `giyapay.com` is in allowed origins
2. **Cookie Issues**: Ensure `secure: true` and `sameSite: 'none'` in production
3. **Domain Mismatch**: Verify API calls go to `backend.giyapay.com`

### Debug Steps

1. Check browser console for API request logs
2. Verify cookies are being set (DevTools → Application → Cookies)
3. Test backend health endpoint directly
4. Check server logs for authentication errors

## Environment Variables

```bash
# Required for production
NODE_ENV=production
ALLOWED_ORIGINS=https://giyapay.com,https://www.giyapay.com
SESSION_SECRET=your_secure_session_secret
```
