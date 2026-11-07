import { createFileRoute } from "@tanstack/react-router";
import { pageSeo } from "@/lib/seo";
import { IndustriesPage } from "@/components/site/pages/IndustriesPage";

export const Route = createFileRoute("/industries")({
  head: pageSeo("industries"),
  component: Industries,
});

function Industries() {
  return <IndustriesPage />;
}
