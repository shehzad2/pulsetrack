import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProductGrid from "../components/ProductGrid";
import QuantitySelector from "../components/QuantitySelector";
import type { Cart, Product } from "../types/product";

interface ProductDetailPageProps {
  products: Product[];
  cart: Cart;
  onAdd: (product: Product, quantity?: number) => void;
  loading: boolean;
  error: string;
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path d="M4.5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" width="17" height="17" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4" />
      <path d="m6.5 10 2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ProductDetailPage({
  products,
  cart,
  onAdd,
  loading,
  error,
}: ProductDetailPageProps) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [slug]);

  if (loading) {
    return (
      <section className="detail-page-state">
        <span className="loading-dot" />
        <p>Finding your dish…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="detail-page-state" role="alert">
        <h1>We couldn't load this dish.</h1>
        <p>{error}</p>
        <Link className="primary-button" to="/products">Back to menu</Link>
      </section>
    );
  }

  const product = products.find((item) => item.slug === slug);

  if (!product) {
    return (
      <section className="detail-page-state">
        <p className="eyebrow">A LITTLE MIX-UP</p>
        <h1>This dish isn't on the menu.</h1>
        <p>Explore our menu to find something delicious instead.</p>
        <Link className="primary-button" to="/products">Explore the menu <ArrowIcon /></Link>
      </section>
    );
  }

  const price = Number(product.price);
  const inCart = cart[product.id] || 0;

  return (
    <section className="product-detail-page">
      <div className="breadcrumbs detail-breadcrumbs">
        <Link to="/">Home</Link>
        <span className="breadcrumb-divider">/</span>
        <Link to="/products">Our menu</Link>
        <span className="breadcrumb-divider">/</span>
        <span>{product.name}</span>
      </div>

      <div className="detail-layout">
        <div className="detail-visual">
          <div className="detail-image-wrap">
            {product.image_url ? (
              <img
                className="detail-image"
                src={product.image_url}
                alt={product.name}
              />
            ) : (
              <div className="detail-image detail-image-placeholder">
                <span>Image coming soon</span>
              </div>
            )}
          </div>
          <div className="detail-image-caption">
            <span className="caption-mark" />
            <span>Made fresh when you order</span>
          </div>
        </div>

        <div className="detail-info">
          <p className="eyebrow">A SAVORY FAVOURITE</p>
          <span className="detail-category">{product.category}</span>
          <h1>{product.name}</h1>

          <div className="detail-price-row">
            <p className="detail-price">₹{price.toFixed(2)}</p>
            <span className="price-note">Inclusive of applicable taxes</span>
          </div>

          <div className="detail-divider" />

          <p className="detail-description">
            {product.description ||
              "Thoughtfully prepared with fresh ingredients and plenty of flavour. A delicious choice for your next meal."}
          </p>

          <div className="detail-benefits">
            <span><CheckIcon /> Freshly prepared</span>
            <span><CheckIcon /> Made with care</span>
          </div>

          <div className="purchase-label">MAKE IT YOURS</div>
          <div className="detail-purchase">
            <QuantitySelector
              quantity={quantity}
              min={1}
              max={20}
              onChange={setQuantity}
            />

            <button
              type="button"
              className="detail-add"
              onClick={() => onAdd(product, quantity)}
            >
              <span>Add to cart</span>
              <span className="detail-add-price">₹{(price * quantity).toFixed(2)}</span>
              <ArrowIcon />
            </button>
          </div>

          {inCart > 0 && (
            <div className="already-in-cart">
              <CheckIcon />
              <span>{inCart} {inCart === 1 ? "item" : "items"} already in your cart</span>
            </div>
          )}

          <button
            type="button"
            className="back-link"
            onClick={() => navigate("/products")}
          >
            <span aria-hidden="true">←</span> Back to all dishes
          </button>
        </div>
      </div>

      <section className="related-products">
        <div className="related-heading">
          <div>
            <p className="eyebrow">KEEP EXPLORING</p>
            <h2>A little more delicious.</h2>
            <p>More favourites we think you'll enjoy.</p>
          </div>
          <Link className="related-view-all" to="/products">
            View full menu <ArrowIcon />
          </Link>
        </div>

        <ProductGrid
          products={products.filter((item) => item.id !== product.id).slice(0, 3)}
          cart={cart}
          onAdd={onAdd}
        />
      </section>
    </section>
  );
}
