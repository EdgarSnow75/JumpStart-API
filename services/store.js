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
                items[i].itemRestockCount += 1;
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
        }
        await store.save();
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};