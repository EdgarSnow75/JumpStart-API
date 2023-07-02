// import express from "express";
// import Item from "../models/Item.js";
// 

// const router = express.Router();

// // Route to filter items based on search query
// router.post("/search/q=:query", async (req, res) => {
//     const { query } = req.params.query; // Retrieve the query parameter from the request URL

//     try {
//         const filteredItems = await filterItems(query); // Call the filterItems function with the query parameter
//         if (!res.headersSent) {
//             res.json({ items: filteredItems }); // Send the response if headers have not been sent
//         }
//     } catch (err) {
//         if (!res.headersSent) {
//             res.status(500).json({ msg: err.message }); // Send the error response if headers have not been sent
//         }
//     }
// });

// export default router;

// routes.js

import express from "express";
import { filterItems } from "../services/items.js";

const router = express.Router();

// Define the route for filtering items
router.get("/items/filter", filterItems);

// Your other routes can be defined here

export default router;
