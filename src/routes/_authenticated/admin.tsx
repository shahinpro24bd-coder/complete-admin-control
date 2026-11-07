import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { defaults, makeSlug, mergeServices, type CmsCompany, type CmsFaq, type CmsService } from "@/lib/cms";
import { seoDefaults } from "@/lib/seo";
import { IconPicker } from "@/components/admin/IconPicker";
import type { Tables } from "@/integrations/supabase/types";
import { Customers, Contracts, Jobs, Invoices, Quotations, Payments, Expenses, Accounts, BillingSettings } from "@/components/admin/Business";
import { services as siteServices } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel | QMEP Electromechanical LLC" },
      { name: "description", content: "Manage QMEP website content and quote requests." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Panel | QMEP" },
      { property: "og:description", content: "QMEP website admin panel." },
    ],
  }),
  component: AdminPage,
});

type Tab = "dashboard" | "company" | "services" | "faqs" | "seo" | "quotes" | "account" | "customers" | "amc" | "jobs" | "invoices" | "reports" | "quotations" | "payments" | "expenses" | "billing";

const getSitePages = () => [
  { key: "home", name: "Home", path: "/", icon: "fa-home", desc: "Hero slides, about, services, process, FAQ", edit: true },
  { key: "about", name: "About", path: "/about", icon: "fa-info-circle", desc: "Company story and values", edit: true },
  { key: "services", name: "Services", path: "/services", icon: "fa-tools", desc: "All services overview", edit: true },
  { key: "amc", name: "AMC", path: "/amc", icon: "fa-file-contract", desc: "Annual maintenance contracts", edit: true },
  { key: "projects", name: "Projects", path: "/projects", icon: "fa-project-diagram", desc: "Project showcase", edit: true },
  { key: "industries", name: "Industries", path: "/industries", icon: "fa-industry", desc: "Industries we serve", edit: true },
  { key: "contact", name: "Contact", path: "/contact", icon: "fa-envelope", desc: "Contact details and form", edit: true },
  ...siteServices.map((s) => ({ key: `service-${s.slug}`, name: s.title, path: `/services/${s.slug}`, icon: s.icon, desc: "Service detail page", edit: true })),
];
const companyFields: { key: keyof CmsCompany; label: string }[] = [
  { key: "name", label: "Company name" },
  { key: "short", label: "Short name" },
  { key: "phone", label: "Phone (shown)" },
  { key: "phoneHref", label: "Phone link (tel:+971...)" },
  { key: "whatsappHref", label: "WhatsApp link (https://wa.me/...)" },
  { key: "email", label: "Email" },
  { key: "address", label: "Address" },
  { key: "hours", label: "Working hours" },
  { key: "mapQuery", label: "Map location (address shown on the Contact page map)" },
  { key: "facebook", label: "Facebook page link (leave empty to hide)" },
  { key: "instagram", label: "Instagram link (leave empty to hide)" },
  { key: "linkedin", label: "LinkedIn link (leave empty to hide)" },
];

function AdminPage() {
  const nav = useNavigate();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [company, setCompany] = useState<CmsCompany>({ ...defaults.company });
  const [services, setServices] = useState<CmsService[]>(defaults.services.map((s) => ({ ...s })));
  const [faqs, setFaqs] = useState<CmsFaq[]>(defaults.faqs.map((f) => ({ ...f })));
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [iconFor, setIconFor] = useState<number | null>(null);
  const [quotes, setQuotes] = useState<Tables<"quote_requests">[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data: ok } = await supabase.rpc("has_role", { _user_id: u.user!.id, _role: "admin" });
      setIsAdmin(!!ok);
      if (!ok) return;
      const { data } = await supabase.from("site_content").select("key, value");
      for (const r of data ?? []) {
        if (r.key === "company") setCompany({ ...defaults.company, ...(r.value as object) });
        if (r.key === "services") setServices(mergeServices(r.value as CmsService[]).map((s) => ({ ...s, items: [...s.items] })));
        if (r.key === "texts" && r.value && typeof r.value === "object") setTexts(r.value as Record<string, string>);
        if (r.key === "faqs" && Array.isArray(r.value) && r.value.length) setFaqs(r.value as CmsFaq[]);
      }
      const q = await supabase.from("quote_requests").select("*").order("created_at", { ascending: false });
      setQuotes(q.data ?? []);
    })();
  }, []);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const touch = () => setDirty(true);

  const save = async () => {
    setSaving(true);
    const now = new Date().toISOString();
    // Re-read page texts first so edits made in the page editor meanwhile are kept; only SEO keys come from here.
    const { data: cur } = await supabase.from("site_content").select("value").eq("key", "texts").maybeSingle();
    const latest = { ...((cur?.value as Record<string, string> | null) ?? {}) };
    for (const k of Object.keys(latest)) if (k.startsWith("seo.")) delete latest[k];
    for (const [k, v] of Object.entries(texts)) if (k.startsWith("seo.") && v.trim()) latest[k] = v;
    const { error } = await supabase.from("site_content").upsert([
      { key: "company", value: company, updated_at: now },
      { key: "services", value: services.filter((x) => x.title.trim()).map((x) => ({ ...x, items: x.items.filter((i) => i.trim()) })), updated_at: now },
      { key: "faqs", value: faqs.filter((f) => f.q.trim()), updated_at: now },
      { key: "texts", value: latest, updated_at: now },
    ] as never);
    setSaving(false);
    if (error) { toast.error("Could not save: " + error.message); return; }
    setDirty(false);
    toast.success("Saved! Changes are live on the website.");
    router.invalidate();
  };

  const upload = async (idx: number, file: File) => {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const name = `${services[idx]!.slug}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("site-images").upload(name, file, { contentType: file.type, cacheControl: "31536000" });
    if (error) { toast.error("Upload failed: " + error.message); return; }
    setServices((s) => s.map((x, i) => (i === idx ? { ...x, image: `/api/public/img/${name}` } : x)));
    touch();
    toast.success("Image uploaded — click Save to publish.");
  };

  const signOut = async () => {
    if (dirty && !confirm("You have unsaved changes. Sign out anyway?")) return;
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  };

  const updateQuote = async (id: string, patch: { notes?: string; follow_up_date?: string | null }) => {
    const { error } = await supabase.from("quote_requests").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setQuotes((q) => q.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    toast.success("Updated");
  };
  const saveCustomer = async (q: Tables<"quote_requests">) => {
    const { error } = await supabase.from("customers").insert({ name: q.name, company: q.company, phone: q.phone, email: q.email, address: q.location, notes: `From quote: ${q.service}` });
    if (error) toast.error(error.message); else toast.success("Added to customers");
  };
  const setQuoteStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("quote_requests").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setQuotes((q) => q.map((x) => (x.id === id ? { ...x, status } : x)));
  };
  const deleteQuote = async (id: string) => {
    if (!confirm("Delete this request?")) return;
    const { error } = await supabase.from("quote_requests").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setQuotes((q) => q.filter((x) => x.id !== id));
  };

  if (isAdmin === null) return <div className="p-5 text-center">Loading…</div>;
  if (!isAdmin) return (
    <div className="p-5 text-center"><h3>No admin access</h3><button className="btn btn-primary mt-3" onClick={signOut}>Sign out</button></div>
  );

  const newCount = quotes.filter((q) => q.status === "new").length;
  const tabs: [Tab, string, string][] = [
    ["dashboard", "Dashboard", "fa-th-large"],
    ["quotes", `Quote Requests${newCount ? ` (${newCount})` : ""}`, "fa-inbox"],
    ["customers", "Customers", "fa-users"],
    ["amc", "AMC Contracts", "fa-file-contract"],
    ["jobs", "Jobs", "fa-wrench"],
    ["quotations", "Quotations", "fa-file-signature"],
    ["invoices", "Invoices", "fa-file-invoice-dollar"],
    ["payments", "Payments In", "fa-hand-holding-usd"],
    ["expenses", "Expenses", "fa-receipt"],
    ["reports", "Accounts", "fa-chart-bar"],
    ["billing", "Billing Setup", "fa-cog"],
    ["company", "Contact Info", "fa-building"],
    ["services", "Services", "fa-tools"],
    ["faqs", "FAQs", "fa-question-circle"],
    ["seo", "Google / SEO", "fa-search"],
    ["account", "Account", "fa-user-cog"],
  ];

  return (
    <div className="bg-light" style={{ minHeight: "100vh" }}>
      <header className="bg-dark text-white sticky-top" style={{ zIndex: 50 }}>
        <div className="container d-flex flex-wrap align-items-center gap-3 py-3">
          <h4 className="text-white m-0 me-auto">QMEP <span className="text-primary">Admin</span></h4>
          <a href="/" target="_blank" rel="noreferrer" className="btn btn-outline-light btn-sm"><i className="fa fa-external-link-alt me-1"></i>View site</a>
          <button className="btn btn-primary btn-sm px-3" onClick={save} disabled={saving || !dirty}>
            {saving ? "Saving…" : dirty ? "Save changes •" : "Saved"}
          </button>
          <button className="btn btn-outline-light btn-sm" onClick={signOut}>Sign out</button>
        </div>
      </header>
      <div className="container py-4">
        <div className="d-flex flex-wrap gap-2 mb-4">
          {tabs.map(([k, label, icon]) => (
            <button key={k} className={`btn ${tab === k ? "btn-primary" : "btn-light border"}`} onClick={() => setTab(k)}>
              <i className={`fa ${icon} me-2`}></i>{label}
            </button>
          ))}
        </div>

        {tab === "dashboard" && <Dashboard quotes={quotes} newCount={newCount} servicesCount={services.length} faqCount={faqs.length} go={setTab} />}

        {tab === "account" && <Account />}
        {tab === "customers" && <Customers />}
        {tab === "amc" && <Contracts go={setTab as never} />}
        {tab === "jobs" && <Jobs go={setTab as never} />}
        {tab === "quotations" && <Quotations go={setTab as never} />}
        {tab === "invoices" && <Invoices />}
        {tab === "payments" && <Payments />}
        {tab === "expenses" && <Expenses />}
        {tab === "reports" && <Accounts />}
        {tab === "billing" && <BillingSettings />}

        {tab === "company" && (
          <div className="bg-white p-4 shadow-sm">
            <h4 className="mb-4">Contact information (shown across the website)</h4>
            <div className="row g-3">
              {companyFields.map((f) => (
                <div className="col-md-6" key={f.key}>
                  <label className="form-label">{f.label}</label>
                  <input className="form-control" value={company[f.key]} onChange={(e) => { setCompany({ ...company, [f.key]: e.target.value }); touch(); }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "services" && (
          <>
            <p className="text-muted">Add, remove, reorder and rewrite your services. Each service gets its own page; open it from the dashboard to edit the rest of its text.</p>
            {services.map((s, i) => {
              const upd = (patch: Partial<CmsService>) => { setServices(services.map((x, j) => (j === i ? { ...x, ...patch } : x))); touch(); };
              const move = (dir: -1 | 1) => { const j = i + dir; if (j < 0 || j >= services.length) return; const n = [...services]; [n[i], n[j]] = [n[j]!, n[i]!]; setServices(n); touch(); };
              return (
                <div className="bg-white p-4 shadow-sm mb-4" key={s.slug}>
                  <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
                    <strong>{String(i + 1).padStart(2, "0")} · {s.title || "New service"}</strong>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-light border" onClick={() => move(-1)} disabled={i === 0} aria-label="Move up"><i className="fa fa-arrow-up"></i></button>
                      <button className="btn btn-sm btn-light border" onClick={() => move(1)} disabled={i === services.length - 1} aria-label="Move down"><i className="fa fa-arrow-down"></i></button>
                      <button className="btn btn-sm btn-outline-danger" disabled={services.length <= 1}
                        onClick={() => { if (confirm(`Remove "${s.title}" from the website?`)) { setServices(services.filter((_, j) => j !== i)); touch(); } }}><i className="fa fa-trash me-1"></i>Remove</button>
                    </div>
                  </div>
                  <div className="row g-4">
                    <div className="col-md-3">
                      <img src={s.image} alt={s.title} className="w-100 mb-2" style={{ aspectRatio: "4/3", objectFit: "cover" }} />
                      <label className="btn btn-outline-primary btn-sm w-100 mb-2">
                        <i className="fa fa-upload me-1"></i>Change image
                        <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(i, e.target.files[0])} />
                      </label>
                      <button className="btn btn-outline-secondary btn-sm w-100" onClick={() => setIconFor(i)}><i className={`fa ${s.icon} me-2`}></i>Change icon</button>
                    </div>
                    <div className="col-md-9">
                      <label className="form-label">Title</label>
                      <input className="form-control mb-3" value={s.title} onChange={(e) => upd({ title: e.target.value })} />
                      <label className="form-label">Summary</label>
                      <textarea className="form-control mb-3" rows={2} value={s.summary} onChange={(e) => upd({ summary: e.target.value })} />
                      <label className="form-label">What's included (one per line)</label>
                      <textarea className="form-control mb-3" rows={5} value={s.items.join("\n")} onChange={(e) => upd({ items: e.target.value.split("\n") })} />
                      <label className="form-label">Button text</label>
                      <input className="form-control" value={s.cta} onChange={(e) => upd({ cta: e.target.value })} />
                    </div>
                  </div>
                </div>
              );
            })}
            <button className="btn btn-outline-primary mb-4" onClick={() => {
              const title = prompt("Name of the new service?");
              if (!title?.trim()) return;
              const base = services[services.length - 1] ?? defaults.services[0]!;
              setServices([...services, { slug: makeSlug(title, services.map((x) => x.slug)), title: title.trim(), summary: "Describe this service in one or two sentences.", items: ["First thing included", "Second thing included", "Third thing included"], cta: "Request a Quote", image: base.image, icon: "fa-tools" }]);
              touch();
              toast.success("Service added — click Save to publish it.");
            }}><i className="fa fa-plus me-1"></i>Add service</button>
            {iconFor !== null && services[iconFor] && (
              <IconPicker value={services[iconFor]!.icon} onClose={() => setIconFor(null)}
                onPick={(ic) => { setServices(services.map((x, j) => (j === iconFor ? { ...x, icon: ic } : x))); touch(); setIconFor(null); }} />
            )}
          </>
        )}

        {tab === "seo" && (
          <div className="bg-white p-4 shadow-sm">
            <h4 className="mb-1">How your pages appear on Google</h4>
            <p className="text-muted mb-4">Leave a box empty to use the standard text (shown in grey).</p>
            {[...Object.entries(seoDefaults), ...siteServices.map((sv) => [`service-${sv.slug}`, { name: sv.title, title: `${sv.title} in Dubai | QMEP Electromechanical`, description: sv.summary }] as const)].map(([key, d]) => (
              <div className="border-bottom pb-3 mb-3" key={key}>
                <h6 className="mb-2">{d.name}</h6>
                <label className="form-label small">Page title</label>
                <input className="form-control mb-2" placeholder={d.title} value={texts[`seo.${key}.title`] ?? ""}
                  onChange={(e) => { setTexts({ ...texts, [`seo.${key}.title`]: e.target.value }); touch(); }} />
                <label className="form-label small">Description</label>
                <textarea className="form-control" rows={2} placeholder={d.description} value={texts[`seo.${key}.description`] ?? ""}
                  onChange={(e) => { setTexts({ ...texts, [`seo.${key}.description`]: e.target.value }); touch(); }} />
              </div>
            ))}
          </div>
        )}

        {tab === "faqs" && (
          <div className="bg-white p-4 shadow-sm">
            {faqs.map((f, i) => (
              <div className="border-bottom pb-3 mb-3" key={i}>
                <div className="d-flex gap-2 mb-2">
                  <input className="form-control fw-bold" placeholder="Question" value={f.q} onChange={(e) => { setFaqs(faqs.map((x, j) => j === i ? { ...x, q: e.target.value } : x)); touch(); }} />
                  <button className="btn btn-outline-danger" onClick={() => { setFaqs(faqs.filter((_, j) => j !== i)); touch(); }} aria-label="Delete question"><i className="fa fa-trash"></i></button>
                </div>
                <textarea className="form-control" rows={2} placeholder="Answer" value={f.a} onChange={(e) => { setFaqs(faqs.map((x, j) => j === i ? { ...x, a: e.target.value } : x)); touch(); }} />
              </div>
            ))}
            <button className="btn btn-outline-primary" onClick={() => { setFaqs([...faqs, { q: "", a: "" }]); touch(); }}><i className="fa fa-plus me-1"></i>Add question</button>
          </div>
        )}

        {tab === "quotes" && (
          <div className="bg-white p-4 shadow-sm">
            {quotes.length === 0 && <p className="text-muted m-0">No quote requests yet.</p>}
            {quotes.map((q) => (
              <div key={q.id} className="border p-3 mb-3" style={{ borderLeft: q.status === "new" ? "4px solid var(--primary)" : undefined }}>
                <div className="d-flex flex-wrap justify-content-between gap-2">
                  <h5 className="m-0">{q.name}{q.company ? ` · ${q.company}` : ""}</h5>
                  <small className="text-muted">{new Date(q.created_at).toLocaleString()}</small>
                </div>
                <p className="mb-1 mt-2"><strong>{q.service}</strong>{q.property_type ? ` · ${q.property_type}` : ""} · {q.location}</p>
                <p className="mb-2"><a href={`tel:${q.phone}`}>{q.phone}</a>{q.email ? <> · <a href={`mailto:${q.email}`}>{q.email}</a></> : null}</p>
                <p className="mb-3" style={{ whiteSpace: "pre-wrap" }}>{q.details}</p>
                <div className="d-flex flex-wrap gap-2 mb-2">
                  <textarea className="form-control form-control-sm" rows={1} style={{ flex: "1 1 260px" }} placeholder="Internal notes…" defaultValue={q.notes ?? ""}
                    onBlur={(e) => e.target.value !== (q.notes ?? "") && updateQuote(q.id, { notes: e.target.value })} />
                  <label className="small d-flex align-items-center gap-1">Follow-up
                    <input type="date" className="form-control form-control-sm" defaultValue={q.follow_up_date ?? ""} onChange={(e) => updateQuote(q.id, { follow_up_date: e.target.value || null })} />
                  </label>
                  {q.follow_up_date && q.status !== "done" && q.follow_up_date <= new Date().toISOString().slice(0, 10) && <span className="badge bg-danger align-self-center">Follow-up due</span>}
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <select className="form-select form-select-sm" style={{ width: 160 }} value={q.status} onChange={(e) => setQuoteStatus(q.id, e.target.value)}>
                    <option value="new">New</option><option value="contacted">Contacted</option><option value="quoted">Quoted</option><option value="won">Won</option><option value="lost">Lost</option><option value="done">Done</option>
                  </select>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => saveCustomer(q)}><i className="fa fa-user-plus me-1"></i>Save as customer</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => deleteQuote(q.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Dashboard({ quotes, newCount, servicesCount, faqCount, go }: {
  quotes: Tables<"quote_requests">[]; newCount: number; servicesCount: number; faqCount: number; go: (t: Tab) => void;
}) {
  const week = quotes.filter((q) => Date.now() - new Date(q.created_at).getTime() < 7 * 864e5).length;
  return (
    <>
      <div className="row g-3 mb-4">
        {[
          [newCount, "New quote requests", "quotes"],
          [week, "Requests this week", "quotes"],
          [servicesCount, "Services listed", "services"],
          [faqCount, "FAQ questions", "faqs"],
        ].map(([n, label, t]) => (
          <div className="col-6 col-lg-3" key={label as string}>
            <button className="adm-stat w-100 text-start border-0" onClick={() => go(t as Tab)}>
              <strong>{n}</strong><span>{label}</span>
            </button>
          </div>
        ))}
      </div>

      <h4 className="mb-1">Which page do you want to edit?</h4>
      <p className="text-muted mb-3">Open a page to change its texts, photos and icons directly on the page, and to add, move or remove cards and list items. The top menu and footer can be edited from any page.</p>
      <div className="row g-3 mb-5">
        {getSitePages().map((p) => (
          <div className="col-sm-6 col-lg-4 col-xl-3" key={p.name}>
            {p.edit ? (
              <Link to="/admin/pages/$page" params={{ page: p.key }} className="adm-page is-ready text-reset text-decoration-none">
                <span className="adm-page-icon"><i className={`fa ${p.icon}`}></i></span>
                <h5 className="m-0">{p.name}</h5>
                <small className="text-muted">{p.desc}</small>
                <span className="text-primary mt-auto fw-bold"><i className="fa fa-pen me-1"></i>Edit page</span>
              </Link>
            ) : (
              <div className="adm-page is-soon">
                <span className="adm-page-icon"><i className={`fa ${p.icon}`}></i></span>
                <h5 className="m-0">{p.name}</h5>
                <small className="text-muted">{p.desc}</small>
                <span className="mt-auto d-flex justify-content-between align-items-center">
                  <span className="badge bg-secondary">Coming soon</span>
                  <a href={p.path} target="_blank" rel="noreferrer" className="small">View</a>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="bg-white p-4 shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="m-0">Latest quote requests</h5>
              <button className="btn btn-link btn-sm" onClick={() => go("quotes")}>See all</button>
            </div>
            {quotes.length === 0 && <p className="text-muted m-0">No quote requests yet.</p>}
            {quotes.slice(0, 5).map((q) => (
              <div key={q.id} className="d-flex justify-content-between border-bottom py-2 gap-2">
                <span><strong>{q.name}</strong> · {q.service}</span>
                <span className="text-nowrap">
                  {q.status === "new" && <span className="badge bg-primary me-2">New</span>}
                  <small className="text-muted">{new Date(q.created_at).toLocaleDateString()}</small>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-lg-4">
          <div className="bg-white p-4 shadow-sm h-100">
            <h5 className="mb-3">Quick actions</h5>
            <div className="d-grid gap-2">
              <Link to="/admin/pages/$page" params={{ page: "home" }} className="btn btn-primary"><i className="fa fa-pen me-2"></i>Edit home page</Link>
              <button className="btn btn-light border" onClick={() => go("company")}><i className="fa fa-phone me-2"></i>Update contact info</button>
              <button className="btn btn-light border" onClick={() => go("services")}><i className="fa fa-tools me-2"></i>Manage services</button>
              <button className="btn btn-light border" onClick={() => go("account")}><i className="fa fa-key me-2"></i>Change password</button>
              <a href="/" target="_blank" rel="noreferrer" className="btn btn-light border"><i className="fa fa-external-link-alt me-2"></i>Open website</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Account() {
  const [cur, setCur] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (pw.length < 6) { toast.error("New password must be at least 6 characters."); return; }
    if (pw !== pw2) { toast.error("Passwords do not match."); return; }
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const check = await supabase.auth.signInWithPassword({ email: u.user!.email!, password: cur });
    if (check.error) { setBusy(false); toast.error("Current password is wrong."); return; }
    const { error } = await supabase.auth.updateUser({ password: pw, current_password: cur } as never);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setCur(""); setPw(""); setPw2("");
    toast.success("Password changed.");
  };
  return (
    <form onSubmit={submit} className="bg-white p-4 shadow-sm" style={{ maxWidth: 480 }}>
      <h4 className="mb-4">Change admin password</h4>
      <label className="form-label">Current password</label>
      <input type="password" className="form-control mb-3" value={cur} onChange={(e) => setCur(e.target.value)} required autoComplete="current-password" />
      <label className="form-label">New password</label>
      <input type="password" className="form-control mb-3" value={pw} onChange={(e) => setPw(e.target.value)} required autoComplete="new-password" />
      <label className="form-label">Repeat new password</label>
      <input type="password" className="form-control mb-4" value={pw2} onChange={(e) => setPw2(e.target.value)} required autoComplete="new-password" />
      <button className="btn btn-primary px-4" disabled={busy}>{busy ? "Saving…" : "Change password"}</button>
    </form>
  );
}
