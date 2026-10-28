"use client";
import BusinessShell from "./business-shell";
import CombinedHero from "./combined-hero";
import HomeEvents from "./home-events";
import HomeSupport from "./home-support";
import { BusinessShopPreview } from "./business-sections";
export default function HomeOverview() {
  return <BusinessShell className="b2b-home">{onOffer => <>
    <CombinedHero onOffer={() => onOffer("Cafea + apă")} />
    <HomeSupport />
    <BusinessShopPreview title="Alege-ți cafeaua." description="Blenduri și cafele de origine SwitchMORN. Alege sortimentul, gramajul și măcinarea potrivite pentru tine." showEyebrow={false} />
    <HomeEvents />
  </>}</BusinessShell>;
}
