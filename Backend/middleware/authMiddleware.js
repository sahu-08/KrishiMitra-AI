import Session from '../models/Session.js';
import User from '../models/user.js';

const authMiddleware = async (req, res, next) => {
    try {
        const sessionId = req.signedCookies.sid;

        if (!sessionId) {
            return res.status(401).json({
                message: 'Please login first',
            });
        }

        const session = await Session.findById(sessionId);

        if (!session || session.expiresAt <= new Date()) {
            if (session) {
                await Session.findByIdAndDelete(session._id);
            }

            res.clearCookie('sid', {
                signed: true,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
            });

            return res.status(401).json({
                message: 'Session expired. Please login again',
            });
        }

        const user = await User.findById(session.userId);

        if (!user) {
            await Session.findByIdAndDelete(session._id);

            return res.status(401).json({
                message: 'User not found',
            });
        }

        req.user = user;

        next();
    } catch (error) {
        return res.status(500).json({
            message: 'Authentication failed',
        });
    }
};

export const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const sessionId = req.signedCookies?.sid;

        if (!sessionId) {
            req.user = null;
            return next();
        }

        const session = await Session.findById(sessionId);

        if (!session || session.expiresAt <= new Date()) {
            if (session) {
                await Session.findByIdAndDelete(session._id);
            }
            req.user = null;
            return next();
        }

        const user = await User.findById(session.userId);
        req.user = user || null;
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

export default authMiddleware;
