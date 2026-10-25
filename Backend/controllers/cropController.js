import Recommendation from "../models/Recommendation.js";
import { recommendCrops } from "../services/cropRecommender.js";

const requiredFields = [
  "nitrogen",
  "phosphorus",
  "potassium",
  "temperature",
  "humidity",
  "ph",
  "rainfall",
];

export const recommendCropController = async (req, res) => {
  try {
    const values = {};

    for (const field of requiredFields) {
      const num = Number(req.body[field]);
      if (Number.isNaN(num)) {
        return res.status(400).json({
          message: `Valid ${field} is required`,
        });
      }
      values[field] = num;
    }

    const result = recommendCrops(values);

    const saved = await Recommendation.create({
      userId: req.user._id,
      ...values,
      recommendedCrop: result.recommendedCrop,
      topRecommendations: result.topRecommendations.map((item) => ({
        crop: item.crop,
        modelScore: item.modelScore,
      })),
    });

    return res.status(200).json({
      message: "Top crops recommended",
      recommendedCrop: result.recommendedCrop,
      topRecommendations: result.topRecommendations,
      id: saved._id,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Crop recommendation failed",
    });
  }
};

export const historyController = async (req, res) => {
  try {
    const history = await Recommendation.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.status(200).json({ history });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch history",
    });
  }
};
