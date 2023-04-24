import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    refreshToken: {
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    },
});

export default mongoose.model("RefreshToken", tokenSchema);