require("dotenv").config();
const express = require("express"),
  cors = require("cors"),
  helmet = require("helmet"),
  morgan = require("morgan"),
  rate = require("express-rate-limit"),
  path = require("path");

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(rate({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "API running" }),
);
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/addresses", require("./routes/addressRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use(require("./middleware/errorMiddleware"));
module.exports = app;
