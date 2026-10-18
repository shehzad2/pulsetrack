import { Link } from "react-router-dom";
import type { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: (product: Product) => void;
}

export default function ProductCard({
  product,
  quantity,
  onAdd,
}: ProductCardProps) {
  return (
    <article className="menu-card">
      <Link
        className="product-image-link"
        to={`/products/${product.slug}`}
        aria-label={`View ${product.name} details`}
      >
        {product.image_url ? (
          <img
            className="food-image"
            src={product.image_url}
            alt={product.name}
            loading="lazy"
          />
        ) : (
          <div className="food-image image-placeholder"><span>Image coming soon</span></div>
        )}
        <span className="view-details">View details ↗</span>
      </Link>

      <div className="product-info">
        <span className="category">{product.category}</span>

        <Link className="product-title" to={`/products/${product.slug}`}>
          <h3>{product.name}</h3>
        </Link>

        <p className="product-description">
          {product.description || "Freshly prepared with care, just for you."}
        </p>

        <div className="product-footer">
          <strong>₹{Number(product.price).toFixed(2)}</strong>
          <button type="button" onClick={() => onAdd(product)}>
            {quantity > 0 ? `Add more (${quantity})` : "+ Add"}
          </button>
        </div>
      </div>
    </article>
  );
}
