import { Schema, model } from "mongoose";

const recommendationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    nitrogen: {
        type: Number,
        required: true
    },

    phosphorus: {
        type: Number,
        required: true
    },

    potassium: {
        type: Number,
        required: true
    },

    temperature: {
        type: Number,
        required: true
    },

    humidity: {
        type: Number,
        required: true
    },

    ph: {
        type: Number,
        required: true
    },

    rainfall: {
        type: Number,
        required: true
    },

    recommendedCrop: {
        type: String,
        required: true
    },

    topRecommendations: {
        type: [{
            crop: String,
            modelScore: Number
        }],
        default: []
    }
}, {
    timestamps: true
});

const Recommendation = model(
    "Recommendation",
    recommendationSchema
);

export default Recommendation;
