const twilio = require('twilio');
require('dotenv').config();

// Use mock service in development/testing
const isTestMode = process.env.NODE_ENV !== 'production' || process.env.TEST_MODE === 'true';

// Mock SMS service for development
const mockSendSMS = (mobile, otp) => {
  console.log(`[TEST MODE] OTP for ${mobile}: ${otp}`);
  return Promise.resolve({
    sid: 'MOCK_SID_' + Date.now(),
    status: 'delivered'
  });
};

// Initialize Twilio client only if not in test mode
const client = !isTestMode && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Helper function to format phone numbers to E.164 format (required by Twilio)
const formatPhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if already has country code (assuming +91 for India)
  if (!cleaned.startsWith('91') && cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  
  // Ensure number starts with +
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
};

// Send OTP via SMS
exports.sendOTP = async (mobile, otp) => {
  try {
    // Use mock service in test mode
    if (isTestMode) {
      return {
        success: true,
        message: 'Test OTP created',
        testMode: true,
        otp: otp
      };
    }
    
    // Use actual Twilio in production
    if (!client) {
      throw new Error('Twilio client not initialized');
    }
    
    // Format mobile number to E.164 format if needed
    let formattedMobile = mobile;
    if (!mobile.startsWith('+')) {
      formattedMobile = '+' + mobile;
    }
    
    const message = await client.messages.create({
      body: `Your TRENDSUIT verification code is: ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedMobile
    });
    
    return {
      success: true,
      message: 'OTP sent successfully',
      sid: message.sid
    };
  } catch (error) {
    console.error('Twilio Error:', error);
    return {
      success: false,
      message: error.message,
      code: error.code
    };
  }
}; 