// // item.js

// import Item from "../models/Item.js";

// // Function to filter items based on the user's search
// export const filterItems = async (req, res) => {
//     try {
//         const { search } = req.query;

//         // Filter items based on the search query
//         const filteredItems = await Item.find({
//             $or: [
//                 { itemName: { $regex: search, $options: "i" } }, // Case-insensitive search on the "name" field
//                 { itemDesc: { $regex: search, $options: "i" } }, // Case-insensitive search on the "description" field
//             ],
//         });

//         res.json({ items: filteredItems });
//     } catch (err) {
//         res.status(500).json({ msg: err.message });
//     }
// };

// item.js

import Item from "../models/Item.js";

// Function to filter items based on the user's search
export const filterItems = async (req, res) => {
    try {
        const { search } = req.query;

        // Filter items based on the search query
        const filteredItems = await Item.find({
            $or: [
                { itemName: { $regex: search, $options: "i" } }, // Case-insensitive search on the "name" field
                { itemDesc: { $regex: search, $options: "i" } }, // Case-insensitive search on the "description" field
            ],
        });

        res.json({ items: filteredItems });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export default filterItems;
