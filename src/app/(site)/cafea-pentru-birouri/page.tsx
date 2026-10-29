import type { Metadata } from "next";
import MakeonLanding from "@/components/makeon-landing";

export const metadata: Metadata = {
  title: "Cafea de origine pentru birouri | Makeon",
  description: "Cafea de origine proaspăt prăjită, livrată direct din prăjitorie. Espressoare în comodat, dimensionate după numărul de angajați, livrări regulate și service pentru biroul tău.",
};

export default function OfficeCoffeePage() {
  return <MakeonLanding key="office-coffee" dedicatedCoffee />;
}
