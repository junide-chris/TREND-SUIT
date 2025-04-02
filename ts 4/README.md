# TRENDSUIT Backend

Backend implementation for TRENDSUIT fashion e-commerce platform with Google OAuth and OTP verification.

## Features

- Google OAuth integration for social login
- OTP verification via Twilio SMS
- Session management
- User profile management
- Secure API endpoints

## Prerequisites

- Node.js (v14+)
- MongoDB
- Google OAuth credentials
- Twilio account

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/trendsuit-backend.git
   cd trendsuit-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the project root with the following variables:
   ```
   PORT=3000
   NODE_ENV=development
   SESSION_SECRET=your_session_secret
   
   MONGODB_URI=mongodb://localhost:27017/trendsuit
   
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. For production:
   ```
   npm start
   ```

## API Endpoints

### Authentication

- `GET /auth/google` - Start Google OAuth flow
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/send-otp` - Send OTP to mobile
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/resend-otp` - Resend OTP
- `POST /auth/link-mobile` - Link mobile to Google account
- `GET /auth/status` - Check auth status
- `GET /auth/logout` - Logout user

### User Profile

- `GET /api/profile` - Get user profile data

## Setting Up Google OAuth

1. Go to the [Google Developer Console](https://console.developers.google.com/)
2. Create a new project
3. Enable the Google+ API
4. Configure the OAuth consent screen
5. Create OAuth credentials (Web application)
6. Add authorized redirect URIs: `http://localhost:3000/auth/google/callback` for dev and your production URL for prod
7. Copy the Client ID and Client Secret to your `.env` file

## Setting Up Twilio

1. Sign up for a Twilio account at [twilio.com](https://www.twilio.com/)
2. Get a Twilio phone number capable of sending SMS
3. Copy your Account SID, Auth Token, and Twilio phone number to your `.env` file

## Deployment

This app can be deployed to any Node.js hosting platform such as:

- Heroku
- AWS Elastic Beanstalk
- DigitalOcean App Platform
- Railway

Make sure to set all environment variables in your production environment. 