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
    <HomeEvents />
    <BusinessShopPreview title="Cafea SwitchMORN" description="Blenduri și cafele de origine pentru espresso, ibric sau moka. Alege sortimentul, gramajul și măcinarea din magazin." showEyebrow={false} />
  </>}</BusinessShell>;
}
