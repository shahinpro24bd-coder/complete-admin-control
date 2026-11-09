import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import { EditContext } from "@/lib/editable";
import { SiteLayout } from "@/components/site/Layout";
import { HomeContent } from "@/components/site/HomeContent";
import { AboutPage } from "@/components/site/pages/AboutPage";
import { ServicesPage } from "@/components/site/pages/ServicesPage";
import { AmcPage } from "@/components/site/pages/AmcPage";
import { ProjectsPage } from "@/components/site/pages/ProjectsPage";
import { IndustriesPage } from "@/components/site/pages/IndustriesPage";
import { ContactPage } from "@/components/site/pages/ContactPage";
import { ServiceDetailPage } from "@/components/site/pages/ServiceDetailPage";
import { services } from "@/lib/site";

// In the admin page editor every visible word, icon and photo must be editable.
const ctx = { edit: true, get: (_k: string, d: string) => d, set() {}, pick() {}, pickIcon() {} };
const pages: Record<string, () => JSX.Element> = {
  Layout: () => <SiteLayout><div /></SiteLayout>,
  HomeContent, AboutPage, ServicesPage, AmcPage, ProjectsPage, IndustriesPage, ContactPage,
  ...Object.fromEntries(services.map((s) => [`Service ${s.slug}`, () => <ServiceDetailPage slug={s.slug} />])),
};

// Things that are generated, not written copy: numbering, counters, separators.
const ignorable = (t: string) => /^[\s\d/·|:.,\-–—+%()#&]*$/.test(t);
// Editor-only helpers (toolbars, add buttons, hints) are not site content.
const skip = ".cms-tools, .cms-add, .cms-hint, .cms-hero-pick, .cms-options small, textarea, select, script, style, noscript";

async function audit(P: () => JSX.Element) {
  const root = createRootRoute({ component: () => <EditContext.Provider value={ctx}><P /></EditContext.Provider> });
  const router = createRouter({ routeTree: root, history: createMemoryHistory({ initialEntries: ["/"] }) });
  await router.load();
  const doc = new DOMParser().parseFromString(renderToString(<RouterProvider router={router} />), "text/html");
  const bad: string[] = [];
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = n.textContent ?? "";
    if (ignorable(t) || n.parentElement?.closest(skip)) continue;
    bad.push(`text: "${t.trim()}"`);
  }
  doc.querySelectorAll("i[class*='fa-']").forEach((i) => {
    if (i.closest(skip) || i.classList.contains("cms-icon") || i.hasAttribute("data-fixed")) return;
    bad.push(`icon: ${i.className}`);
  });
  doc.querySelectorAll("img").forEach((i) => {
    if (i.closest(skip) || i.classList.contains("cms-img")) return;
    bad.push(`image: ${i.getAttribute("src")}`);
  });
  return bad;
}

describe("everything on the site is editable from the admin page editor", () => {
  for (const [name, P] of Object.entries(pages)) {
    it(`${name} has no fixed text, icons or photos`, async () => {
      expect(await audit(P)).toEqual([]);
    });
  }
});
