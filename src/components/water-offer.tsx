import { Check } from "lucide-react";
import { waterSubscription } from "@/lib/business-content";

/** Concise offer artwork, with real HTML text for sharp and accessible pricing. */
export default function WaterOffer() {
  return (
    <div className="water-offer-art">
      <span className="water-offer-brand">VERO AQUA / ABONAMENT</span>
      <p className="water-offer-heading">
        Simplu. Transparent.
        <br />
        <span>Avantajos.</span>
      </p>
      <div className="water-offer-price">
        <strong>
          {waterSubscription.monthlyEuro}
          <span>€</span>
        </strong>
        <span>
          / lună<small>+ TVA</small>
        </span>
      </div>
      <div className="water-offer-benefits">
        <span>
          <Check aria-hidden="true" />
          Filtre și mentenanță incluse
        </span>
      </div>
    </div>
  );
}
