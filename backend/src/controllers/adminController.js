const bcrypt = require("bcryptjs");
const User = require("../models/User"),
  AP = require("../models/AdminProfile"),
  P = require("../models/Product"),
  C = require("../models/Category"),
  O = require("../models/Order"),
  A = require("../models/AdminAction");
const audit = require("../services/auditService");
exports.dashboard = async (req, res, next) => {
  try {
    const [
      users,
      products,
      cats,
      orders,
      pending,
      delivered,
      cancelled,
      rev,
      low,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      // Total users
      User.countDocuments({
        role: "USER",
      }),

      // Active products
      P.countDocuments({
        status: "ACTIVE",
      }),

      // Active categories
      C.countDocuments({
        status: "ACTIVE",
      }),

      // Total orders
      O.countDocuments(),

      // Pending orders
      O.countDocuments({
        order_status: "PENDING",
      }),

      // Delivered orders
      O.countDocuments({
        order_status: "DELIVERED",
      }),

      // Cancelled orders
      O.countDocuments({
        order_status: "CANCELLED",
      }),

      // Revenue
      O.aggregate([
        {
          $match: {
            payment_status: "SUCCESSFUL",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$total_amount",
            },
          },
        },
      ]),

      // Number of low-stock products
      P.countDocuments({
        stock_quantity: {
          $gt: 0,
          $lte: 5,
        },
        status: "ACTIVE",
      }),

      // Recent 5 orders
      O.find({})
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .select("order_id total_amount order_status payment_status createdAt")
        .lean(),

      // Low-stock products
      P.find({
        stock_quantity: {
          $gt: 0,
          $lte: 5,
        },
        status: "ACTIVE",
      })
        .sort({
          stock_quantity: 1,
        })
        .limit(5)
        .select("product_name stock_quantity status")
        .lean(),
    ]);
    res.json({
      success: true,
      data: {
        users,
        products,
        categories: cats,
        orders,

        pendingOrders: pending,
        deliveredOrders: delivered,
        cancelledOrders: cancelled,

        revenue: rev?.[0]?.total || 0,

        lowStock: low,

        recentOrders,
        lowStockProducts,
      },
    });
  } catch (e) {
    next(e);
  }
};
exports.statistics = async (req, res, next) => {
  try {
    const [byStatus, byCategory, best] = await Promise.all([
      O.aggregate([{ $group: { _id: "$order_status", count: { $sum: 1 } } }]),
      P.aggregate([
        { $group: { _id: "$category_id", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
        { $project: { category: "$category.category_name", count: 1 } },
      ]),
      O.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product_id",
            sold: { $sum: "$items.quantity" },
            name: { $first: "$items.product_name" },
          },
        },
        { $sort: { sold: -1 } },
        { $limit: 10 },
      ]),
    ]);
    res.json({
      success: true,
      data: { byStatus, byCategory, bestSelling: best },
    });
  } catch (e) {
    next(e);
  }
};

exports.admins = async (req, res, next) => {
  try {
    const admins = await User.find({
      role: "ADMIN",
    })
      .select("-password")
      .lean();

    const adminProfiles = await AP.find({
      user_id: {
        $in: admins.map((admin) => admin._id),
      },
    }).lean();

    const profileMap = {};

    adminProfiles.forEach((profile) => {
      profileMap[profile.user_id.toString()] = profile;
    });

    const result = admins.map((admin) => ({
      ...admin,
      status: profileMap[admin._id.toString()]?.status || "ACTIVE",
    }));

    res.json({
      success: true,
      message: "Admins fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    // Check if user already exists
    let u = await User.findOne({ email });

    // If user already exists
    if (u) {
      // If existing user is not an admin, promote them
      if (u.role !== "ADMIN") {
        u.role = "ADMIN";
        u.name = name;

        if (phone) {
          u.phone = phone;
        }

        await u.save();
      }
    } else {
      // New admin password
      const plainPassword = password || "Admin@123";

      // Hash password before saving
      const hashedPassword = await bcrypt.hash(plainPassword, 12);

      // Create new admin
      u = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        role: "ADMIN",
      });
    }

    // Create/update AdminProfile
    await AP.findOneAndUpdate(
      { user_id: u._id },
      {
        user_id: u._id,
        status: "ACTIVE",
      },
      {
        upsert: true,
        new: true,
      },
    );

    // Audit log
    await audit.log(req.user, "CREATE_ADMIN", "User", u._id);

    // Return admin without password
    const admin = await User.findById(u._id).select("-password");

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: admin,
    });
  } catch (e) {
    next(e);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(400).json({
        success: false,
        message: "Selected user is not an admin",
      });
    }

    // Hash the new password
    user.password = await bcrypt.hash(password, 12);

    await user.save();

    await audit.log(req.user, "RESET_ADMIN_PASSWORD", "User", user._id);

    res.json({
      success: true,
      message: "Admin password reset successfully",
    });
  } catch (e) {
    next(e);
  }
};

exports.updateAdmin = async (req, res, next) => {
  try {
    const { name, email, status } = req.body;

    const user = await User.findOne({
      _id: req.params.id,
      role: "ADMIN",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (name !== undefined) {
      user.name = name.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.params.id },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email is already in use",
        });
      }

      user.email = normalizedEmail;
    }

    await user.save();

    if (status !== undefined && !["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin status",
      });
    }

    const adminProfile = await AP.findOneAndUpdate(
      { user_id: user._id },
      {
        $set: {
          ...(status !== undefined && { status }),
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    res.json({
      success: true,
      message: "Admin updated successfully",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        adminProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAdmin = async (req, res, next) => {
  try {
    const adminId = req.params.id;

    const admin = await User.findOne({
      _id: adminId,
      role: "ADMIN",
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Prevent an admin from deleting their own account
    if (req.user._id.toString() === adminId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account",
      });
    }

    const adminCount = await User.countDocuments({
      role: "ADMIN",
    });

    // Prevent deleting the final administrator
    if (adminCount <= 1) {
      return res.status(400).json({
        success: false,
        message: "The final administrator cannot be deleted",
      });
    }

    // Remove AdminProfile
    await AP.deleteOne({
      user_id: admin._id,
    });

    // Remove admin privileges
    admin.role = "USER";
    await admin.save();

    res.json({
      success: true,
      message: "Admin removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.resetAdminPassword = async (req, res, next) => {
  try {
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const adminUser = await User.findOne({
      _id: req.params.id,
      role: "ADMIN",
    });

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const bcrypt = require("bcryptjs");

    const hashedPassword = await bcrypt.hash(password, 12);

    adminUser.password = hashedPassword;

    await adminUser.save();

    await audit.log(req.user, "RESET_ADMIN_PASSWORD", "User", adminUser._id);

    return res.json({
      success: true,
      message: "Admin password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.orders = async (req, res, next) => {
  try {
    const q = req.query.status ? { order_status: req.query.status } : {},
      data = await O.find(q)
        .populate("user_id", "name email phone")
        .sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};
exports.order = async (req, res, next) => {
  try {
    const d = await O.findById(req.params.id)
      .populate("user_id", "name email phone")
      .populate("payment_id");
    if (!d)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    res.json({ success: true, data: d });
  } catch (e) {
    next(e);
  }
};
exports.updateOrder = async (req, res, next) => {
  try {
    const d = await O.findById(req.params.id);
    if (!d)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    const allowed = [
      "PENDING",
      "CONFIRMED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];
    if (!allowed.includes(req.body.order_status))
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    d.order_status = req.body.order_status;
    await d.save();
    await audit.log(req.user, "UPDATE_ORDER_STATUS", "Order", d._id);
    res.json({ success: true, data: d });
  } catch (e) {
    next(e);
  }
};
exports.auditLogs = async (req, res, next) => {
  try {
    const data = await A.find()
      .populate("admin_id", "name email")
      .sort({ timestamp: -1 })
      .limit(200);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};
