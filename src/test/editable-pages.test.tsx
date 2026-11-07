import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import { EditContext } from "@/lib/editable";
import { AboutPage } from "@/components/site/pages/AboutPage";
import { ServicesPage } from "@/components/site/pages/ServicesPage";
import { AmcPage } from "@/components/site/pages/AmcPage";
import { ProjectsPage } from "@/components/site/pages/ProjectsPage";
import { IndustriesPage } from "@/components/site/pages/IndustriesPage";
import { ContactPage } from "@/components/site/pages/ContactPage";
import { ServiceDetailPage } from "@/components/site/pages/ServiceDetailPage";

const ctx = { edit: true, get: (_k: string, d: string) => d, set() {}, pick() {} };
const pages = { AboutPage, ServicesPage, AmcPage, ProjectsPage, IndustriesPage, ContactPage, Detail: () => <ServiceDetailPage slug="hvac" /> };

describe("page editor", () => {
  for (const [name, P] of Object.entries(pages)) {
    it(`${name} turns its text into editable boxes`, async () => {
      const root = createRootRoute({ component: () => <EditContext.Provider value={ctx}><P /></EditContext.Provider> });
      const router = createRouter({ routeTree: root, history: createMemoryHistory({ initialEntries: ["/"] }) });
      await router.load();
      const html = renderToString(<RouterProvider router={router} />);
      expect(html.match(/cms-field/g)?.length ?? 0).toBeGreaterThan(5);
    });
  }
});
