// packages
import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

// utils
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();
const port = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const corsOptions = {
  origin: 'https://ecommercekue.vercel.app',
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true
};

app.use(cors(corsOptions));

app.use("/api/users", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);

// app.get("/api/config/paypal", (req, res) => {
//   res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
// });

app.get("/api/config/midtrans", (req, res) => {
  res.send({
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });
});

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname + "/uploads")));

app.listen(port, () => console.log(`Server running on port: ${port}`));
