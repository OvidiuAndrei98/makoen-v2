import { ArrowRight, MessageCircle, SlidersHorizontal, Wrench } from "lucide-react";

const steps = [
  {
    Icon: MessageCircle,
    title: "Ne spui despre echipă.",
    description: "Câți colegi sunteți și ce consum de cafea și apă aveți.",
  },
  {
    Icon: SlidersHorizontal,
    title: "Alegem și instalăm echipamentele.",
    description: "Dimensionăm aparatele după echipă și spațiu. Stabilim comodatul și serviciile într-o ofertă clară.",
  },
  {
    Icon: Wrench,
    title: "Livrăm și avem grijă de aparate.",
    description: "Planificăm livrările de cafea proaspăt prăjită, aprovizionarea și mentenanța după ritmul biroului.",
  },
];

export default function HomeProcess() {
  return (
    <section className="b2b-container home-process" id="cum-lucram" aria-labelledby="home-process-title" data-choreography="section">
      <div className="home-process-panel">
        <h2 className="b2b-heading" id="home-process-title">
          <span className="choreography-heading-mask"><span data-choreo-heading>Cum lucrăm.</span></span>
        </h2>
        <ol className="home-process-steps" role="list">
          {steps.map(({ Icon, title, description }, index) => (
            <li key={title}>
              <span className="home-process-icon" aria-hidden="true"><Icon size={22} strokeWidth={1.6} /></span>
              <div className="home-process-copy" data-choreo-item>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              {index < steps.length - 1 && <ArrowRight className="home-process-arrow" size={18} strokeWidth={1.5} aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
