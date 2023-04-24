import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

import { getUserType, checkPassword, getUserData } from "../services/user.js";
import {
    auth,
    generateAccessToken,
    generateRefreshToken,
} from "../services/auth.js";
import RefreshToken from "../models/RefreshToken.js";

const { REFRESH_TOKEN_SECRET } = process.env;
const router = express.Router();

// Login user
router.post("/login", [getUserType, checkPassword], async (req, res) => {
    const { userType, userId } = req;

    try {
        // Generate access token
        const accessToken = generateAccessToken(userId);

        // Generate refresh token
        const refreshToken = generateRefreshToken(userId);

        // Save refresh token to database
        await RefreshToken.create({ refreshToken, createdBy: userId });

        // Send access token as a cookie and refresh token to client
        res
            .status(200)
            .cookie("access_token", accessToken, {
                httpOnly: true,
                sameSite: "None",
                secure: true,
                maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
            })
            .json({ accessToken, refreshToken, userType, msg: "Login successful." });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Get user data
router.get("/details", [auth, getUserData], async (req, res) => {
    const { userData } = req;

    try {
        res.status(200).json(userData);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Refresh access token
router.post("/refresh", [auth], async (req, res) => {
    const { refreshToken } = req.body;
    const { userId } = req;

    // Check if refresh token exists
    if (!refreshToken) {
        return res
            .status(401)
            .json({ msg: "No token present! Authorization denied" });
    }

    // Check if refresh token is valid
    try {
        const tokenExists = await RefreshToken.exists({
            refreshToken,
            createdBy: userId,
        });

        if (!tokenExists) {
            res.status(403).json({ msg: "Invalid token." });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

        // Generate new access token
        const accessToken = generateAccessToken(decoded.userId);

        // Send new access token to client
        res
            .status(200)
            .cookie("access_token", accessToken, {
                httpOnly: true,
                sameSite: "None",
                secure: true,
                maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
            })
            .json({ accessToken, msg: "Access token refreshed." });
    } catch (err) {
        res.status(403).json({ msg: "Invalid token." });
    }
});

// Logout
router.post("/logout", [auth], async (req, res) => {
    // Get refresh token from request body
    const { userId } = req;

    try {
        // Delete refresh token from database
        await RefreshToken.deleteMany({ createdBy: userId });
        // Delete access token cookie
        res.clearCookie("access_token", {
            httpOnly: true,
            sameSite: "None",
            secure: true,
        });

        res.status(200).json({ msg: "Logout successful." });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

export default router;