import express from "express";

import {
    registerController,
    loginController,
    requestOTPController,
    verifyOTPController,
    logoutController,
    logoutAllController
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/request-otp", requestOTPController);

router.post("/verify-otp", verifyOTPController);

router.post("/logout", logoutController);

router.post(
    "/logout-all",
    authMiddleware,
    logoutAllController
);

router.get("/me", authMiddleware, (req, res) => {
    return res.status(200).json({
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email
        }
    });
});

export default router;
