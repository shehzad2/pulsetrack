
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  clearAuthSession,
  fetchCurrentUser,
  getAuthToken,
  logoutRequest,
} from "../auth";
import type { AuthUser } from "../auth";

import { PULSETRACK_CONFIG } from "../config";

const API_URL = `${PULSETRACK_CONFIG.endpoint}/api/v1`;

interface TrackingEvent {
  id: number;
  status: string;
  title: string;
  description?: string | null;
  location?: string | null;
  occurred_at: string;
}

interface OrderItem {
  product_id: number | string;
  product_name: string;
  unit_price: number | string;
  quantity: number;
  line_total: number | string;
}

interface CustomerOrder {
  id: number;
  order_number: string;
  customer_name: string;
  items: OrderItem[];
  total_amount: number | string;
  currency: string;
  status: string;
  created_at: string;
  tracking_events?: TrackingEvent[];
}

interface OrdersResponse {
  data?: CustomerOrder[];
}

interface OrderResponse {
  order?: CustomerOrder;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatMoney(amount: number | string, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

async function fetchCustomerOrders(): Promise<CustomerOrder[]> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Your session has expired. Please log in again.");
  }

  const response = await fetch(`${API_URL}/orders`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = (await response.json().catch(() => ({}))) as
    | OrdersResponse
    | { message?: string };

  if (!response.ok) {
    throw new Error(
      "message" in result && result.message
        ? result.message
        : "Unable to load your orders.",
    );
  }

  return "data" in result && Array.isArray(result.data)
    ? result.data
    : [];
}

async function fetchOrderDetails(orderId: number): Promise<CustomerOrder> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Please log in again to view order tracking.");
  }

  const response = await fetch(
    `${API_URL}/orders/${orderId}/tracking`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const result = (await response.json().catch(() => ({}))) as
    | OrderResponse
    | { message?: string };

  if (!response.ok || !("order" in result) || !result.order) {
    throw new Error(
      "message" in result && result.message
        ? result.message
        : "Unable to load tracking details.",
    );
  }

  return result.order;
}

function TrackingTimeline({
  events,
}: {
  events: TrackingEvent[];
}) {
  if (!events.length) {
    return (
      <p className="account-muted">
        Tracking updates will appear here when available.
      </p>
    );
  }

  return (
    <ol className="account-timeline">
      {events.map((event) => (
        <li className="account-timeline-event" key={event.id}>
          <span className="account-timeline-marker" />
          <div>
            <strong>{event.title || formatStatus(event.status)}</strong>
            {event.description && <p>{event.description}</p>}
            {event.location && (
              <span className="account-muted">{event.location}</span>
            )}
            <time dateTime={event.occurred_at}>
              {formatDate(event.occurred_at)}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function AccountPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState("");
  const [ordersError, setOrdersError] = useState("");
  const [busy, setBusy] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [trackingLoadingId, setTrackingLoadingId] = useState<number | null>(null);
  const [trackingErrors, setTrackingErrors] = useState<Record<number, string>>({});

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError("");

    try {
      const customerOrders = await fetchCustomerOrders();
      setOrders(customerOrders);
    } catch (err: unknown) {
      setOrdersError(
        err instanceof Error ? err.message : "Unable to load your orders.",
      );
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      try {
        const currentUser = await fetchCurrentUser();

        if (!active) return;

        setUser(currentUser);
        setLoading(false);

        try {
          const customerOrders = await fetchCustomerOrders();

          if (active) setOrders(customerOrders);
        } catch (err: unknown) {
          if (active) {
            setOrdersError(
              err instanceof Error
                ? err.message
                : "Unable to load your orders.",
            );
          }
        }
      } catch (err: unknown) {
        clearAuthSession();

        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Please log in again.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
          setOrdersLoading(false);
        }
      }
    }

    void loadAccount();

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    setBusy(true);
    setError("");

    try {
      await logoutRequest();
    } catch {
      // Clear the local session even if the server logout request fails.
    } finally {
      clearAuthSession();
      navigate("/login", { replace: true });
      setBusy(false);
    }
  }

  async function handleTracking(order: CustomerOrder) {
    if (expandedOrderId === order.id) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(order.id);
    setTrackingErrors((current) => ({
      ...current,
      [order.id]: "",
    }));

    if (order.tracking_events) return;

    setTrackingLoadingId(order.id);

    try {
      const details = await fetchOrderDetails(order.id);

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id
            ? {
                ...item,
                status: details.status,
                tracking_events: details.tracking_events ?? [],
              }
            : item,
        ),
      );
    } catch (err: unknown) {
      setTrackingErrors((current) => ({
        ...current,
        [order.id]:
          err instanceof Error
            ? err.message
            : "Unable to load tracking.",
      }));
    } finally {
      setTrackingLoadingId(null);
    }
  }

  if (loading) {
    return (
      <section className="account-page">
        <div className="account-card">
          <p>Loading your account...</p>
        </div>
      </section>
    );
  }

  if (error && !user) {
    return (
      <section className="auth-page">
        <div className="auth-card">
          <h1>Session unavailable</h1>
          <p className="auth-error">{error}</p>
          <Link className="auth-submit auth-link-button" to="/login">
            Log in again
          </Link>
        </div>
      </section>
    );
  }

  if (!user) return null;

  return (
    <section className="account-page account-page-enhanced">
      <div className="account-container">
        <div className="account-card">
          <p className="auth-eyebrow">YOUR SAVORY ACCOUNT</p>
          <h1>Hello, {user.name}</h1>
          <p className="auth-description">
            Manage your profile and keep track of your orders.
          </p>

          <div className="account-detail">
            <span>Full name</span>
            <strong>{user.name}</strong>
          </div>

          <div className="account-detail">
            <span>Verified mobile number</span>
            <strong>{user.mobile_number}</strong>
          </div>

          <div className="account-actions">
            <Link className="auth-submit auth-link-button" to="/products">
              Explore the menu
            </Link>

            <button
              className="auth-secondary"
              onClick={handleLogout}
              disabled={busy}
            >
              {busy ? "Logging out..." : "Log out"}
            </button>
          </div>
        </div>

        <section className="account-orders">
          <div className="account-orders-heading">
            <div>
              <p className="auth-eyebrow">YOUR SAVORY ORDERS</p>
              <h2>Order history</h2>
              <p className="auth-description">
                Review your purchases and follow order progress.
              </p>
            </div>

            <button
              className="account-refresh"
              onClick={() => void loadOrders()}
              disabled={ordersLoading}
            >
              {ordersLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {ordersError && (
            <div className="account-message" role="alert">
              <p>{ordersError}</p>
              <button
                className="account-refresh"
                onClick={() => void loadOrders()}
              >
                Try again
              </button>
            </div>
          )}

          {ordersLoading && orders.length === 0 && (
            <div className="account-order-empty">
              <p>Loading your orders...</p>
            </div>
          )}

          {!ordersLoading && !ordersError && orders.length === 0 && (
            <div className="account-order-empty">
              <h3>No orders yet</h3>
              <p>Your completed checkouts will appear here.</p>
              <Link className="auth-submit auth-link-button" to="/products">
                Browse the menu
              </Link>
            </div>
          )}

          <div className="account-order-list">
            {orders.map((order) => (
              <article className="account-order-card" key={order.id}>
                <div className="account-order-top">
                  <div>
                    <span className="account-order-label">ORDER NUMBER</span>
                    <strong className="account-order-number">
                      {order.order_number}
                    </strong>
                    <time className="account-muted">
                      {formatDate(order.created_at)}
                    </time>
                  </div>

                  <span className={`account-status account-status-${order.status.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                    {formatStatus(order.status)}
                  </span>
                </div>

                <div className="account-order-items">
                  {(order.items ?? []).map((item, index) => (
                    <div
                      className="account-order-item"
                      key={`${item.product_id}-${index}`}
                    >
                      <span>
                        {item.product_name} × {item.quantity}
                      </span>
                      <strong>
                        {formatMoney(item.line_total, order.currency)}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="account-order-bottom">
                  <div>
                    <span className="account-muted">Order total</span>
                    <strong className="account-order-total">
                      {formatMoney(order.total_amount, order.currency)}
                    </strong>
                  </div>

                  <button
                    className="account-track-button"
                    onClick={() => void handleTracking(order)}
                  >
                    {trackingLoadingId === order.id
                      ? "Loading..."
                      : expandedOrderId === order.id
                        ? "Hide tracking"
                        : "Track order"}
                  </button>
                </div>

                {expandedOrderId === order.id && (
                  <div className="account-tracking-panel">
                    <h3>Order tracking</h3>

                    {trackingErrors[order.id] && (
                      <div className="account-message" role="alert">
                        <p>{trackingErrors[order.id]}</p>
                        <button
                          className="account-refresh"
                          onClick={() => {
                            setOrders((current) =>
                              current.map((item) =>
                                item.id === order.id
                                  ? { ...item, tracking_events: undefined }
                                  : item,
                              ),
                            );
                            void handleTracking(order);
                          }}
                        >
                          Try again
                        </button>
                      </div>
                    )}

                    {trackingLoadingId === order.id ? (
                      <p className="account-muted">
                        Loading tracking updates...
                      </p>
                    ) : (
                      <TrackingTimeline
                        events={order.tracking_events ?? []}
                      />
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
