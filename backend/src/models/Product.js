const m = require("mongoose");
const s = new m.Schema(
  {
    category_id: {
      type: m.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    product_name: { type: String, required: true, trim: true },
    description: String,
    price: { type: Number, required: true, min: 0 },
    discount_price: { type: Number, min: 0 },
    brand: { type: String, required: true, trim: true },
    sizes: [String],
    colors: [String],
    stock_quantity: { type: Number, required: true, min: 0, default: 0 },
    product_images: [String],
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true },
);
s.index({ product_name: "text", brand: "text", description: "text" });
s.index({ category_id: 1, price: 1 });
module.exports = m.model("Product", s);
