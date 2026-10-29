export default function HomeProcess() {
  return (
    <section className="b2b-container home-process" id="cum-lucram" aria-labelledby="home-process-title" data-choreography="section">
      <h2 className="b2b-heading" id="home-process-title">
        <span className="choreography-heading-mask"><span data-choreo-heading>Cum lucrăm.</span></span>
      </h2>
      <ol className="home-process-steps">
        <li data-choreo-item>
          <span className="home-process-number" aria-hidden="true">01</span>
          <h3>Ne spui despre echipă.</h3>
          <p>Câți colegi sunteți, ce consumați și ce spațiu aveți la dispoziție.</p>
        </li>
        <li data-choreo-item>
          <span className="home-process-number" aria-hidden="true">02</span>
          <h3>Îți recomandăm soluția.</h3>
          <p>Alegem cafeaua, espressorul sau dozatorul de apă și clarificăm costurile în ofertă.</p>
        </li>
        <li data-choreo-item>
          <span className="home-process-number" aria-hidden="true">03</span>
          <h3>Stabilim instalarea și serviciile.</h3>
          <p>Planificăm instalarea și mentenanța, plus aprovizionarea cu cafea, conform ofertei acceptate.</p>
        </li>
      </ol>
    </section>
  );
}
