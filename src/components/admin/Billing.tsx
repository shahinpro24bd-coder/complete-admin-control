import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  aed, amountInWords, docTotals, invoiceTotal, isOverdue, lineAmount, nextNumber, paymentStatus, periodRange, receivedFor,
  type LineItem, type StatementRow,
} from "@/lib/business";
import { company } from "@/lib/site";
import { CustomerList, db, matchCustomer, PeriodSelect, pill, today, useTable, type Row } from "@/components/admin/shared";

/* ---------------- Billing settings ---------------- */

export type BillingSettingsData = {
  legalName: string; trn: string; address: string; phone: string; email: string;
  bankName: string; accountName: string; iban: string; accountNo: string; swift: string;
  invPrefix: string; qtPrefix: string; rcptPrefix: string; vat: number; termsDays: number; validDays: number;
  invoiceTerms: string; quoteTerms: string;
};
export const settingsDefaults: BillingSettingsData = {
  legalName: company.name, trn: "", address: company.address, phone: company.phone, email: company.email,
  bankName: "", accountName: company.name, iban: "", accountNo: "", swift: "",
  invPrefix: "INV", qtPrefix: "QT", rcptPrefix: "RCT", vat: 5, termsDays: 30, validDays: 30,
  invoiceTerms: "Payment due within the due date shown. Cheques payable to " + company.name + ".",
  quoteTerms: "Prices valid until the date shown. Work starts after written approval / LPO. Any extra work will be quoted separately.",
};

export function useSettings() {
  const [settings, setSettings] = useState<BillingSettingsData>(settingsDefaults);
  useEffect(() => {
    db.from("business_settings").select("data").eq("id", 1).maybeSingle().then(({ data }: { data: { data: Partial<BillingSettingsData> } | null }) => {
      if (data?.data) setSettings({ ...settingsDefaults, ...data.data });
    });
  }, []);
  return { settings, setSettings };
}

const addDays = (d: string, n: number) => new Date(Date.parse(d) + n * 864e5).toISOString().slice(0, 10);

export function BillingSettings() {
  const { settings, setSettings } = useSettings();
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    const { error } = await db.from("business_settings").upsert({ id: 1, data: settings, updated_at: new Date().toISOString() });
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Billing settings saved");
  };
  const f = (k: keyof BillingSettingsData, label: string, opts: { type?: string; wide?: boolean; area?: boolean; help?: string } = {}) => (
    <div className={opts.wide || opts.area ? "col-12" : "col-md-4"} key={k}>
      <label className="form-label small mb-1">{label}</label>
      {opts.area ? <textarea className="form-control" rows={2} value={String(settings[k] ?? "")} onChange={(e) => setSettings({ ...settings, [k]: e.target.value })} />
        : <input className="form-control" type={opts.type ?? "text"} value={String(settings[k] ?? "")} onChange={(e) => setSettings({ ...settings, [k]: opts.type === "number" ? Number(e.target.value) : e.target.value })} />}
      {opts.help && <small className="text-muted">{opts.help}</small>}
    </div>
  );
  return (
    <div className="bg-white p-4 shadow-sm">
      <h4>Billing setup</h4>
      <p className="text-muted">These details print on every quotation, invoice, receipt and statement.</p>
      <h6 className="mt-4">Company</h6>
      <div className="row g-3">{f("legalName", "Legal company name")}{f("trn", "Company TRN (VAT registration no.)", { help: "When filled, invoices print as TAX INVOICE" })}{f("phone", "Phone")}{f("email", "Email")}{f("address", "Address", { wide: true })}</div>
      <h6 className="mt-4">Bank details (for customers paying by transfer)</h6>
      <div className="row g-3">{f("bankName", "Bank name")}{f("accountName", "Account name")}{f("accountNo", "Account number")}{f("iban", "IBAN")}{f("swift", "SWIFT / BIC")}</div>
      <h6 className="mt-4">Numbers & defaults</h6>
      <div className="row g-3">{f("invPrefix", "Invoice number prefix")}{f("qtPrefix", "Quotation number prefix")}{f("rcptPrefix", "Receipt number prefix")}
        {f("vat", "Default VAT %", { type: "number" })}{f("termsDays", "Invoice due after (days)", { type: "number" })}{f("validDays", "Quotation valid for (days)", { type: "number" })}
        {f("invoiceTerms", "Invoice terms / footer", { area: true })}{f("quoteTerms", "Quotation terms", { area: true })}</div>
      <button className="btn btn-primary mt-4 px-4" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save billing setup"}</button>
    </div>
  );
}

/* ---------------- Printing ---------------- */

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const money = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function printPage(title: string, s: BillingSettingsData, body: string) {
  const w = window.open("", "_blank");
  if (!w) { toast.error("Allow pop-ups to print."); return; }
  w.document.write(`<html><head><title>${esc(title)}</title><style>
  body{font-family:Arial,sans-serif;padding:36px;color:#222;font-size:13px}h1{font-size:22px;margin:0}h2{font-size:18px;letter-spacing:1px;margin:24px 0 8px}
  .top{display:flex;justify-content:space-between;border-bottom:3px solid #c0392b;padding-bottom:12px}.muted{color:#666}
  table{width:100%;border-collapse:collapse;margin-top:12px}td,th{border:1px solid #ccc;padding:7px;text-align:left;vertical-align:top}th{background:#f3f3f3}.r{text-align:right}
  .tot td{border:none;padding:4px 7px}.tot .g td{font-weight:bold;font-size:15px;border-top:2px solid #222}.box{display:flex;gap:24px;margin-top:14px}.box>div{flex:1}
  .sign{display:flex;justify-content:space-between;margin-top:60px}.sign div{border-top:1px solid #222;width:220px;padding-top:6px;text-align:center}
  @media print{body{padding:0}}</style></head><body>
  <div class="top"><div><h1>${esc(s.legalName)}</h1><div class="muted">${esc(s.address)}<br>Tel: ${esc(s.phone)}${s.email ? " · " + esc(s.email) : ""}</div></div>
  <div class="r">${s.trn ? `<b>TRN:</b> ${esc(s.trn)}` : ""}</div></div>${body}<script>window.onload=()=>window.print()</script></body></html>`);
  w.document.close();
}

function docBody(kind: "invoice" | "quotation", d: Row, s: BillingSettingsData, received = 0) {
  const items: LineItem[] = d.items?.length ? d.items : [{ description: d.description ?? "", qty: 1, rate: d.amount ?? 0 }];
  const t = docTotals(items, d.discount, d.vat_percent);
  const title = kind === "quotation" ? "QUOTATION" : s.trn ? "TAX INVOICE" : "INVOICE";
  const no = kind === "quotation" ? d.quote_no : d.invoice_no;
  const balance = Math.max(0, t.total - received);
  return `<h2>${title}</h2>
  <div class="box"><div><b>${kind === "quotation" ? "To" : "Bill to"}:</b><br>${esc(d.customer_name)}<br>${esc(d.customer_address ?? "")}${d.customer_trn ? `<br>TRN: ${esc(d.customer_trn)}` : ""}</div>
  <div class="r"><b>${kind === "quotation" ? "Quotation" : "Invoice"} no:</b> ${esc(no)}<br><b>Date:</b> ${esc(d.issue_date)}<br>
  ${kind === "quotation" ? `<b>Valid until:</b> ${esc(d.valid_until ?? "")}` : `<b>Due date:</b> ${esc(d.due_date ?? "")}${d.lpo_no ? `<br><b>LPO / Ref:</b> ${esc(d.lpo_no)}` : ""}`}</div></div>
  ${d.subject ? `<p><b>Subject:</b> ${esc(d.subject)}</p>` : ""}
  <table><tr><th>#</th><th>Description</th><th class="r">Qty</th><th>Unit</th><th class="r">Rate (AED)</th><th class="r">Amount (AED)</th></tr>
  ${items.map((l, i) => `<tr><td>${i + 1}</td><td>${esc(l.description)}</td><td class="r">${esc(l.qty)}</td><td>${esc(l.unit ?? "")}</td><td class="r">${money(Number(l.rate) || 0)}</td><td class="r">${money(lineAmount(l))}</td></tr>`).join("")}</table>
  <table class="tot" style="width:320px;margin-left:auto">
  <tr><td>Subtotal</td><td class="r">${money(t.subtotal)}</td></tr>${t.discount ? `<tr><td>Discount</td><td class="r">- ${money(t.discount)}</td></tr><tr><td>Taxable amount</td><td class="r">${money(t.taxable)}</td></tr>` : ""}
  <tr><td>VAT ${esc(d.vat_percent)}%</td><td class="r">${money(t.vat)}</td></tr><tr class="g"><td>Total (AED)</td><td class="r">${money(t.total)}</td></tr>
  ${kind === "invoice" && received > 0 ? `<tr><td>Paid</td><td class="r">- ${money(received)}</td></tr><tr class="g"><td>Balance due</td><td class="r">${money(balance)}</td></tr>` : ""}</table>
  <p><b>Amount in words:</b> ${esc(amountInWords(t.total))}</p>
  ${kind === "invoice" && (s.iban || s.accountNo) ? `<p><b>Bank details:</b> ${esc(s.bankName)} · A/C name: ${esc(s.accountName)} · A/C no: ${esc(s.accountNo)} · IBAN: ${esc(s.iban)}${s.swift ? " · SWIFT: " + esc(s.swift) : ""}</p>` : ""}
  ${d.notes ? `<p><b>Notes:</b> ${esc(d.notes)}</p>` : ""}<p class="muted">${esc(kind === "quotation" ? s.quoteTerms : s.invoiceTerms)}</p>
  <div class="sign"><div>For ${esc(s.legalName)}</div><div>${kind === "quotation" ? "Customer acceptance" : "Received by"}</div></div>`;
}

export const printDoc = (kind: "invoice" | "quotation", d: Row, s: BillingSettingsData, received = 0) =>
  printPage(kind === "quotation" ? d.quote_no : d.invoice_no, s, docBody(kind, d, s, received));

export function printReceipt(p: Row, s: BillingSettingsData, invoiceNo?: string) {
  printPage(p.receipt_no, s, `<h2>PAYMENT RECEIPT</h2>
  <div class="box"><div><b>Received from:</b> ${esc(p.customer_name)}</div><div class="r"><b>Receipt no:</b> ${esc(p.receipt_no)}<br><b>Date:</b> ${esc(p.payment_date)}</div></div>
  <table><tr><th>Against</th><th>Method</th><th>Reference</th><th class="r">Amount (AED)</th></tr>
  <tr><td>${invoiceNo ? "Invoice " + esc(invoiceNo) : "Advance / on account"}</td><td>${esc(p.method)}</td><td>${esc(p.reference ?? "")}${p.cheque_date ? `<br>Cheque date: ${esc(p.cheque_date)}` : ""}</td><td class="r"><b>${money(Number(p.amount))}</b></td></tr></table>
  <p><b>Amount in words:</b> ${esc(amountInWords(Number(p.amount)))}</p>${p.notes ? `<p>${esc(p.notes)}</p>` : ""}
  <div class="sign"><div>For ${esc(s.legalName)}</div><div>Customer signature</div></div>`);
}

export function printStatement(c: Row, rows: StatementRow[], s: BillingSettingsData) {
  const bal = rows.length ? rows[rows.length - 1].balance : 0;
  printPage(`Statement - ${c.name}`, s, `<h2>STATEMENT OF ACCOUNT</h2>
  <div class="box"><div><b>Customer:</b> ${esc(c.name)}${c.company ? `<br>${esc(c.company)}` : ""}${c.trn ? `<br>TRN: ${esc(c.trn)}` : ""}</div><div class="r"><b>Date:</b> ${today()}</div></div>
  <table><tr><th>Date</th><th>Ref</th><th>Details</th><th class="r">Invoiced</th><th class="r">Paid</th><th class="r">Balance</th></tr>
  ${rows.map((r) => `<tr><td>${esc(r.date)}</td><td>${esc(r.ref)}</td><td>${esc(r.text)}</td><td class="r">${r.debit ? money(r.debit) : ""}</td><td class="r">${r.credit ? money(r.credit) : ""}</td><td class="r">${money(r.balance)}</td></tr>`).join("") || `<tr><td colspan="6">No transactions.</td></tr>`}
  </table><p style="font-size:15px"><b>Balance due: AED ${money(bal)}</b></p>`);
}

/* ---------------- Quotation / invoice editor ---------------- */

let pendingInvoice: Row | null = null;
/** Opens the invoice editor pre-filled (from a quotation, AMC contract or job) the next time the Invoices tab mounts. */
export const queueInvoice = (d: Row) => { pendingInvoice = d; };

const blankLine = (): LineItem => ({ description: "", qty: 1, unit: "", rate: "" });

function DocEditor({ kind, doc, customers, jobs, onClose, onSaved }: {
  kind: "invoice" | "quotation"; doc: Row; customers: Row[]; jobs: Row[]; onClose: () => void; onSaved: (id: string) => void;
}) {
  const [d, setD] = useState<Row>(() => ({
    ...doc,
    items: doc.items?.length ? doc.items : doc.description || doc.amount ? [{ description: doc.description ?? "", qty: 1, unit: "", rate: doc.amount ?? "" }] : [blankLine()],
  }));
  const t = docTotals(d.items, d.discount, d.vat_percent);
  const set = (patch: Row) => setD({ ...d, ...patch });
  const setItem = (i: number, patch: Partial<LineItem>) => set({ items: d.items.map((x: LineItem, j: number) => (j === i ? { ...x, ...patch } : x)) });
  const pickCustomer = (name: string) => {
    const c = matchCustomer(name, customers);
    set({ customer_name: name, ...(c ? { customer_trn: d.customer_trn || c.trn || "", customer_address: d.customer_address || c.address || "" } : {}) });
  };

  const save = async () => {
    if (!d.customer_name?.trim()) { toast.error("Customer is required"); return; }
    const items = (d.items as LineItem[]).filter((l) => String(l.description).trim()).map((l) => ({ description: String(l.description).trim(), qty: Number(l.qty) || 0, unit: l.unit ?? "", rate: Number(l.rate) || 0 }));
    if (!items.length) { toast.error("Add at least one line"); return; }
    const common = {
      customer_id: matchCustomer(d.customer_name, customers)?.id ?? d.customer_id ?? null, customer_name: d.customer_name.trim(),
      customer_trn: d.customer_trn || null, customer_address: d.customer_address || null, issue_date: d.issue_date || today(),
      items, discount: Number(d.discount) || 0, vat_percent: Number(d.vat_percent) || 0, amount: docTotals(items, d.discount, d.vat_percent).taxable, notes: d.notes || null,
    };
    const payload = kind === "invoice"
      ? { ...common, invoice_no: d.invoice_no, due_date: d.due_date || null, lpo_no: d.lpo_no || null, job_id: d.job_id || null, contract_id: d.contract_id || null,
          description: items.map((l) => l.description).join("; ").slice(0, 500), ...(d.id ? {} : { status: "unpaid" }) }
      : { ...common, quote_no: d.quote_no, valid_until: d.valid_until || null, subject: d.subject || null, status: d.status || "draft" };
    const table = kind === "invoice" ? "invoices" : "quotations";
    const res = d.id ? await db.from(table).update(payload).eq("id", d.id).select("id").single() : await db.from(table).insert(payload).select("id").single();
    if (res.error) { toast.error(res.error.message); return; }
    if (kind === "invoice") await syncInvoice(res.data.id);
    if (kind === "invoice" && d._fromQuote) await db.from("quotations").update({ status: "invoiced", invoice_id: res.data.id }).eq("id", d._fromQuote);
    toast.success("Saved");
    onSaved(res.data.id);
  };

  return (
    <div className="border p-3 mb-4 bg-light">
      <CustomerList customers={customers} />
      <h5 className="mb-3">{d.id ? "Edit" : "New"} {kind}</h5>
      <div className="row g-3">
        <div className="col-md-3"><label className="form-label small mb-1">{kind === "invoice" ? "Invoice" : "Quotation"} no.</label>
          <input className="form-control" value={kind === "invoice" ? d.invoice_no : d.quote_no} onChange={(e) => set(kind === "invoice" ? { invoice_no: e.target.value } : { quote_no: e.target.value })} /></div>
        <div className="col-md-5"><label className="form-label small mb-1">Customer *</label>
          <input className="form-control" list="cust-list" value={d.customer_name ?? ""} onChange={(e) => pickCustomer(e.target.value)} placeholder="Type or pick a customer" /></div>
        <div className="col-md-4"><label className="form-label small mb-1">Customer TRN</label><input className="form-control" value={d.customer_trn ?? ""} onChange={(e) => set({ customer_trn: e.target.value })} /></div>
        <div className="col-md-6"><label className="form-label small mb-1">Customer address</label><input className="form-control" value={d.customer_address ?? ""} onChange={(e) => set({ customer_address: e.target.value })} /></div>
        <div className="col-md-3"><label className="form-label small mb-1">Date</label><input type="date" className="form-control" value={d.issue_date ?? ""} onChange={(e) => set({ issue_date: e.target.value })} /></div>
        {kind === "invoice" ? (
          <>
            <div className="col-md-3"><label className="form-label small mb-1">Due date</label><input type="date" className="form-control" value={d.due_date ?? ""} onChange={(e) => set({ due_date: e.target.value })} /></div>
            <div className="col-md-4"><label className="form-label small mb-1">LPO / reference no.</label><input className="form-control" value={d.lpo_no ?? ""} onChange={(e) => set({ lpo_no: e.target.value })} /></div>
            <div className="col-md-8"><label className="form-label small mb-1">For job (optional — used for job profit)</label>
              <select className="form-select" value={d.job_id ?? ""} onChange={(e) => set({ job_id: e.target.value })}>
                <option value="">— Not linked to a job —</option>{jobs.map((j) => <option key={j.id} value={j.id}>{j.scheduled_date} {j.title} {j.customer_name ? `(${j.customer_name})` : ""}</option>)}
              </select></div>
          </>
        ) : (
          <>
            <div className="col-md-3"><label className="form-label small mb-1">Valid until</label><input type="date" className="form-control" value={d.valid_until ?? ""} onChange={(e) => set({ valid_until: e.target.value })} /></div>
            <div className="col-md-8"><label className="form-label small mb-1">Subject</label><input className="form-control" value={d.subject ?? ""} onChange={(e) => set({ subject: e.target.value })} placeholder="e.g. Supply & installation of split AC units" /></div>
            <div className="col-md-4"><label className="form-label small mb-1">Status</label>
              <select className="form-select" value={d.status ?? "draft"} onChange={(e) => set({ status: e.target.value })}>{["draft", "sent", "accepted", "rejected", "invoiced"].map((s) => <option key={s}>{s}</option>)}</select></div>
          </>
        )}
      </div>

      <div className="table-responsive mt-3">
        <table className="table table-sm align-middle bg-white mb-1">
          <thead><tr><th>Description (labour, parts, call-out…)</th><th style={{ width: 90 }}>Qty</th><th style={{ width: 90 }}>Unit</th><th style={{ width: 130 }}>Rate (AED)</th><th style={{ width: 130 }} className="text-end">Amount</th><th style={{ width: 40 }}></th></tr></thead>
          <tbody>
            {d.items.map((l: LineItem, i: number) => (
              <tr key={i}>
                <td><input className="form-control form-control-sm" value={l.description} onChange={(e) => setItem(i, { description: e.target.value })} aria-label={`Line ${i + 1} description`} /></td>
                <td><input type="number" step="0.01" className="form-control form-control-sm" value={l.qty} onChange={(e) => setItem(i, { qty: e.target.value })} aria-label={`Line ${i + 1} quantity`} /></td>
                <td><input className="form-control form-control-sm" value={l.unit ?? ""} onChange={(e) => setItem(i, { unit: e.target.value })} placeholder="nos" aria-label={`Line ${i + 1} unit`} /></td>
                <td><input type="number" step="0.01" className="form-control form-control-sm" value={l.rate} onChange={(e) => setItem(i, { rate: e.target.value })} aria-label={`Line ${i + 1} rate`} /></td>
                <td className="text-end">{aed(lineAmount(l))}</td>
                <td><button className="btn btn-sm btn-link text-danger" onClick={() => set({ items: d.items.filter((_: LineItem, j: number) => j !== i) })} aria-label="Remove line"><i className="fa fa-times"></i></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn btn-sm btn-outline-primary" onClick={() => set({ items: [...d.items, blankLine()] })}><i className="fa fa-plus me-1"></i>Add line</button>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-md-7"><label className="form-label small mb-1">Notes (printed)</label><textarea className="form-control" rows={3} value={d.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} /></div>
        <div className="col-md-5">
          <table className="table table-sm mb-0">
            <tbody>
              <tr><td>Subtotal</td><td className="text-end">{aed(t.subtotal)}</td></tr>
              <tr><td>Discount (AED)</td><td className="text-end"><input type="number" step="0.01" className="form-control form-control-sm d-inline-block text-end" style={{ width: 120 }} value={d.discount ?? 0} onChange={(e) => set({ discount: e.target.value })} aria-label="Discount" /></td></tr>
              <tr><td>VAT %</td><td className="text-end"><input type="number" step="0.01" className="form-control form-control-sm d-inline-block text-end" style={{ width: 120 }} value={d.vat_percent ?? 5} onChange={(e) => set({ vat_percent: e.target.value })} aria-label="VAT percent" /> <span className="ms-2">{aed(t.vat)}</span></td></tr>
              <tr className="fw-bold fs-6"><td>Total</td><td className="text-end">{aed(t.total)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="d-flex gap-2 mt-3">
        <button className="btn btn-primary btn-sm px-4" onClick={save}>Save {kind}</button>
        <button className="btn btn-light border btn-sm" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

/** Re-computes an invoice's paid / partial / unpaid status from its payments. */
export async function syncInvoice(id: string) {
  const { data: inv } = await db.from("invoices").select("id, amount, vat_percent, status").eq("id", id).maybeSingle();
  if (!inv || inv.status === "cancelled") return;
  const { data: ps } = await db.from("payments").select("amount, payment_date").eq("invoice_id", id);
  const list = (ps ?? []) as { amount: number; payment_date: string }[];
  const rec = list.reduce((s, p) => s + Number(p.amount), 0);
  const st = paymentStatus(invoiceTotal(inv), rec);
  const last = list.map((p) => p.payment_date).sort().pop() ?? null;
  await db.from("invoices").update({ status: st, paid_date: st === "paid" ? last : null }).eq("id", id);
}

const statusColors = { paid: "success", partial: "info", unpaid: "warning", cancelled: "secondary", overdue: "danger" };

/* ---------------- Quotations ---------------- */

export function Quotations({ go }: { go: (t: never) => void }) {
  const t = useTable("quotations", "issue_date");
  const customers = useTable("customers").rows;
  const jobs = useTable("jobs", "scheduled_date").rows;
  const { settings } = useSettings();
  const [edit, setEdit] = useState<Row | null>(null);
  const [q, setQ] = useState("");
  const shown = t.rows.filter((r) => !q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  const add = () => setEdit({ quote_no: nextNumber(settings.qtPrefix, t.rows.map((r) => r.quote_no)), issue_date: today(), valid_until: addDays(today(), settings.validDays), vat_percent: settings.vat, discount: 0, status: "draft" });
  const toInvoice = (r: Row) => {
    queueInvoice({ customer_name: r.customer_name, customer_id: r.customer_id, customer_trn: r.customer_trn, customer_address: r.customer_address, items: r.items, discount: r.discount, vat_percent: r.vat_percent, lpo_no: r.quote_no, notes: r.subject ?? "", _fromQuote: r.id });
    go("invoices" as never);
  };
  const del = async (id: string) => { if (!confirm("Delete this quotation?")) return; const { error } = await db.from("quotations").delete().eq("id", id); if (error) toast.error(error.message); else t.load(); };
  const setStatus = async (r: Row, status: string) => { await db.from("quotations").update({ status }).eq("id", r.id); t.load(); };
  const total = (r: Row) => invoiceTotal(r);
  return (
    <div className="bg-white p-4 shadow-sm">
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <h4 className="m-0 me-auto">Quotations <small className="text-muted">({t.rows.length})</small></h4>
        <input className="form-control form-control-sm" style={{ width: 220 }} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn btn-primary btn-sm" onClick={add}><i className="fa fa-plus me-1"></i>New quotation</button>
      </div>
      {edit && <DocEditor kind="quotation" doc={edit} customers={customers} jobs={jobs} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); t.load(); }} />}
      <div className="table-responsive">
        <table className="table table-hover align-middle small">
          <thead><tr><th>No.</th><th>Customer</th><th>Date</th><th>Valid until</th><th className="text-end">Total</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {shown.length === 0 && <tr><td colSpan={7} className="text-muted">No quotations yet.</td></tr>}
            {shown.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.quote_no}</strong></td><td>{r.customer_name}<small className="d-block text-muted">{r.subject}</small></td><td>{r.issue_date}</td>
                <td>{r.valid_until}{r.valid_until && r.valid_until < today() && ["draft", "sent"].includes(r.status) && <small className="d-block text-danger">Expired</small>}</td>
                <td className="text-end">{aed(total(r))}</td>
                <td><select className="form-select form-select-sm" style={{ width: 120 }} value={r.status} onChange={(e) => setStatus(r, e.target.value)} aria-label="Quotation status">{["draft", "sent", "accepted", "rejected", "invoiced"].map((s) => <option key={s}>{s}</option>)}</select></td>
                <td className="text-end text-nowrap">
                  <button className="btn btn-sm btn-outline-dark me-1" onClick={() => printDoc("quotation", r, settings)} aria-label="Print"><i className="fa fa-print"></i></button>
                  {r.status !== "invoiced" && <button className="btn btn-sm btn-outline-success me-1" onClick={() => toInvoice(r)}><i className="fa fa-file-invoice me-1"></i>Make invoice</button>}
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

/* ---------------- Invoices ---------------- */

const methods = ["cash", "bank transfer", "cheque", "card", "online"];

function PaymentForm({ invoice, balance, settings, used, customers, onDone }: { invoice?: Row; balance?: number; settings: BillingSettingsData; used: string[]; customers: Row[]; onDone: () => void }) {
  const [p, setP] = useState<Row>({ payment_date: today(), method: "bank transfer", amount: balance ?? "", customer_name: invoice?.customer_name ?? "" });
  const save = async () => {
    const amount = Number(p.amount);
    if (!(amount > 0)) { toast.error("Enter the amount received"); return; }
    if (!p.customer_name?.trim()) { toast.error("Customer is required"); return; }
    if (balance !== undefined && amount > balance + 0.001 && !confirm(`This is more than the balance due (${aed(balance)}). Record anyway?`)) return;
    const { error } = await db.from("payments").insert({
      receipt_no: nextNumber(settings.rcptPrefix, used), invoice_id: invoice?.id ?? null,
      customer_id: invoice?.customer_id ?? matchCustomer(p.customer_name, customers)?.id ?? null, customer_name: p.customer_name.trim(),
      payment_date: p.payment_date, amount, method: p.method, reference: p.reference || null, cheque_date: p.method === "cheque" ? p.cheque_date || null : null, notes: p.notes || null,
    });
    if (error) { toast.error(error.message); return; }
    if (invoice) await syncInvoice(invoice.id);
    toast.success("Payment recorded");
    onDone();
  };
  return (
    <div className="border border-success p-3 mb-3 bg-light">
      <CustomerList customers={customers} />
      <h6>{invoice ? `Receive payment for ${invoice.invoice_no} — balance ${aed(balance ?? 0)}` : "Record money received (advance / other income)"}</h6>
      <div className="row g-2 align-items-end">
        {!invoice && <div className="col-md-3"><label className="form-label small mb-1">Customer</label><input className="form-control form-control-sm" list="cust-list" value={p.customer_name} onChange={(e) => setP({ ...p, customer_name: e.target.value })} /></div>}
        <div className="col-md-2"><label className="form-label small mb-1">Amount (AED)</label><input type="number" step="0.01" className="form-control form-control-sm" value={p.amount} onChange={(e) => setP({ ...p, amount: e.target.value })} aria-label="Amount received" /></div>
        <div className="col-md-2"><label className="form-label small mb-1">Date</label><input type="date" className="form-control form-control-sm" value={p.payment_date} onChange={(e) => setP({ ...p, payment_date: e.target.value })} /></div>
        <div className="col-md-2"><label className="form-label small mb-1">Method</label><select className="form-select form-select-sm" value={p.method} onChange={(e) => setP({ ...p, method: e.target.value })}>{methods.map((m) => <option key={m}>{m}</option>)}</select></div>
        <div className="col-md-2"><label className="form-label small mb-1">{p.method === "cheque" ? "Cheque no. / bank" : "Reference"}</label><input className="form-control form-control-sm" value={p.reference ?? ""} onChange={(e) => setP({ ...p, reference: e.target.value })} /></div>
        {p.method === "cheque" && <div className="col-md-2"><label className="form-label small mb-1">Cheque date</label><input type="date" className="form-control form-control-sm" value={p.cheque_date ?? ""} onChange={(e) => setP({ ...p, cheque_date: e.target.value })} /></div>}
        <div className="col-auto d-flex gap-2"><button className="btn btn-success btn-sm" onClick={save}>Save payment</button><button className="btn btn-light border btn-sm" onClick={onDone}>Cancel</button></div>
      </div>
    </div>
  );
}

export function Invoices() {
  const t = useTable("invoices", "issue_date");
  const pays = useTable("payments", "payment_date");
  const customers = useTable("customers").rows;
  const jobs = useTable("jobs", "scheduled_date").rows;
  const { settings } = useSettings();
  const [edit, setEdit] = useState<Row | null>(null);
  const [payFor, setPayFor] = useState<Row | null>(null);
  const [q, setQ] = useState("");
  const [show, setShow] = useState("all");
  const newDoc = (extra: Row = {}) => ({ invoice_no: nextNumber(settings.invPrefix, t.rows.map((r) => r.invoice_no)), issue_date: today(), due_date: addDays(today(), settings.termsDays), vat_percent: settings.vat, discount: 0, notes: "", ...extra });

  useEffect(() => {
    if (pendingInvoice && t.rows !== undefined) { const p = pendingInvoice; pendingInvoice = null; setEdit(newDoc(p)); }
  }, [settings]);

  const rows = useMemo(() => t.rows.map((r) => {
    const total = invoiceTotal(r), received = receivedFor(r.id, pays.rows);
    const st = paymentStatus(total, received, r.status === "cancelled");
    return { ...r, total, received, balance: st === "cancelled" ? 0 : Math.max(0, Math.round((total - received) * 100) / 100), st, overdue: isOverdue({ ...r, status: st }) };
  }), [t.rows, pays.rows]);
  const shown = rows.filter((r) => (show === "all" || (show === "open" ? r.balance > 0 : show === "overdue" ? r.overdue : r.st === show)) && (!q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase())));
  const live = rows.filter((r) => r.st !== "cancelled");
  const sum = { invoiced: live.reduce((s, r) => s + r.total, 0), received: live.reduce((s, r) => s + r.received, 0), due: live.reduce((s, r) => s + r.balance, 0), overdue: live.filter((r) => r.overdue).reduce((s, r) => s + r.balance, 0) };

  const refresh = () => { t.load(); pays.load(); };
  const voidInv = async (r: Row) => {
    if (r.st === "cancelled") { await db.from("invoices").update({ status: "unpaid" }).eq("id", r.id); await syncInvoice(r.id); refresh(); return; }
    if (!confirm(`Cancel invoice ${r.invoice_no}? It stays in the list (for audit) but no longer counts as sales.${r.received ? " Payments already recorded will remain." : ""}`)) return;
    await db.from("invoices").update({ status: "cancelled" }).eq("id", r.id); refresh();
  };
  const del = async (r: Row) => {
    if (!confirm(`Delete invoice ${r.invoice_no}${r.received ? " and its payments" : ""} permanently? Tip: use Cancel instead to keep a record.`)) return;
    const { error } = await db.from("invoices").delete().eq("id", r.id); if (error) toast.error(error.message); else refresh();
  };

  return (
    <div className="bg-white p-4 shadow-sm">
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <h4 className="m-0 me-auto">Invoices <small className="text-muted">({t.rows.length})</small></h4>
        <select className="form-select form-select-sm" style={{ width: 150 }} value={show} onChange={(e) => setShow(e.target.value)} aria-label="Show">
          <option value="all">All</option><option value="open">Not fully paid</option><option value="overdue">Overdue</option><option value="partial">Part paid</option><option value="paid">Paid</option><option value="cancelled">Cancelled</option>
        </select>
        <input className="form-control form-control-sm" style={{ width: 200 }} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn btn-primary btn-sm" onClick={() => setEdit(newDoc())}><i className="fa fa-plus me-1"></i>New invoice</button>
      </div>
      <div className="row g-2 mb-3 small">
        {[["Total invoiced", sum.invoiced, ""], ["Received", sum.received, "text-success"], ["Balance due", sum.due, "text-warning"], ["Overdue", sum.overdue, "text-danger"]].map(([l, v, c]) => (
          <div className="col-6 col-md-3" key={l as string}><div className="border p-2 bg-light"><div className="text-muted">{l}</div><strong className={`fs-6 ${c}`}>{aed(v as number)}</strong></div></div>
        ))}
      </div>
      {edit && <DocEditor kind="invoice" doc={edit} customers={customers} jobs={jobs} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); refresh(); }} />}
      {payFor && <PaymentForm invoice={payFor} balance={payFor.balance} settings={settings} used={pays.rows.map((p) => p.receipt_no)} customers={customers} onDone={() => { setPayFor(null); refresh(); }} />}
      <div className="table-responsive">
        <table className="table table-hover align-middle small">
          <thead><tr><th>No.</th><th>Customer</th><th>Issued</th><th>Due</th><th className="text-end">Total</th><th className="text-end">Received</th><th className="text-end">Balance</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {shown.length === 0 && <tr><td colSpan={9} className="text-muted">No invoices.</td></tr>}
            {shown.map((r) => (
              <tr key={r.id} className={r.overdue ? "table-danger" : r.st === "cancelled" ? "text-muted" : ""}>
                <td><strong>{r.invoice_no}</strong>{r.lpo_no && <small className="d-block text-muted">Ref {r.lpo_no}</small>}</td>
                <td>{r.customer_name}</td><td>{r.issue_date}</td><td>{r.due_date}</td>
                <td className="text-end text-nowrap">{aed(r.total)}</td><td className="text-end text-nowrap">{aed(r.received)}</td><td className="text-end text-nowrap fw-bold">{aed(r.balance)}</td>
                <td>{pill(r.overdue ? "overdue" : r.st, statusColors)}</td>
                <td className="text-end text-nowrap">
                  {r.balance > 0 && <button className="btn btn-sm btn-success me-1" onClick={() => setPayFor(r)}><i className="fa fa-hand-holding-usd me-1"></i>Receive</button>}
                  <button className="btn btn-sm btn-outline-dark me-1" onClick={() => printDoc("invoice", r, settings, r.received)} aria-label="Print"><i className="fa fa-print"></i></button>
                  <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEdit({ ...r })} aria-label="Edit"><i className="fa fa-edit"></i></button>
                  <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => voidInv(r)} title={r.st === "cancelled" ? "Restore" : "Cancel invoice"}><i className={`fa ${r.st === "cancelled" ? "fa-undo" : "fa-ban"}`}></i></button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => del(r)} aria-label="Delete"><i className="fa fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Payments received ---------------- */

export function Payments() {
  const t = useTable("payments", "payment_date");
  const inv = useTable("invoices", "issue_date").rows;
  const customers = useTable("customers").rows;
  const { settings } = useSettings();
  const [period, setPeriod] = useState("this-month");
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState("");
  const [from, to] = periodRange(period);
  const invNo = (id?: string) => inv.find((i) => i.id === id)?.invoice_no;
  const shown = t.rows.filter((p) => p.payment_date >= from && p.payment_date <= to && (!q || JSON.stringify(p).toLowerCase().includes(q.toLowerCase())));
  const byMethod = shown.reduce<Record<string, number>>((m, p) => ({ ...m, [p.method]: (m[p.method] ?? 0) + Number(p.amount) }), {});
  const pdc = t.rows.filter((p) => p.method === "cheque" && p.cheque_date && p.cheque_date > today());
  const del = async (p: Row) => {
    if (!confirm(`Delete receipt ${p.receipt_no}? The invoice will show as unpaid again.`)) return;
    const { error } = await db.from("payments").delete().eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    if (p.invoice_id) await syncInvoice(p.invoice_id);
    t.load();
  };
  return (
    <div className="bg-white p-4 shadow-sm">
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <h4 className="m-0 me-auto">Payments received</h4>
        <PeriodSelect value={period} onChange={setPeriod} />
        <input className="form-control form-control-sm" style={{ width: 200 }} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}><i className="fa fa-plus me-1"></i>Other income / advance</button>
      </div>
      <p className="small text-muted">To receive money against an invoice, use the <b>Receive</b> button in Invoices — it updates the invoice balance automatically.</p>
      <div className="d-flex flex-wrap gap-3 mb-3 p-3 bg-light border small">
        <span>Total received: <strong className="text-success">{aed(shown.reduce((s, p) => s + Number(p.amount), 0))}</strong></span>
        {Object.entries(byMethod).map(([m, v]) => <span key={m} className="text-capitalize">{m}: {aed(v)}</span>)}
      </div>
      {pdc.length > 0 && <div className="alert alert-warning small py-2"><i className="fa fa-money-check me-2"></i><b>Post-dated cheques to deposit:</b> {pdc.map((p) => `${p.customer_name} ${aed(Number(p.amount))} on ${p.cheque_date}`).join(" · ")}</div>}
      {adding && <PaymentForm settings={settings} used={t.rows.map((p) => p.receipt_no)} customers={customers} onDone={() => { setAdding(false); t.load(); }} />}
      <div className="table-responsive">
        <table className="table table-hover align-middle small">
          <thead><tr><th>Receipt</th><th>Date</th><th>Customer</th><th>Against</th><th>Method</th><th className="text-end">Amount</th><th></th></tr></thead>
          <tbody>
            {shown.length === 0 && <tr><td colSpan={7} className="text-muted">No payments in this period.</td></tr>}
            {shown.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.receipt_no}</strong></td><td>{p.payment_date}</td><td>{p.customer_name}</td><td>{invNo(p.invoice_id) ?? <span className="text-muted">Advance / other</span>}</td>
                <td className="text-capitalize">{p.method}{p.reference && <small className="d-block text-muted">{p.reference}</small>}{p.cheque_date && <small className={`d-block ${p.cheque_date > today() ? "text-warning" : "text-muted"}`}>Cheque date {p.cheque_date}</small>}</td>
                <td className="text-end fw-bold">{aed(Number(p.amount))}</td>
                <td className="text-end text-nowrap">
                  <button className="btn btn-sm btn-outline-dark me-1" onClick={() => printReceipt(p, settings, invNo(p.invoice_id))} aria-label="Print receipt"><i className="fa fa-print"></i></button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => del(p)} aria-label="Delete"><i className="fa fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
