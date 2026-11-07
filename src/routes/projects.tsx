import { createFileRoute } from "@tanstack/react-router";
import { pageSeo } from "@/lib/seo";
import { ProjectsPage } from "@/components/site/pages/ProjectsPage";

export const Route = createFileRoute("/projects")({
  head: pageSeo("projects"),
  component: Projects,
});

function Projects() {
  return <ProjectsPage />;
}
