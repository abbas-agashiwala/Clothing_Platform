const m = require("mongoose");
module.exports = m.model(
  "Payment",
  new m.Schema(
    {
      user_id: { type: m.Schema.Types.ObjectId, ref: "User", required: true },
      order_id: { type: m.Schema.Types.ObjectId, ref: "Order" },
      transaction_id: String,
      payment_method: {
        type: String,
        enum: [
          "CREDIT_CARD",
          "DEBIT_CARD",
          "UPI",
          "NET_BANKING",
          "CASH_ON_DELIVERY",
        ],
        required: true,
      },
      amount: { type: Number, min: 0, required: true },
      payment_status: {
        type: String,
        enum: ["PENDING", "SUCCESSFUL", "FAILED", "REFUNDED"],
        default: "PENDING",
      },
      payment_date: Date,
      gateway_order_id: String,
    },
    { timestamps: true },
  ),
);
