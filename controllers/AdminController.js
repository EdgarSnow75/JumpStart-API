import express from "express";
import { encryptPassword } from "../services/passwordEncrypt.js";

import Admin from "../models/Admin.js";
import Customer from "../models/Customer.js";
import { auth } from "../services/auth.js";
import {
    checkAdmin,
    checkLogistics,
    checkSuperAdmin,
} from "../services/admin.js";
import { checkUserExists } from "../services/user.js";

const router = express.Router();

// DEV ONLY - Create admin
router.post("/create", [encryptPassword], async (req, res) => {
    const {
        firstName,
        lastName,
        emailAddress,
        password,
        contactNumber,
        permissions,
    } = req.body;

    try {
        await Admin.create({
            firstName,
            lastName,
            emailAddress,
            password,
            contactNumber,
            permissions,
        });

        res.status(201).json({
            msg: "Admin created successfully!",
        });
    } catch (err) {
        res.status(500).json({ msg: err });
    }
});

// Get all users
router.get("/users", [auth, checkSuperAdmin], async (req, res) => {
    const userType = req.query.type;

    try {
        let users;

        switch (userType) {
            case "admin":
                users = await Admin.find().select("-password");
                res.status(200).json(users);
                break;
            case "customer":
                users = await Customer.find().select("-password");
                res.status(200).json(users);
                break;
            default:
                // return all users
                const admins = await Admin.find().select("-password");
                const customers = await Customer.find().select("-password");

                users = {
                    admins,
                    customers,
                };
                res.status(200).json(users);
        }
    } catch (err) {
        res.status(500).json({ msg: err });
    }
});

// Get user by id
router.get("/user/:id", [auth, checkSuperAdmin], async (req, res) => {
    const userId = req.params.id;

    try {
        const user =
            (await Admin.findById(userId).select("-password")) ??
            (await Customer.findById(userId).select("-password"));

        if (!user) {
            return res.status(404).json({ msg: "User not found." });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ msg: err });
    }
});

// Create user
router.post(
    "/user",
    [auth, checkSuperAdmin, encryptPassword],
    async (req, res) => {
        const userType = req.query.type;
        const userDetails = req.body;

        // Check if user exists
        const userExists = await checkUserExists(userDetails.emailAddress);
        if (userExists) {
            return res.status(400).json({ msg: "User already exists." });
        }
        try {
            switch (userType) {
                case "admin":
                    try {
                        await Admin.create(userDetails);

                        res.status(201).json({
                            msg: "Admin created successfully!",
                        });
                    } catch (err) {
                        res.status(500).json({ msg: err });
                    }
                    break;
                case "customer":
                    try {
                        await Customer.create(userDetails);

                        res.status(201).json({
                            msg: "Customer created successfully!",
                        });
                    } catch (err) {
                        res.status(500).json({ msg: err });
                    }

                    break;

                default:
                    return res.status(400).json({ msg: "Invalid user type." });
            }
        } catch (err) {
            res.status(500).json({ msg: err });
        }
    }
);

// Update user
router.put("/user/:id", [auth, checkSuperAdmin], async (req, res) => {
    const userId = req.params.id;
    const userDetails = req.body;

    try {

        const userType = (await Admin.exists({ _id: userId }))
            ? "admin"
            : (await Customer.exists({ _id: userId }))
                ? "customer" : null;

        if (!userType) {
            return res.status(404).json({ msg: "User not found." });
        }

        const user =
            userType === "admin"
                ? await Admin.findById(userId)
                : userType === "customer"
                    ? await Customer.findById(userId)
                    : null;

        if (!user) {
            return res.status(404).json({ msg: "User not found." });
        }

        switch (userType) {
            case "admin":
                for (const [key, value] of Object.entries(userDetails)) {
                    if (Array.isArray(user[key])) {
                        if (!user[key].every((item) => value.includes(item))) {
                            user[key] = value;
                        }
                        continue;
                    }

                    if (user[key] !== value) {
                        user[key] = value;
                    }
                }
                await user.save();
                break;
            case "customer":
                for (const [key, value] of Object.entries(userDetails)) {
                    if (Array.isArray(user[key])) {
                        if (!user[key].every((item) => value.includes(item))) {
                            user[key] = value;
                        }
                        continue;
                    }

                    if (user[key] !== value) {
                        user[key] = value;
                    }
                }

                await user.save();
                break;

            default:
                return res.status(400).json({ msg: "Invalid user type." });
        }

        res.status(200).json({ msg: "User updated successfully." });
    } catch (err) {
        res.status(500).json({ msg: err });
    }
});

// Delete user
router.delete("/user/:id", [auth, checkSuperAdmin], async (req, res) => {
    const userId = req.params.id;

    try {
        const userType = (await Admin.exists({ _id: userId }))
            ? "admin"
            : (await Customer.exists({ _id: userId }))
                ? "customer"
                : null;

        if (!userType) {
            return res.status(404).json({ msg: "User not found." });
        }

        switch (userType) {
            case "admin":
                await Admin.findByIdAndDelete(userId);
                break;
            case "customer":
                await Customer.findByIdAndDelete(userId);
                break;
            default:
                return res.status(400).json({ msg: "Invalid user type." });
        }

        res.status(200).json({ msg: "User deleted successfully!" });
    } catch (err) {
        res.status(500).json({ msg: err });
    }
});

export default router;
