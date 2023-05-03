import Store from "../models/Store.js";

export const isItemRestockable = async (storeId) => {
    try {
        const store = await Store.findById(storeId);
        if (!store) {
            throw new Error("Store not found.");
        }
        const items = store.inventory;
        for (let i = 0; i < items.length; i++) {
            if (items[i].itemStock <= 10) {
                items[i].restockStatus = true;

            }
        }
        await store.save();
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const isItemStocked = async (storeId) => {
    try {
        const store = await Store.findById(storeId);
        if (!store) {
            throw new Error("Store not found.");
        }
        const items = store.inventory;
        for (let i = 0; i < items.length; i++) {
            if (items[i].itemStock > 10) {
                items[i].restockStatus = false;
            }
        }
        await store.save();
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const RestockInventory = async (storeId) => {
    try {
        const store = await Store.findById(storeId);
        if (!store) {
            throw new Error("Store not found.");
        }
        const items = store.inventory;
        for (let i = 0; i < items.length; i++) {
            items[i].itemStock += 10;
            items[i].itemRestockCount += 1;
        }
        await store.save();
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const itemRestock = async (storeId, itemId) => {
    try {
        const store = await Store.findById(storeId);
        if (!store) {
            throw new Error("Store not found.");
        }
        const item = store.inventory.find((item) => item._id.toString() === itemId.toString());
        if (!item) {
            throw new Error("Item not found.");
        }
        item.itemStock += 10;
        item.restockStatus = false;
        item.itemRestockCount += 1;
        await store.save();
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};