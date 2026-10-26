import Link from "next/link";

export default function HomeSupport() {
  return (
    <section className="home-support-band" id="despre" aria-labelledby="home-support-title" data-choreography="band">
      <div className="b2b-container">
        <div className="home-support-band-grid">
          <div className="home-support-band-heading" id="ecosistem">
            <h2 id="home-support-title"><span className="choreography-heading-mask"><span data-choreo-heading>Un singur partener pentru birou.</span></span></h2>
          </div>
          <div className="home-support-band-service" data-choreo-item>
            <h3>Alegerea echipamentului</h3>
            <p>Discutăm consumul, preferințele și spațiul disponibil, apoi pregătim propunerea.</p>
          </div>
          <div className="home-support-band-service" data-choreo-item>
            <h3>Instalare și întreținere</h3>
            <p>Abonamentul Vero Aqua prezentat include instalare, mentenanță și filtre. Pentru cafea, serviciile și costurile se confirmă în ofertă.</p>
          </div>
          <div className="home-support-band-service" data-choreo-item>
            <h3>Aprovizionare cu cafea</h3>
            <p>Alegem cafeaua și stabilim planul de aprovizionare după consumul echipei.</p>
          </div>
        </div>
        <nav className="home-support-band-links choreography-line-host" id="servicii" aria-label="Servicii specializate pentru birouri">
          <span className="choreography-separator" data-choreo-line aria-hidden="true" />
          <Link href="/apa#filtre" data-choreo-item>Filtrare și mentenanță</Link>
          <Link href="/cafea-pentru-birouri#servicii" data-choreo-item>Prăjire și blenduri personalizate</Link>
        </nav>
      </div>
    </section>
  );
}
