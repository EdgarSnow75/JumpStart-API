import bcrypt from "bcrypt";

// Middleware for encrypting password
export const encryptPassword = async (req, res, next) => {
    const { password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        req.body.password = hashedPassword;
        next();
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};