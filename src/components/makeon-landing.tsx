import HomeOverview from "./home-overview";
import { CoffeeOfficeLanding, WaterLanding } from "./office-landings";

/** Preserve the existing route entry points while giving each service its own presentation. */
export default function MakeonLanding({ initialWorld = "coffee", dedicatedWater = false, dedicatedCoffee = false }: {
  initialWorld?: "coffee" | "water";
  dedicatedWater?: boolean;
  dedicatedCoffee?: boolean;
}) {
  if (dedicatedWater || initialWorld === "water") return <WaterLanding />;
  if (dedicatedCoffee) return <CoffeeOfficeLanding />;
  return <HomeOverview />;
}
