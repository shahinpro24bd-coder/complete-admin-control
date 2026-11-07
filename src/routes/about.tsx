import { createFileRoute } from "@tanstack/react-router";
import { pageSeo } from "@/lib/seo";
import { AboutPage } from "@/components/site/pages/AboutPage";

export const Route = createFileRoute("/about")({
  head: pageSeo("about"),
  component: About,
});

function About() {
  return <AboutPage />;
}
