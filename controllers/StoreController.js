import express from "express";
import Store from "../models/Store.js";
const router = express.Router();

// create a new Store
router.post("/create", async (req, res) => {
    const {
        storeName,
        storeLocation,
        inventory,
    } = req.body;

    try {
        await Store.create({
            storeName,
            storeLocation,
            inventory,
        });

        res.status(201).json(
            {
                msg: "Store created successfully!"
            }
        );
    } catch (err) {
        res.status(500).json({ msg: err });
    }
});

// get all Stores
router.get("/allStores", async (req, res) => {
    try {
        let stores;
        stores = await Store.find().select("-storeName");
        res.status(200).json(stores);
    } catch (err) {
        res.status(500).json({ msg: err });
    }
});

// get a Store by id
router.get("/:id", async (req, res) => {
    const storeID = req.params.id;
    try {
        const Store = await Store.findById(storeID).select("-storeName");
        res.status(200).json(Store);
    } catch (err) {
        res.status(500).json({ msg: err });
    }
});

// update a Store by id
router.put("/:StoreId", async (req, res) => {
    try {
        const Store = await Store.updateStoreById(req.params.StoreId, req.body);
        res.status(200).json(Store);
    } catch (err) {
        res.status(500).json({ msg: err });
    }
});

// delete a Store by id
router.delete("/:StoreId", async (req, res) => {
    try {
        const Store = await Store.deleteStoreById(req.params.StoreId);
        res.status(200).json(Store);
    } catch (err) {
        res.status(500).json({ msg: err });
    }
});

export default router;
