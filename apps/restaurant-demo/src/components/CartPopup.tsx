import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Cart, Product } from "../types/product";
import QuantitySelector from "./QuantitySelector";

interface CartPopupProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  cart: Cart;
  onQuantityChange: (productId: number, quantity: number) => void;
}

export default function CartPopup({
  open,
  onClose,
  products,
  cart,
  onQuantityChange,
}: CartPopupProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const items = products.filter((product) => (cart[product.id] || 0) > 0);

  const count = items.reduce(
    (sum, product) => sum + cart[product.id],
    0,
  );

  const subtotal = items.reduce(
    (sum, product) =>
      sum + Number(product.price) * cart[product.id],
    0,
  );

  const goToCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <div className="cart-overlay" onClick={onClose}>
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cart-drawer-header">
          <div>
            <p className="eyebrow">YOUR SELECTION</p>
            <h2>Your cart <span>({count})</span></h2>
          </div>

          <button
            type="button"
            className="close-button"
            aria-label="Close cart"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="empty-cart">
              <span>🛍️</span>
              <h3>Your cart is waiting</h3>
              <p>Add something delicious from our menu.</p>
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  onClose();
                  navigate("/products");
                }}
              >
                Explore menu
              </button>
            </div>
          ) : (
            items.map((product) => (
              <article className="cart-item" key={product.id}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} />
                ) : (
                  <div className="cart-item-placeholder">🍽️</div>
                )}

                <div className="cart-item-info">
                  <h3>{product.name}</h3>
                  <p>₹{Number(product.price).toFixed(2)} each</p>

                  <QuantitySelector
                    quantity={cart[product.id]}
                    min={0}
                    onChange={(quantity) =>
                      onQuantityChange(product.id, quantity)
                    }
                  />

                  <button
                    type="button"
                    className="remove-item"
                    onClick={() => onQuantityChange(product.id, 0)}
                  >
                    Remove
                  </button>
                </div>

                <strong>
                  ₹{(
                    Number(product.price) * cart[product.id]
                  ).toFixed(2)}
                </strong>
              </article>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-summary">
            <div className="subtotal-row">
              <span>Subtotal</span>
              <strong>₹{subtotal.toFixed(2)}</strong>
            </div>

            <p>Delivery charges, if applicable, are calculated at checkout.</p>

            <button
              type="button"
              className="primary-button checkout-button"
              onClick={goToCheckout}
            >
              Proceed to checkout →
            </button>

            <button
              type="button"
              className="continue-shopping"
              onClick={onClose}
            >
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
