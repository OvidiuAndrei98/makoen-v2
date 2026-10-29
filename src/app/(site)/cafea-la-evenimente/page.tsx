import type { Metadata } from "next";
import EventLanding from "@/components/event-landing";

export const metadata: Metadata = {
  title: "Cafea la evenimente: bar mobil și rulotă | Makeon",
  description: "Bar mobil Coffee Corner și rulotă SwitchMORN Coffee pentru evenimente. Alegem formatul după locație și invitați. Cere ofertă pentru evenimentul tău.",
};

export default function EventsPage() { return <EventLanding />; }
