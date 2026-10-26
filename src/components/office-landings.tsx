"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import BusinessShell from "./business-shell";
import { BusinessQuestions, BusinessShopPreview, ServiceDetails } from "./business-sections";
import { coffeeCraftServices, coffeeQuestions, waterQuestions, waterServices, waterSubscription } from "@/lib/business-content";
import { useRef, useState } from "react";
import usePresentationEntrance from "./use-presentation-entrance";
import AnimatedDisclosure from "./animated-disclosure";

const officeIllustration = "/images/makeon-office-hero-v2.webp";

export function CoffeeOfficeLanding() {
  const hero = useRef<HTMLElement>(null);
  const [equipmentOpen, setEquipmentOpen] = useState(false);
  usePresentationEntrance(hero, "service");

  return <BusinessShell className="b2b-coffee office-service-page" initialInterest="Cafea și espressoare">{onOffer => <>
    <section ref={hero} className="b2b-container b2b-service-hero coffee-intro office-service-hero coffee-editorial-hero" data-presentation="coffee" aria-labelledby="hero-title">
      <div className="b2b-hero-copy">
        <Image className="office-service-brand coffee-service-brand" src="/images/switchmorn-coffee-logo.webp" alt="SwitchMORN Coffee" width={64} height={65} />
        <h1 className="b2b-title" id="hero-title"><span className="presentation-line-mask"><span data-presentation-line>Cafea pentru</span></span>{" "}<span className="presentation-line-mask"><span data-presentation-line>birouri.</span></span></h1>
        <p className="b2b-lead" data-presentation-copy>Espressor automat, cafea SwitchMORN și aprovizionare după consumul echipei.</p>
        <div className="b2b-actions" data-presentation-actions>
          <button type="button" className="b2b-btn" onClick={() => onOffer("Abonament de cafea")}>Cere oferta de cafea<ArrowUpRight size={18} aria-hidden="true" /></button>
        </div>
      </div>
      <figure className="service-office-photograph">
        <div className="b2b-hero-media service-coffee-photo" data-presentation-media>
          <div className="service-coffee-photo-crop">
            <Image src={officeIllustration} alt="Ilustrație Makeon cu espressorul SwitchMORN, blatul și zona de servire într-un spațiu de birou" fill preload sizes="(max-width: 800px) 240vw, (max-width: 1280px) 145vw, 1672px" />
          </div>
        </div>
        <figcaption className="service-photo-caption">Ilustrație de prezentare Makeon.</figcaption>
      </figure>
    </section>

    <nav className="b2b-container b2b-anchor-nav" aria-label="Pe pagina de cafea">
      <a href="#solutii">Soluția pentru birou</a><a href="#abonamente">Oferta</a><a href="#magazin">Cafeaua</a><a href="#servicii">Prăjire și blenduri</a>
    </nav>

    <section className="coffee-offer-section office-coffee-offer" id="abonamente" data-choreography="section" aria-labelledby="coffee-offer-title">
      <div className="b2b-container office-coffee-offer-grid">
        <figure className="coffee-plan-product" data-choreo-media>
          <div className="coffee-plan-product-image">
            <Image src="/images/coffee-machine-switchmorn.png" alt="Espressor automat SwitchMORN cu ecran tactil și recipient pentru cafea boabe" fill sizes="(max-width: 800px) 65vw, 32vw" />
          </div>
        </figure>
        <div className="coffee-plan-copy">
          <div className="coffee-offer-conditions" id="solutii" data-service="coffee">
            <h2 className="b2b-heading" id="coffee-offer-title"><span className="choreography-heading-mask"><span data-choreo-heading>Ofertă personalizată.</span></span></h2>
            <p className="b2b-body" data-choreo-item>Prețul depinde de echipament, consum și serviciile alese. Instalarea, mentenanța și costurile lor se confirmă în ofertă.</p>
          </div>
          <div className="office-module-line" data-choreo-line aria-hidden="true" />
          <dl className="office-service-facts">
            <div data-choreo-item><dt>Cafea SwitchMORN</dt><dd>Aleasă după preferințele echipei.</dd></div>
            <div data-choreo-item><dt>Espressor automat</dt><dd>Ales după consum și băuturile preparate.</dd></div>
            <div data-choreo-item><dt>Aprovizionare</dt><dd>Plan adaptat consumului.</dd></div>
          </dl>
          <div className="coffee-equipment-secondary" data-choreo-item>
            <AnimatedDisclosure id="coffee-equipment-details" className="office-equipment-details" title="Detalii despre espressor" compact open={equipmentOpen} onToggle={() => setEquipmentOpen(value => !value)}>
              <dl className="b2b-details">
                <div><dt>Preparare</dt><dd>Cafea boabe, preparată în espressor automat.</dd></div>
                <div><dt>Băuturi</dt><dd>Espresso și cappuccino, în funcție de preferințele echipei.</dd></div>
                <div><dt>Utilizare</dt><dd>Ecran tactil pentru selectarea băuturilor.</dd></div>
              </dl>
              <p className="b2b-note">Configurația finală și cerințele de instalare se confirmă în ofertă.</p>
            </AnimatedDisclosure>
          </div>
        </div>
      </div>
    </section>

    <section className="b2b-container b2b-section office-catalog-section" id="magazin" data-choreography="catalog">
      <BusinessShopPreview title="Cafea SwitchMORN" description="Alege sortimentul, gramajul și măcinarea din catalog." showEyebrow={false} sectionId="office-shop-products" />
    </section>

    <section className="b2b-container b2b-section office-service-complements" id="servicii" data-choreography="section" aria-labelledby="coffee-services-title">
      <ServiceDetails services={coffeeCraftServices} onOffer={onOffer} title="Prăjire și blenduri." titleId="coffee-services-title"
        description="Alege serviciul despre care vrei să discutăm." action="Cere detalii despre cafea" defaultInterest="Cafea și espressoare" />
    </section>

    <section className="b2b-container office-related-section coffee-filtration" id="filtre" aria-labelledby="coffee-filters-title">
      <div><h2 className="b2b-h3" id="coffee-filters-title">Filtrare pentru espressor.</h2><p className="b2b-body">Verificăm compatibilitatea cu aparatul tău și stabilim instalarea și întreținerea filtrului.</p></div>
      <div className="b2b-actions">
        <button type="button" className="b2b-link" onClick={() => onOffer("Filtre pentru apă și cafea")}>Cere detalii despre filtre<ArrowUpRight size={18} aria-hidden="true" /></button>
        <Link className="b2b-link" href="/apa#filtre">Vezi serviciile de filtrare<ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>
    </section>

    <section className="b2b-container office-related-section office-events-link" id="evenimente" aria-labelledby="coffee-events-title">
      <div><h2 className="b2b-h3" id="coffee-events-title">Cafea la evenimente.</h2><p className="b2b-body">Stand Coffee Corner sau rulotă SwitchMORN.</p></div>
      <div className="b2b-actions">
        <Link className="b2b-link" href="/cafea-la-evenimente#bar-mobil">Stand / bar mobil<ArrowUpRight size={18} aria-hidden="true" /></Link>
        <Link className="b2b-link" href="/cafea-la-evenimente#rulota">Rulotă<ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>
    </section>

    <BusinessQuestions questions={coffeeQuestions} initialOpen={null} />
  </>}</BusinessShell>;
}

export function WaterLanding() {
  const hero = useRef<HTMLDivElement>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  usePresentationEntrance(hero, "service");

  return <BusinessShell className="b2b-water office-service-page" initialInterest="Consultanță pentru filtrarea apei">{onOffer => <>
    <section className="water-subscription office-water-offer" id="abonamente" aria-labelledby="hero-title">
      <div ref={hero} className="b2b-container water-intro office-service-hero water-editorial-hero" data-presentation="water">
        <div className="b2b-hero-copy water-editorial-intro">
          <Image className="office-service-brand water-service-brand" src="/images/vero-aqua-logo.webp" alt="Vero Aqua" width={148} height={55} />
          <h1 className="b2b-title" id="hero-title"><span className="presentation-line-mask"><span data-presentation-line>Apă pentru</span></span>{" "}<span className="presentation-line-mask"><span data-presentation-line>birouri.</span></span></h1>
          <p className="b2b-lead" data-presentation-copy>Dozator Vero Aqua, cu instalare, mentenanță și filtre incluse.</p>
        </div>
        <div className="water-price office-water-price" data-service="water" data-presentation-actions>
          <p className="water-plan-label">Abonament Vero Aqua</p>
          <div className="b2b-price"><strong>{waterSubscription.monthlyEuro} €</strong><span>+ TVA / lună</span></div>
          <p className="water-contract">Per aparat · Contract pe {waterSubscription.months} de luni</p>
          <p className="b2b-note">Total: {(waterSubscription.monthlyEuro * waterSubscription.months).toLocaleString("ro-RO")} € + TVA / aparat, pe {waterSubscription.months} de luni.</p>
          <button type="button" className="b2b-btn" onClick={() => onOffer(waterSubscription.interest)}>Cere abonamentul Vero Aqua<ArrowUpRight size={18} aria-hidden="true" /></button>
        </div>
        <figure className="service-equipment water-editorial-product" id="solutii">
          <div className="b2b-hero-media b2b-product-hero-water water-product-stage" data-presentation-media>
            <div className="water-product-arrival" data-presentation-product>
              <Image src="/images/vero-aqua-dispenser.webp" alt="Dozatorul de apă Vero Aqua prezentat în oferta pentru birouri" fill preload sizes="(max-width: 767px) 180px, (max-width: 1199px) 25vw, 18vw" />
            </div>
          </div>
        </figure>
        <p className="water-temperature-note">Rece · Caldă · Temperatura camerei</p>
      </div>

      <section className="b2b-container water-office-context" data-choreography="section" aria-labelledby="water-offer-title">
        <figure className="water-context-visual">
          <div className="water-context-photo" data-choreo-media>
            <Image src={officeIllustration} alt="Ilustrație Makeon cu dozatorul Vero Aqua și zona de utilizare într-un spațiu de birou" fill sizes="(max-width: 800px) 100vw, 55vw" />
          </div>
          <figcaption className="service-photo-caption" data-choreo-item>Ilustrație de prezentare Makeon.</figcaption>
        </figure>
        <div className="office-water-inclusions water-inclusions">
          <h2 className="b2b-heading" id="water-offer-title"><span className="choreography-heading-mask"><span data-choreo-heading>Abonamentul include</span></span></h2>
          <div className="office-module-line" data-choreo-line aria-hidden="true" />
          <ul>{waterSubscription.includes.map(item => <li key={item} data-choreo-item>{item}</li>)}</ul>
          <p className="b2b-note" data-choreo-item>Oferta este exclusiv pentru apă. Configurația, cerințele de instalare și condițiile finale se confirmă la contractare.</p>
        </div>
      </section>
    </section>

    <nav className="b2b-container b2b-anchor-nav" aria-label="Pe pagina de apă">
      <a href="#solutii">Dozatorul de apă</a><a href="#abonamente">Abonamentul Vero Aqua</a><a href="#filtre">Filtre și compatibilitate</a><a href="#servicii">Instalare și mentenanță</a>
    </nav>

    <section className="b2b-container office-water-filtration">
      <AnimatedDisclosure id="filtre" className="office-filter-disclosure" title="Filtre și compatibilitate" headingLevel={2} open={filtersOpen} onToggle={() => setFiltersOpen(value => !value)}>
        <div className="office-filter-details">
          <div>
            <dl className="water-apparatus-details">
              <div><dt>Comenzi</dt><dd>Distribuire separată.</dd></div>
              <div><dt>Aparatul prezentat</dt><dd>Patru stadii de filtrare și lampă UV, pentru modelul din ofertă.</dd></div>
            </dl>
            <p className="b2b-body">Sistemul ilustrat mai jos are patru etape. Verificăm configurația și compatibilitatea pentru aparatul ales; schema nu descrie toate sistemele disponibile.</p>
            <ul className="b2b-filter-stages"><li>Sediment</li><li>Cărbune activ</li><li>Carbon block</li><li>Membrană UF</li></ul>
            <div className="b2b-actions">
              <button type="button" className="b2b-link" onClick={() => onOffer("Filtre pentru apă și cafea")}>Cere un filtru compatibil<ArrowUpRight size={18} aria-hidden="true" /></button>
              <Link className="b2b-link" href="/cafea-pentru-birouri#filtre">Filtre pentru espressor<ArrowUpRight size={18} aria-hidden="true" /></Link>
            </div>
          </div>
          <div className="b2b-filter-media"><Image src="/images/filtration/four-filters.webp" alt="Sistemul ilustrat cu filtre pentru sediment, cărbune activ, carbon block și membrană UF" fill sizes="(max-width: 800px) 90vw, 45vw" /></div>
        </div>
      </AnimatedDisclosure>
    </section>

    <section className="b2b-container b2b-section office-service-complements" id="servicii" data-choreography="section" aria-labelledby="water-services-title">
      <ServiceDetails services={waterServices} onOffer={onOffer} title="Altă soluție pentru apă?" titleId="water-services-title"
        description="Pentru alt aparat sau un sistem existent, stabilim configurația, lucrările și costurile în oferta personalizată."
        action="Cere ofertă pentru apă" defaultInterest="Consultanță pentru filtrarea apei" />
    </section>

    <BusinessQuestions questions={waterQuestions} initialOpen={null} />
  </>}</BusinessShell>;
}
