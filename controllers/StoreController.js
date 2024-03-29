import express from "express";
import Store from "../models/Store.js";
import Item from "../models/Item.js";

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
        stores = await Store.find().select("-updatedAt");
        res.status(200).json(stores);
    } catch (err) {
        res.status(500).json({ msg: err });
    }
});

// get a Store by id
router.get("/stores/:id", async (req, res) => {
    const storeID = req.params.id;
    try {
        const store = await Store.findById(storeID).select("-updatedAt");
        res.status(200).json(store);
    } catch (err) {
        res.status(500).json({ msg: err.toString() });
    }
});

//update a Store by id
router.put("/update/:id", async (req, res) => {
    const storeID = req.params.id;
    const storeDetails = req.body;

    try {
        const store = await Store.findById(storeID);
        if (!store) {
            return res.status(404).json({ msg: "Store Not Found" });
        }
        for (const [key, value] of Object.entries(storeDetails)) {
            if (Array.isArray(store[key])) {
                if (!store[key].every((item) => value.include(item))) {
                    store[key] = value;
                }
                continue;
            }

            if (store[key] !== value) {
                store[key] = value;
            }
        }
        await store.save();

        res.status(200).json({ msg: "Store updated Successfully" });
    } catch (err) {
        res.status(500).json({ msg: err.toString() });
    }
});

// delete a Store by id
router.delete("/delete/:id", async (req, res) => {
    const storeID = req.params.id;
    try {
        await Store.findByIdAndDelete(storeID);
        res.status(200).json({ msg: "Store deleted successfully!" });
    } catch (err) {
        res.status(500).json({ msg: err.toString() });
    }
});


//Items

// get an item by id
router.get("/items/:id", async (req, res) => {
    const itemID = req.params.id;
    try {
        const item = await Item.findById(itemID).select("-updatedAt");
        res.status(200).json(item);
    } catch (err) {
        res.status(500).json({ msg: err.toString() });
    }
});

// // get inventory of a Store by id
// router.get("/:id/inventory", async (req, res) => {
//     const storeID = req.params.id;
//     try {
//         const store = await Store.findById(storeID).populate("inventory");
//         if (!store) {
//             return res.status(404).json({ msg: "Store Not Found" });
//         }
//         res.status(200).json(store.inventory);
//     } catch (err) {
//         res.status(500).json({ msg: err.toString() });
//     }
// });

router.get("/:id/inventory", async (req, res) => {
    const storeID = req.params.id;
    try {
        const store = await Store.findById(storeID).populate("inventory");
        if (!store) {
            return res.status(404).json({ msg: "Store Not Found" });
        }

        // Check and update restock status of items
        await isItemRestockable(storeID);
        await isItemStocked(storeID);

        // Return updated inventory
        res.status(200).json(store.inventory);
    } catch (err) {
        res.status(500).json({ msg: err.toString() });
    }
});


//Add Items to a store's inventory
router.put("/:id/addItem", async (req, res) => {
    const storeID = req.params.id;
    console.log("StoreID: ", storeID);
    const { itemName, itemImg, itemDesc, itemCategory, itemPrice, itemStock, itemRestockCount, restockStatus } = req.body;

    try {
        const store = await Store.findById(storeID);
        console.log("Store is: ", store);
        if (!store) {
            console.log(`Store with ID ${storeID} not found`);
            return res.status(404).json({ msg: "Store not found." });
        }

        try {
            console.log("Store Middle: ", store)
            const newItem = await Item.create({
                itemName,
                itemImg,
                itemDesc,
                itemCategory,
                itemPrice,
                itemStock,
                itemRestockCount,
                restockStatus,
                storeID,
            });
            store.inventory.push(newItem);
            await store.save();
            res.status(200).json({
                msg: "Item added successfully!",
                newItem,
            });

        } catch (err) {
            console.log("Error creating new item:", err);
            console.log("Store After1: ", store);
            res.status(500).json({ msg: err.toString() });
        }
        console.log("Store After2: ", store);

    } catch (err) {
        console.log(`Error finding store with ID ${storeID}:`, err);
        res.status(500).json({ msg: err.toString() });
    }
});

//Get All Items
router.get("/item/allItems", async (req, res) => {
    try {
        let items;
        items = await Item.find().select("-createdAt");
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ msg: err });
    }
});

//Update an item
router.put("/items/update/:id", async (req, res) => {
    const itemID = req.params.id;
    const itemDetails = req.body;

    try {
        const item = await Item.findById(itemID);
        if (!item) {
            return res.status(404).json({ msg: "Item Not Found" });
        }
        for (const [key, value] of Object.entries(itemDetails)) {
            if (Array.isArray(item[key])) {
                if (!item[key].every((item) => value.include(item))) {
                    item[key] = value;
                }
                continue;
            }

            if (item[key] !== value) {
                item[key] = value;
            }
        }
        await item.save();

        res.status(200).json({ msg: "Item updated Successfully" });
    } catch (err) {
        res.status(500).json({ msg: err.toString() });
    }
});

//Restock item by id
router.put("/items/restock/:storeId/:itemId", async (req, res) => {
    const { storeId, itemId } = req.params;
    try {
        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ msg: "Store Not Found" });
        }

        const item = store.inventory.find(item => item._id == itemId);
        if (!item) {
            return res.status(404).json({ msg: "Item Not Found" });
        }

        item.itemStock += 10;
        item.restockStatus = false;
        item.itemRestockCount += 1;

        await store.save();

        res.status(200).json({ msg: "Item Restocked Successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
})


//Delete an item
router.delete("/items/delete/:id", async (req, res) => {
    const itemID = req.params.id;
    try {
        await Item.findByIdAndDelete(itemID);
        res.status(200).json({ msg: "Item Deleted Successfully" });
    } catch (err) {
        res.status(500).json({ msg: err });
    }
})


export default router;
