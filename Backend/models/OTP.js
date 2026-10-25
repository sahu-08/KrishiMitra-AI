import { Schema, model } from "mongoose";

const otpSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },

    otpHash: {
        type: String,
        required: true
    },

    expiresAt: {
        type: Date,
        required: true
    },

    attempts: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const OTP = model("OTP", otpSchema);

export default OTP;
