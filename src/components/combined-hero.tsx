"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import OfficeOffers from "./office-offers";
import useHomeOpeningMotion from "./use-home-opening-motion";

export default function CombinedHero({ onOffer }: { onOffer: () => void }) {
  const opening = useRef<HTMLElement>(null);
  useHomeOpeningMotion(opening);
  return <section ref={opening} className="home-opening" aria-labelledby="hero-title">
    <div className="opening-stage">
      <div className="opening-atmosphere">
        <div className="opening-photo-mask"><div className="opening-photo-pan"><div className="opening-photo-enter">
          <Image src="/images/makeon-office-hero-v2.webp" alt="Espressor SwitchMORN și dozator Vero Aqua într-un spațiu de birou" fill preload sizes="100vw" />
        </div></div></div>
        <div className="opening-copy">
          <h1 id="hero-title"><span className="opening-line-mask"><span className="opening-title-line">Cafea și apă </span></span><span className="opening-line-mask"><span className="opening-title-line">pentru biroul tău.</span></span></h1>
          <div className="opening-copy-follow">
          <p className="opening-description">Espressoare SwitchMORN și dozatoare Vero Aqua pentru companii.</p>
          <div className="opening-actions">
            <button type="button" className="b2b-btn" onClick={onOffer}>Cere ofertă pentru birou<ArrowUpRight size={18} aria-hidden="true" /></button>
            <Link href="#solutii">Descoperă cafeaua și apa</Link>
          </div>
          </div>
        </div>
      </div>
      <OfficeOffers />
    </div>
  </section>;
}
