import { createFileRoute } from "@tanstack/react-router";
import { mergeServices, type SiteContent } from "@/lib/cms";
import { ServiceDetailPage } from "@/components/site/pages/ServiceDetailPage";
import { seoMeta } from "@/lib/seo";

export const Route = createFileRoute("/services_/$slug")({
  loader: ({ params }) => ({ slug: params.slug }),
  head: ({ loaderData, matches }) => {
    const content = matches[0]?.loaderData as SiteContent | undefined;
    const s = mergeServices(content?.services).find((x) => x.slug === loaderData?.slug);
    const title = s ? `${s.title} in Dubai | QMEP Electromechanical` : "Service | QMEP";
    const desc = s?.summary ?? "MEP services by QMEP Electromechanical LLC.";
    return seoMeta(matches, `service-${loaderData?.slug ?? ""}`, title, desc);
  },
  component: ServicePage,
});

function ServicePage() {
  const { slug } = Route.useLoaderData();
  return <ServiceDetailPage key={slug} slug={slug} />;
}
