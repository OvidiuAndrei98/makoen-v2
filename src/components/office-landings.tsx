"use client";

import Image from "next/image";
import { ArrowUpRight, Check, Headphones, PackageCheck, Plug, RefreshCw, Wrench } from "lucide-react";
import BusinessShell from "./business-shell";
import { BusinessQuestions, BusinessShopPreview } from "./business-sections";
import { coffeeQuestions, waterQuestions, waterSubscription } from "@/lib/business-content";
import { useRef } from "react";
import usePresentationEntrance from "./use-presentation-entrance";

const officeIllustration = "/images/makeon-office-hero-v2.webp";
const inclusionIcons = [PackageCheck, Plug, Wrench, RefreshCw, Headphones];

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

    <section className="office-coffee-showcase" id="abonamente" data-choreography="section" aria-labelledby="coffee-offer-title">
      <div className="b2b-container office-showcase-grid">
        <figure className="coffee-plan-product office-machine-stage" data-choreo-media>
          <span className="office-visual-label">SwitchMORN Coffee</span>
          <div className="coffee-plan-product-image">
            <Image src="/images/coffee-machine-switchmorn.png" alt="Espressor automat SwitchMORN cu ecran tactil și recipient pentru cafea boabe" fill sizes="(max-width: 800px) 80vw, 40vw" />
          </div>
          <figcaption className="office-machine-specs"><span>Cafea boabe</span><span>Ecran tactil</span><span>Espresso & cappuccino</span></figcaption>
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
          <button type="button" className="b2b-btn" onClick={() => onOffer("Abonament de cafea")} data-choreo-item>Cere oferta pentru birou<ArrowUpRight size={18} aria-hidden="true" /></button>
        </div>
      </div>
    </section>

    <section className="b2b-container b2b-section office-catalog-section" id="magazin" data-choreography="catalog">
      <BusinessShopPreview title="Cafea SwitchMORN" description="Alege sortimentul, gramajul și măcinarea din catalog." showEyebrow={false} sectionId="office-shop-products" />
    </section>

    <section className="office-craft-band" id="servicii" data-choreography="section" aria-labelledby="coffee-services-title"><div className="b2b-container office-craft-section">
      <figure className="office-craft-visual">
        <div className="office-coffee-closeup" data-choreo-media><div className="office-coffee-photo-crop"><Image src="/images/switchmorn-coffee-corner.webp" alt="Espressor SwitchMORN, pachete de cafea și accesorii pentru servire" fill sizes="(max-width: 800px) 160vw, 85vw" /></div></div>
        <figcaption className="service-photo-caption">Espressor și cafea SwitchMORN.</figcaption>
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
          <button type="button" className="b2b-btn" onClick={() => onOffer("Cafea de probă")}>Solicită cafea de probă<ArrowUpRight size={18} aria-hidden="true" /></button>
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

export function WaterLanding() {
  const hero = useRef<HTMLDivElement>(null);
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

      <section className="b2b-container water-office-context office-water-experience" data-choreography="section" aria-labelledby="water-offer-title">
        <div className="office-water-experience-heading">
          <h2 className="b2b-heading" id="water-offer-title"><span className="choreography-heading-mask"><span data-choreo-heading>Un abonament.<br />Aparat și servicii incluse.</span></span></h2>
          <p className="b2b-body" data-choreo-item>Instalare, întreținere și asistență pentru dozatorul de la birou.</p>
        </div>
        <figure className="water-context-visual">
          <div className="water-context-photo" data-choreo-media>
            <Image src={officeIllustration} alt="Ilustrație Makeon cu dozatorul Vero Aqua și zona de utilizare într-un spațiu de birou" fill sizes="100vw" />
          </div>
          <figcaption className="service-photo-caption" data-choreo-item>Ilustrație de prezentare Makeon.</figcaption>
        </figure>
        <div className="office-water-inclusions water-inclusions">
          <ul>{waterSubscription.includes.map((item, index) => { const Icon = inclusionIcons[index]; return <li key={item} data-choreo-item><Icon size={28} strokeWidth={1.4} aria-hidden="true" /><span>{item}</span></li>; })}</ul>
          <p className="b2b-note" data-choreo-item>Oferta este exclusiv pentru apă. Configurația, cerințele de instalare și condițiile finale se confirmă la contractare.</p>
        </div>
      </section>
    </section>

    <section className="office-filtration-section" id="filtre" data-choreography="section" aria-labelledby="water-filters-title">
      <div className="b2b-container">
        <div className="office-filtration-heading">
          <div><p className="office-overline" data-choreo-item>Vero Aqua · Filtrare</p><h2 className="b2b-heading" id="water-filters-title"><span className="choreography-heading-mask"><span data-choreo-heading>Filtrarea, la vedere.</span></span></h2></div>
          <p className="b2b-body" data-choreo-item>Patru stadii de filtrare și lampă UV pentru modelul din ofertă. Verificăm configurația și compatibilitatea pentru aparatul ales.</p>
        </div>
        <figure className="office-filter-system">
          <div className="b2b-filter-media" data-choreo-media><Image src="/images/filtration/four-filters.webp" alt="Sistemul ilustrat cu filtre pentru sediment, cărbune activ, carbon block și membrană UF" fill sizes="(max-width: 800px) 90vw, 1000px" /></div>
          <figcaption><ul className="office-filter-labels"><li>Sediment</li><li>Cărbune activ</li><li>Carbon block</li><li>Membrană UF</li></ul></figcaption>
        </figure>
        <div className="office-existing-system" id="servicii">
          <div className="office-existing-system-heading"><h3 className="b2b-h3">Ai deja un sistem de filtrare?</h3><p className="b2b-body">Instalare, mentenanță sau un filtru compatibil, într-o ofertă pentru echipamentul tău.</p></div>
          <ul className="office-water-services">
            <li data-choreo-item><Plug size={24} strokeWidth={1.5} aria-hidden="true" /><div><h4>Instalare</h4><p>Montaj adaptat spațiului și aparatului.</p></div></li>
            <li data-choreo-item><Wrench size={24} strokeWidth={1.5} aria-hidden="true" /><div><h4>Mentenanță</h4><p>Verificări și intervale stabilite în ofertă.</p></div></li>
            <li data-choreo-item><RefreshCw size={24} strokeWidth={1.5} aria-hidden="true" /><div><h4>Schimb de filtre</h4><p>Compatibilitate verificată pentru sistemul existent.</p></div></li>
          </ul>
          <div className="office-existing-system-action" data-choreo-item><p className="b2b-note">Pentru alte sisteme, lucrările și costurile se stabilesc separat de abonamentul Vero Aqua.</p><button type="button" className="b2b-btn" onClick={() => onOffer("Consultanță pentru filtrarea apei")}>Cere ofertă pentru apă<ArrowUpRight size={18} aria-hidden="true" /></button></div>
        </div>
      </div>
    </section>

    <BusinessQuestions questions={waterQuestions} initialOpen={null} />
  </>}</BusinessShell>;
}
