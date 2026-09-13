require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose"),
  bcrypt = require("bcryptjs"),
  User = require("../src/models/User"),
  AP = require("../src/models/AdminProfile"),
  C = require("../src/models/Category"),
  P = require("../src/models/Product");
const cats = [
  "Men",
  "Women",
  "Kids",
  "T-Shirts",
  "Shirts",
  "Jeans",
  "Dresses",
  "Jackets",
  "Shoes",
  "Accessories",
];
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([
    User.deleteMany({}),
    AP.deleteMany({}),
    C.deleteMany({}),
    P.deleteMany({}),
  ]);
  const u = await User.create({
    name: "Super Admin",
    email: process.env.SEED_ADMIN_EMAIL || "admin@example.com",
    password: await bcrypt.hash(
      process.env.SEED_ADMIN_PASSWORD || "Admin@123",
      12,
    ),
    role: "ADMIN",
  });
  await AP.create({ user_id: u._id });
  const cs = await C.insertMany(
    cats.map((category_name) => ({
      category_name,
      description: `${category_name} clothing`,
    })),
  );
  const products = [];
  for (let i = 0; i < 30; i++) {
    products.push({
      category_id: cs[i % cs.length]._id,
      product_name: `Classic ${cats[i % cats.length]} ${i + 1}`,
      description: "Comfortable premium clothing for everyday wear.",
      price: 699 + (i % 8) * 150,
      discount_price: 599 + (i % 8) * 120,
      brand: i % 2 ? "UrbanWear" : "StyleHub",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "White", "Blue"],
      stock_quantity: 10 + (i % 15),
      product_images: [],
      status: "ACTIVE",
    });
  }
  await P.insertMany(products);
  console.log("Seed complete");
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
