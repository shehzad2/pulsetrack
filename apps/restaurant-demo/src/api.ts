import { PULSETRACK_CONFIG } from "./config";

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

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(
    `${PULSETRACK_CONFIG.endpoint}/api/v1/products`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to load products (${response.status})`);
  }

  const result: { data: Product[] } = await response.json();
  return result.data;
}
