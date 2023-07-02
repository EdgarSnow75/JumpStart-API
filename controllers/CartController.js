import express from "express";
import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Item from "../models/Item.js";
import Customer from "../models/Customer.js";

const router = express.Router();

// // create a new cart
// router.post("/create", async (req, res) => {
//     const { customerID } = req.body;
//     try {
//         await Cart.create({
//             customerID,
//             items: [],
//         });

//         res.status(201).json({
//             cartData
//         });
//     } catch (err) {
//         res.status(500).json({ msg: err.toString() });
//     }
// });

// create a new cart
router.post("/create", async (req, res) => {
    const { customerID } = req.body;
    try {
        const newCart = await Cart.create({
            customerID,
            items: [],
        });

        const cartData = await Cart.findById(newCart._id).select("-updatedAt");

        res.status(201).json({
            cartData
        });
    } catch (err) {
        res.status(500).json({ msg: err.toString() });
    }
});

// get all carts
router.get("/allCarts", async (req, res) => {
    try {
        let carts = await Cart.find().select("-updatedAt");
        res.status(200).json(carts);
    } catch (err) {
        res.status(500).json({ msg: err.toString() });
    }
});

// get a cart by id
router.get("/carts/:id", async (req, res) => {
    const cartID = req.params.id;
    try {
        const cart = await Cart.findById(cartID).select("-updatedAt");
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ msg: err.toString() });
    }
});

// get a cart by customer ID
router.get("/customer/cart/:id", async (req, res) => {
    const customerID = req.params.id;
    try {
        const cart = await Cart.findOne({ customerID }).select("-createdAt");
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ msg: err.toString() });
    }
});


//update a cart by id
router.put("/update/:id", async (req, res) => {
    const cartID = req.params.id;
    const cartDetails = req.body;

    try {
        const cart = await Cart.findById(cartID);
        if (!cart) {
            return res.status(404).json({ msg: "Cart Not Found" });
        }
        for (const [key, value] of Object.entries(cartDetails)) {
            if (Array.isArray(cart[key])) {
                if (!cart[key].every((item) => value.include(item))) {
                    cart[key] = value;
                }
                continue;
            }

            if (cart[key] !== value) {
                cart[key] = value;
            }
        }
        await cart.save();

        res.status(200).json({ msg: "Cart updated Successfully" });
    } catch (err) {
        res.status(500).json({ msg: err.toString() });
    }
});

// delete a cart by id
router.delete("/delete/:id", async (req, res) => {
    const cartID = req.params.id;
    try {
        await Cart.findByIdAndDelete(cartID);
        res.status(200).json({ msg: "Cart deleted successfully!" });
    } catch (err) {
        res.status(500).json({ msg: err.toString() });
    }
});

// // Add Item to Cart
// router.put("/:id/addItem/:itemID", async (req, res) => {
//     const cartID = req.params.id;
//     const itemID = req.params.itemID;

//     if (!mongoose.Types.ObjectId.isValid(itemID)) {
//         return res.status(400).json({ msg: "Invalid Item ID" });
//     }

//     try {
//         const cart = await Cart.findById(cartID);
//         if (!cart) {
//             return res.status(404).json({ msg: "Cart Not Found" });
//         }

//         const item = await Item.findById(itemID);
//         if (!item) {
//             return res.status(404).json({ msg: "Item Not Found" });
//         }

//         const cartItem = cart.items.find((i) => i.item === itemID);
//         if (cartItem) {
//             cartItem.quantity++;
//             await cart.save();
//             return res.status(200).json({ msg: "Item quantity incremented in cart" });
//         }

//         const newCartItem = {
//             item: itemID,
//             quantity: 1,
//             price: item.itemPrice,
//         };

//         cart.items.push(newCartItem);
//         await cart.save();

//         res.status(200).json({ msg: "Item added to cart" });
//     } catch (err) {
//         res.status(500).json({ msg: err.toString() });
//     }
// });

// // Add an item to the cart
// router.put("/:cartID/addItem/:itemID", async (req, res) => {
//     const cartID = req.params.cartID;
//     const itemID = req.params.itemID;

//     try {
//         const cart = await Cart.findById(cartID);
//         if (!cart) {
//             return res.status(404).json({ msg: "Cart not found." });
//         }

//         const item = await Item.findById(itemID);
//         if (!item) {
//             return res.status(404).json({ msg: "Item not found." });
//         }

//         cart.items.push(itemID);
//         await cart.save();

//         res.status(200).json({ msg: "Item added to the cart successfully!" });
//     } catch (err) {
//         res.status(500).json({ msg: err.toString() });
//     }
// });

// Add Item to Cart
router.put("/:id/addItem/:itemID", async (req, res) => {
    const cartID = req.params.id;
    const itemID = req.params.itemID;

    try {
        const cart = await Cart.findById(cartID);
        console.log("Cart:", cart); // Added console log
        if (!cart) {
            return res.status(404).json({ msg: "Cart Not Found" });
        }

        const item = await Item.findById(itemID);
        console.log("Item:", item); // Added console log
        if (!item) {
            return res.status(404).json({ msg: "Item Not Found" });
        }

        const cartItemIndex = cart.items.findIndex((i) => i.item && i.item.toString() === itemID);
        console.log("CartItemIndex:", cartItemIndex); // Added console log
        if (cartItemIndex !== -1) {
            cart.items[cartItemIndex].quantity++;
            await cart.save();
            return res.status(200).json({ msg: "Item quantity incremented in cart" });
        }


        cart.items.push({ item: item._id, quantity: 1 });

        await cart.save();

        res.status(200).json({ msg: "Item added to cart" });
    } catch (err) {
        console.log("Error:", err); // Added console log
        res.status(500).json({ msg: err.toString() });
    }
});

// Decrease Item Quantity in Cart
router.put("/:id/decreaseItem/:itemID", async (req, res) => {
    const cartID = req.params.id;
    const itemID = req.params.itemID;

    try {
        const cart = await Cart.findById(cartID);
        console.log("Cart:", cart); // Added console log
        if (!cart) {
            return res.status(404).json({ msg: "Cart Not Found" });
        }

        const cartItemIndex = cart.items.findIndex((i) => i.item && i.item.toString() === itemID);
        console.log("CartItemIndex:", cartItemIndex); // Added console log
        if (cartItemIndex !== -1) {
            if (cart.items[cartItemIndex].quantity > 1) {
                cart.items[cartItemIndex].quantity--;
                await cart.save();
                return res.status(200).json({ msg: "Item quantity decreased in cart" });
            } else {
                cart.items.splice(cartItemIndex, 1); // Remove item from cart if quantity becomes 0
                await cart.save();
                return res.status(200).json({ msg: "Item removed from cart" });
            }
        } else {
            return res.status(404).json({ msg: "Item Not Found in Cart" });
        }
    } catch (err) {
        console.log("Error:", err); // Added console log
        res.status(500).json({ msg: err.toString() });
    }
});

// Remove Item from Cart
router.delete("/:id/removeItem/:itemID", async (req, res) => {
    const cartID = req.params.id;
    const itemID = req.params.itemID;

    try {
        const cart = await Cart.findById(cartID);
        console.log("Cart:", cart); // Added console log
        if (!cart) {
            return res.status(404).json({ msg: "Cart Not Found" });
        }

        const cartItemIndex = cart.items.findIndex((i) => i.item && i.item.toString() === itemID);
        console.log("CartItemIndex:", cartItemIndex); // Added console log
        if (cartItemIndex !== -1) {
            cart.items.splice(cartItemIndex, 1);
            await cart.save();
            return res.status(200).json({ msg: "Item removed from cart" });
        } else {
            return res.status(404).json({ msg: "Item Not Found in Cart" });
        }
    } catch (err) {
        console.log("Error:", err); // Added console log
        res.status(500).json({ msg: err.toString() });
    }
});






// // Remove Item from Cart
// router.put("/cart/:id/removeItem/:itemID", async (req, res) => {
//     const cartID = req.params.id;
//     const itemID = req.params.itemID;

//     try {
//         const cart = await Cart.findById(cartID);
//         if (!cart) {
//             return res.status(404).json({ msg: "Cart Not Found" });
//         }

//         const cartItem = cart.items.find((i) => i.item.toString() === itemID);
//         if (!cartItem) {
//             return res.status(404).json({ msg: "Item Not Found in Cart" });
//         }

//         if (cartItem.quantity > 1) {
//             cartItem.quantity--;
//             await cart.save();
//             return res.status(200).json({ msg: "Item quantity decremented in cart" });
//         }

//         const index = cart.items.indexOf(cartItem);
//         cart.items.splice(index, 1);
//         await cart.save();

//         res.status(200).json({ msg: "Item removed from cart" });
//     } catch (err) {
//         res.status(500).json({ msg: err.toString() });
//     }
// });

export default router;