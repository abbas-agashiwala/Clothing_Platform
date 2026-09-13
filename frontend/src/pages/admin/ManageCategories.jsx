import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    category_name: "",
    description: "",
    status: "ACTIVE",
  });

  const [editingCategory, setEditingCategory] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ==============================
  // Load Categories
  // ==============================
  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/categories?limit=100");

      setCategories(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load categories"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ==============================
  // Add / Update Category
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.category_name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setError("");
      setMessage("");

      if (editingCategory) {
        // UPDATE
        await api.put(
          `/admin/categories/${editingCategory._id}`,
          {
            category_name: form.category_name,
            description: form.description,
            status: form.status,
          }
        );

        setMessage("Category updated successfully");
      } else {
        // CREATE
        await api.post("/admin/categories", {
          category_name: form.category_name,
          description: form.description,
          status: form.status,
        });

        setMessage("Category created successfully");
      }

      // Reset form
      setForm({
        category_name: "",
        description: "",
        status: "ACTIVE",
      });

      setEditingCategory(null);

      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save category"
      );
    }
  };

  // ==============================
  // Edit Category
  // ==============================
  const handleEdit = (category) => {
    setEditingCategory(category);

    setForm({
      category_name: category.category_name || "",
      description: category.description || "",
      status: category.status || "ACTIVE",
    });

    setError("");
    setMessage("");
  };

  // ==============================
  // Cancel Edit
  // ==============================
  const handleCancelEdit = () => {
    setEditingCategory(null);

    setForm({
      category_name: "",
      description: "",
      status: "ACTIVE",
    });

    setError("");
  };

  // ==============================
  // Activate / Deactivate
  // ==============================
  const handleStatusChange = async (category) => {
    try {
      setError("");
      setMessage("");

      const newStatus =
        category.status === "ACTIVE"
          ? "INACTIVE"
          : "ACTIVE";

      await api.put(
        `/admin/categories/${category._id}`,
        {
          category_name: category.category_name,
          description: category.description || "",
          status: newStatus,
        }
      );

      setMessage(
        `Category ${
          newStatus === "ACTIVE"
            ? "activated"
            : "deactivated"
        } successfully`
      );

      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update category status"
      );
    }
  };

  // ==============================
  // Delete Category
  // ==============================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.delete(`/admin/categories/${id}`);

      setMessage("Category deleted successfully");

      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete category"
      );
    }
  };

  return (
    <div className="container-fluid">

      <h1 className="mb-4">Categories</h1>

      {/* ==============================
          Messages
      ============================== */}

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

      {/* ==============================
          Add / Edit Category Form
      ============================== */}

      <div className="card mb-4">
        <div className="card-body">

          <h4 className="mb-3">
            {editingCategory
              ? "Edit Category"
              : "Add Category"}
          </h4>

          <form onSubmit={handleSubmit}>

            <div className="row">

              {/* Category Name */}
              <div className="col-md-4 mb-3">
                <label className="form-label">
                  Category Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Category name"
                  value={form.category_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category_name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              {/* Description */}
              <div className="col-md-4 mb-3">
                <label className="form-label">
                  Description
                </label>

                <textarea
                  className="form-control"
                  rows="1"
                  placeholder="Category description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              {/* Status */}
              <div className="col-md-2 mb-3">
                <label className="form-label">
                  Status
                </label>

                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="ACTIVE">
                    Active
                  </option>

                  <option value="INACTIVE">
                    Inactive
                  </option>
                </select>
              </div>

              {/* Buttons */}
              <div className="col-md-2 mb-3 d-flex align-items-end">

                <button
                  type="submit"
                  className="btn btn-dark me-2"
                >
                  {editingCategory
                    ? "Update"
                    : "Add"}
                </button>

                {editingCategory && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                )}

              </div>

            </div>

          </form>
        </div>
      </div>

      {/* ==============================
          Category List
      ============================== */}

      <div className="card">

        <div className="card-body">

          <h4 className="mb-3">
            Category List
          </h4>

          {loading ? (
            <div className="text-center py-4">
              <div
                className="spinner-border"
                role="status"
              >
                <span className="visually-hidden">
                  Loading...
                </span>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="alert alert-info">
              No categories found.
            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-bordered table-hover align-middle">

                <thead className="table-dark">
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {categories.map((category) => (

                    <tr key={category._id}>

                      <td>
                        {category.category_name}
                      </td>

                      <td>
                        {category.description ||
                          "No description"}
                      </td>

                      <td>

                        <span
                          className={`badge ${
                            category.status === "ACTIVE"
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {category.status}
                        </span>

                      </td>

                      <td>

                        {/* Edit */}
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() =>
                            handleEdit(category)
                          }
                        >
                          Edit
                        </button>

                        {/* Activate / Deactivate */}
                        <button
                          className={`btn btn-sm me-2 ${
                            category.status ===
                            "ACTIVE"
                              ? "btn-warning"
                              : "btn-success"
                          }`}
                          onClick={() =>
                            handleStatusChange(category)
                          }
                        >
                          {category.status ===
                          "ACTIVE"
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        {/* Delete */}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            handleDelete(
                              category._id
                            )
                          }
                        >
                          Delete
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}