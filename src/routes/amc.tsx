import { createFileRoute } from "@tanstack/react-router";
import { pageSeo } from "@/lib/seo";
import { AmcPage } from "@/components/site/pages/AmcPage";

export const Route = createFileRoute("/amc")({
  head: pageSeo("amc"),
  component: Amc,
});

function Amc() {
  return <AmcPage />;
}
