import express from "express";
import Customer from "../models/Customer.js";

import { auth } from "../services/auth.js";
import { encryptPassword } from "../services/passwordEncrypt.js";

const router = express.Router();

router.post("/signup", [encryptPassword], async (req, res) => {
    const {
        customerName,
        emailAddress,
        password,
        customerLocation,
        customerContact,
    } = req.body;

    try {
        await Customer.create({
            customerName,
            emailAddress,
            password,
            customerLocation,
            customerContact,
        });

        res.status(201).json({
            msg: "Customer sign up successful!",
        });
    } catch (err) {
        res.status(500).json({ msg: err });
    }
});

router.put("/update", [auth], async (req, res) => {
    const { userId } = req;
    console.log("updateID: ", userId)
    try {
        const user = await Customer.findById(userId);
        console.log("UpdateUser: ", user)
        if (!user) {
            return res.status(404).json({ msg: "User not found." });
        }

        await Customer.updateOne(
            { emailAddress: user.emailAddress },
            {
                customerName: req.body.customerName,
                customerEmail: req.body.customerEmail,
                password: req.body.password,
                customerLocation: req.body.customerLocation,
                customerContact: req.body.customerContact,
            }
        );
    } catch (err) {
        res.status(500).json({ msg: err });
    }
});

export default router;