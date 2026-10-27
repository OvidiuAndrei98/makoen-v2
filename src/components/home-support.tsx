"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { OfferHandler } from "./business-shell";
import { waterSubscription } from "@/lib/business-content";

export default function HomeSupport({ onOffer }: { onOffer: OfferHandler }) {
  return <section className="home-solutions" id="despre" aria-labelledby="home-support-title" data-choreography="section">
    <div className="b2b-container">
      <div className="home-solutions-heading" id="ecosistem">
        <h2 id="home-support-title"><span className="choreography-heading-mask"><span data-choreo-heading>Cafea și apă.<br />Un singur partener.</span></span></h2>
        <p data-choreo-item>Două lucruri care fac ziua la birou mai bună. Cafeaua SwitchMORN și apa filtrată Vero Aqua, cu soluția potrivită echipei tale.</p>
      </div>

      <div className="home-solutions-grid" id="servicii">
        <article className="home-solution home-solution-coffee" aria-labelledby="home-coffee-details-title" data-choreography="section">
          <header className="home-solution-masthead">
            <div className="home-solution-brand"><Image src="/images/switchmorn-coffee-logo.webp" alt="" width={44} height={44} /><span>SwitchMORN Coffee</span></div>
            <p className="home-solution-category">Cafea pentru echipă</p>
          </header>
          <div className="home-solution-body">
            <div className="home-solution-copy">
              <h3 id="home-coffee-details-title"><span className="choreography-heading-mask"><span data-choreo-heading>Cafeaua <em>ta.</em></span></span></h3>
              <p className="home-solution-description" data-choreo-item>De la primul espresso la ultima întâlnire. Cafea SwitchMORN, espressor automat și aprovizionare după ritmul echipei.</p>
              <p className="home-solution-detail" data-choreo-item>Blenduri sau cafele de origine. Alegem împreună sortimentele și aparatul potrivit băuturilor preferate.</p>
            </div>
            <figure className="home-solution-visual home-coffee-visual">
              <div className="home-solution-media" data-choreo-media><div className="office-coffee-photo-crop"><Image src="/images/switchmorn-coffee-corner.webp" alt="Espressor SwitchMORN, pachete de cafea și accesorii pentru servire" fill sizes="(max-width: 700px) 160vw, (max-width: 1000px) 90vw, 95vw" /></div></div>
              <figcaption><span>Espressor și cafea SwitchMORN</span><span>Pauza începe aici.</span></figcaption>
            </figure>
          </div>
          <div className="home-solution-footer" data-choreo-item>
            <div className="home-solution-offer">
              <p className="home-coffee-quote">O soluție pentru biroul tău.</p>
              <p className="home-solution-conditions">Ofertă personalizată. Echipamentul, aprovizionarea, instalarea și mentenanța se stabilesc împreună, cu costurile lor.</p>
            </div>
            <div className="home-solution-action"><button type="button" className="b2b-btn" onClick={() => onOffer("Abonament de cafea")}>Cere ofertă pentru cafea<ArrowUpRight size={18} aria-hidden="true" /></button></div>
          </div>
        </article>

        <article className="home-solution home-solution-water" aria-labelledby="home-water-details-title" data-choreography="section">
          <header className="home-solution-masthead">
            <Image className="home-water-brand" src="/images/vero-aqua-logo.webp" alt="Vero Aqua" width={128} height={48} />
            <p className="home-solution-category">Apă filtrată, la îndemână</p>
          </header>
          <div className="home-solution-body">
            <div className="home-solution-copy">
              <h3 id="home-water-details-title"><span className="choreography-heading-mask"><span data-choreo-heading>Pauza ta de <em>hidratare.</em></span></span></h3>
              <p className="home-solution-description" data-choreo-item>Rece, caldă sau la temperatura camerei. Apă filtrată la birou, dintr-un dozator Vero Aqua nou.</p>
              <p className="home-solution-detail" data-choreo-item>Instalare, mentenanță, igienizare, schimb de filtre și asistență tehnică incluse în abonament.</p>
            </div>
            <div className="home-water-showcase">
              <div className="home-water-temperatures" aria-hidden="true"><span>Rece</span><span>Caldă</span><span>Ambientală</span></div>
              <div className="home-water-apparatus" data-choreo-media><Image src="/images/vero-aqua-dispenser.webp" alt="Dozatorul Vero Aqua cu apă rece, caldă și la temperatura camerei" fill sizes="(max-width: 700px) 150px, 210px" /></div>
              <div className="home-water-filtration" data-choreo-item><span className="home-water-filtration-number" aria-hidden="true">4</span><p>Patru stadii de filtrare<br /><span>și lampă UV</span></p><small>Pentru modelul prezentat</small></div>
            </div>
          </div>
          <div className="home-solution-footer" data-choreo-item>
            <div className="home-solution-offer">
              <p className="home-water-summary-price"><strong>{waterSubscription.monthlyEuro} €</strong><span>+ TVA<br />/ lună / aparat</span></p>
              <p className="home-solution-conditions">Contract pe {waterSubscription.months} de luni · Total: {(waterSubscription.monthlyEuro * waterSubscription.months).toLocaleString("ro-RO")} € + TVA / aparat. Configurația și instalarea se confirmă la contractare.</p>
            </div>
            <div className="home-solution-action"><button type="button" className="b2b-btn" onClick={() => onOffer(waterSubscription.interest)}>Cere abonamentul de apă<ArrowUpRight size={18} aria-hidden="true" /></button></div>
          </div>
        </article>
      </div>
    </div>
  </section>;
}
