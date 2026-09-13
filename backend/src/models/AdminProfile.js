const m = require("mongoose");
module.exports = m.model(
  "AdminProfile",
  new m.Schema(
    {
      user_id: {
        type: m.Schema.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true,
      },
      status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
    },
    { timestamps: true },
  ),
);
