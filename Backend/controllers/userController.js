import OTP from '../models/OTP.js';
import Session from '../models/Session.js';
import User from '../models/user.js';

import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

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

        const canEmail = process.env.SMTP_USER && process.env.SMTP_PASS;

        if (canEmail) {
            try {
                await transporter.sendMail({
                    from: process.env.SMTP_USER,
                    to: normalizedEmail,
                    subject: 'Your KrishiMitra AI OTP',
                    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
                });
            } catch (error) {
                await OTP.deleteOne({ email: normalizedEmail });
                throw error;
            }
        } else {
            // Dev mode: no SMTP configured — OTP printed in server console
            console.log(`[KrishiMitra OTP] ${normalizedEmail} => ${otp}`);
        }

        return res.status(200).json({
            message: canEmail
                ? 'OTP sent successfully'
                : 'OTP generated (check server console — SMTP not configured)',
            // Only expose OTP when SMTP is off (local development)
            ...(canEmail ? {} : { devOtp: otp }),
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
