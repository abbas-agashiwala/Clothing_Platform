import { useState } from "react";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !form.currentPassword ||
      !form.newPassword ||
      !form.confirmPassword
    ) {
      setError("All password fields are required.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (form.newPassword.length < 6) {
      setError(
        "New password must be at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.put(
        "/auth/change-password",
        form
      );

      setMessage(
        response.data.message ||
          "Password changed successfully."
      );

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to change password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">

      <div
        className="card shadow-sm mx-auto"
        style={{ maxWidth: "600px" }}
      >

        <div className="card-body p-4">

          <h2 className="mb-4">
            Change Password
          </h2>

          {message && (
            <div className="alert alert-success">
              {message}
            </div>
          )}

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="mb-3">
              <label className="form-label">
                Current Password
              </label>

              <input
                type="password"
                name="currentPassword"
                className="form-control"
                value={form.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                New Password
              </label>

              <input
                type="password"
                name="newPassword"
                className="form-control"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
              />
            </div>

            <div className="mb-4">
              <label className="form-label">
                Confirm New Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
              />
            </div>

            <div className="d-flex gap-2">

              <button
                type="submit"
                className="btn btn-dark"
                disabled={loading}
              >
                {loading
                  ? "Updating..."
                  : "Change Password"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/profile")}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}