const r = require("express").Router();

const a = require("../middleware/authMiddleware");
const c = require("../controllers/adminController");
const cat = require("../controllers/categoryController");
const p = require("../controllers/productController");
const up = require("../middleware/uploadMiddleware").upload;

// Protect every admin route
r.use(a.protect, a.admin);

// ==============================
// ADMIN DASHBOARD
// ==============================

r.get("/dashboard", c.dashboard);
r.get("/statistics", c.statistics);

// ==============================
// ADMIN MANAGEMENT
// ==============================

r.get("/admins", c.admins);
r.post("/admins", c.createAdmin);
r.put("/admins/:id", c.updateAdmin);
r.delete("/admins/:id", c.deleteAdmin);

// RESET ADMIN PASSWORD
r.patch("/admins/:id/password", c.resetPassword);

// ==============================
// ORDERS
// ==============================

r.get("/orders", c.orders);
r.get("/orders/:id", c.order);
r.patch("/orders/:id/status", c.updateOrder);

// ==============================
// AUDIT LOGS
// ==============================

r.get("/audit-logs", c.auditLogs);

// ==============================
// CATEGORIES
// ==============================

r.post(
  "/categories",
  up.single("image"),
  cat.create
);

r.put(
  "/categories/:id",
  up.single("image"),
  cat.update
);

r.delete(
  "/categories/:id",
  cat.remove
);

// ==============================
// PRODUCTS
// ==============================

r.post(
  "/products",
  up.array("images", 10),
  p.create
);

r.put(
  "/products/:id",
  up.array("images", 10),
  p.update
);

r.delete(
  "/products/:id",
  p.remove
);

r.patch("/products/:id/status", p.updateStatus);

r.patch(
  "/products/:id/stock",
  p.stock
);

r.get(
  "/products",
  p.adminList
);

module.exports = r;