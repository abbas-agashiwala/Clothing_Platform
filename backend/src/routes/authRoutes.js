const router = require("express").Router();
const c = require("../controllers/authController");
const { body } = require("express-validator");
const { validate } = require("../middleware/validationMiddleware");
const { protect } = require("../middleware/authMiddleware");

// Register
router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),

    body("email")
      .isEmail()
      .withMessage("Please enter a valid email"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),

    body("confirmPassword")
      .notEmpty()
      .withMessage("Confirm password is required"),

    body("phone")
      .optional()
      .trim(),
  ],
  validate,
  c.register
);

// Login
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email"),

    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],
  validate,
  c.login
);

// Logout
router.post("/logout", protect, c.logout);

// Current authenticated user
router.get("/me", protect, c.me);

// Update profile
router.put(
  "/profile",
  protect,
  c.profile
);

router.put("/change-password", protect, c.changePassword);

module.exports = router;