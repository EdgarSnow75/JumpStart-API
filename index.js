import mongoose from 'mongoose';
import express from 'express';
import cors from "cors";
import dotenv from "dotenv";
import adminRoutes from "./controllers/AdminController.js"
import customerRoutes from "./controllers/CustomerController.js";
import userRoutes from "./controllers/UserController.js";
import storeRoutes from "./controllers/StoreController.js";
import cartRoutes from "./controllers/CartController.js";
import itemRoutes from "./controllers/ItemController.js";
import cookieParser from "cookie-parser"


const app = express();

dotenv.config();

const { DB_USER, DB_PWD } = process.env;

mongoose
    .connect(
        `mongodb+srv://${DB_USER}:${DB_PWD}@cluster0.rducmhd.mongodb.net/?retryWrites=true&w=majority`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then(() => {
        console.log("Connected to database");
    })
    .catch((err) => {
        console.log("Connection failed", err);
    });

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: ["http://127.0.0.1:5173", "http://localhost:5173", "*"],
        credentials: true,
    })
);

app.use("/api/user", userRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/items", itemRoutes);


app.listen(3000, () => {
    console.log("Server is running on port 3000")
});