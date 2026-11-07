import { createFileRoute } from "@tanstack/react-router";
import { pageSeo } from "@/lib/seo";
import { ContactPage } from "@/components/site/pages/ContactPage";

export const Route = createFileRoute("/contact")({
  head: pageSeo("contact"),
  component: Contact,
});

function Contact() {
  return <ContactPage />;
}
