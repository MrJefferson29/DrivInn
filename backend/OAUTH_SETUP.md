# OAuth Setup Guide

## Google OAuth Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:5000/auth/google/callback` (for development)
   - `https://yourdomain.com/auth/google/callback` (for production)
7. Copy the Client ID and Client Secret

### 2. Environment Variables

Add to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Backend URL
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Session Secret
SESSION_SECRET=your-super-secret-session-key
```

## Facebook OAuth Setup

### 1. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add Facebook Login product to your app
4. Go to "Settings" > "Basic"
5. Add your domain to "App Domains"
6. Go to "Facebook Login" > "Settings"
7. Add Valid OAuth Redirect URIs:
   - `http://localhost:5000/auth/facebook/callback` (for development)
   - `https://yourdomain.com/auth/facebook/callback` (for production)
8. Copy the App ID and App Secret

### 2. Environment Variables

Add to your `.env` file:

```env
# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

## Complete Environment Configuration

```env
# Database
MONGODB_URI=mongodb://localhost:27017/airbnb-clone

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# URLs
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Session
SESSION_SECRET=your-super-secret-session-key

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Cloudinary
CLOUD_NAME=your-cloud-name
API_KEY=your-api-key
API_SECRET=your-api-secret
```

## Testing OAuth

### 1. Start the Servers

```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm start
```

### 2. Test Google Login

1. Navigate to `http://localhost:3000/login`
2. Click "Continue with Google"
3. Complete Google OAuth flow
4. Should redirect to success page and then home

### 3. Test Facebook Login

1. Navigate to `http://localhost:3000/login`
2. Click "Continue with Facebook"
3. Complete Facebook OAuth flow
4. Should redirect to success page and then home

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI" error**
   - Check that your redirect URIs match exactly in Google/Facebook console
   - Ensure no trailing slashes

2. **"App not configured" error**
   - Make sure your app is in "Live" mode (Facebook)
   - Check that the API is enabled (Google)

3. **"Session error"**
   - Ensure SESSION_SECRET is set
   - Check that express-session is properly configured

4. **"CORS error"**
   - Verify CORS configuration in server.js
   - Check that FRONTEND_URL is set correctly

### Security Notes:

- Never commit OAuth secrets to version control
- Use environment variables for all sensitive data
- Set up proper HTTPS for production
- Configure app domains correctly
- Use strong session secrets

## Production Deployment

### 1. Update Redirect URIs

Change all redirect URIs to your production domain:

```
https://yourdomain.com/auth/google/callback
https://yourdomain.com/auth/facebook/callback
```

### 2. Environment Variables

Update all URLs to production:

```env
BACKEND_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### 3. HTTPS Setup

Ensure your production server has HTTPS enabled for secure OAuth flows.

### 4. Domain Verification

- Google: Add your domain to authorized domains
- Facebook: Add your domain to app domains 