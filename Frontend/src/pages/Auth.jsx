import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext.jsx";

export default function Auth() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [mode, setMode] = useState("login"); // login | register | otp
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
  });
  const [devOtp, setDevOtp] = useState("");
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
        setMessage("Registered. Now login with OTP.");
        setMode("login");
      } else if (mode === "login") {
        const data = await api.requestOtp({
          email: form.email,
          password: form.password,
        });
        setDevOtp(data.devOtp ? String(data.devOtp) : "");
        setMessage(data.message);
        setMode("otp");
      } else {
        await api.verifyOtp({ email: form.email, otp: form.otp });
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
    <section className="panel">
      <h1>{mode === "register" ? "Create account" : "Farmer login"}</h1>
      <p className="muted">
        OTP login keeps your farm account simple and secure.
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
            />
          </label>
        )}

        {mode !== "otp" && (
          <>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                required
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
              />
            </label>
          </>
        )}

        {mode === "otp" && (
          <label>
            Enter OTP
            <input
              name="otp"
              value={form.otp}
              onChange={onChange}
              required
              placeholder="4-digit OTP"
            />
          </label>
        )}

        {devOtp && mode === "otp" && (
          <p className="hint">Dev OTP (SMTP off): {devOtp}</p>
        )}

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <button className="btn primary" type="submit" disabled={busy}>
          {busy
            ? "Please wait..."
            : mode === "register"
              ? "Register"
              : mode === "otp"
                ? "Verify OTP"
                : "Send OTP"}
        </button>
      </form>

      <div className="auth-switch">
        {mode === "register" ? (
          <button type="button" className="link-btn" onClick={() => setMode("login")}>
            Already have an account? Login
          </button>
        ) : (
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setMode("register");
              setDevOtp("");
            }}
          >
            New farmer? Register
          </button>
        )}
      </div>
    </section>
  );
}
