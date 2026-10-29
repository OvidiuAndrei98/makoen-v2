import type { Metadata } from "next";
import CoffeeShop from "@/components/coffee-shop";
import ShopShell from "@/components/shop-shell";
import Starburst from "@/components/starburst";

export const metadata: Metadata = {
  title: "Magazin cafea boabe și măcinată SwitchMORN | Makeon",
  description:
    "Descoperă cafeaua SwitchMORN pentru birou și acasă: blenduri și cafele de origine. Alege sortimentul, gramajul și măcinarea potrivite din magazin.",
};
export default function CoffeeStore() {
  return (
    <ShopShell>
      <div className="shop-banner section-padding">
        <span className="eyebrow">
          PENTRU BIROU. PENTRU ACASĂ. PENTRU TINE.
        </span>
        <h1>
          Un ritual bun
          <br />
          <span>merită dus acasă.</span>
        </h1>
        <p>Cafeaua pe care o iubești, dincolo de pauza de la birou.</p>
      </div>
      <CoffeeShop full />
    </ShopShell>
  );
}
