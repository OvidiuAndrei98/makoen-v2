import type { Metadata } from "next";
import MakeonLanding from "@/components/makeon-landing";

export const metadata: Metadata = {
  title: "Apă filtrată pentru birouri și dozatoare Vero Aqua | Makeon",
  description: "Dozatoare Vero Aqua cu apă rece, caldă și la temperatura camerei pentru birouri. Abonament cu instalare, mentenanță, schimb de filtre și asistență tehnică.",
};

export default function WaterPage() {
  return <MakeonLanding key="water" initialWorld="water" dedicatedWater />;
}
