import type { CoffeeProduct } from "./coffee-catalog";

/** Every grind of the same product consumes the same physical inventory. */
export function needsProductionRequest(
  items: readonly { slug: string; quantity: number }[],
  products: readonly CoffeeProduct[],
) {
  return items.some(line => {
    const product = products.find(product => product.slug === line.slug);
    if (!product) return false; // Missing/inactive products must be removed, never quoted.
    const quantity = items.filter(item => item.slug === line.slug).reduce((sum, item) => sum + item.quantity, 0);
    return product.price == null || product.stock == null || product.stock < quantity;
  });
}
