import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  recommendCropController,
  historyController,
} from "../controllers/cropController.js";

const router = express.Router();

router.post("/recommend", authMiddleware, recommendCropController);
router.get("/history", authMiddleware, historyController);

export default router;
