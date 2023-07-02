import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

export const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });
};

export const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, REFRESH_TOKEN_SECRET);
};

export const auth = (req, res, next) => {
    // Get token from authorization header
    const token = req.headers?.authorization?.split(" ")[1] || req.cookies?.access_token;
    console.log('Token: ', token);
    // Check if token exists    
    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(403).json({ msg: "Invalid token." });
    }
};