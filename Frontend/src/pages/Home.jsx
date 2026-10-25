import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { user } = useAuth();

  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">For Indian farmers</p>
        <h1>KrishiMitra AI</h1>
        <p className="lead">
          Simple crop advice from your soil numbers, plus a farming chatbot you
          can type or speak to.
        </p>
        <div className="cta-row">
          <Link className="btn primary" to={user ? "/recommend" : "/auth"}>
            {user ? "Get crop advice" : "Sign in to start"}
          </Link>
          <Link className="btn ghost" to="/chat">
            Ask the chatbot
          </Link>
        </div>
      </div>

      <div className="feature-strip">
        <article>
          <h2>Crop recommendation</h2>
          <p>Enter N, P, K, pH, weather — get top 3 crops.</p>
        </article>
        <article>
          <h2>Farming chatbot</h2>
          <p>Ask watering, fertilizer, and pest questions in plain language.</p>
        </article>
        <article>
          <h2>Voice help</h2>
          <p>Speak your question and hear the reply read aloud.</p>
        </article>
      </div>
    </section>
  );
}
