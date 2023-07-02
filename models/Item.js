import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
    },
    itemImg: {
        type: String,
        default: "",
    },
    itemDesc: {
        type: String,
        required: true,
    },
    itemCategory: {
        type: String,
        required: true,
    },
    itemPrice: {
        type: Number,
        required: true,
    },
    itemStock: {
        type: Number,
        required: true,
        default: 10,
    },
    itemRestockCount: {
        type: Number,
        required: true,
        default: 0,
    },
    restockStatus: {
        type: Boolean,
        required: true,
        default: "false",
    },
    storeID: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "Store",
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

itemSchema.pre("save", async function (next) {
    try {
        const store = await mongoose.model("Store").findById(this.storeID);
        console.log("Item StoreID:", this.storeID);
        console.log("Item Store:", store);
        if (!store) {
            throw new Error("Store not found.");
        }
        this.storeName = store.storeName;
        this.updatedAt = Date.now();
        next();
    } catch (error) {
        next(error);
    }
});


const Item = mongoose.model("Item", itemSchema);

export default Item;