import OTP from '../models/OTP.js';
import Session from '../models/Session.js';
import User from '../models/user.js';

import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER?.trim();
const smtpPass = process.env.SMTP_PASS?.replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // false for 587 (STARTTLS), true for 465
    requireTLS: smtpPort === 587,
    auth: {
        user: smtpUser,
        pass: smtpPass,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

// Verify SMTP connection on startup if credentials exist
if (smtpUser && smtpPass) {
    transporter.verify((error) => {
        if (error) {
            console.error('❌ [SMTP] Connection verification failed:', error.message);
        } else {
            console.log(`✅ [SMTP] Connected to ${smtpHost}:${smtpPort} (ready to send emails)`);
        }
    });
}

const createSession = async (user, res) => {
    const session = await Session.create({
        userId: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie('sid', session._id.toString(), {
        signed: true,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

export const registerController = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'All fields are required',
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(409).json({
                message: 'Email already registered',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
        });

        return res.status(201).json({
            message: 'Registration successful',
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Email already registered',
            });
        }

        return res.status(500).json({
            message: 'Registration failed',
        });
    }
};

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required',
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
        });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid credentials',
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid credentials',
            });
        }

        await createSession(user, res);

        return res.status(200).json({
            message: 'Login successful',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Login failed',
        });
    }
};

export const requestOTPController = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required',
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail,
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                message: 'Invalid credentials',
            });
        }

        const otp = crypto.randomInt(1000, 10000);

        const otpHash = await bcrypt.hash(otp.toString(), 12);

        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await OTP.findOneAndUpdate(
            { email: normalizedEmail },
            {
                email: normalizedEmail,
                otpHash,
                expiresAt,
                attempts: 0,
            },
            { upsert: true, runValidators: true },
        );

        const canEmail = Boolean(smtpUser && smtpPass);
        let emailSent = false;
        let emailError = null;

        // Always log OTP to console so it's visible in Render logs as fallback
        console.log(`[KrishiMitra OTP] ${normalizedEmail} => ${otp}`);

        if (canEmail) {
            try {
                await transporter.sendMail({
                    from: `"KrishiMitra AI" <${smtpUser}>`,
                    to: normalizedEmail,
                    subject: 'Your KrishiMitra AI OTP',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 420px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                            <h2 style="color: #2d6a4f; margin-top: 0;">KrishiMitra AI</h2>
                            <p style="color: #333; font-size: 15px;">Your OTP for login is:</p>
                            <div style="background-color: #f0fdf4; border: 1px dashed #2d6a4f; border-radius: 6px; padding: 12px; text-align: center; margin: 16px 0;">
                                <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #2d6a4f;">${otp}</span>
                            </div>
                            <p style="color: #555; font-size: 13px;">This OTP expires in <strong>5 minutes</strong>.</p>
                            <p style="color: #888; font-size: 12px; margin-bottom: 0;">If you didn't request this code, you can safely ignore this email.</p>
                        </div>
                    `,
                });
                emailSent = true;
                console.log(`[KrishiMitra OTP] Email sent successfully to ${normalizedEmail}`);
            } catch (err) {
                emailError = err;
                console.error('[KrishiMitra OTP] Failed to send email. Error:', err.message);
            }
        } else {
            console.log('[KrishiMitra OTP] SMTP not configured — check SMTP_USER and SMTP_PASS env vars');
        }

        return res.status(200).json({
            message: emailSent
                ? 'OTP sent to your email successfully'
                : canEmail
                    ? 'OTP generated but email failed to send — check Render logs'
                    : 'OTP generated (SMTP not configured — check server logs)',
            // Expose devOtp in development or as fallback if email fails to send
            ...((process.env.NODE_ENV !== 'production' || !emailSent) && { devOtp: otp }),
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Unable to send OTP',
        });
    }
};

export const verifyOTPController = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: 'Email and OTP are required',
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const storedOTP = await OTP.findOne({
            email: normalizedEmail,
        });

        if (!storedOTP) {
            return res.status(401).json({
                message: 'OTP not found or expired',
            });
        }

        if (storedOTP.expiresAt <= new Date()) {
            await OTP.deleteOne({ _id: storedOTP._id });

            return res.status(401).json({
                message: 'OTP expired',
            });
        }

        if (storedOTP.attempts >= 3) {
            await OTP.deleteOne({ _id: storedOTP._id });

            return res.status(429).json({
                message: 'Too many incorrect attempts',
            });
        }

        const isOTPValid = await bcrypt.compare(String(otp), storedOTP.otpHash);

        if (!isOTPValid) {
            storedOTP.attempts += 1;
            await storedOTP.save();

            return res.status(401).json({
                message: 'Invalid OTP',
            });
        }

        await OTP.deleteOne({ _id: storedOTP._id });

        const user = await User.findOne({
            email: normalizedEmail,
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        await createSession(user, res);

        return res.status(200).json({
            message: 'Email verified and login successful',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'OTP verification failed',
        });
    }
};

export const logoutController = async (req, res) => {
    try {
        if (req.signedCookies.sid) {
            await Session.findByIdAndDelete(req.signedCookies.sid);
        }

        res.clearCookie('sid', {
            signed: true,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        return res.status(200).json({
            message: 'Logout successful',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Logout failed',
        });
    }
};

export const logoutAllController = async (req, res) => {
    try {
        await Session.deleteMany({
            userId: req.user._id,
        });

        res.clearCookie('sid', {
            signed: true,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        return res.status(200).json({
            message: 'Logged out from all devices',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Logout failed',
        });
    }
};
