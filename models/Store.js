import mongoose from "mongoose";
import Item from "./Item.js";

const storeSchema = new mongoose.Schema({
    storeName: {
        type: String,
        required: true,
    },
    storeLocation: {
        type: String,
        required: true,
    },
    inventory: {
        type: [Item.schema], // this defines an array of Item documents
        default: [],
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

storeSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

const Store = mongoose.model("Store", storeSchema);

export default Store;
