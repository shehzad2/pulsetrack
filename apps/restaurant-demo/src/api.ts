export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: string;
  image_url: string | null;
}

const API_URL = "http://127.0.0.1:8000/api/v1";

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products`);

  if (!response.ok) {
    throw new Error(`Failed to load products (${response.status})`);
  }

  const result: { data: Product[] } = await response.json();
  return result.data;
}
