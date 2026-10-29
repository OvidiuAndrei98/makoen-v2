import type { Metadata } from "next";
import ShopShell from "@/components/shop-shell";
import CheckoutForm from "@/components/checkout-form";

export const metadata: Metadata = { title: "Finalizare comandă | Makeon", robots: { index: false, follow: false } };
export default function CheckoutPage() {
  return <ShopShell><CheckoutForm /></ShopShell>;
}
