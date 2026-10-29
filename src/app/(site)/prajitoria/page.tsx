import type { Metadata } from "next";
import RoasteryLanding from "@/components/roastery-landing";

export const metadata: Metadata = {
  title: "Prăjitoria SwitchMORN · Cafea proaspăt prăjită | Makeon",
  description: "Cafea de origine, blenduri și prăjire în loturi mici pentru espresso sau filtru. Livrare direct din prăjitoria SwitchMORN și sortimente alese după gustul tău.",
};

export default function RoasteryPage() { return <RoasteryLanding />; }
