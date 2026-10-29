import type { Metadata } from "next";
import MakeonLanding from "@/components/makeon-landing";

export const metadata: Metadata = {
  title: "Cafea pentru birouri și espressoare automate | Makeon",
  description:
    "Cafea SwitchMORN, espressoare automate și aprovizionare pentru birouri. Cere ofertă personalizată după consumul și preferințele echipei tale.",
};

export default function OfficeCoffeePage() {
  return <MakeonLanding key="office-coffee" dedicatedCoffee />;
}
