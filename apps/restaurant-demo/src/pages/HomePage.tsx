import { Link } from "react-router-dom";
import ProductGrid from "../components/ProductGrid";
import type { Cart, Product } from "../types/product";

interface HomePageProps {
  products: Product[];
  cart: Cart;
  onAdd: (product: Product) => void;
  loading: boolean;
  error: string;
}

export default function HomePage({
  products,
  cart,
  onAdd,
  loading,
  error,
}: HomePageProps) {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">FRESH • DELICIOUS • MADE FOR YOU</p>
          <h1>Good food.<br />Good mood.</h1>
          <p className="hero-description">
            Discover your favorites, freshly prepared and ready to enjoy.
            Every bite brings a little happiness.
          </p>
          <Link className="primary-button" to="/products">
            Explore our menu →
          </Link>
          <p className="hero-note">✦ Freshly prepared · Made with love</p>
        </div>

        <div className="hero-art">
          <img
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1100&q=85"
            alt="Savory restaurant food"
            className="home-hero-image"
          />
        </div>
      </section>

      <section className="menu-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">MADE FOR YOUR CRAVINGS</p>
            <h2>Customer favorites</h2>
            <p className="section-subtitle">
              Delicious picks for every kind of appetite.
            </p>
          </div>

          <Link className="text-link" to="/products">
            View all products →
          </Link>
        </div>

        {loading && <p>Loading our menu...</p>}
        {error && <p className="error-message" role="alert">{error}</p>}

        {!loading && !error && (
          <ProductGrid
            products={products.slice(0, 4)}
            cart={cart}
            onAdd={onAdd}
          />
        )}

        <div className="home-promo">
          <div>
            <p className="eyebrow">YOUR NEXT FAVORITE IS WAITING</p>
            <h2>Good things are on the menu.</h2>
            <p>Find something delicious for your next meal.</p>
          </div>

          <Link className="primary-button" to="/products">
            Browse the menu →
          </Link>
        </div>
      </section>
    </>
  );
}
