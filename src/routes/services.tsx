import { createFileRoute } from "@tanstack/react-router";
import { pageSeo } from "@/lib/seo";
import { ServicesPage } from "@/components/site/pages/ServicesPage";

export const Route = createFileRoute("/services")({
  head: pageSeo("services"),
  component: Services,
});

function Services() {
  return <ServicesPage />;
}
