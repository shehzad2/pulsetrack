
import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

interface PaymentNavigationState {
  orderId?: number | string;
  orderNumber?: string;
  customerName?: string;
  subtotal?: number;
  currency?: string;
}

type PaymentMethod = "cod" | "upi" | "card";

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <rect x="5" y="10" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 9h.01M18 15h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <path d="M14 14h3v3h-3zM20 14v2M17 20h4M20 18v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
      <rect x="2" y="4.5" width="20" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2.5 9.5h19M6 15h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function PaymentPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as PaymentNavigationState;

  const [method, setMethod] = useState<PaymentMethod>("cod");
  const [message, setMessage] = useState("");

  if (!orderId) {
    return (
      <section className="payment-page">
        <div className="payment-main-card">
          <h1>Order not found</h1>
          <p>Please return to the menu and try again.</p>
          <Link className="payment-primary-button" to="/products">
            Return to menu
          </Link>
        </div>
      </section>
    );
  }

  const total =
    typeof state.subtotal === "number"
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: state.currency || "INR",
        }).format(state.subtotal)
      : "Check order total";

  function confirmCashOnDelivery() {
    if (method !== "cod") {
      setMessage("Please select Cash on Delivery to continue.");
      return;
    }

    navigate(`/thank-you/${orderId}`, {
      state: {
        ...state,
        orderId,
        paymentMethod: "cod",
        paymentLabel: "Cash on Delivery",
      },
    });
  }

  return (
    <section className="payment-page">
      <div className="payment-shell">
        <nav className="payment-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Menu</Link>
          <span>/</span>
          <span>Payment</span>
        </nav>

        <header className="payment-heading">
          <span className="payment-secure-icon">
            <LockIcon />
          </span>
          <p className="payment-eyebrow">THE FINAL STEP</p>
          <h1>How would you like to pay?</h1>
          <p>Choose a payment method for your Savory order.</p>
        </header>

        <div className="payment-layout">
          <div className="payment-main-card">
            <div className="payment-section-heading">
              <span className="payment-step-number">01</span>
              <div>
                <h2>Payment method</h2>
                <p>Select your preferred way to pay.</p>
              </div>
            </div>

            <div className="payment-method-list">
              <button
                type="button"
                className={`payment-method ${method === "cod" ? "selected" : ""}`}
                onClick={() => {
                  setMethod("cod");
                  setMessage("");
                }}
                aria-pressed={method === "cod"}
              >
                <span className="payment-method-icon"><CashIcon /></span>
                <span className="payment-method-copy">
                  <strong>Cash on Delivery</strong>
                  <span>Pay when your order arrives.</span>
                  <span className="payment-method-tag">Available</span>
                </span>
                <span className="payment-radio">
                  {method === "cod" && <span />}
                </span>
              </button>

              <button
                type="button"
                className={`payment-method ${method === "upi" ? "selected" : ""}`}
                onClick={() => {
                  setMethod("upi");
                  setMessage("");
                }}
                aria-pressed={method === "upi"}
              >
                <span className="payment-method-icon"><QrIcon /></span>
                <span className="payment-method-copy">
                  <strong>UPI / Scan QR</strong>
                  <span>Google Pay, PhonePe, Paytm and more.</span>
                  <span className="payment-method-tag coming-soon">
                    Setup required
                  </span>
                </span>
                <span className="payment-radio">
                  {method === "upi" && <span />}
                </span>
              </button>

              <button
                type="button"
                className={`payment-method ${method === "card" ? "selected" : ""}`}
                onClick={() => {
                  setMethod("card");
                  setMessage("");
                }}
                aria-pressed={method === "card"}
              >
                <span className="payment-method-icon"><CardIcon /></span>
                <span className="payment-method-copy">
                  <strong>Credit or Debit Card</strong>
                  <span>Secure online card payment.</span>
                  <span className="payment-method-tag coming-soon">
                    Coming soon
                  </span>
                </span>
                <span className="payment-radio">
                  {method === "card" && <span />}
                </span>
              </button>
            </div>

            {method === "cod" && (
              <div className="payment-info-box">
                <CashIcon />
                <div>
                  <strong>Pay at your doorstep</strong>
                  <p>No online payment is required for Cash on Delivery.</p>
                </div>
              </div>
            )}

            {method === "upi" && (
              <div className="payment-info-box">
                <QrIcon />
                <div>
                  <strong>UPI QR payment setup required</strong>
                  <p>
                    A genuine payment QR needs your merchant UPI ID or a
                    payment gateway. No payment QR is available yet, and
                    payment has not been taken.
                  </p>
                </div>
              </div>
            )}

            {method === "card" && (
              <div className="payment-info-box">
                <LockIcon />
                <div>
                  <strong>Card payments coming soon</strong>
                  <p>
                    A secure payment gateway must be connected before card
                    payments can be accepted.
                  </p>
                </div>
              </div>
            )}

            {message && <p className="payment-error" role="alert">{message}</p>}

            {method === "cod" ? (
              <button
                type="button"
                className="payment-primary-button"
                onClick={confirmCashOnDelivery}
              >
                Confirm Cash on Delivery <span aria-hidden="true">→</span>
              </button>
            ) : (
              <button
                type="button"
                className="payment-primary-button"
                disabled
              >
                {method === "upi" ? "UPI setup required" : "Card payments coming soon"}
              </button>
            )}

            <p className="payment-security-note">
              <LockIcon />
              Your order details are handled securely.
            </p>

            <Link className="payment-back-link" to="/products">
              ← Return to menu
            </Link>
          </div>

          <aside className="payment-summary-card">
            <p className="payment-eyebrow">YOUR ORDER</p>
            <h2>Order summary</h2>

            <div className="payment-summary-row">
              <span>Order reference</span>
              <strong>{state.orderNumber || orderId}</strong>
            </div>

            {state.customerName && (
              <div className="payment-summary-row">
                <span>Customer</span>
                <strong>{state.customerName}</strong>
              </div>
            )}

            <div className="payment-summary-divider" />

            <div className="payment-total-row">
              <span>Order total</span>
              <strong>{total}</strong>
            </div>

            {method === "cod" && (
              <div className="payment-summary-note">
                <span className="payment-summary-dot" />
                <span>Pay at your doorstep</span>
              </div>
            )}

            <p className="payment-summary-footnote">
              Online payment methods become available after the payment
              provider is configured.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
