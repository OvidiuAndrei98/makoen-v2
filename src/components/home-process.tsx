import { ArrowRight } from "lucide-react";

export default function HomeProcess() {
  return (
    <section className="b2b-container home-process" id="cum-lucram" aria-labelledby="home-process-title" data-choreography="section">
      <h2 className="b2b-heading" id="home-process-title">
        <span className="choreography-heading-mask"><span data-choreo-heading>Cum lucrăm.</span></span>
      </h2>
      <ol className="home-process-steps">
        <li data-choreo-item>
          <h3>Ne spui despre echipă.</h3>
          <p>Câți colegi sunteți și ce consum de cafea și apă aveți.</p>
          <ArrowRight className="home-process-arrow" size={24} strokeWidth={1.5} aria-hidden="true" />
        </li>
        <li data-choreo-item>
          <h3>Îți recomandăm soluția.</h3>
          <p>Alegem echipamentele și cafeaua potrivite, cu o ofertă clară.</p>
          <ArrowRight className="home-process-arrow" size={24} strokeWidth={1.5} aria-hidden="true" />
        </li>
        <li data-choreo-item>
          <h3>Ne ocupăm de servicii.</h3>
          <p>Instalare, aprovizionare și mentenanță, conform ofertei acceptate.</p>
        </li>
      </ol>
    </section>
  );
}
