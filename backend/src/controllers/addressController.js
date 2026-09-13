const A = require("../models/Address");
exports.list = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await A.find({ user_id: req.user._id }).sort({
        is_default: -1,
        createdAt: -1,
      }),
    });
  } catch (e) {
    next(e);
  }
};
exports.get = async (req, res, next) => {
  try {
    const d = await A.findOne({ _id: req.params.id, user_id: req.user._id });
    if (!d)
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    res.json({ success: true, data: d });
  } catch (e) {
    next(e);
  }
};
exports.create = async (req, res, next) => {
  try {
    if (req.body.is_default)
      await A.updateMany({ user_id: req.user._id }, { is_default: false });
    let d = await A.create({ ...req.body, user_id: req.user._id });
    if ((await A.countDocuments({ user_id: req.user._id })) === 1) {
      d.is_default = true;
      await d.save();
    }
    res.status(201).json({ success: true, data: d });
  } catch (e) {
    next(e);
  }
};
exports.update = async (req, res, next) => {
  try {
    if (req.body.is_default)
      await A.updateMany({ user_id: req.user._id }, { is_default: false });
    const d = await A.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!d)
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    res.json({ success: true, data: d });
  } catch (e) {
    next(e);
  }
};
exports.remove = async (req, res, next) => {
  try {
    const d = await A.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id,
    });
    if (!d)
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    next(e);
  }
};
exports.default = async (req, res, next) => {
  try {
    await A.updateMany({ user_id: req.user._id }, { is_default: false });
    const d = await A.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      { is_default: true },
      { new: true },
    );
    if (!d)
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    res.json({ success: true, data: d });
  } catch (e) {
    next(e);
  }
};
