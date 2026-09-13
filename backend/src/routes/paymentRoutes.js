const r = require("express").Router(),
  c = require("../controllers/paymentController"),
  a = require("../middleware/authMiddleware").protect;
r.use(a);
r.post("/create", c.create);
r.post("/verify", c.verify);
r.get("/:id", c.get);
module.exports = r;
