// Check permissions

import Admin from "../models/Admin.js";

// Get permissions
const getPermissions = async (userId) => {
    try {
        const isAdmin = Admin.exists({ _id: userId });

        if (!isAdmin) {
            return res.status(401).json({ msg: "Unauthorized access!" });
        }

        const user = await Admin.findById(userId);

        return user.permissions;
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Middleware to check for super admin permissions
export const checkSuperAdmin = async (req, res, next) => {
    const { userId } = req;
    const permissions = await getPermissions(userId);

    if (!permissions.includes("super")) {
        return res
            .status(403)
            .json({ msg: "Forbidden access! Not enough permissions." });
    }

    next();
};

// Middleware to check for at least admin permissions
export const checkAdmin = async (req, res, next) => {
    const { userId } = req;
    const permissions = await getPermissions(userId);

    if (!(permissions.includes("super") || permissions.includes("admin"))) {
        return res
            .status(403)
            .json({ msg: "Forbidden access! Not enough permissions." });
    }

    next();
};

// Middleware to check for at least logistics permissions
export const checkLogistics = async (req, res, next) => {
    const { userId } = req;
    const permissions = await getPermissions(userId);

    if (
        !(
            permissions.includes("super") ||
            permissions.includes("admin") ||
            permissions.includes("logistics")
        )
    ) {
        return res
            .status(403)
            .json({ msg: "Forbidden access! Not enough permissions." });
    }

    next();
};
