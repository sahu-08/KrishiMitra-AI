import express from "express";
import authMiddleware, {
  optionalAuthMiddleware,
} from "../middleware/authMiddleware.js";
import {
  recommendCropController,
  historyController,
} from "../controllers/cropController.js";

const router = express.Router();

router.post("/recommend", optionalAuthMiddleware, recommendCropController);
router.get("/history", authMiddleware, historyController);

export default router;
