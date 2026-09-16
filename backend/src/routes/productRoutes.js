const r = require("express").Router(),
  c = require("../controllers/productController"),
  a = require("../middleware/authMiddleware"),
  up = require("../middleware/uploadMiddleware").upload;
r.get("/", c.list);
r.get("/admin/all", a.protect, a.admin, c.adminList);
r.get("/category/:categoryId", (req, res, next) => {
  req.query.category = req.params.categoryId;
  c.list(req, res, next);
});
r.get("/:id", c.get);
r.post("/", a.protect, a.admin, up.array("images", 10), c.create);
r.put("/:id", a.protect, a.admin, up.array("images", 10), c.update);
r.delete("/:id", a.protect, a.admin, c.remove);
r.patch("/:id/stock", a.protect, a.admin, c.stock);
module.exports = r;
