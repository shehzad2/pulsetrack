
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";

interface ThankYouState {
  orderNumber?: string;
  customerName?: string;
  paymentMethod?: "cod" | "upi" | "card";
  paymentLabel?: string;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" aria-hidden="true">
      <path
        d="m5 12.5 4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" width="23" height="23" fill="none" aria-hidden="true">
      <path
        d="M5 8h14l1 12H4L5 8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 9V6a3 3 0 0 1 6 0v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ThankYouPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const state = (location.state ?? {}) as ThankYouState;
  const paymentStatus = searchParams.get("payment");
  const paymentConfirmed = paymentStatus === "success";
  const isCod = state.paymentMethod === "cod";

  if (!orderId) {
    return (
      <section className="thank-you-page">
        <div className="thank-you-card">
          <h1>Order reference missing</h1>
          <p>We couldn't find your order reference.</p>
          <Link className="thank-you-primary" to="/products">
            Return to menu
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="thank-you-page">
      <div className="thank-you-shell">
        <div className="thank-you-breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Menu</Link>
          <span>/</span>
          <span>Order confirmation</span>
        </div>

        <div className="thank-you-card">
          <div className={`thank-you-success-icon ${paymentConfirmed ? "paid" : ""}`}>
            <CheckIcon />
          </div>

          <p className="thank-you-eyebrow">
            {paymentConfirmed
              ? "PAYMENT CONFIRMATION"
              : "THANK YOU FOR CHOOSING SAVORY"}
          </p>

          <h1>
            {state.customerName
              ? `Thank you, ${state.customerName.split(" ")[0]}!`
              : "Thanks for choosing Savory!"}
          </h1>

          <p className="thank-you-intro">
            {isCod
              ? "Your order has been submitted with Cash on Delivery selected."
              : "Your order reference is ready. Check the details below for your next step."}
          </p>

          <div className="thank-you-order-box">
            <div className="thank-you-order-icon">
              <BagIcon />
            </div>
            <div className="thank-you-order-copy">
              <span>ORDER REFERENCE</span>
              <strong>{state.orderNumber || orderId}</strong>
            </div>
            <button
              type="button"
              className="thank-you-copy-button"
              onClick={() => {
                void navigator.clipboard?.writeText(
                  state.orderNumber || orderId,
                );
              }}
              aria-label="Copy order reference"
            >
              Copy
            </button>
          </div>

          <div className="thank-you-status">
            <span className="thank-you-status-dot" />
            <div>
              <strong>
                {paymentConfirmed
                  ? "Payment confirmation received"
                  : isCod
                    ? "Payment due on delivery"
                    : "Order awaiting confirmation"}
              </strong>
              <p>
                {paymentConfirmed
                  ? "The server must verify the payment before marking the order as paid."
                  : isCod
                    ? "Pay the delivery person when your order arrives. The server must still confirm the order."
                    : "This page does not confirm payment or final order acceptance."}
              </p>
            </div>
          </div>

          <div className="thank-you-actions">
            <Link className="thank-you-primary" to="/products">
              Continue shopping <span aria-hidden="true">→</span>
            </Link>
            <Link className="thank-you-secondary" to="/">
              Back to home
            </Link>
          </div>

          <div className="thank-you-help">
            Need help with your order? Visit your{" "}
            <Link to="/account">account</Link> to check available order details.
          </div>
        </div>

        <p className="thank-you-footer-note">
          Savory · Made fresh, served with care.
        </p>
      </div>
    </section>
  );
}
