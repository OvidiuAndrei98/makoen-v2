"use client";
import BusinessShell from "./business-shell";
import CombinedHero from "./combined-hero";
import HomeEvents from "./home-events";
import HomeSupport from "./home-support";
import { BusinessShopPreview } from "./business-sections";
export default function HomeOverview() {
  return <BusinessShell className="b2b-home">{onOffer => <>
    <CombinedHero onOffer={() => onOffer("Cafea + apă")} />
    <HomeSupport onOffer={onOffer} />
    <BusinessShopPreview title="Cafeaua ta, de la SwitchMORN." description="Blenduri și cafele de origine pentru pauzele de la birou. Alege sortimentul, gramajul și măcinarea din magazin." showEyebrow={false} />
    <HomeEvents />
  </>}</BusinessShell>;
}
