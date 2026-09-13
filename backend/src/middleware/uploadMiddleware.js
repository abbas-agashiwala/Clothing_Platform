const multer = require("multer"),
  path = require("path"),
  fs = require("fs");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.originalUrl.includes("/products")
      ? "products"
      : req.originalUrl.includes("/categories")
        ? "categories"
        : "profiles";
    const d = path.join(__dirname, "../../uploads", type);
    console.log("UPLOAD DIRECTORY:", d);
    fs.mkdirSync(d, { recursive: true });
    cb(null, d);
  },
  filename: (req, file, cb) =>
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname),
    ),
});
exports.upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (r, f, c) =>
    /^image\/(jpeg|png|webp|jpg)$/.test(f.mimetype)
      ? c(null, true)
      : c(new Error("Only image files are allowed")),
});
