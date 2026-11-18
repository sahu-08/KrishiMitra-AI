import express from "express";
import { optionalAuthMiddleware } from "../middleware/authMiddleware.js";
import { chatController } from "../controllers/chatController.js";

const router = express.Router();

router.post("/", optionalAuthMiddleware, chatController);

export default router;
