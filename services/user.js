import bcrypt from "bcrypt";

import Admin from "../models/Admin.js";
import Customer from "../models/Customer.js";

export const checkUserExists = async (emailAddress) => {
    try {
        return (
            (await Customer.exists({ emailAddress })) ||
            (await Admin.exists({ emailAddress }))
        );
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const getUserType = async (req, res, next) => {
    const { emailAddress } = req.body;
    console.log(req.body);
    let userExists = false;
    let userType = null;

    try {
        // Check if user exists in the Customer collection
        userExists = await Customer.exists({ emailAddress });
        if (userExists) {
            userType = "customer";
            console.log(emailAddress, userExists, userType);
            req.userType = userType;
            req.emailAddress = emailAddress;
            next();
            return;
        }

        // Check if user exists in the Admin collection
        userExists = await Admin.exists({ emailAddress });
        if (userExists) {
            userType = "admin";
            req.userType = userType;
            req.emailAddress = emailAddress;
            next();
            return;
        }

        // Check if user exists
        if (!userExists) {
            console.log(emailAddress, userExists, userType);
            return res.status(404).json({ msg: "User does not exist." });
        }

        // Set user type
        req.userType = userType;
        req.emailAddress = emailAddress;
        next();
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Middleware to check if password is correct
export const checkPassword = async (req, res, next) => {
    const { userType, emailAddress } = req;
    const { password } = req.body;
    console.log("userType:", userType);
    console.log("emailAddress:", emailAddress);
    console.log("password:", password);
    // Get user data
    let userData = null;

    try {
        switch (userType) {
            case "customer":
                userData = await Customer.findOne({ emailAddress });
                break;
            case "admin":
                userData = await Admin.findOne({ emailAddress });
                break;
        }

        // Check if user exists
        if (!userData) {
            return res.status(404).json({ msg: "User does not exist." });
        }

        // Check if password is correct
        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ msg: "Incorrect password. Please try again." });
        }

        req.userId = userData._id;
        // console.log("userID: ", req.userId);
        next();
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Middleware to get user data
export const getUserData = async (req, res, next) => {
    const { userId } = req;
    // Get user data
    try {
        const userType = (await Customer.exists({ _id: userId }))
            ? "customer"
            : (await Admin.exists({ _id: userId }))
                ? "admin"
                : null;

        if (!userType) {
            return res.status(404).json({ msg: "User does not exist." });
        }

        // Get user data
        const userData =
            (await Customer.findById(userId)) ??
            (await Admin.findById(userId));

        // Set user data
        req.userData = { ...userData._doc, userType };
        next();
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};