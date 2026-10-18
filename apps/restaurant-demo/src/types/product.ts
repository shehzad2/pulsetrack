export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  price: string | number;
  image_url: string | null;
}

export type Cart = Record<number, number>;

export interface OrderItem {
  product_id: number;
  quantity: number;
}
