const User = require('../models/User');
const OTP = require('../models/OTP');
const twilioService = require('../services/twilioService');

// Generate a 4-digit OTP code
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Updated sendOTP function with better error handling
exports.sendOTP = async (req, res) => {
  try {
    const { name, mobile } = req.body;
    
    if (!mobile) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }
    
    // Generate new OTP
    const otp = generateOTP();
    console.log(`Generated OTP: ${otp} for mobile: ${mobile}`);
    
    // Calculate expiry (5 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);
    
    // Save OTP to database first, so we have it even if SMS fails
    const otpRecord = await OTP.findOneAndUpdate(
      { mobile },
      { 
        mobile,
        code: otp,
        expiresAt,
        verified: false
      },
      { upsert: true, new: true }
    );
    
    console.log(`OTP record saved to database with ID: ${otpRecord._id}`);
    
    // Try to send OTP via Twilio
    let sent = false;
    let smsError = null;
    
    try {
      sent = await twilioService.sendOTP(mobile, otp);
    } catch (error) {
      smsError = error.message;
      console.error('SMS sending error:', error);
    }
    
    // Create or update user (without verification yet)
    let user = await User.findOne({ mobile });
    
    if (!user) {
      user = new User({ name, mobile });
      await user.save();
      console.log(`New user created with ID: ${user._id}`);
    } else if (name && name !== user.name) {
      user.name = name;
      await user.save();
      console.log(`User name updated for user ID: ${user._id}`);
    }
    
    // Even if SMS fails, provide OTP in development mode
    if (!sent) {
      if (process.env.NODE_ENV === 'development') {
        return res.json({ 
          success: true, 
          message: 'OTP saved but SMS failed to send. In development mode, OTP is returned for testing.',
          expiresAt,
          developmentOtp: otp,
          smsError
        });
      } else {
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to send OTP via SMS. Please try again later.',
          smsError
        });
      }
    }
    
    return res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      expiresAt
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Verify OTP submitted by user
exports.verifyOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    
    if (!mobile || !otp) {
      return res.status(400).json({ success: false, message: 'Mobile and OTP are required' });
    }
    
    // Find the OTP record
    const otpRecord = await OTP.findOne({ 
      mobile,
      code: otp,
      expiresAt: { $gt: new Date() },
      verified: false
    });
    
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    
    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();
    
    // Find and update user
    const user = await User.findOne({ mobile });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Mark user as verified
    user.isVerified = true;
    user.lastLogin = new Date();
    await user.save();
    
    // Set user session
    req.session.userId = user._id;
    
    return res.json({ 
      success: true, 
      message: 'OTP verified successfully',
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile
      }
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Resend OTP to user
exports.resendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;
    
    if (!mobile) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }
    
    // Check if user exists
    const user = await User.findOne({ mobile });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Generate new OTP
    const otp = generateOTP();
    
    // Calculate expiry (5 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);
    
    // Save OTP to database
    await OTP.findOneAndUpdate(
      { mobile },
      { 
        mobile,
        code: otp,
        expiresAt,
        verified: false
      },
      { upsert: true, new: true }
    );
    
    // Send OTP via Twilio
    const sent = await twilioService.sendOTP(mobile, otp);
    
    if (!sent) {
      return res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
    
    return res.json({ 
      success: true, 
      message: 'OTP resent successfully',
      expiresAt
    });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Link mobile number to Google account
exports.linkMobile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    const { mobile } = req.body;
    
    if (!mobile) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }
    
    // Check if mobile is already linked to another account
    const existingUser = await User.findOne({ mobile, _id: { $ne: req.user._id } });
    
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'This mobile number is already linked to another account' });
    }
    
    // Update user with mobile number
    req.user.mobile = mobile;
    req.user.lastLogin = new Date();
    await req.user.save();
    
    return res.json({ 
      success: true, 
      message: 'Mobile number linked successfully',
      user: {
        id: req.user._id,
        name: req.user.name,
        mobile: req.user.mobile
      }
    });
  } catch (error) {
    console.error('Link Mobile Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get authenticated user info
exports.getAuthStatus = (req, res) => {
  if (req.user) {
    return res.json({ 
      isAuthenticated: true, 
      user: {
        id: req.user._id,
        name: req.user.name,
        mobile: req.user.mobile,
        email: req.user.email
      }
    });
  } else {
    return res.json({ isAuthenticated: false });
  }
};

// Logout user
exports.logout = (req, res) => {
  req.logout();
  req.session.destroy();
  res.json({ success: true, message: 'Logged out successfully' });
}; 