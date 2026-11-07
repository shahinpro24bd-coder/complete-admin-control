import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { aed, invoiceTotal, isOverdue, monthlyIncome } from "@/lib/business";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;
type Field = { key: string; label: string; type?: "text" | "date" | "number" | "textarea" | "select"; options?: string[]; required?: boolean; wide?: boolean };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export function useTable(table: string, order = "created_at") {
  const [rows, setRows] = useState<Row[]>([]);
  const load = async () => {
    const { data, error } = await db.from(table).select("*").order(order, { ascending: false });
    if (error) toast.error(error.message); else setRows(data ?? []);
  };
  useEffect(() => { load(); }, [table]);
  return { rows, load };
}

function CrudTable({ title, table, fields, columns, badge, extra, defaults = {}, rows, load }: {
  title: string; table: string; fields: Field[]; columns: { label: string; render: (r: Row) => React.ReactNode }[];
  badge?: (r: Row) => string | undefined; extra?: (r: Row) => React.ReactNode; defaults?: Row; rows: Row[]; load: () => void;
}) {
  const [edit, setEdit] = useState<Row | null>(null);
  const [q, setQ] = useState("");
  const shown = rows.filter((r) => !q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));

  const save = async () => {
    for (const f of fields) if (f.required && !edit?.[f.key]) { toast.error(`${f.label} is required`); return; }
    const payload: Row = {};
    for (const f of fields) payload[f.key] = edit![f.key] === "" ? null : edit![f.key] ?? null;
    const res = edit!.id ? await db.from(table).update(payload).eq("id", edit!.id) : await db.from(table).insert(payload);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success("Saved"); setEdit(null); load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    const { error } = await db.from(table).delete().eq("id", id);
    if (error) toast.error(error.message); else load();
  };

  return (
    <div className="bg-white p-4 shadow-sm">
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <h4 className="m-0 me-auto">{title} <small className="text-muted">({rows.length})</small></h4>
        <input className="form-control form-control-sm" style={{ width: 220 }} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn btn-primary btn-sm" onClick={() => setEdit({ ...defaults })}><i className="fa fa-plus me-1"></i>Add new</button>
      </div>

      {edit && (
        <div className="border p-3 mb-4 bg-light">
          <div className="row g-3">
            {fields.map((f) => (
              <div className={f.wide || f.type === "textarea" ? "col-12" : "col-md-4"} key={f.key}>
                <label className="form-label small mb-1">{f.label}{f.required ? " *" : ""}</label>
                {f.type === "textarea" ? (
                  <textarea className="form-control" rows={2} value={edit[f.key] ?? ""} onChange={(e) => setEdit({ ...edit, [f.key]: e.target.value })} />
                ) : f.type === "select" ? (
                  <select className="form-select" value={edit[f.key] ?? ""} onChange={(e) => setEdit({ ...edit, [f.key]: e.target.value })}>
                    {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input className="form-control" type={f.type ?? "text"} value={edit[f.key] ?? ""} onChange={(e) => setEdit({ ...edit, [f.key]: e.target.value })} />
                )}
              </div>
            ))}
          </div>
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-primary btn-sm" onClick={save}>Save</button>
            <button className="btn btn-light border btn-sm" onClick={() => setEdit(null)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover align-middle small">
          <thead><tr>{columns.map((c) => <th key={c.label}>{c.label}</th>)}<th></th></tr></thead>
          <tbody>
            {shown.length === 0 && <tr><td colSpan={columns.length + 1} className="text-muted">No records yet.</td></tr>}
            {shown.map((r) => (
              <tr key={r.id} className={badge?.(r)}>
                {columns.map((c) => <td key={c.label}>{c.render(r)}</td>)}
                <td className="text-end text-nowrap">
                  {extra?.(r)}
                  <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEdit({ ...r })} aria-label="Edit"><i className="fa fa-edit"></i></button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => del(r.id)} aria-label="Delete"><i className="fa fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const pill = (s: string, map: Record<string, string>) => <span className={`badge bg-${map[s] ?? "secondary"}`}>{s}</span>;
const today = () => new Date().toISOString().slice(0, 10);

export function Customers() {
  const t = useTable("customers");
  return <CrudTable title="Customers" table="customers" {...t}
    fields={[{ key: "name", label: "Name", required: true }, { key: "company", label: "Company" }, { key: "phone", label: "Phone" }, { key: "email", label: "Email" }, { key: "address", label: "Address", wide: true }, { key: "notes", label: "Notes", type: "textarea" }]}
    columns={[{ label: "Name", render: (r) => <strong>{r.name}</strong> }, { label: "Company", render: (r) => r.company }, { label: "Phone", render: (r) => r.phone && <a href={`tel:${r.phone}`}>{r.phone}</a> }, { label: "Email", render: (r) => r.email }, { label: "Address", render: (r) => r.address }]} />;
}

export function Contracts() {
  const t = useTable("amc_contracts", "end_date");
  const soon = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
  return <CrudTable title="AMC Contracts" table="amc_contracts" {...t} defaults={{ status: "active", visits_per_year: 4, plan: "Standard" }}
    fields={[{ key: "customer_name", label: "Customer", required: true }, { key: "property", label: "Property / building" }, { key: "plan", label: "Plan", type: "select", options: ["Basic", "Standard", "Premium", "Custom"] },
      { key: "start_date", label: "Start date", type: "date" }, { key: "end_date", label: "End (renewal) date", type: "date" }, { key: "next_visit", label: "Next visit", type: "date" },
      { key: "visits_per_year", label: "Visits per year", type: "number" }, { key: "amount", label: "Contract value (AED)", type: "number" }, { key: "status", label: "Status", type: "select", options: ["active", "expired", "cancelled"] }, { key: "notes", label: "Notes", type: "textarea" }]}
    badge={(r) => (r.status === "active" && r.end_date && r.end_date <= soon ? "table-warning" : undefined)}
    columns={[{ label: "Customer", render: (r) => <strong>{r.customer_name}</strong> }, { label: "Property", render: (r) => r.property }, { label: "Plan", render: (r) => r.plan },
      { label: "Period", render: (r) => `${r.start_date ?? "?"} → ${r.end_date ?? "?"}` }, { label: "Next visit", render: (r) => r.next_visit }, { label: "Value", render: (r) => aed(Number(r.amount) || 0) },
      { label: "Status", render: (r) => <>{pill(r.status, { active: "success", expired: "danger", cancelled: "secondary" })}{r.status === "active" && r.end_date && r.end_date <= soon && <small className="d-block text-danger">Renewal due</small>}</> }]} />;
}

export function Jobs() {
  const t = useTable("jobs", "scheduled_date");
  return <CrudTable title="Jobs & Technicians" table="jobs" {...t} defaults={{ status: "scheduled", priority: "normal", scheduled_date: today() }}
    fields={[{ key: "title", label: "Job title", required: true }, { key: "customer_name", label: "Customer" }, { key: "location", label: "Location" },
      { key: "service", label: "Service", type: "select", options: ["HVAC", "Electrical", "Plumbing", "MEP Maintenance", "AMC visit", "VRF", "Other"] }, { key: "technician", label: "Technician" },
      { key: "scheduled_date", label: "Date", type: "date" }, { key: "scheduled_time", label: "Time", type: "text" }, { key: "priority", label: "Priority", type: "select", options: ["low", "normal", "urgent"] },
      { key: "status", label: "Status", type: "select", options: ["scheduled", "in progress", "completed", "cancelled"] }, { key: "notes", label: "Notes", type: "textarea" }]}
    badge={(r) => (r.priority === "urgent" && r.status !== "completed" ? "table-danger" : undefined)}
    columns={[{ label: "Date", render: (r) => <>{r.scheduled_date}<small className="d-block text-muted">{r.scheduled_time}</small></> }, { label: "Job", render: (r) => <><strong>{r.title}</strong><small className="d-block text-muted">{r.service}</small></> },
      { label: "Customer", render: (r) => <>{r.customer_name}<small className="d-block text-muted">{r.location}</small></> }, { label: "Technician", render: (r) => r.technician || <span className="text-danger">Unassigned</span> },
      { label: "Priority", render: (r) => pill(r.priority, { urgent: "danger", normal: "info", low: "secondary" }) }, { label: "Status", render: (r) => pill(r.status, { scheduled: "primary", "in progress": "warning", completed: "success", cancelled: "secondary" }) }]} />;
}

export function Invoices() {
  const t = useTable("invoices", "issue_date");
  const next = `INV-${new Date().getFullYear()}-${String(t.rows.length + 1).padStart(4, "0")}`;
  const markPaid = async (r: Row) => {
    const { error } = await db.from("invoices").update({ status: "paid", paid_date: today() }).eq("id", r.id);
    if (error) toast.error(error.message); else t.load();
  };
  return <CrudTable title="Invoices" table="invoices" {...t} defaults={{ invoice_no: next, status: "unpaid", vat_percent: 5, issue_date: today() }}
    fields={[{ key: "invoice_no", label: "Invoice no.", required: true }, { key: "customer_name", label: "Customer", required: true }, { key: "amount", label: "Amount before VAT (AED)", type: "number" },
      { key: "vat_percent", label: "VAT %", type: "number" }, { key: "issue_date", label: "Issue date", type: "date" }, { key: "due_date", label: "Due date", type: "date" },
      { key: "status", label: "Status", type: "select", options: ["unpaid", "paid", "cancelled"] }, { key: "paid_date", label: "Paid date", type: "date" }, { key: "description", label: "Description", type: "textarea" }]}
    badge={(r) => (isOverdue(r as never) ? "table-danger" : undefined)}
    extra={(r) => <>
      <button className="btn btn-sm btn-outline-dark me-1" onClick={() => printInvoice(r)} aria-label="Print"><i className="fa fa-print"></i></button>
      {r.status === "unpaid" && <button className="btn btn-sm btn-outline-success me-1" onClick={() => markPaid(r)}>Mark paid</button>}
    </>}
    columns={[{ label: "No.", render: (r) => <strong>{r.invoice_no}</strong> }, { label: "Customer", render: (r) => r.customer_name }, { label: "Issued", render: (r) => r.issue_date },
      { label: "Due", render: (r) => <>{r.due_date}{isOverdue(r as never) && <small className="d-block text-danger">Overdue</small>}</> }, { label: "Total (incl. VAT)", render: (r) => aed(invoiceTotal(r as never)) },
      { label: "Status", render: (r) => pill(r.status, { paid: "success", unpaid: "warning", cancelled: "secondary" }) }]} />;
}

function printInvoice(r: Row) {
  const w = window.open("", "_blank");
  if (!w) return;
  const amt = Number(r.amount) || 0, vat = invoiceTotal(r as never) - amt;
  const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  w.document.write(`<html><head><title>${esc(r.invoice_no)}</title><style>body{font-family:sans-serif;padding:40px;color:#222}table{width:100%;border-collapse:collapse;margin-top:24px}td,th{border:1px solid #ccc;padding:8px;text-align:left}.r{text-align:right}</style></head><body>
  <h2>QMEP Electromechanical LLC</h2><p>Tel: +971 56 547 7186</p><h3>TAX INVOICE ${esc(r.invoice_no)}</h3>
  <p><b>Bill to:</b> ${esc(r.customer_name)}<br><b>Date:</b> ${esc(r.issue_date)} &nbsp; <b>Due:</b> ${esc(r.due_date)}</p>
  <table><tr><th>Description</th><th class="r">Amount (AED)</th></tr><tr><td>${esc(r.description)}</td><td class="r">${amt.toFixed(2)}</td></tr>
  <tr><td class="r">VAT ${esc(r.vat_percent)}%</td><td class="r">${vat.toFixed(2)}</td></tr><tr><th class="r">Total</th><th class="r">${invoiceTotal(r as never).toFixed(2)}</th></tr></table>
  <p>Status: ${esc(r.status).toUpperCase()}</p><script>window.print()</script></body></html>`);
  w.document.close();
}

export function Reports() {
  const inv = useTable("invoices", "issue_date").rows;
  const jobs = useTable("jobs").rows;
  const amc = useTable("amc_contracts").rows;
  const months = useMemo(() => Object.entries(monthlyIncome(inv as never)).sort().reverse().slice(0, 12), [inv]);
  const paid = inv.filter((i) => i.status === "paid").reduce((s, i) => s + invoiceTotal(i as never), 0);
  const due = inv.filter((i) => i.status === "unpaid").reduce((s, i) => s + invoiceTotal(i as never), 0);
  const overdue = inv.filter((i) => isOverdue(i as never)).length;
  const max = Math.max(1, ...months.map(([, v]) => v));
  const cards: [string, string, string][] = [
    ["Income received", aed(paid), "fa-coins"], ["Outstanding", aed(due), "fa-hourglass-half"], ["Overdue invoices", String(overdue), "fa-exclamation-triangle"],
    ["Active AMC contracts", String(amc.filter((a) => a.status === "active").length), "fa-file-contract"],
    ["Open jobs", String(jobs.filter((j) => j.status === "scheduled" || j.status === "in progress").length), "fa-wrench"],
    ["Jobs completed", String(jobs.filter((j) => j.status === "completed").length), "fa-check-circle"],
  ];
  return (
    <div>
      <div className="row g-3 mb-4">
        {cards.map(([l, v, i]) => (
          <div className="col-md-4" key={l}><div className="bg-white p-4 shadow-sm h-100"><i className={`fa ${i} text-primary fa-2x mb-2`}></i><h3 className="m-0">{v}</h3><small className="text-muted">{l}</small></div></div>
        ))}
      </div>
      <div className="bg-white p-4 shadow-sm">
        <h4 className="mb-3">Monthly income (paid invoices)</h4>
        {months.length === 0 && <p className="text-muted m-0">No paid invoices yet.</p>}
        {months.map(([m, v]) => (
          <div key={m} className="d-flex align-items-center gap-3 mb-2">
            <span style={{ width: 70 }}>{m}</span>
            <div className="flex-grow-1 bg-light" style={{ height: 22 }}><div className="bg-primary h-100" style={{ width: `${(v / max) * 100}%` }}></div></div>
            <strong style={{ width: 140 }} className="text-end">{aed(v)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
