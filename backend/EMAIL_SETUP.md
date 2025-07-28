# Email Setup Guide

## Gmail Configuration

To enable password reset emails, you need to configure Gmail SMTP:

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Enable 2-Factor Authentication

### 2. Generate App Password
- Go to Google Account > Security > 2-Step Verification
- Click on "App passwords"
- Generate a new app password for "Mail"
- Copy the generated password

### 3. Environment Variables
Add these to your `.env` file:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-from-step-2
FRONTEND_URL=http://localhost:3000
```

### 4. Alternative Email Services

#### Outlook/Hotmail
```javascript
// In emailService.js, change the transporter configuration:
const transporter = nodemailer.createTransporter({
  service: 'outlook',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

#### Custom SMTP Server
```javascript
// In emailService.js, change the transporter configuration:
const transporter = nodemailer.createTransporter({
  host: 'your-smtp-server.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## Testing Email Functionality

1. Start the backend server
2. Navigate to `/forgot-password` in the frontend
3. Enter a valid email address
4. Check your email for the reset link
5. Click the link to test the reset password flow

## Troubleshooting

### Common Issues:

1. **"Invalid credentials" error**
   - Make sure you're using an app password, not your regular Gmail password
   - Ensure 2-Factor Authentication is enabled

2. **"Connection timeout" error**
   - Check your internet connection
   - Verify the email service settings

3. **"Authentication failed" error**
   - Double-check your email and app password
   - Make sure the app password was generated for "Mail"

### Security Notes:

- Never commit your `.env` file to version control
- Use app passwords instead of your main password
- Consider using environment-specific email services for production 