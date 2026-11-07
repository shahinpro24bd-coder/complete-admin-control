import { createFileRoute } from "@tanstack/react-router";
import { pageSeo } from "@/lib/seo";
import { HomeContent } from "@/components/site/HomeContent";

export const Route = createFileRoute("/")({
  head: pageSeo("home"),
  component: HomeContent,
});

