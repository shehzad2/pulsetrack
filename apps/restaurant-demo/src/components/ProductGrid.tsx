import ProductCard from "./ProductCard";
import type { Product } from "../types/product";
import type { Cart } from "../types/product";

interface ProductGridProps {
  products: Product[];
  cart: Cart;
  onAdd: (product: Product) => void;
}

export default function ProductGrid({
  products,
  cart,
  onAdd,
}: ProductGridProps) {
  if (products.length === 0) {
    return <p className="empty-state">No products found in this category.</p>;
  }

  return (
    <div className="menu-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          quantity={cart[product.id] || 0}
          onAdd={onAdd}
        />
      ))}
    </div>
  );
}
