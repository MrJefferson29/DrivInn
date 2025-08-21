const express = require('express');
const passport = require('passport');
const { generateSocialLoginToken } = require('../config/passport');

const router = express.Router();

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'https://driv-inn.vercel.app'}/login?error=Google authentication failed`);
      }

      const token = generateSocialLoginToken(req.user);
      
      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL || 'https://driv-inn.vercel.app'}/social-login-success?token=${token}&provider=google`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'https://driv-inn.vercel.app'}/login?error=Authentication failed`);
    }
  }
);

module.exports = router; 