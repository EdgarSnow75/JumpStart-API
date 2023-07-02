import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    customerID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Customer",
    },
    items: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true,
        },
        quantity: {
            type: Number,
            default: 1,
        },
    }],
    totalItems: {
        type: Number,
        default: 0,
    },
    totalCost: {
        type: Number,
        default: 0,
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

cartSchema.pre("save", async function (next) {
    try {
        const customer = await mongoose.model("Customer").findById(this.customerID);
        if (!customer) {
            throw new Error("Customer not found!");
        }
        const items = await mongoose.model("Item").find({ _id: { $in: this.items.map((item) => item.item) } });

        const totalItems = this.items.reduce((acc, item) => acc + item.quantity, 0);
        const totalCost = this.items.reduce((acc, item) => {
            const foundItem = items.find((i) => i._id.equals(item.item));
            if (foundItem) {
                return acc + foundItem.itemPrice * item.quantity;
            }
            return acc;
        }, 0);

        this.totalItems = totalItems;
        this.totalCost = totalCost;
        this.updatedAt = Date.now();
        next();
    } catch (error) {
        next(error);
    }
});

const ShoppingCart = mongoose.model("ShoppingCart", cartSchema);

export default ShoppingCart;
