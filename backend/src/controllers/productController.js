const P = require("../models/Product"),
  audit = require("../services/auditService");
exports.list = async (req, res, next) => {
  try {
    let q = { status: "ACTIVE" };
    if (req.query.category) q.category_id = req.query.category;
    if (req.query.search) {
  const search = req.query.search.trim();

  if (search) {
    q.$or = [
      { product_name: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
}
    if (req.query.size) q.sizes = req.query.size;
    if (req.query.color) q.colors = req.query.color;
    if (req.query.minPrice || req.query.maxPrice) {
  const min = req.query.minPrice ? Number(req.query.minPrice) : 0;
  const max = req.query.maxPrice
    ? Number(req.query.maxPrice)
    : Number.MAX_SAFE_INTEGER;

  q.$expr = {
    $and: [
      {
        $gte: [
          { $ifNull: ["$discount_price", "$price"] },
          min,
        ],
      },
      {
        $lte: [
          { $ifNull: ["$discount_price", "$price"] },
          max,
        ],
      },
    ],
  };
}
    const sort =
      req.query.sort === "price_asc"
        ? { price: 1 }
        : req.query.sort === "price_desc"
          ? { price: -1 }
          : { createdAt: -1 };
    const page = Math.max(1, +req.query.page || 1),
      limit = Math.min(50, +req.query.limit || 12),
      total = await P.countDocuments(q),
      data = await P.find(q)
        .populate("category_id", "category_name")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);
    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (e) {
    next(e);
  }
};
exports.get = async (req, res, next) => {
  try {
    const d = await P.findById(req.params.id).populate("category_id");
    if (!d)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, data: d });
  } catch (e) {
    next(e);
  }
};
exports.create = async (req, res, next) => {
  try {
    let images = req.files?.map((f) => "/uploads/products/" + f.filename) || [];
    const d = await P.create({
      ...req.body,
      sizes: Array.isArray(req.body.sizes)
        ? req.body.sizes
        : JSON.parse(req.body.sizes || "[]"),
      colors: Array.isArray(req.body.colors)
        ? req.body.colors
        : JSON.parse(req.body.colors || "[]"),
      product_images: images.length ? images : req.body.product_images || [],
      price: +req.body.price,
      discount_price: req.body.discount_price
        ? +req.body.discount_price
        : undefined,
      stock_quantity: +req.body.stock_quantity,
    });
    await audit.log(req.user, "CREATE_PRODUCT", "Product", d._id);
    res.status(201).json({ success: true, data: d });
  } catch (e) {
    next(e);
  }
};
exports.update = async (req, res, next) => {
  try {
    const d = await P.findById(req.params.id);
    if (!d)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    Object.assign(d, req.body);
    if (req.file) {
    }
    if (req.files?.length)
      d.product_images = req.files.map(
        (f) => "/uploads/products/" + f.filename,
      );
    if (req.body.sizes && typeof req.body.sizes === "string")
      d.sizes = JSON.parse(req.body.sizes);
    if (req.body.colors && typeof req.body.colors === "string")
      d.colors = JSON.parse(req.body.colors);
    await d.save();
    await audit.log(req.user, "UPDATE_PRODUCT", "Product", d._id);
    res.json({ success: true, data: d });
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const d = await P.findByIdAndDelete(req.params.id);

    if (!d) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Product not found"
        });
    }

    await audit.log(
      req.user,
      "DELETE_PRODUCT",
      "Product",
      d._id
    );

    res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (e) {
    next(e);
  }
};

exports.stock = async (req, res, next) => {
  try {
    const d = await P.findByIdAndUpdate(
      req.params.id,
      { stock_quantity: Math.max(0, +req.body.stock_quantity) },
      { new: true, runValidators: true },
    );
    if (!d)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    await audit.log(req.user, "UPDATE_STOCK", "Product", d._id);
    res.json({ success: true, data: d });
  } catch (e) {
    next(e);
  }
};
exports.adminList = async (req, res, next) => {
  try {
    const data = await P.find()
      .populate("category_id", "category_name")
      .sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product status"
      });
    }

    const product = await P.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    await audit.log(
      req.user,
      "UPDATE_PRODUCT_STATUS",
      "Product",
      product._id
    );

    res.json({
      success: true,
      data: product
    });

  } catch (e) {
    next(e);
  }
};
