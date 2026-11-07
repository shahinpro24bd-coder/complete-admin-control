import type { SiteContent } from "@/lib/cms";

// Default search-engine title/description per page; admins can override them (keys seo.<page>.title / .description).
export const seoDefaults: Record<string, { name: string; title: string; description: string }> = {
  home: { name: "Home", title: "QMEP Electromechanical LLC | Reliable MEP Solutions in Dubai", description: "Professional HVAC, electrical, plumbing and MEP maintenance services for residential and commercial buildings across Dubai." },
  about: { name: "About", title: "About Us | QMEP Electromechanical LLC", description: "Learn about QMEP Electromechanical LLC, our mission, vision and core values in MEP services in Dubai." },
  services: { name: "Services", title: "MEP & Electromechanical Services | QMEP Dubai", description: "HVAC, electrical, plumbing, MEP maintenance, AMC and VRF/VRV services in Dubai by QMEP Electromechanical LLC." },
  amc: { name: "AMC Packages", title: "AMC Packages | Annual Maintenance Contracts Dubai | QMEP", description: "Residential, commercial and comprehensive MEP Annual Maintenance Contracts in Dubai from QMEP Electromechanical LLC." },
  projects: { name: "Projects", title: "Our Projects | QMEP Electromechanical LLC", description: "Explore HVAC, electrical, plumbing and MEP maintenance work by QMEP Electromechanical LLC in Dubai." },
  industries: { name: "Industries", title: "Industries We Serve | QMEP Electromechanical LLC", description: "MEP solutions for residential, commercial, fit-out, facility management and main contractor projects in Dubai." },
  contact: { name: "Contact", title: "Contact Us | Request a Quote | QMEP Electromechanical LLC", description: "Contact QMEP Electromechanical LLC in Dubai for HVAC, electrical, plumbing and MEP maintenance quotations." },
};

type MatchLike = { loaderData?: unknown };

/** Builds the head() meta for a page, using saved SEO texts from the root loader when present. */
export function seoMeta(matches: MatchLike[], page: string, title: string, description: string) {
  const texts = (matches[0]?.loaderData as SiteContent | undefined)?.texts ?? {};
  const t = texts[`seo.${page}.title`]?.trim() || title;
  const d = texts[`seo.${page}.description`]?.trim() || description;
  return {
    meta: [
      { title: t },
      { name: "description", content: d },
      { property: "og:title", content: t },
      { property: "og:description", content: d },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}

export const pageSeo = (page: keyof typeof seoDefaults) => ({ matches }: { matches: MatchLike[] }) =>
  seoMeta(matches, page, seoDefaults[page]!.title, seoDefaults[page]!.description);
