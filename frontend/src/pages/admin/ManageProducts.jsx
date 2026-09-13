
import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function ManageProducts() {
  const emptyForm = {
    product_name: "",
    brand: "",
    price: "",
    discount_price: "",
    stock_quantity: "",
    description: "",
    sizes: "",
    colors: "",
    category_id: "",
  };

  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);

  const [editingProduct, setEditingProduct] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProducts = async () => {
    try {
      const response = await api.get("/admin/products");
      setProducts(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load products"
      );
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get("/categories?limit=100");
      setCats(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load categories"
      );
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImages = (e) => {
    setImages(Array.from(e.target.files || []));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImages([]);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!form.category_id) {
        throw new Error("Please select a category");
      }

      if (!form.product_name.trim()) {
        throw new Error("Product name is required");
      }

      if (!form.brand.trim()) {
        throw new Error("Brand is required");
      }

      if (!form.price || Number(form.price) < 0) {
        throw new Error("Please enter a valid price");
      }

      const data = new FormData();

      data.append("product_name", form.product_name);
      data.append("brand", form.brand);
      data.append("price", form.price);
      data.append("category_id", form.category_id);
      data.append("stock_quantity", form.stock_quantity || 0);
      data.append("description", form.description);

      if (form.discount_price !== "") {
        data.append("discount_price", form.discount_price);
      }

      data.append(
        "sizes",
        JSON.stringify(
          form.sizes
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        )
      );

      data.append(
        "colors",
        JSON.stringify(
          form.colors
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        )
      );

      images.forEach((image) => {
        data.append("images", image);
      });

      if (editingProduct) {
        await api.put(
          `/admin/products/${editingProduct._id}`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setMessage("Product updated successfully");
      } else {
        await api.post("/admin/products", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setMessage("Product added successfully");
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Operation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);

    setForm({
      product_name: product.product_name || "",
      brand: product.brand || "",
      price: product.price ?? "",
      discount_price: product.discount_price ?? "",
      stock_quantity: product.stock_quantity ?? "",
      description: product.description || "",
      sizes: Array.isArray(product.sizes)
        ? product.sizes.join(", ")
        : "",
      colors: Array.isArray(product.colors)
        ? product.colors.join(", ")
        : "",
      category_id:
        product.category_id?._id ||
        product.category_id ||
        "",
    });

    setImages([]);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleStatus = async (product) => {
    try {
      setError("");
      setMessage("");

      const newStatus =
        product.status === "ACTIVE"
          ? "INACTIVE"
          : "ACTIVE";

      await api.patch(
        `/admin/products/${product._id}/status`,
        {
          status: newStatus,
        }
      );

      setMessage(
        `Product ${
          newStatus === "ACTIVE"
            ? "activated"
            : "deactivated"
        } successfully`
      );

      await loadProducts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update product status"
      );
    }
  };

  const handleStock = async (product) => {
    const value = window.prompt(
      "Enter new stock quantity:",
      product.stock_quantity
    );

    if (value === null) return;

    const stock = Number(value);

    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a non-negative whole number");
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.patch(
        `/admin/products/${product._id}/stock`,
        {
          stock_quantity: stock,
        }
      );

      setMessage("Stock updated successfully");

      await loadProducts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update stock"
      );
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${product.product_name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await api.delete(
        `/admin/products/${product._id}`
      );

      setMessage("Product deactivated successfully");

      await loadProducts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to deactivate product"
      );
    }
  };

  return (
    <div className="container-fluid">

      <h1 className="mb-4">
        {editingProduct
          ? "Edit Product"
          : "Products"}
      </h1>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {/* PRODUCT FORM */}

      <div className="card mb-4">
        <div className="card-body">

          <h4 className="mb-3">
            {editingProduct
              ? "Edit Product"
              : "Add New Product"}
          </h4>

          <form onSubmit={handleSubmit}>

            <div className="row">

              <div className="col-md-4 mb-3">
                <label className="form-label">
                  Product Name
                </label>

                <input
                  type="text"
                  name="product_name"
                  className="form-control"
                  value={form.product_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">
                  Brand
                </label>

                <input
                  type="text"
                  name="brand"
                  className="form-control"
                  value={form.brand}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">
                  Category
                </label>

                <select
                  name="category_id"
                  className="form-select"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Category
                  </option>

                  {cats.map((cat) => (
                    <option
                      value={cat._id}
                      key={cat._id}
                    >
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">
                  Price
                </label>

                <input
                  type="number"
                  name="price"
                  className="form-control"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">
                  Discount Price
                </label>

                <input
                  type="number"
                  name="discount_price"
                  className="form-control"
                  value={form.discount_price}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">
                  Stock Quantity
                </label>

                <input
                  type="number"
                  name="stock_quantity"
                  className="form-control"
                  value={form.stock_quantity}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">
                  Product Images
                </label>

                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  multiple
                  onChange={handleImages}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Sizes
                </label>

                <input
                  type="text"
                  name="sizes"
                  className="form-control"
                  placeholder="S, M, L, XL"
                  value={form.sizes}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Colors
                </label>

                <input
                  type="text"
                  name="colors"
                  className="form-control"
                  placeholder="Black, White, Blue"
                  value={form.colors}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">
                  Description
                </label>

                <textarea
                  name="description"
                  className="form-control"
                  rows="4"
                  placeholder="Enter product description"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

            </div>

            <button
              type="submit"
              className="btn btn-dark me-2"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingProduct
                ? "Update Product"
                : "Add Product"}
            </button>

            {editingProduct && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}

          </form>
        </div>
      </div>

      {/* PRODUCT LIST */}

      <div className="card">

        <div className="card-body">

          <h4 className="mb-3">
            Product List
          </h4>

          <div className="table-responsive">

            <table className="table table-bordered table-hover">

              <thead className="table-dark">

                <tr>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {products.length === 0 ? (

                  <tr>
                    <td
                      colSpan="7"
                      className="text-center"
                    >
                      No products found
                    </td>
                  </tr>

                ) : (

                  products.map((product) => (

                    <tr key={product._id}>

                      <td>
                        {product.product_name}
                      </td>

                      <td>
                        {product.brand}
                      </td>

                      <td>
                        {product.category_id?.category_name ||
                          "N/A"}
                      </td>

                      <td>
                        ₹{product.price}
                      </td>

                      <td>
                        {product.stock_quantity}
                      </td>

                      <td>

                        <span
                          className={`badge ${
                            product.status === "ACTIVE"
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {product.status}
                        </span>

                      </td>

                      <td>

                        <button
                          className="btn btn-sm btn-primary me-1 mb-1"
                          onClick={() =>
                            handleEdit(product)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className={`btn btn-sm ${
                            product.status === "ACTIVE"
                              ? "btn-warning"
                              : "btn-success"
                          } me-1 mb-1`}
                          onClick={() =>
                            handleStatus(product)
                          }
                        >
                          {product.status === "ACTIVE"
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        <button
                          className="btn btn-sm btn-info me-1 mb-1"
                          onClick={() =>
                            handleStock(product)
                          }
                        >
                          Stock
                        </button>

                        <button
                          className="btn btn-sm btn-danger mb-1"
                          onClick={() =>
                            handleDelete(product)
                          }
                        >
                          Delete
                        </button>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}