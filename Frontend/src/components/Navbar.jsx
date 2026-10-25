import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="nav">
      <Link to="/" className="brand">
        KrishiMitra AI
      </Link>
      <nav className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/recommend">Crops</NavLink>
        <NavLink to="/chat">Chat</NavLink>
        {user ? (
          <button type="button" className="link-btn" onClick={logout}>
            Logout ({user.name})
          </button>
        ) : (
          <NavLink to="/auth">Login</NavLink>
        )}
      </nav>
    </header>
  );
}
