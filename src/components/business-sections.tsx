"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { OfferHandler } from "./business-shell";
import { CoffeeProductCard } from "./coffee-shop";
import { useCatalog } from "./catalog-provider";
import { legal } from "@/lib/legal";
import AnimatedDisclosure from "./animated-disclosure";

export function BusinessContact({ onOffer, selection, id = "contact", title = "Spune-ne ce ai nevoie pentru echipa ta.", description = "Discutăm spațiul, consumul și serviciile. Îți pregătim o ofertă pentru soluția aleasă.", action = "Cere ofertă pentru birou" }: {
  onOffer: OfferHandler; selection?: string; id?: string; title?: string; description?: string; action?: string;
}) {
  return <section className="b2b-container b2b-contact" id={id} aria-labelledby={`${id}-title`} data-choreography="section">
    <div><p className="b2b-eyebrow">CONTACT MAKEON</p><h2 className="b2b-heading" id={`${id}-title`}><span className="choreography-heading-mask"><span data-choreo-heading>{title}</span></span></h2><p className="b2b-body" data-choreo-item>{description}</p></div>
    <div className="b2b-contact-actions" data-choreo-item><button type="button" className="b2b-btn" onClick={() => onOffer(selection)}>{action}<ArrowUpRight size={18} aria-hidden="true" /></button><a href={legal.phoneHref}>{legal.phone}</a></div>
  </section>;
}

export function BusinessQuestions({ questions, initialOpen = 0 }: { questions: readonly (readonly [string, string])[]; initialOpen?: number | null }) {
  const [opened, setOpened] = useState<number | null>(initialOpen);
  return <section className="b2b-container b2b-section b2b-faq-layout" aria-labelledby="business-faq-title" data-choreography="section">
    <div className="b2b-faq-heading"><h2 className="b2b-heading" id="business-faq-title"><span className="choreography-heading-mask"><span data-choreo-heading>Întrebări utile.</span></span></h2></div>
    <div data-choreo-item>{questions.map(([question, answer], index) => <AnimatedDisclosure key={question} id={`faq-item-${index}`} className="b2b-faq-item" title={question}
      triggerId={`faq-trigger-${index}`} panelId={`faq-answer-${index}`} open={opened === index} onToggle={() => setOpened(opened === index ? null : index)}>
      <p className="b2b-body">{answer}</p>
    </AnimatedDisclosure>)}</div>
  </section>;
}

export function ServiceDetails({ services, onOffer, title, titleId, description, action, defaultInterest }: {
  services: readonly { title: string; text: string; interest: string; action: string }[];
  onOffer: OfferHandler;
  title: string; titleId: string; description: string; action: string; defaultInterest: string;
}) {
  const [opened, setOpened] = useState<number | null>(null);
  const active = opened === null ? undefined : services[opened];
  return <>
    <div className="office-section-intro choreography-line-host">
      <h2 className="b2b-heading" id={titleId}><span className="choreography-heading-mask"><span data-choreo-heading>{title}</span></span></h2>
      <p className="b2b-body" data-choreo-item>{description}</p>
      <span className="choreography-separator" data-choreo-line aria-hidden="true" />
    </div>
    <div className="b2b-service-rows" data-choreo-item>{services.map((service, index) => <AnimatedDisclosure key={service.title}
      id={`${titleId}-service-${index}`} className="b2b-service-detail" title={service.title} open={opened === index} onToggle={() => setOpened(opened === index ? null : index)}>
      <p className="b2b-body">{service.text}</p>
    </AnimatedDisclosure>)}</div>
    <div className="office-service-action" data-choreo-item>
      <button type="button" className="b2b-link" onClick={() => onOffer(active?.interest ?? defaultInterest)}>{active?.action ?? action}<ArrowUpRight size={18} aria-hidden="true" /></button>
    </div>
  </>;
}

/** Uses the exact same product cards, catalog and add-to-cart handler as /cafea. */
export function BusinessShopPreview({ title = "Cafeaua se poate comanda \u0219i separat.", description = "Alege sortimentul, gramajul \u0219i m\u0103cinarea din catalog. Pentru un espressor \u0219i aprovizionarea biroului, folose\u0219te cererea de ofert\u0103.", showEyebrow = true, sectionId = "magazin" }: { title?: string; description?: string; showEyebrow?: boolean; sectionId?: string }) {
  const { products, ready, unavailable, refresh } = useCatalog();
  return <section className="b2b-container b2b-section" id={sectionId} aria-labelledby="business-shop-title" data-choreography={sectionId === "magazin" ? "catalog" : undefined}>
    <div className="b2b-section-head choreography-line-host"><div>{showEyebrow && <p className="b2b-eyebrow">MAGAZIN SWITCHMORN COFFEE</p>}<h2 className="b2b-heading" id="business-shop-title"><span className="choreography-heading-mask"><span data-choreo-heading>{title}</span></span></h2><p className="b2b-body" data-choreo-item>{description}</p></div><Link className="b2b-link" href="/cafea" data-choreo-item>Deschide magazinul<ArrowUpRight size={18} aria-hidden="true" /></Link><span className="choreography-separator" data-choreo-line aria-hidden="true" /></div>
    {unavailable && <div className="b2b-catalog-status"><p className="b2b-body" role="alert">{products.length ? "Catalogul nu a putut fi actualizat. Reîncearcă pentru prețuri și stocuri actuale." : "Catalogul este temporar indisponibil."}</p><button className="b2b-link" type="button" onClick={refresh}>Reîncearcă</button></div>}
    {!ready ? <p className="b2b-body" role="status">Se încarcă produsele…</p> : products.length > 0 && <div className="b2b-product-selection" data-choreo-cards>{products.slice(0, 3).map(product => <CoffeeProductCard key={product.slug} product={product} />)}</div>}
  </section>;
}

export function Collaboration({ showBrands = false }: { showBrands?: boolean }) {
  return <section className="b2b-tinted b2b-section" id="despre" aria-labelledby="collaboration-title"><div className="b2b-container b2b-about-grid">
    <div id="ecosistem"><p className="b2b-eyebrow">DESPRE MAKEON & COLABORARE</p><h2 className="b2b-heading" id="collaboration-title">Aceeași discuție pentru cafea, apă și echipamente.</h2><p className="b2b-body">Makeon reunește SwitchMORN Coffee și Vero Aqua. Poți alege o singură specializare sau o ofertă comună pentru birou.</p>
      {showBrands && <div className="b2b-brand-pair"><Image src="/images/switchmorn-coffee-logo.webp" alt="SwitchMORN Coffee" width={65} height={66} /><Image src="/images/vero-aqua-logo.webp" alt="Vero Aqua" width={128} height={49} /></div>}
    </div>
    <ol className="b2b-process">
      <li><h3>Discutăm nevoia</h3><p>Numărul de colegi, consumul, băuturile preferate și spațiul disponibil ne ajută să alegem echipamentele.</p></li>
      <li><h3>Primești propunerea</h3><p>Clarificăm aparatul, cafeaua sau filtrarea, costurile și serviciile. Pentru Vero Aqua poți consulta și abonamentul prezentat pe site.</p></li>
      <li><h3>Stabilim instalarea și serviciile</h3><p>Confirmăm condițiile de amplasare, aprovizionarea și mentenanța potrivit soluției alese. Serviciile incluse sunt cele din oferta acceptată.</p></li>
    </ol>
  </div></section>;
}
