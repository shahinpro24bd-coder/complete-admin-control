import { company, services, faqs, type Service } from "@/lib/site";
import { setPageTexts } from "@/lib/editable";

export type CmsCompany = typeof company;
export type CmsService = { slug: string; title: string; summary: string; items: string[]; cta: string; image: string; icon: string };
export type CmsFaq = { q: string; a: string };
export type SiteContent = { company?: Partial<CmsCompany>; services?: CmsService[]; faqs?: CmsFaq[]; texts?: Record<string, string> };

// Snapshot of the bundled content: used as fallback and as the admin's starting point.
export const defaults = {
  company: { ...company },
  services: services.map((s) => ({ slug: s.slug, title: s.title, summary: s.summary, items: [...s.items], cta: s.cta, image: s.image, icon: s.icon })),
  faqs: faqs.map((f) => ({ ...f })),
};

/**
 * Turns the saved services list into the list shown on the site. The saved list decides
 * which services exist and their order (so admins can add/remove); missing fields fall back
 * to the bundled service with the same slug.
 */
export function mergeServices(saved: Partial<CmsService>[] | null | undefined): Service[] {
  const list = Array.isArray(saved) && saved.length ? saved : defaults.services;
  const out: Service[] = [];
  for (const sv of list) {
    if (!sv?.slug || out.some((o) => o.slug === sv.slug)) continue;
    const base = defaults.services.find((d) => d.slug === sv.slug);
    const fallbackImg = base?.image ?? defaults.services[0]!.image;
    out.push({
      slug: sv.slug,
      title: sv.title || base?.title || "New Service",
      summary: sv.summary ?? base?.summary ?? "",
      cta: sv.cta || base?.cta || "Request a Quote",
      icon: sv.icon || base?.icon || "fa-tools",
      image: resolveImg(sv.image, fallbackImg),
      items: sv.items?.filter((x) => x.trim()).length ? sv.items.filter((x) => x.trim()) : base?.items ?? [],
    });
  }
  return out.length ? out : defaults.services.map((s) => ({ ...s, items: [...s.items] }));
}

// Merges saved content into the shared site data in place, so every page picks it up.
export function applyContent(c: SiteContent | null | undefined) {
  Object.assign(company, defaults.company, c?.company ?? {});
  services.splice(0, services.length, ...mergeServices(c?.services));
  faqs.splice(0, faqs.length, ...(c?.faqs?.length ? c.faqs : defaults.faqs));
  setPageTexts(c?.texts);
}

/** Typing a new phone number also updates the call and WhatsApp links. */
export function withPhone(co: CmsCompany, phone: string): CmsCompany {
  const digits = phone.replace(/[^\d+]/g, "");
  if (!digits.replace("+", "")) return { ...co, phone };
  return { ...co, phone, phoneHref: `tel:${digits}`, whatsappHref: `https://wa.me/${digits.replace(/^\+/, "")}` };
}

/** URL-safe id for a new service page, unique among existing slugs. */
export function makeSlug(title: string, taken: string[]) {
  const base = title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "service";
  let s = base, n = 2;
  while (taken.includes(s)) s = `${base}-${n++}`;
  return s;
}

export const ADMIN_EMAIL = "admin@qmep-app.com";
export const usernameToEmail = (u: string) => (u.includes("@") ? u.trim() : `${u.trim().toLowerCase()}@qmep-app.com`);
