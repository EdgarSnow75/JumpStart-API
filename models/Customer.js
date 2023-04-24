import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true,
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

    customerLocation: {
        type: String,
        required: true,
        default: "",
    },
    customerContact: {
        type: String,
        required: true,
        default: "",
    },
    createdAt: {
        type: Date,
        default: () => Date.now(),
        immutable: true,
    },
    updatedAt: {
        type: Date,
        default: () => Date.now(),
    },
});

customerSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});


const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
