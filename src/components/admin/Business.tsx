import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { aed, customerStatement, expenseTotal, periodRange } from "@/lib/business";
import { printStatement, queueInvoice, useSettings } from "@/components/admin/Billing";
import { belongsTo, CustomerList, db, matchCustomer, PeriodSelect, pill, today, useTable, type Row } from "@/components/admin/shared";

type Opt = string | { value: string; label: string };
export type Field = {
  key: string; label: string; type?: "text" | "date" | "number" | "textarea" | "select" | "customer" | "vat";
  options?: Opt[]; required?: boolean; wide?: boolean; help?: string;
};

export function CrudTable({ title, table, fields, columns, badge, extra, defaults = {}, rows, load, customers = [], top, filter }: {
  title: string; table: string; fields: Field[]; columns: { label: string; render: (r: Row) => ReactNode; right?: boolean }[];
  badge?: (r: Row) => string | undefined; extra?: (r: Row) => ReactNode; defaults?: Row; rows: Row[]; load: () => void;
  customers?: Row[]; top?: ReactNode; filter?: (r: Row) => boolean;
}) {
  const [edit, setEdit] = useState<Row | null>(null);
  const [q, setQ] = useState("");
  const shown = rows.filter((r) => (!filter || filter(r)) && (!q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase())));

  const save = async () => {
    for (const f of fields) if (f.required && (edit?.[f.key] === undefined || edit?.[f.key] === "" || edit?.[f.key] === null)) { toast.error(`${f.label} is required`); return; }
    const payload: Row = {};
    for (const f of fields) payload[f.key] = edit![f.key] === "" ? null : edit![f.key] ?? null;
    if (fields.some((f) => f.type === "customer")) payload.customer_id = matchCustomer(payload.customer_name, customers)?.id ?? null;
    const res = edit!.id ? await db.from(table).update(payload).eq("id", edit!.id) : await db.from(table).insert(payload);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success("Saved"); setEdit(null); load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    const { error } = await db.from(table).delete().eq("id", id);
    if (error) toast.error(error.message); else load();
  };
  const set = (k: string, v: unknown) => setEdit({ ...edit, [k]: v });

  return (
    <div className="bg-white p-4 shadow-sm">
      <CustomerList customers={customers} />
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <h4 className="m-0 me-auto">{title} <small className="text-muted">({rows.length})</small></h4>
        <input className="form-control form-control-sm" style={{ width: 220 }} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn btn-primary btn-sm" onClick={() => setEdit({ ...defaults })}><i className="fa fa-plus me-1"></i>Add new</button>
      </div>
      {top}

      {edit && (
        <div className="border p-3 mb-4 bg-light">
          <div className="row g-3">
            {fields.map((f) => (
              <div className={f.wide || f.type === "textarea" ? "col-12" : "col-md-4"} key={f.key}>
                <label className="form-label small mb-1">{f.label}{f.required ? " *" : ""}</label>
                {f.type === "textarea" ? (
                  <textarea className="form-control" rows={2} value={edit[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
                ) : f.type === "select" ? (
                  <select className="form-select" value={edit[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)}>
                    {f.options!.map((o) => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : f.type === "customer" ? (
                  <input className="form-control" list="cust-list" value={edit[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} placeholder="Type or pick a customer" />
                ) : f.type === "vat" ? (
                  <div className="input-group">
                    <input className="form-control" type="number" step="0.01" value={edit[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
                    <button type="button" className="btn btn-outline-secondary" onClick={() => set(f.key, Math.round((Number(edit.amount) || 0) * 5) / 100)}>5%</button>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => set(f.key, 0)}>0</button>
                  </div>
                ) : (
                  <input className="form-control" type={f.type ?? "text"} step={f.type === "number" ? "0.01" : undefined} value={edit[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
                )}
                {f.help && <small className="text-muted">{f.help}</small>}
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
          <thead><tr>{columns.map((c) => <th key={c.label} className={c.right ? "text-end" : ""}>{c.label}</th>)}<th></th></tr></thead>
          <tbody>
            {shown.length === 0 && <tr><td colSpan={columns.length + 1} className="text-muted">No records yet.</td></tr>}
            {shown.map((r) => (
              <tr key={r.id} className={badge?.(r)}>
                {columns.map((c) => <td key={c.label} className={c.right ? "text-end text-nowrap" : ""}>{c.render(r)}</td>)}
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

export function Customers() {
  const t = useTable("customers");
  const inv = useTable("invoices", "issue_date").rows;
  const pay = useTable("payments", "payment_date").rows;
  const { settings } = useSettings();
  const mine = belongsTo;
  const balance = (c: Row) => {
    const rows = customerStatement(inv.filter((i) => mine(c, i)), pay.filter((p) => mine(c, p)));
    return rows.at(-1)?.balance ?? 0;
  };
  return <CrudTable title="Customers" table="customers" {...t}
    fields={[{ key: "name", label: "Name", required: true }, { key: "company", label: "Company" }, { key: "trn", label: "TRN (VAT no.)", help: "Printed on their tax invoices" }, { key: "phone", label: "Phone" }, { key: "email", label: "Email" }, { key: "address", label: "Address" }, { key: "notes", label: "Notes", type: "textarea" }]}
    columns={[{ label: "Name", render: (r) => <><strong>{r.name}</strong><small className="d-block text-muted">{r.company}</small></> }, { label: "Phone", render: (r) => r.phone && <a href={`tel:${r.phone}`}>{r.phone}</a> }, { label: "Email", render: (r) => r.email },
      { label: "TRN", render: (r) => r.trn }, { label: "Balance due", right: true, render: (r) => { const b = balance(r); return <span className={b > 0 ? "text-danger fw-bold" : ""}>{aed(b)}</span>; } }]}
    extra={(r) => <button className="btn btn-sm btn-outline-dark me-1" title="Statement of account" onClick={() => printStatement(r, customerStatement(inv.filter((i) => mine(r, i)), pay.filter((p) => mine(r, p))), settings)}><i className="fa fa-list-alt me-1"></i>Statement</button>} />;
}

const billingDiv: Record<string, number> = { yearly: 1, "half-yearly": 2, quarterly: 4, monthly: 12 };

export function Contracts({ go }: { go: (t: never) => void }) {
  const t = useTable("amc_contracts", "end_date");
  const customers = useTable("customers").rows;
  const soon = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
  const invoice = (r: Row) => {
    const per = Math.round(((Number(r.amount) || 0) / (billingDiv[r.billing] ?? 1)) * 100) / 100;
    queueInvoice({ customer_name: r.customer_name, customer_id: r.customer_id, contract_id: r.id,
      items: [{ description: `Annual Maintenance Contract – ${r.plan ?? ""} plan${r.property ? `, ${r.property}` : ""} (${r.billing} billing, ${r.start_date ?? "?"} to ${r.end_date ?? "?"})`, qty: 1, unit: "lot", rate: per }] });
    go("invoices" as never);
  };
  return <CrudTable title="AMC Contracts" table="amc_contracts" {...t} customers={customers} defaults={{ status: "active", visits_per_year: 4, plan: "Standard", billing: "yearly" }}
    fields={[{ key: "customer_name", label: "Customer", type: "customer", required: true }, { key: "property", label: "Property / building" }, { key: "plan", label: "Plan", type: "select", options: ["Basic", "Standard", "Premium", "Custom"] },
      { key: "start_date", label: "Start date", type: "date" }, { key: "end_date", label: "End (renewal) date", type: "date" }, { key: "next_visit", label: "Next visit", type: "date" },
      { key: "visits_per_year", label: "Visits per year", type: "number" }, { key: "amount", label: "Contract value per year (AED, excl. VAT)", type: "number" },
      { key: "billing", label: "Billing", type: "select", options: ["yearly", "half-yearly", "quarterly", "monthly"] },
      { key: "status", label: "Status", type: "select", options: ["active", "expired", "cancelled"] }, { key: "notes", label: "Notes", type: "textarea" }]}
    badge={(r) => (r.status === "active" && r.end_date && r.end_date <= soon ? "table-warning" : undefined)}
    extra={(r) => <button className="btn btn-sm btn-outline-success me-1" onClick={() => invoice(r)} title="Create invoice for this contract"><i className="fa fa-file-invoice me-1"></i>Invoice</button>}
    columns={[{ label: "Customer", render: (r) => <><strong>{r.customer_name}</strong><small className="d-block text-muted">{r.property}</small></> }, { label: "Plan", render: (r) => r.plan },
      { label: "Period", render: (r) => `${r.start_date ?? "?"} → ${r.end_date ?? "?"}` }, { label: "Next visit", render: (r) => r.next_visit },
      { label: "Value / year", right: true, render: (r) => <>{aed(Number(r.amount) || 0)}<small className="d-block text-muted">{r.billing}: {aed((Number(r.amount) || 0) / (billingDiv[r.billing] ?? 1))}</small></> },
      { label: "Status", render: (r) => <>{pill(r.status, { active: "success", expired: "danger", cancelled: "secondary" })}{r.status === "active" && r.end_date && r.end_date <= soon && <small className="d-block text-danger">Renewal due</small>}</> }]} />;
}

export function Jobs({ go }: { go: (t: never) => void }) {
  const t = useTable("jobs", "scheduled_date");
  const customers = useTable("customers").rows;
  const invoice = (r: Row) => {
    queueInvoice({ customer_name: r.customer_name ?? "", customer_id: r.customer_id, job_id: r.id,
      items: [{ description: `${r.service ? r.service + ": " : ""}${r.title}${r.location ? ` – ${r.location}` : ""}`, qty: 1, unit: "job", rate: "" }] });
    go("invoices" as never);
  };
  return <CrudTable title="Jobs & Technicians" table="jobs" {...t} customers={customers} defaults={{ status: "scheduled", priority: "normal", scheduled_date: today() }}
    fields={[{ key: "title", label: "Job title", required: true }, { key: "customer_name", label: "Customer", type: "customer" }, { key: "location", label: "Location" },
      { key: "service", label: "Service", type: "select", options: ["HVAC", "Electrical", "Plumbing", "MEP Maintenance", "AMC visit", "VRF", "Other"] }, { key: "technician", label: "Technician" },
      { key: "scheduled_date", label: "Date", type: "date" }, { key: "scheduled_time", label: "Time", type: "text" }, { key: "priority", label: "Priority", type: "select", options: ["low", "normal", "urgent"] },
      { key: "status", label: "Status", type: "select", options: ["scheduled", "in progress", "completed", "cancelled"] }, { key: "notes", label: "Notes", type: "textarea" }]}
    badge={(r) => (r.priority === "urgent" && r.status !== "completed" ? "table-danger" : undefined)}
    extra={(r) => <button className="btn btn-sm btn-outline-success me-1" onClick={() => invoice(r)} title="Create invoice for this job"><i className="fa fa-file-invoice me-1"></i>Invoice</button>}
    columns={[{ label: "Date", render: (r) => <>{r.scheduled_date}<small className="d-block text-muted">{r.scheduled_time}</small></> }, { label: "Job", render: (r) => <><strong>{r.title}</strong><small className="d-block text-muted">{r.service}</small></> },
      { label: "Customer", render: (r) => <>{r.customer_name}<small className="d-block text-muted">{r.location}</small></> }, { label: "Technician", render: (r) => r.technician || <span className="text-danger">Unassigned</span> },
      { label: "Priority", render: (r) => pill(r.priority, { urgent: "danger", normal: "info", low: "secondary" }) }, { label: "Status", render: (r) => pill(r.status, { scheduled: "primary", "in progress": "warning", completed: "success", cancelled: "secondary" }) }]} />;
}

export const expenseCategories = ["Materials & spare parts", "Subcontractor", "Salaries & wages", "Transport & fuel", "Vehicle maintenance", "Tools & equipment", "Rent", "Utilities & phone", "Visa & licensing", "Office & admin", "Marketing", "Bank charges", "Other"];

export function Expenses() {
  const t = useTable("expenses", "expense_date");
  const jobs = useTable("jobs", "scheduled_date").rows;
  const [period, setPeriod] = useState("this-month");
  const [from, to] = periodRange(period);
  const inPeriod = (r: Row) => r.expense_date >= from && r.expense_date <= to;
  const sums = useMemo(() => {
    const p = t.rows.filter(inPeriod);
    return { total: p.reduce((s, e) => s + expenseTotal(e), 0), vat: p.reduce((s, e) => s + (Number(e.vat_amount) || 0), 0), unpaid: t.rows.filter((e) => e.status === "unpaid").reduce((s, e) => s + expenseTotal(e), 0) };
  }, [t.rows, from, to]);
  const markPaid = async (r: Row) => { const { error } = await db.from("expenses").update({ status: "paid" }).eq("id", r.id); if (error) toast.error(error.message); else t.load(); };
  const jobName = (id: string) => jobs.find((j) => j.id === id)?.title;
  return <CrudTable title="Expenses & Bills" table="expenses" {...t} filter={inPeriod}
    defaults={{ expense_date: today(), category: expenseCategories[0], method: "cash", status: "paid", vat_amount: 0 }}
    top={<div className="d-flex flex-wrap gap-3 align-items-center mb-3 p-3 bg-light border">
      <PeriodSelect value={period} onChange={setPeriod} />
      <span>Spent: <strong>{aed(sums.total)}</strong></span>
      <span className="text-muted">VAT paid (input VAT): {aed(sums.vat)}</span>
      <span className="text-danger">Unpaid supplier bills (all time): <strong>{aed(sums.unpaid)}</strong></span>
    </div>}
    fields={[{ key: "expense_date", label: "Date", type: "date", required: true }, { key: "category", label: "Category", type: "select", options: expenseCategories },
      { key: "supplier", label: "Supplier / paid to" }, { key: "bill_no", label: "Bill / receipt no." },
      { key: "amount", label: "Amount excl. VAT (AED)", type: "number", required: true }, { key: "vat_amount", label: "VAT on bill (AED)", type: "vat", help: "Use 5% if the supplier charged VAT — you can claim it back" },
      { key: "method", label: "Paid by", type: "select", options: ["cash", "bank transfer", "cheque", "card"] },
      { key: "status", label: "Status", type: "select", options: [{ value: "paid", label: "Paid" }, { value: "unpaid", label: "Unpaid (pay later)" }] },
      { key: "job_id", label: "For job (optional)", type: "select", options: [{ value: "", label: "— General / not for a job —" }, ...jobs.map((j) => ({ value: j.id, label: `${j.scheduled_date ?? ""} ${j.title}` }))] },
      { key: "description", label: "Description", wide: true }, { key: "notes", label: "Notes", type: "textarea" }]}
    badge={(r) => (r.status === "unpaid" ? "table-warning" : undefined)}
    extra={(r) => r.status === "unpaid" ? <button className="btn btn-sm btn-outline-success me-1" onClick={() => markPaid(r)}>Mark paid</button> : null}
    columns={[{ label: "Date", render: (r) => r.expense_date }, { label: "Category", render: (r) => <>{r.category}{r.job_id && <small className="d-block text-muted"><i className="fa fa-wrench me-1"></i>{jobName(r.job_id)}</small>}</> },
      { label: "Supplier", render: (r) => <>{r.supplier}<small className="d-block text-muted">{r.bill_no}</small></> }, { label: "Description", render: (r) => r.description },
      { label: "Amount", right: true, render: (r) => aed(Number(r.amount) || 0) }, { label: "VAT", right: true, render: (r) => aed(Number(r.vat_amount) || 0) },
      { label: "Total", right: true, render: (r) => <strong>{aed(expenseTotal(r))}</strong> },
      { label: "Status", render: (r) => <>{pill(r.status, { paid: "success", unpaid: "warning" })}<small className="d-block text-muted">{r.method}</small></> }]} />;
}

// Re-exported so the admin page can import every business screen from one place.
export { Quotations, Invoices, Payments, BillingSettings } from "@/components/admin/Billing";
export { Accounts } from "@/components/admin/Accounts";
