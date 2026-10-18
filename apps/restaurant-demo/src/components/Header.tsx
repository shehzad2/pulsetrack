
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  clearAuthSession,
  getSavedUser,
  logoutRequest,
} from "../auth";
import type { AuthUser } from "../auth";

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
}

export default function Header({ cartCount, onOpenCart }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  const [user, setUser] = useState<AuthUser | null>(getSavedUser());
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setUser(getSavedUser());
  }, [location.pathname]);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logoutRequest();
      clearAuthSession();
      setUser(null);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className={`navbar${isAuthPage ? " navbar-auth" : ""}`}>
      <Link className="brand" to="/" aria-label="Savory home">
        <span className="brand-icon">S.</span>
        <span>
          Savory<span className="brand-period">.</span>
        </span>
      </Link>

      {isAuthPage ? (
        <Link className="auth-header-back" to="/products">
          Back to menu <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/products">Our Menu</NavLink>

          {user ? (
            <>
              <NavLink to="/account">My Account</NavLink>
              <button
                type="button"
                className="auth-header-button"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "Logging out..." : "Log out"}
              </button>
            </>
          ) : (
            <NavLink to="/login">Log in</NavLink>
          )}

          <button
            type="button"
            className="cart-trigger"
            onClick={onOpenCart}
            aria-label={`Open shopping cart, ${cartCount} items`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.5L20 8H6" />
              <circle cx="10" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            <span>Cart</span>
            <span className="cart-badge">{cartCount}</span>
          </button>
        </nav>
      )}
    </header>
  );
}
