import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "Admin@123",
  });

  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    status: "ACTIVE",
  });

  const [resetAdmin, setResetAdmin] = useState(null);

  const [resetPassword, setResetPassword] = useState("");
  const [confirmResetPassword, setConfirmResetPassword] = useState("");

  const [resetLoading, setResetLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/admins");
      setAdmins(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load administrators");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Add admin
  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      if (!form.name || !form.email || !form.password) {
        setError("Name, email and password are required");
        return;
      }

      await api.post("/admin/admins", form);

      setMessage("Admin created successfully");

      setForm({
        name: "",
        email: "",
        password: "Admin@123",
      });

      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create admin");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!resetAdmin) {
      return;
    }

    if (!resetPassword || !confirmResetPassword) {
      setError("Please enter both password fields");
      return;
    }

    if (resetPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (resetPassword !== confirmResetPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setResetLoading(true);
      setError("");
      setMessage("");

      await api.patch(`/admin/admins/${resetAdmin._id}/password`, {
        password: resetPassword,
        confirmPassword: confirmResetPassword,
      });

      setMessage("Admin password reset successfully");

      setResetAdmin(null);
      setResetPassword("");
      setConfirmResetPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset admin password");
    } finally {
      setResetLoading(false);
    }
  };

  // Open edit form
  const handleEdit = (admin) => {
    setEditingAdmin(admin);

    setEditForm({
      name: admin.name || "",
      email: admin.email || "",
      status: admin.status || "ACTIVE",
    });

    setError("");
    setMessage("");
  };

  // Update admin
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingAdmin) return;

    try {
      setError("");
      setMessage("");

      await api.put(`/admin/admins/${editingAdmin._id}`, {
        name: editForm.name,
        email: editForm.email,
        status: editForm.status,
      });

      setMessage("Admin updated successfully");

      setEditingAdmin(null);

      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update admin");
    }
  };

  // Change status
  const handleStatusChange = async (admin) => {
    const newStatus = admin.status === "INACTIVE" ? "ACTIVE" : "INACTIVE";

    if (
      !window.confirm(
        `Are you sure you want to change ${admin.name}'s status to ${newStatus}?`,
      )
    ) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.put(`/admin/admins/${admin._id}`, {
        status: newStatus,
      });

      setMessage(`Admin status changed to ${newStatus}`);

      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update admin status");
    }
  };

  // Delete admin
  const handleDelete = async (admin) => {
    if (!window.confirm(`Are you sure you want to remove ${admin.name}?`)) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.delete(`/admin/admins/${admin._id}`);

      setMessage("Admin removed successfully");

      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove admin");
    }
  };

  return (
    <div className="container-fluid">
      <h1 className="mb-4">Admins</h1>

      {/* Messages */}
      {error && <div className="alert alert-danger">{error}</div>}

      {message && <div className="alert alert-success">{message}</div>}

      {/* Add Admin */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Add Admin</h5>

          <form onSubmit={handleAdd}>
            <div className="row g-3">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="col-md-4">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="col-md-4">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="col-12">
                <button type="submit" className="btn btn-dark w-100">
                  Add Admin
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Edit Admin */}
      {editingAdmin && (
        <div className="card mb-4 border-primary">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Edit Admin</h5>

              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => setEditingAdmin(null)}
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Name</label>

                  <input
                    type="text"
                    className="form-control"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Email</label>

                  <input
                    type="email"
                    className="form-control"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Status</label>

                  <select
                    className="form-select"
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="ACTIVE">ACTIVE</option>

                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div className="col-12">
                  <button type="submit" className="btn btn-primary">
                    Update Admin
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin List */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title mb-3">Administrator List</h5>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : admins.length === 0 ? (
            <div className="alert alert-info">No administrators found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin._id}>
                      <td>{admin.name}</td>

                      <td>{admin.email}</td>

                      <td>
                        <span className="badge bg-dark">{admin.role}</span>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            admin.status === "INACTIVE"
                              ? "bg-danger"
                              : "bg-success"
                          }`}
                        >
                          {admin.status || "ACTIVE"}
                        </span>
                      </td>

                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleEdit(admin)}
                          >
                            Edit
                          </button>

                          <button
                            className={`btn btn-sm ${
                              admin.status === "INACTIVE"
                                ? "btn-success"
                                : "btn-warning"
                            }`}
                            onClick={() => handleStatusChange(admin)}
                          >
                            {admin.status === "INACTIVE"
                              ? "Activate"
                              : "Deactivate"}
                          </button>

                          <button
                            className="btn btn-sm btn-secondary me-2"
                            onClick={() => {
                              setResetAdmin(admin);
                              setResetPassword("");
                              setConfirmResetPassword("");
                              setError("");
                              setMessage("");
                            }}
                          >
                            Reset Password
                          </button>

                          <button
    className="btn btn-sm btn-danger"
    onClick={() => handleDelete(admin._id)}
  >
    Remove
  </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {resetAdmin && (
  <div
    className="modal d-block"
    tabIndex="-1"
    style={{
      backgroundColor: "rgba(0,0,0,0.5)",
    }}
  >
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">

        <div className="modal-header">
          <h5 className="modal-title">
            Reset Admin Password
          </h5>

          <button
            type="button"
            className="btn-close"
            onClick={() => {
              setResetAdmin(null);
              setResetPassword("");
              setConfirmResetPassword("");
              setError("");
            }}
          ></button>
        </div>

        <form onSubmit={handleResetPassword}>

          <div className="modal-body">

            <div className="mb-3">
              <label className="form-label">
                Admin
              </label>

              <input
                type="text"
                className="form-control"
                value={resetAdmin.name}
                disabled
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Email
              </label>

              <input
                type="email"
                className="form-control"
                value={resetAdmin.email}
                disabled
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                New Password
              </label>

              <input
                type="password"
                className="form-control"
                value={resetPassword}
                onChange={(e) =>
                  setResetPassword(e.target.value)
                }
                placeholder="Enter new password"
                minLength="6"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Confirm New Password
              </label>

              <input
                type="password"
                className="form-control"
                value={confirmResetPassword}
                onChange={(e) =>
                  setConfirmResetPassword(e.target.value)
                }
                placeholder="Confirm new password"
                minLength="6"
                required
              />
            </div>

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

          </div>

          <div className="modal-footer">

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setResetAdmin(null);
                setResetPassword("");
                setConfirmResetPassword("");
                setError("");
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={resetLoading}
            >
              {resetLoading
                ? "Resetting..."
                : "Reset Password"}
            </button>

          </div>

        </form>

      </div>
    </div>
  </div>
)}
    </div>
  );
}
