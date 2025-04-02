// Auth Service for Trendsuit
class AuthService {
  constructor() {
    this.apiUrl = '/auth';
    this.user = null;
    this.isAuthenticated = false;
  }
  
  // Check current authentication status
  async checkAuthStatus() {
    try {
      const response = await fetch(`${this.apiUrl}/status`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      this.isAuthenticated = data.isAuthenticated;
      this.user = data.user || null;
      
      return {
        isAuthenticated: this.isAuthenticated,
        user: this.user
      };
    } catch (error) {
      console.error('Auth Status Error:', error);
      return {
        isAuthenticated: false,
        user: null
      };
    }
  }
  
  // Send OTP to user's mobile
  async sendOTP(name, mobile) {
    try {
      const response = await fetch(`${this.apiUrl}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, mobile }),
        credentials: 'include'
      });
      
      return await response.json();
    } catch (error) {
      console.error('Send OTP Error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }
  
  // Verify OTP submitted by user
  async verifyOTP(mobile, otp) {
    try {
      const response = await fetch(`${this.apiUrl}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mobile, otp }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.isAuthenticated = true;
        this.user = data.user;
      }
      
      return data;
    } catch (error) {
      console.error('Verify OTP Error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }
  
  // Resend OTP to user's mobile
  async resendOTP(mobile) {
    try {
      const response = await fetch(`${this.apiUrl}/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mobile }),
        credentials: 'include'
      });
      
      return await response.json();
    } catch (error) {
      console.error('Resend OTP Error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }
  
  // Link mobile number to Google account
  async linkMobile(mobile) {
    try {
      const response = await fetch(`${this.apiUrl}/link-mobile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mobile }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.user = data.user;
      }
      
      return data;
    } catch (error) {
      console.error('Link Mobile Error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }
  
  // Logout user
  async logout() {
    try {
      const response = await fetch(`${this.apiUrl}/logout`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.isAuthenticated = false;
        this.user = null;
      }
      
      return data;
    } catch (error) {
      console.error('Logout Error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }
}

// Create and export auth service instance
const authService = new AuthService();

// Make it available globally
window.authService = authService; 