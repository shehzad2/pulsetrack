import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartPopup from "./components/CartPopup";
import { CartProvider, useCart } from "./context/CartContext";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentPage from "./pages/PaymentPage";
import ThankYouPage from "./pages/ThankYouPage";
import NotFoundPage from "./pages/NotFoundPage";
import AuthPage from "./pages/AuthPage";
import AccountPage from "./pages/AccountPage";
import { analytics } from "./analytics";
import "./App.css";

function RouteAnalytics() {
  const location = useLocation();

  useEffect(() => {
    void analytics.page();
  }, [location.pathname, location.search]);

  return null;
}

function AppLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  const {
    products,
    loading,
    error,
    cart,
    cartCount,
    addToCart,
    updateQuantity,
  } = useCart();

  return (
    <>
      <RouteAnalytics />
      <div className="restaurant app-shell">
        <Header
          cartCount={cartCount}
          onOpenCart={() => setCartOpen(true)}
        />

        <main className="page-content">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                products={products}
                cart={cart}
                onAdd={addToCart}
                loading={loading}
                error={error}
              />
            }
          />
          <Route
            path="/products"
            element={
              <ProductsPage
                products={products}
                cart={cart}
                onAdd={addToCart}
                loading={loading}
                error={error}
              />
            }
          />
          <Route
            path="/products/:slug"
            element={
              <ProductDetailPage
                products={products}
                cart={cart}
                onAdd={addToCart}
                loading={loading}
                error={error}
              />
            }
          />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment/:orderId" element={<PaymentPage />} />
          <Route path="/thank-you/:orderId" element={<ThankYouPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Routes>
        </main>

        <Footer />
      </div>

      <CartPopup
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        products={products}
        cart={cart}
        onQuantityChange={updateQuantity}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppLayout />
      </CartProvider>
    </BrowserRouter>
  );
}
