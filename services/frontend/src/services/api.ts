import type { Product } from "../types/product";

const PRODUCT_SERVICE_URL =
  import.meta.env.VITE_PRODUCT_SERVICE_URL;

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${PRODUCT_SERVICE_URL}/products`);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}
