import { useState } from "react";
import ProductGrid from "../components/ProductGrid";
import type { Cart, Product } from "../types/product";

interface ProductsPageProps {
  products: Product[];
  cart: Cart;
  onAdd: (product: Product) => void;
  loading: boolean;
  error: string;
}

export default function ProductsPage({
  products,
  cart,
  onAdd,
  loading,
  error,
}: ProductsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    ...Array.from(new Set(products.map((product) => product.category))),
  ];

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <section className="catalog-page">
      <div className="catalog-intro">
        <div className="catalog-copy">
          <div className="breadcrumbs">
            <span>Home</span>
            <span className="breadcrumb-divider">/</span>
            <span>Our menu</span>
          </div>

          <p className="eyebrow">GOOD FOOD, GOOD MOOD</p>
          <h1>Find your new<br /><em>favourite.</em></h1>
          <p className="catalog-description">
            Thoughtfully prepared favourites and feel-good classics,
            made for whatever you’re craving today.
          </p>
        </div>

        <div className="catalog-aside">
          <span className="catalog-aside-line" />
          <p>Freshly prepared.<br />Always worth the bite.</p>
        </div>
      </div>

      <div className="catalog-toolbar">
        <div className="category-filters" aria-label="Filter products by category">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              className={selectedCategory === category ? "filter-chip active" : "filter-chip"}
              aria-pressed={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {!loading && !error && (
          <p className="results-label">
            <strong>{filteredProducts.length.toString().padStart(2, "0")}</strong>
            {" "}items to love
          </p>
        )}
      </div>

      {loading && (
        <div className="catalog-message">
          <span className="loading-dot" />
          <p>Preparing our menu…</p>
        </div>
      )}

      {error && (
        <div className="catalog-message catalog-error" role="alert">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <ProductGrid
          products={filteredProducts}
          cart={cart}
          onAdd={onAdd}
        />
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <div className="catalog-bottom-note">
          <span className="note-rule" />
          <p>Good things are made to be shared.</p>
          <span className="note-rule" />
        </div>
      )}
    </section>
  );
}
