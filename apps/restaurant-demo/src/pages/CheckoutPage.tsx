
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useProducts } from "../hooks/useProducts";
import { getAuthToken } from "../auth";
import { analytics } from "../analytics";
import { PULSETRACK_CONFIG } from "../config";



interface CreatedOrder {
  id: number;
  order_number: string;
  total_amount: number | string;
  currency: string;
  status: string;
}

interface CreateOrderResponse {
  message?: string;
  order?: CreatedOrder;
  data?: CreatedOrder;
  id?: number;
  errors?: Record<string, string[]>;
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { products, loading, error } = useProducts();
  const { cart, cartCount } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const items = products.filter(
    (product) => (cart[product.id] || 0) > 0,
  );

  const subtotal = items.reduce(
    (sum, product) =>
      sum + Number(product.price) * cart[product.id],
    0,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    if (!cartCount || !items.length) {
      setSubmitError(
        "Your cart is empty. Please select products first.",
      );
      return;
    }

    if (submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const token = getAuthToken();

     const response = await fetch(
        `${PULSETRACK_CONFIG.endpoint}/api/v1/orders`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            public_key: PULSETRACK_CONFIG.projectKey,
            customer_name: customerName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            city: city.trim(),
            postal_code: postalCode.trim(),
            items: items.map((product) => ({
              product_id: product.id,
              quantity: cart[product.id],
            })),
          }),
        },
      );

      const result = (await response.json().catch(() => ({}))) as
        CreateOrderResponse;

      if (!response.ok) {
        const validationMessage = result.errors
          ? Object.values(result.errors).flat().join(" ")
          : "";

        throw new Error(
          validationMessage ||
            result.message ||
            `Unable to create your order (HTTP ${response.status}).`,
        );
      }

      const order = result.order ?? result.data;
      const orderId = order?.id ?? result.id;

      if (!orderId) {
        throw new Error(
          "The server did not return an order ID.",
        );
      }
      void analytics.track("order_created", {
        order_id: String(orderId),
        total_amount: Number(order?.total_amount ?? subtotal),
        currency: order?.currency ?? "INR",
        item_count: items.reduce(
          (count, product) => count + cart[product.id],
          0,
        ),
      });
      navigate(`/payment/${orderId}`, {
        state: {
          orderId,
          orderNumber: order?.order_number,
          customerName: customerName.trim(),
          subtotal: Number(order?.total_amount ?? subtotal),
          currency: order?.currency ?? "INR",
        },
      });
    } catch (submitException) {
      setSubmitError(
        submitException instanceof Error
          ? submitException.message
          : "Something went wrong while creating your order.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="checkout-state">
        <span className="loading-dot" />
        <p>Loading your order…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="checkout-state">
        <p className="error-message" role="alert">
          {error}
        </p>
        <Link className="primary-button" to="/products">
          Return to menu
        </Link>
      </section>
    );
  }

  if (!cartCount || !items.length) {
    return (
      <section className="checkout-state">
        <p className="eyebrow">YOUR NEXT FAVOURITE AWAITS</p>
        <h1>Your cart is empty.</h1>
        <p>Let's find something delicious for you.</p>
        <Link className="primary-button" to="/products">
          Explore the menu <ArrowIcon />
        </Link>
      </section>
    );
  }

  return (
    <section className="checkout-page checkout-redesign">
      <div className="checkout-heading">
        <div className="breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Menu</Link>
          <span>/</span>
          <span>Checkout</span>
        </div>

        <p className="eyebrow">ONE LAST STEP</p>
        <h1>
          Let's get the good stuff <em>to you.</em>
        </h1>
        <p>
          Tell us where to deliver your order. We'll take care
          of the delicious part.
        </p>
      </div>

      <div className="checkout-layout checkout-redesign-layout">
        <form
          className="checkout-form checkout-form-card"
          onSubmit={handleSubmit}
        >
          <div className="checkout-card-heading">
            <span className="checkout-step">01</span>
            <div>
              <h2>Delivery details</h2>
              <p>Where should we bring your order?</p>
            </div>
          </div>

          <div className="checkout-fields">
            <div className="checkout-field checkout-field-full">
              <label htmlFor="customer-name">Full name</label>
              <input
                id="customer-name"
                name="customer_name"
                autoComplete="name"
                placeholder="Enter your full name"
                value={customerName}
                onChange={(event) =>
                  setCustomerName(event.target.value)
                }
                required
                maxLength={120}
              />
            </div>

            <div className="checkout-field checkout-field-full">
              <label htmlFor="customer-phone">Phone number</label>
              <input
                id="customer-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="Your contact number"
                pattern="[0-9+() -]{8,20}"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                required
                maxLength={20}
              />
              <span className="field-hint">
                For delivery updates about your order.
              </span>
            </div>

            <div className="checkout-field checkout-field-full">
              <label htmlFor="customer-address">
                Delivery address
              </label>
              <textarea
                id="customer-address"
                name="address"
                autoComplete="street-address"
                rows={3}
                placeholder="House number, street, area, landmark"
                value={address}
                onChange={(event) =>
                  setAddress(event.target.value)
                }
                required
                maxLength={500}
              />
            </div>

            <div className="checkout-field">
              <label htmlFor="customer-city">City</label>
              <input
                id="customer-city"
                name="city"
                autoComplete="address-level2"
                placeholder="Your city"
                value={city}
                onChange={(event) =>
                  setCity(event.target.value)
                }
                required
                maxLength={100}
              />
            </div>

            <div className="checkout-field">
              <label htmlFor="customer-postal">PIN code</label>
              <input
                id="customer-postal"
                name="postal_code"
                autoComplete="postal-code"
                inputMode="numeric"
                placeholder="6-digit PIN"
                pattern="[0-9]{6}"
                value={postalCode}
                onChange={(event) =>
                  setPostalCode(event.target.value)
                }
                required
                maxLength={6}
              />
            </div>
          </div>

          {submitError && (
            <p className="checkout-error" role="alert">
              {submitError}
            </p>
          )}

          <button
            className="checkout-submit checkout-submit-redesign"
            type="submit"
            disabled={submitting}
          >
            <span>
              {submitting
                ? "Creating your order…"
                : "Continue to payment"}
            </span>
            {!submitting && <ArrowIcon />}
          </button>

          <div className="checkout-secure-note">
            <LockIcon />
            <span>
              Your delivery details are submitted securely
              to the order API.
            </span>
          </div>

          <Link className="checkout-back-link" to="/products">
            ← Back to the menu
          </Link>
        </form>

        <aside className="order-summary order-summary-card">
          <div className="summary-card-heading">
            <div>
              <p className="eyebrow">YOUR SELECTION</p>
              <h2>Order summary</h2>
            </div>
            <span className="summary-count">
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="summary-products">
            {items.map((product) => (
              <div
                className="summary-item summary-product"
                key={product.id}
              >
                {product.image_url ? (
                  <img
                    className="summary-product-image"
                    src={product.image_url}
                    alt={product.name}
                  />
                ) : (
                  <div className="summary-product-image summary-image-placeholder">
                    <span>Food</span>
                  </div>
                )}

                <div className="summary-product-info">
                  <strong>{product.name}</strong>
                  <span>
                    Qty {cart[product.id]} · ₹
                    {Number(product.price).toFixed(2)} each
                  </span>
                </div>

                <strong className="summary-product-total">
                  ₹
                  {(
                    Number(product.price) * cart[product.id]
                  ).toFixed(2)}
                </strong>
              </div>
            ))}
          </div>

          <div className="summary-calculations">
            <div className="summary-calculation-row">
              <span>Subtotal</span>
              <strong>₹{subtotal.toFixed(2)}</strong>
            </div>

            <div className="summary-calculation-row">
              <span>Delivery</span>
              <span className="delivery-pending">
                Calculated by server
              </span>
            </div>

            <div className="summary-calculation-row">
              <span>Taxes</span>
              <span className="delivery-pending">
                As applicable
              </span>
            </div>
          </div>

          <div className="summary-total-row">
            <div>
              <strong>Order subtotal</strong>
              <span>Final charges confirmed by the server</span>
            </div>
            <strong>₹{subtotal.toFixed(2)}</strong>
          </div>

          <div className="summary-note summary-note-redesign">
            <span className="summary-note-mark" />
            <p>
              Freshly prepared, packed with care, and ready
              for your table.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
