import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext.jsx";

export default function Auth() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [mode, setMode] = useState("login"); // login | register
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      if (mode === "register") {
        await api.register({
          name: form.name,
          email: form.email,
          password: form.password,
        });
        await refresh();
        navigate("/recommend");
      } else {
        await api.login({
          email: form.email,
          password: form.password,
        });
        await refresh();
        navigate("/recommend");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel" style={{ maxWidth: "480px", margin: "1rem auto" }}>
      <h1>{mode === "register" ? "Create account" : "Farmer login"}</h1>
      <p className="muted">
        {mode === "register"
          ? "Create an account to save soil tests and view past recommendations."
          : "Sign in directly with your email and password."}
      </p>

      <form className="form" onSubmit={submit}>
        {mode === "register" && (
          <label>
            Name
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              required
              placeholder="e.g. Ramesh Kumar"
            />
          </label>
        )}

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
            placeholder="farmer@example.com"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required
            placeholder="Enter password"
          />
        </label>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <button className="btn primary" type="submit" disabled={busy}>
          {busy
            ? "Please wait..."
            : mode === "register"
              ? "Create account"
              : "Login"}
        </button>
      </form>

      <div className="auth-switch" style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginTop: "1.2rem" }}>
        {mode === "register" ? (
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setMode("login");
              setError("");
              setMessage("");
            }}
          >
            Already have an account? Login
          </button>
        ) : (
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setMode("register");
              setError("");
              setMessage("");
            }}
          >
            New farmer? Create an account
          </button>
        )}

        <button
          type="button"
          className="link-btn"
          style={{ color: "var(--muted)", fontSize: "0.9rem" }}
          onClick={() => navigate("/recommend")}
        >
          Or use crop advisor directly as guest →
        </button>
      </div>
    </section>
  );
}
