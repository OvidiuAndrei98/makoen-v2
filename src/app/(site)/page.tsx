import type { Metadata } from "next";
import MakeonLanding from "@/components/makeon-landing";

export const metadata: Metadata = {
  title: "Dozatoare de apă și aparate de cafea pentru companii | Makeon",
  description:
    "Soluții de apă filtrată și cafea pentru birouri și companii. Dozatoare Vero Aqua, espressoare SwitchMORN, consumabile și service, cu un singur partener.",
};

export default function HomePage() {
  return <MakeonLanding key="coffee" />;
}
