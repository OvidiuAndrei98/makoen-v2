"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomeEvents() {
  return <section className="home-events event-pair-home" id="evenimente" aria-labelledby="home-events-title" data-choreography="event-pair"><div className="b2b-container">
    <div className="event-pair-header choreography-line-host">
      <h2 className="b2b-heading" id="home-events-title"><span className="choreography-heading-mask"><span data-choreo-heading>Cafea la evenimente.</span></span></h2>
      <p data-choreo-item>Stand / bar mobil sau rulotă SwitchMORN Coffee. Alegem formatul după locație, spațiu și organizarea servirii.</p>
      <span className="choreography-separator" data-choreo-line aria-hidden="true" />
    </div>
    <div className="event-photo-pair">
      <figure className="event-pair-card event-pair-card-stand" data-choreography="event-card">
        <div className="event-pair-media event-pair-media-stand" data-choreo-media><Image src="/images/events/bar-mobil-makeon.webp" alt="Standul Coffee Corner SwitchMORN Coffee, amenajat la un eveniment" fill sizes="(max-width: 700px) min(420px, calc(100vw - 40px)), 36vw" /></div>
        <figcaption className="event-pair-copy" data-choreo-caption>
          <h3 className="b2b-heading">Stand / bar mobil</h3><p>Un punct de cafea amenajat în spațiul evenimentului. Discutăm amplasarea și configurația.</p>
          <Link className="event-pair-action event-pair-link" href="/cafea-la-evenimente#bar-mobil">Vezi standul<ArrowRight size={18} aria-hidden="true" /></Link>
        </figcaption>
      </figure>
      <figure className="event-pair-card" data-choreography="event-card">
        <div className="event-pair-media event-pair-media-trailer" data-choreo-media><Image src="/images/events/rulota-exterior.webp" alt="Rulota SwitchMORN Coffee cu punctul de servire deschis" fill sizes="(max-width: 700px) 90vw, 64vw" /></div>
        <figcaption className="event-pair-copy" data-choreo-caption>
          <h3 className="b2b-heading">Rulotă de cafea</h3><p>Punctul de servire este amenajat în rulotă.</p>
          <Link className="event-pair-action event-pair-link" href="/cafea-la-evenimente#rulota">Vezi rulota<ArrowRight size={18} aria-hidden="true" /></Link>
        </figcaption>
      </figure>
    </div>
  </div></section>;
}
