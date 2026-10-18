import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Cart, Product } from "../types/product";
import { analytics } from "../analytics";
import { useProducts } from "../hooks/useProducts";

interface CartContextValue {
  products: Product[];
  loading: boolean;
  error: string;
  cart: Cart;
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { products, loading, error } = useProducts();
  const [cart, setCart] = useState<Cart>({});

  const addToCart = useCallback((product: Product, quantity = 1) => {
    if (!Number.isInteger(quantity) || quantity < 1) return;

    setCart((current) => ({
      ...current,
      [product.id]: Math.min(20, (current[product.id] || 0) + quantity),
    }));

    void analytics.track("add_to_cart", {
      product_id: product.sku,
      product_name: product.name,
      price: Number(product.price),
      quantity,
    });
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setCart((current) => {
      const next = { ...current };

      if (quantity <= 0) {
        delete next[productId];
      } else {
        next[productId] = Math.min(20, Math.floor(quantity));
      }

      return next;
    });
  }, []);

  const clearCart = useCallback(() => setCart({}), []);

  const cartCount = Object.values(cart).reduce(
    (sum, quantity) => sum + quantity,
    0,
  );

  const cartTotal = products.reduce(
    (sum, product) => sum + Number(product.price) * (cart[product.id] || 0),
    0,
  );

  const value = useMemo(
    () => ({
      products,
      loading,
      error,
      cart,
      cartCount,
      cartTotal,
      addToCart,
      updateQuantity,
      clearCart,
    }),
    [
      products,
      loading,
      error,
      cart,
      cartCount,
      cartTotal,
      addToCart,
      updateQuantity,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
