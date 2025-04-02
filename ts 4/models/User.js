const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String, 
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  mobile: {
    type: String,
    trim: true
  },
  googleId: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastLogin: Date
});

// Add index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ mobile: 1 });
userSchema.index({ googleId: 1 });

module.exports = mongoose.model('User', userSchema); 