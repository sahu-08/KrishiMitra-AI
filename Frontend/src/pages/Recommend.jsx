import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext.jsx";

const empty = {
  nitrogen: "",
  phosphorus: "",
  potassium: "",
  temperature: "",
  humidity: "",
  ph: "",
  rainfall: "",
};

export default function Recommend() {
  const { user } = useAuth();
  const [form, setForm] = useState(empty);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadHistory = async () => {
    if (!user) return;
    try {
      const data = await api.history();
      setHistory(data.history || []);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);

    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [key, Number(value)]),
      );
      const data = await api.recommend(payload);
      setResult(data);
      if (user) {
        loadHistory();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="split">
      <div className="panel">
        <h1>Crop recommendation</h1>
        <p className="muted">
          Enter soil and weather values. We suggest the top 3 matching crops.
        </p>

        <form className="form grid-2" onSubmit={submit}>
          {[
            ["nitrogen", "Nitrogen (N)"],
            ["phosphorus", "Phosphorus (P)"],
            ["potassium", "Potassium (K)"],
            ["temperature", "Temperature (°C)"],
            ["humidity", "Humidity (%)"],
            ["ph", "Soil pH"],
            ["rainfall", "Rainfall (mm)"],
          ].map(([name, label]) => (
            <label key={name}>
              {label}
              <input
                type="number"
                step="any"
                name={name}
                value={form[name]}
                onChange={onChange}
                required
              />
            </label>
          ))}

          {error && <p className="error full">{error}</p>}

          <button className="btn primary full" type="submit" disabled={busy}>
            {busy ? "Thinking..." : "Recommend crops"}
          </button>
        </form>
      </div>

      <div className="panel">
        <h2>Results</h2>
        {!result && <p className="muted">Your top 3 crops will show here.</p>}

        {result && (
          <div className="results">
            <p className="best">
              Best match: <strong>{result.recommendedCrop}</strong>
            </p>
            <ol>
              {result.topRecommendations.map((item) => (
                <li key={item.crop}>
                  <span>{item.crop}</span>
                  <span className="score">{item.modelScore}%</span>
                  {item.tip && <small>{item.tip}</small>}
                </li>
              ))}
            </ol>
          </div>
        )}

        {user && history.length > 0 && (
          <div className="history">
            <h3>Recent</h3>
            <ul>
              {history.slice(0, 5).map((item) => (
                <li key={item._id}>
                  {item.recommendedCrop}{" "}
                  <span className="muted">
                    ({new Date(item.createdAt).toLocaleDateString()})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!user && (
          <p className="muted" style={{ fontSize: "0.88rem", marginTop: "1.5rem" }}>
            Tip:{" "}
            <Link to="/auth" style={{ color: "var(--leaf)", textDecoration: "underline" }}>
              Log in
            </Link>{" "}
            to save your soil tests and view past history across visits.
          </p>
        )}
      </div>
    </section>
  );
}
