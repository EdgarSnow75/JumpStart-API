import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        default: "",
    },
    emailAddress: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                // validate email address
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
            },
            message: (props) => `${props.value} is not a valid email address!`,
        },
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: String,
        default: "",
    },
    permissions: {
        type: [String],
        enum: ["super", "admin", "logistics"],
        required: true,
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    },
    updatedAt: {
        type: Date,
        default: () => Date.now(),
    },
});

adminSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
