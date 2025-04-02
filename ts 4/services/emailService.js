const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter
let transporter;

// Initialize in development mode if no SMTP settings
if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
    // Use ethereal.email for testing
    nodemailer.createTestAccount().then(testAccount => {
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
        console.log('Created test email account:', testAccount.user);
    });
} else {
    // Use configured SMTP
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

// Send OTP via email
exports.sendOTP = async (email, otp) => {
    try {
        // Skip actual sending in test mode
        if (process.env.TEST_MODE === 'true') {
            console.log(`[TEST MODE] Would send OTP ${otp} to ${email}`);
            return {
                success: true,
                message: 'Test OTP created',
                testMode: true,
                otp: otp
            };
        }
        
        // Send actual email
        const info = await transporter.sendMail({
            from: `"TRENDSUIT" <${process.env.SMTP_FROM || 'noreply@trendsuit.com'}>`,
            to: email,
            subject: 'Your TRENDSUIT Verification Code',
            text: `Your verification code is: ${otp}. Valid for 5 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #6a0dad; padding: 20px; text-align: center; color: white;">
                        <h1 style="margin: 0;">TRENDSUIT</h1>
                    </div>
                    <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
                        <h2>Your Verification Code</h2>
                        <p>Use the following code to verify your account:</p>
                        <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 15px; background-color: #f5f5f5; letter-spacing: 5px; margin: 20px 0;">
                            ${otp}
                        </div>
                        <p>This code is valid for 5 minutes.</p>
                        <p>If you didn't request this code, please ignore this email.</p>
                    </div>
                    <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                        &copy; ${new Date().getFullYear()} TRENDSUIT. All rights reserved.
                    </div>
                </div>
            `
        });
        
        // Log email URL in development
        if (process.env.NODE_ENV === 'development') {
            console.log('Email sent. Preview URL:', nodemailer.getTestMessageUrl(info));
        }
        
        return {
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId,
            previewUrl: process.env.NODE_ENV === 'development' ? nodemailer.getTestMessageUrl(info) : null
        };
    } catch (error) {
        console.error('Email Error:', error);
        return {
            success: false,
            message: error.message
        };
    }
}; 