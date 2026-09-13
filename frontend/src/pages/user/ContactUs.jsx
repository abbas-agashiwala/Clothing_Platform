import { useState } from "react";

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Thank you for contacting StyleHub!");

    setForm({
      name: "",
      email: "",
      message: "",
    });
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1>Contact Us</h1>
        <p className="text-muted">
          Have a question? We'd love to hear from you.
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="card p-4 shadow-sm">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Message</label>
                <textarea
                  className="form-control"
                  rows="5"
                  required
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                />
              </div>

              <button type="submit" className="btn btn-dark">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}