const m = require("mongoose");
const s = new m.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    profile_image: String,
  },
  { timestamps: true },
);
module.exports = m.model("User", s);
