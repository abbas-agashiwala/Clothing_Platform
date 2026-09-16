const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Address = require("../models/Address");
const mongoose = require("mongoose");
const crypto = require("crypto");
const { ok, fail } = require("../utils/responseHandler");

async function buildOrder(
  session,
  userId,
  addressId,
  paymentMethod,
  paymentId,
) {
  const cart = await Cart.findOne({ user_id: userId }).session(session);
  if (!cart || !cart.items.length)
    throw Object.assign(new Error("Cart is empty"), { status: 400 });
  const address = await Address.findOne({
    _id: addressId,
    user_id: userId,
  }).session(session);
  if (!address)
    throw Object.assign(new Error("Address not found"), { status: 404 });
  let subtotal = 0;
  const items = [];
  for (const ci of cart.items) {
    const p = await Product.findById(ci.product_id).session(session);
    if (!p || p.status !== "ACTIVE" || p.stock_quantity < ci.quantity)
      throw Object.assign(
        new Error(`Insufficient stock for ${p?.product_name || "product"}`),
        { status: 409 },
      );
    const price = p.discount_price ?? p.price,
      sub = price * ci.quantity;
    subtotal += sub;
    items.push({
      product_id: p._id,
      product_name: p.product_name,
      quantity: ci.quantity,
      price,
      size: ci.size,
      color: ci.color,
      subtotal: sub,
    });
  }
  const delivery = subtotal >= 1000 ? 0 : 80,
    total = subtotal + delivery;
  const [order] = await Order.create(
    [
      {
        user_id: userId,
        address_id: address._id,
        address_snapshot: address.toObject(),
        items,
        total_amount: total,
        delivery_charge: delivery,
        discount: 0,
        order_status:
          paymentMethod === "CASH_ON_DELIVERY" ? "CONFIRMED" : "CONFIRMED",
        payment_status:
          paymentMethod === "CASH_ON_DELIVERY" ? "PENDING" : "SUCCESSFUL",
        payment_id: paymentId,
      },
    ],
    { session },
  );
  for (const ci of cart.items) {
    const r = await Product.updateOne(
      { _id: ci.product_id, stock_quantity: { $gte: ci.quantity } },
      { $inc: { stock_quantity: -ci.quantity } },
    ).session(session);
    if (r.modifiedCount !== 1)
      throw Object.assign(new Error("Stock changed. Please retry."), {
        status: 409,
      });
  }
  await Cart.updateOne({ _id: cart._id }, { $set: { items: [] } }).session(
    session,
  );
  return order;
}

exports.create = async (req, res, next) => {
  try {
    const method = req.body.payment_method;
    if (!["CREDIT_CARD", "DEBIT_CARD", "UPI", "NET_BANKING"].includes(method))
      return fail(res, "Invalid online payment method", 400);
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)
      return fail(
        res,
        "Razorpay is not configured. Configure credentials in backend .env.",
        503,
      );
    const Razorpay = require("razorpay");
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart?.items.length) return fail(res, "Cart is empty", 400);
    let subtotal = 0;
    for (const ci of cart.items) {
      const p = await Product.findById(ci.product_id);
      if (!p || p.stock_quantity < ci.quantity)
        return fail(res, "Insufficient stock", 409);
      subtotal += (p.discount_price ?? p.price) * ci.quantity;
    }
    const amount = subtotal + (subtotal >= 1000 ? 0 : 80);
    const ro = await rzp.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });
    const payment = await Payment.create({
      user_id: req.user._id,
      payment_method: method,
      amount,
      payment_status: "PENDING",
      gateway_order_id: ro.id,
    });
    ok(res, {
      paymentId: payment._id,
      razorpayOrderId: ro.id,
      amount: ro.amount,
      currency: ro.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      addressId: req.body.address_id,
    }, "Payment gateway order created");
  } catch (e) {
    next(e);
  }
};

exports.verify = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payment_id,
      address_id,
    } = req.body;
    if (!process.env.RAZORPAY_KEY_SECRET)
      throw Object.assign(new Error("Razorpay is not configured"), {
        status: 503,
      });
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    if (expected !== razorpay_signature)
      throw Object.assign(new Error("Payment verification failed"), {
        status: 400,
      });
    const p = await Payment.findOne({
      _id: payment_id,
      user_id: req.user._id,
      gateway_order_id: razorpay_order_id,
    }).session(session);
    if (!p)
      throw Object.assign(new Error("Payment intent not found"), {
        status: 404,
      });
    p.transaction_id = razorpay_payment_id;
    p.payment_status = "SUCCESSFUL";
    p.payment_date = new Date();
    await p.save({ session });
    const order = await buildOrder(
  session,
  req.user._id,
  address_id,
  p.payment_method,
  p._id,
  "SUCCESSFUL"
);
    p.order_id = order._id;
    await p.save({ session });
    await session.commitTransaction();
    ok(
  res,
  { order, payment: p },
  "Payment verified and order created",
  201
);
  } catch (e) {
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};
exports.get = async (req, res, next) => {
  try {
    const p = await Payment.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });
    if (!p) return fail(res, "Payment not found", 404);
    ok(res, p, "Payment fetched");
  } catch (e) {
    next(e);
  }
};
