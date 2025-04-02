const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const router = express.Router();

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to verify mobile if needed
    if (!req.user.mobile) {
      res.redirect('/login?googleAuth=true');
    } else {
      // Update last login time
      req.user.lastLogin = new Date();
      req.user.save();
      
      res.redirect('/');
    }
  }
);

// OTP auth routes
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/link-mobile', authController.linkMobile);

// Session management
router.get('/status', authController.getAuthStatus);
router.get('/logout', authController.logout);

module.exports = router; 