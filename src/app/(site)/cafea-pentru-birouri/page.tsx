import type { Metadata } from "next";
import MakeonLanding from "@/components/makeon-landing";

export const metadata: Metadata = {
  title: "Aparate de cafea pentru birouri și companii | Makeon",
  description:
    "Espressoare automate, cafea SwitchMORN și aprovizionare pentru companii. Solicită o ofertă adaptată consumului și nevoilor echipei tale.",
};

export default function OfficeCoffeePage() {
  return <MakeonLanding key="office-coffee" dedicatedCoffee />;
}
