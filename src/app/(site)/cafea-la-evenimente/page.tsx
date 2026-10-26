import type { Metadata } from "next";
import EventLanding from "@/components/event-landing";

export const metadata: Metadata = {
  title: "Stand de cafea și rulotă pentru evenimente | Makeon",
  description: "Barul mobil Coffee Corner și rulota SwitchMORN Coffee pentru evenimentul tău. Vezi cele două formate și cere o ofertă în funcție de locație și invitați.",
};

export default function EventsPage() { return <EventLanding />; }
