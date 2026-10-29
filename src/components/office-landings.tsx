"use client";

import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";
import BusinessShell from "./business-shell";
import { BusinessQuestions, BusinessShopPreview } from "./business-sections";
import { coffeeQuestions } from "@/lib/business-content";
import { useRef } from "react";
import usePresentationEntrance from "./use-presentation-entrance";

const officeIllustration = "/images/makeon-office-hero-v2.webp";


export function CoffeeOfficeLanding() {
  const hero = useRef<HTMLElement>(null);
  usePresentationEntrance(hero, "service");

  return <BusinessShell className="b2b-coffee office-service-page" initialInterest="Cafea și espressoare">{onOffer => <>
    <section ref={hero} className="b2b-container b2b-service-hero coffee-intro office-service-hero coffee-editorial-hero" data-presentation="coffee" aria-labelledby="hero-title">
      <div className="b2b-hero-copy">
        <Image className="office-service-brand coffee-service-brand" src="/images/switchmorn-coffee-logo.webp" alt="SwitchMORN Coffee" width={64} height={65} />
        <h1 className="b2b-title" id="hero-title"><span className="presentation-line-mask"><span data-presentation-line>Cafea pentru</span></span>{" "}<span className="presentation-line-mask"><span data-presentation-line>birouri.</span></span></h1>
        <p className="b2b-lead" data-presentation-copy>Espressor automat, cafea SwitchMORN și aprovizionare după consumul echipei.</p>
        <div className="b2b-actions" data-presentation-actions>
          <button type="button" className="b2b-btn" onClick={() => onOffer("Abonament de cafea")}>Cere ofertă pentru cafea<ArrowUpRight size={18} aria-hidden="true" /></button>
        </div>
      </div>
      <figure className="service-office-photograph">
        <div className="b2b-hero-media service-coffee-photo" data-presentation-media>
          <div className="service-coffee-photo-crop">
            <Image src={officeIllustration} alt="Ilustrație Makeon cu espressorul SwitchMORN, blatul și zona de servire într-un spațiu de birou" fill preload sizes="(max-width: 800px) 240vw, (max-width: 1280px) 145vw, 1672px" />
          </div>
        </div>
      </figure>
    </section>

    <section className="office-coffee-showcase" id="abonamente" data-choreography="section" aria-labelledby="coffee-offer-title">
      <div className="b2b-container office-showcase-grid">
        <figure className="coffee-plan-product office-machine-stage" data-choreo-media>
          <span className="office-visual-label">SwitchMORN Coffee</span>
          <div className="coffee-plan-product-image">
            <Image src="/images/coffee-machine-switchmorn.png" alt="Espressor automat SwitchMORN cu ecran tactil și recipient pentru cafea boabe" fill sizes="(max-width: 800px) 80vw, 40vw" />
          </div>
        </figure>
        <div className="office-showcase-copy" id="solutii" data-service="coffee">
          <p className="office-overline" data-choreo-item>Soluția pentru echipa ta</p>
          <h2 className="b2b-heading" id="coffee-offer-title"><span className="choreography-heading-mask"><span data-choreo-heading>Espressor, cafea și aprovizionare.</span></span></h2>
          <ul className="office-plan-points">
            <li data-choreo-item><Check aria-hidden="true" /><span>Espressor ales după consumul biroului.</span></li>
            <li data-choreo-item><Check aria-hidden="true" /><span>Cafea SwitchMORN pe gustul echipei.</span></li>
            <li data-choreo-item><Check aria-hidden="true" /><span>Aprovizionare adaptată consumului.</span></li>
          </ul>
          <div className="office-quote-note" data-choreo-item>
            <h3>Ofertă personalizată.</h3>
            <p>Prețul depinde de echipament, consum și servicii. Instalarea, mentenanța și costurile lor se confirmă în ofertă.</p>
          </div>
          <button type="button" className="b2b-btn" onClick={() => onOffer("Abonament de cafea")} data-choreo-item>Cere ofertă pentru birou<ArrowUpRight size={18} aria-hidden="true" /></button>
        </div>
      </div>
    </section>

    <section className="b2b-container b2b-section office-catalog-section" id="magazin" data-choreography="catalog">
      <BusinessShopPreview title="Cafea SwitchMORN" description="Alege sortimentul, gramajul și măcinarea din catalog." showEyebrow={false} sectionId="office-shop-products" />
    </section>

    <section className="office-craft-band" id="servicii" data-choreography="section" aria-labelledby="coffee-services-title"><div className="b2b-container office-craft-section">
      <figure className="office-craft-visual">
        <div className="office-coffee-closeup" data-choreo-media><div className="office-coffee-photo-crop"><Image src="/images/switchmorn-coffee-corner.webp" alt="Espressor SwitchMORN, pachete de cafea și accesorii pentru servire" fill sizes="(max-width: 800px) 160vw, 85vw" /></div></div>
      </figure>
      <div className="office-craft-copy">
        <p className="office-overline" data-choreo-item>Dincolo de un sortiment</p>
        <h2 className="b2b-heading" id="coffee-services-title"><span className="choreography-heading-mask"><span data-choreo-heading>Începe cu gustul.</span></span></h2>
        <div className="office-craft-facts">
          <div data-choreo-item><h3>Prăjire în loturi mici</h3><p>Profil de prăjire ajustat pentru metoda de preparare.</p></div>
          <div data-choreo-item><h3>Blenduri personalizate</h3><p>O formulă aleasă după preferințele echipei.</p></div>
          <div data-choreo-item><h3>Espresso sau filtru</h3><p>Cafea pentru espressor, V60, Chemex sau AeroPress.</p></div>
          <div data-choreo-item><h3>Cafea de probă</h3><p>Stabilim împreună sortimentele, cantitățile și prețul.</p></div>
        </div>
        <div className="office-craft-actions" data-choreo-item>
          <button type="button" className="b2b-btn" onClick={() => onOffer("Cafea de probă")}>Cere cafea de probă<ArrowUpRight size={18} aria-hidden="true" /></button>
          <button type="button" className="b2b-link" onClick={() => onOffer("Prăjire și blenduri personalizate")}>Discută un blend personalizat<ArrowUpRight size={18} aria-hidden="true" /></button>
        </div>
      </div>
    </div></section>

    <section className="b2b-container office-filter-note" id="filtre" aria-labelledby="coffee-filters-title" data-choreography="section">
      <div className="office-filter-note-image" data-choreo-media><Image src="/images/filtration/four-filters.webp" alt="Exemplu de cartușe de filtrare; compatibilitatea cu espressorul se verifică înainte de ofertare" fill sizes="(max-width: 600px) 70vw, 240px" /></div>
      <div><h2 className="b2b-h3" id="coffee-filters-title">Filtrare pentru espressor.</h2><p className="b2b-body">Verificăm compatibilitatea cu aparatul tău și stabilim instalarea și întreținerea filtrului.</p></div>
      <button type="button" className="b2b-link" onClick={() => onOffer("Filtre pentru apă și cafea")} data-choreo-item>Cere detalii despre filtre<ArrowUpRight size={18} aria-hidden="true" /></button>
    </section>

    <BusinessQuestions questions={coffeeQuestions} initialOpen={null} />
  </>}</BusinessShell>;
}

export { default as WaterLanding } from "./water-landing";
