const jwt = require("jsonwebtoken");
const User = require("../models/User");
exports.protect = async (req, res, next) => {
  try {
    const h = req.headers.authorization || "";
    if (!h.startsWith("Bearer "))
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    const d = jwt.verify(h.slice(7), process.env.JWT_SECRET);
    req.user = await User.findById(d.id).select("-password");
    if (!req.user)
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    next();
  } catch (e) {
    next(Object.assign(new Error("Invalid or expired token"), { status: 401 }));
  }
};
exports.admin = (req, res, next) =>
  req.user?.role === "ADMIN"
    ? next()
    : res
        .status(403)
        .json({ success: false, message: "Admin access required" });
