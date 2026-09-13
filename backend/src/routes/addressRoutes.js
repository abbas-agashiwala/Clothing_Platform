const r = require("express").Router(),
  c = require("../controllers/addressController"),
  a = require("../middleware/authMiddleware").protect;
r.use(a);
r.get("/", c.list);
r.post("/", c.create);
r.get("/:id", c.get);
r.put("/:id", c.update);
r.delete("/:id", c.remove);
r.patch("/:id/default", c.default);
module.exports = r;
