import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type MouseEvent, type JSX } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { uploadSiteImage } from "@/lib/upload-image";
import { defaults, mergeServices, withPhone, type CmsCompany, type CmsFaq, type CmsService } from "@/lib/cms";
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
import { IconPicker } from "@/components/admin/IconPicker";
import { services as siteServices } from "@/lib/site";

// Every editable page: key in the URL, its name, live path and the page body.
const fixedPages: Record<string, { name: string; path: string; render: () => JSX.Element }> = {
  home: { name: "Home", path: "/", render: () => <HomeContent /> },
  about: { name: "About", path: "/about", render: () => <AboutPage /> },
  services: { name: "Services", path: "/services", render: () => <ServicesPage /> },
  amc: { name: "AMC Packages", path: "/amc", render: () => <AmcPage /> },
  projects: { name: "Projects", path: "/projects", render: () => <ProjectsPage /> },
  industries: { name: "Industries", path: "/industries", render: () => <IndustriesPage /> },
  contact: { name: "Contact", path: "/contact", render: () => <ContactPage /> },
};

function findPage(page: string) {
  if (fixedPages[page]) return fixedPages[page];
  const s = page.startsWith("service-") ? siteServices.find((x) => `service-${x.slug}` === page) : undefined;
  return s ? { name: s.title, path: `/services/${s.slug}`, render: () => <ServiceDetailPage slug={s.slug} /> } : undefined;
}

export const Route = createFileRoute("/_authenticated/admin_/pages/$page")({
  head: () => ({
    meta: [
      { title: "Edit Page | QMEP Admin" },
      { name: "description", content: "Edit the texts and images of a QMEP website page." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Edit Page | QMEP Admin" },
      { property: "og:description", content: "QMEP page editor." },
    ],
  }),
  component: PageEditor,
});

const svcRe = /^services\.(\d+)\.(title|summary|cta|image|icon)$/;
const itemRe = /^services\.(\d+)\.items\.(\d+)$/;
const faqRe = /^faqs\.(\d+)\.(q|a)$/;
const coRe = /^company\.(\w+)$/;

function PageEditor() {
  const { page } = Route.useParams();
  const def = findPage(page);
  const router = useRouter();
  const [ready, setReady] = useState<"loading" | "ok" | "denied">("loading");
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [services, setServices] = useState<CmsService[]>(defaults.services.map((s) => ({ ...s, items: [...s.items] })));
  const [faqs, setFaqs] = useState<CmsFaq[]>(defaults.faqs.map((f) => ({ ...f })));
  const [co, setCo] = useState<CmsCompany>({ ...defaults.company });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [iconKey, setIconKey] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pickKey = useRef<string>("");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data: ok } = await supabase.rpc("has_role", { _user_id: u.user!.id, _role: "admin" });
      if (!ok) { setReady("denied"); return; }
      const { data } = await supabase.from("site_content").select("key, value");
      for (const r of data ?? []) {
        if (r.key === "texts") setTexts((r.value ?? {}) as Record<string, string>);
        if (r.key === "services") setServices(mergeServices(r.value as CmsService[]).map((s) => ({ ...s, items: [...s.items] })));
        if (r.key === "faqs" && Array.isArray(r.value) && r.value.length) setFaqs(r.value as CmsFaq[]);
        if (r.key === "company" && r.value) setCo({ ...defaults.company, ...(r.value as object) });
      }
      setReady("ok");
    })();
  }, []);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const ctx = useMemo(() => {
    const get = (k: string, d: string) => {
      let m = k.match(svcRe);
      if (m) return (services[+m[1]!]?.[m[2] as "title"] as string) ?? d;
      m = k.match(itemRe);
      if (m) return services[+m[1]!]?.items[+m[2]!] ?? d;
      m = k.match(faqRe);
      if (m) return faqs[+m[1]!]?.[m[2] as "q"] ?? d;
      m = k.match(coRe);
      if (m && m[1]! in co) return co[m[1] as keyof CmsCompany] ?? d;
      return texts[k] ?? d;
    };
    const set = (k: string, v: string) => {
      setDirty(true);
      let m = k.match(svcRe);
      if (m) { const i = +m[1]!, f = m[2]!; setServices((s) => s.map((x, j) => (j === i ? { ...x, [f]: v } : x))); return; }
      m = k.match(itemRe);
      if (m) { const i = +m[1]!, n = +m[2]!; setServices((s) => s.map((x, j) => (j === i ? { ...x, items: x.items.map((it, q) => (q === n ? v : it)) } : x))); return; }
      m = k.match(faqRe);
      if (m) { const i = +m[1]!, f = m[2]!; setFaqs((s) => s.map((x, j) => (j === i ? { ...x, [f]: v } : x))); return; }
      m = k.match(coRe);
      if (m && m[1]! in defaults.company) { const f = m[1] as keyof CmsCompany; setCo((c) => (f === "phone" ? withPhone(c, v) : { ...c, [f]: v })); return; }
      setTexts((t) => ({ ...t, [k]: v }));
    };
    return {
      edit: true,
      get,
      set,
      pick: (k: string) => { pickKey.current = k; fileRef.current?.click(); },
      pickIcon: (k: string) => setIconKey(k),
      faq: {
        add: () => { setDirty(true); setFaqs((f) => [...f, { q: "New question?", a: "Write the answer here." }]); },
        remove: (i: number) => { if (!confirm("Remove this question?")) return; setDirty(true); setFaqs((f) => f.filter((_, j) => j !== i)); },
        move: (i: number, dir: -1 | 1) => {
          setFaqs((f) => {
            const j = i + dir;
            if (j < 0 || j >= f.length) return f;
            const n = [...f]; [n[i], n[j]] = [n[j]!, n[i]!]; return n;
          });
          setDirty(true);
        },
      },
    };
  }, [texts, services, faqs, co]);

  const onFile = async (file: File) => {
    const k = pickKey.current;
    if (!k) return;
    setUploading(true);
    const { url, error } = await uploadSiteImage(file, k);
    setUploading(false);
    if (error || !url) { toast.error("Upload failed: " + error); return; }
    ctx.set(k, url);
    toast.success("Image changed — click Save to publish.");
  };

  const save = async () => {
    setSaving(true);
    const now = new Date().toISOString();
    const clean = Object.fromEntries(Object.entries(texts).filter(([, v]) => v.trim() !== ""));
    const { error } = await supabase.from("site_content").upsert([
      { key: "texts", value: clean, updated_at: now },
      { key: "services", value: services.map((s) => ({ ...s, items: s.items.filter((x) => x.trim()) })), updated_at: now },
      { key: "faqs", value: faqs.filter((f) => f.q.trim()), updated_at: now },
      { key: "company", value: co, updated_at: now },
    ] as never);
    setSaving(false);
    if (error) { toast.error("Could not save: " + error.message); return; }
    setDirty(false);
    toast.success(`Saved! The ${def?.name ?? ""} page is updated.`);
    router.invalidate();
  };

  const reset = () => {
    if (!confirm("Discard all unsaved changes?")) return;
    window.location.reload();
  };

  // Keep the admin on this page: links inside the preview don't navigate while editing.
  const blockLinks = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest("a")) e.preventDefault();
  };

  if (ready === "loading") return <div className="p-5 text-center">Loading editor…</div>;
  if (!def) return <div className="p-5 text-center"><h3>Page not found</h3><Link to="/admin" className="btn btn-primary mt-3">Back</Link></div>;
  if (ready === "denied") return <div className="p-5 text-center"><h3>No admin access</h3><Link to="/admin" className="btn btn-primary mt-3">Back</Link></div>;

  return (
    <>
      <div className="cms-toolbar">
        <Link to="/admin" className="btn btn-outline-light btn-sm"><i className="fa fa-arrow-left me-1"></i>Dashboard</Link>
        <div className="cms-toolbar-title">Editing: <strong>{def.name}</strong>
          <small className="d-none d-md-inline">Click any text to type · click a photo or icon to replace it · use + to add and the toolbar to move or remove items</small>
        </div>
        {uploading && <span className="cms-toolbar-note">Uploading…</span>}
        <a href={def.path} target="_blank" rel="noreferrer" className="btn btn-outline-light btn-sm">View live</a>
        <button className="btn btn-outline-light btn-sm" onClick={reset} disabled={!dirty}>Discard</button>
        <button className="btn btn-primary btn-sm px-4" onClick={save} disabled={saving || !dirty}>
          {saving ? "Saving…" : dirty ? "Save changes •" : "Saved"}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) onFile(f); }} />
      {iconKey && (
        <IconPicker value={ctx.get(iconKey, "")} onClose={() => setIconKey(null)} onPick={(ic) => { ctx.set(iconKey, ic); setIconKey(null); }} />
      )}
      <div className="cms-editing" onClickCapture={blockLinks}>
        <EditContext.Provider value={ctx}>
          <SiteLayout>
            {def.render()}
          </SiteLayout>
        </EditContext.Provider>
      </div>
    </>
  );
}
