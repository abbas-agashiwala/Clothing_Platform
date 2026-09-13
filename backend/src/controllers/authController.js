const User = require("../models/User"),
  bcrypt = require("bcryptjs"),
  token = require("../utils/generateToken");
const send = (res, u, msg) =>
  res.json({ success: true, message: msg, data: { token: token(u), user: u } });
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;
    if (password !== confirmPassword)
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    if (await User.findOne({ email }))
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    const u = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      phone,
    });
    u.password = undefined;
    send(res, u, "Registration successful");
  } catch (e) {
    next(e);
  }
};
exports.login = async (req, res, next) => {
  try {
    const u = await User.findOne({ email: req.body.email }).select("+password");
    if (!u || !(await bcrypt.compare(req.body.password, u.password)))
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    u.password = undefined;
    send(res, u, "Login successful");
  } catch (e) {
    next(e);
  }
};
exports.me = async (req, res) => res.json({ success: true, data: req.user });
exports.logout = async (req, res) =>
  res.json({ success: true, message: "Logout successful" });
exports.profile = async (req, res, next) => {
  try {
    const u = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: req.body.name,
        phone: req.body.phone,
        profile_image: req.body.profile_image,
      },
      { new: true },
    ).select("-password");
    res.json({ success: true, data: u });
  } catch (e) {
    next(e);
  }
};
exports.changePassword = async (req, res, next) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword
    } = req.body;

    // Check required fields
    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required"
      });
    }

    // Check new password confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match"
      });
    }

    // Basic password length validation
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters"
      });
    }

    // Get current user with password
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    user.password = await bcrypt.hash(
      newPassword,
      12
    );

    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (e) {
    next(e);
  }
};