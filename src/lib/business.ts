// Money math for the admin accounts (UAE: AED, 5% VAT). Kept pure so it can be tested.

export type LineItem = { description: string; qty: number | string; unit?: string; rate: number | string };

export type InvoiceLike = {
  amount: number | string | null; // taxable amount (after discount)
  vat_percent: number | string | null;
  status: string;
  issue_date: string;
  paid_date?: string | null;
  due_date?: string | null;
};

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const num = (v: unknown) => Number(v) || 0;

export const lineAmount = (l: LineItem) => r2(num(l.qty) * num(l.rate));

/** Totals for a quotation / invoice from its line items. */
export function docTotals(items: LineItem[], discount: number | string = 0, vatPercent: number | string = 5) {
  const subtotal = r2(items.reduce((s, l) => s + lineAmount(l), 0));
  const disc = Math.min(Math.max(0, num(discount)), subtotal);
  const taxable = r2(subtotal - disc);
  const vat = r2((taxable * num(vatPercent)) / 100);
  return { subtotal, discount: r2(disc), taxable, vat, total: r2(taxable + vat) };
}

/** Grand total incl. VAT of a saved invoice (amount = taxable amount). */
export const invoiceTotal = (i: InvoiceLike) => r2(num(i.amount) * (1 + num(i.vat_percent) / 100));
export const invoiceVat = (i: InvoiceLike) => r2(invoiceTotal(i) - num(i.amount));

export const isOverdue = (i: InvoiceLike, today = new Date().toISOString().slice(0, 10)) =>
  i.status !== "paid" && i.status !== "cancelled" && !!i.due_date && i.due_date < today;

/** Payment status of an invoice from what has been received against it. */
export function paymentStatus(total: number, received: number, cancelled = false): "cancelled" | "paid" | "partial" | "unpaid" {
  if (cancelled) return "cancelled";
  if (received > 0 && r2(received) >= r2(total)) return "paid";
  if (received > 0) return "partial";
  return "unpaid";
}

export type PaymentLike = { invoice_id?: string | null; amount: number | string; payment_date: string };
export type ExpenseLike = { expense_date: string; amount: number | string; vat_amount?: number | string | null; status?: string; category?: string; job_id?: string | null };

export const expenseTotal = (e: ExpenseLike) => r2(num(e.amount) + num(e.vat_amount));

export function receivedFor(invoiceId: string, payments: PaymentLike[]) {
  return r2(payments.filter((p) => p.invoice_id === invoiceId).reduce((s, p) => s + num(p.amount), 0));
}

const inRange = (d: string | null | undefined, from: string, to: string) => !!d && d >= from && d <= to;

/** Date range for a period preset. Dates are YYYY-MM-DD. */
export function periodRange(preset: string, today = new Date().toISOString().slice(0, 10)): [string, string] {
  const [y = 2000, m = 1] = today.split("-").map(Number);
  const iso = (yy: number, mm: number, dd: number) => new Date(Date.UTC(yy, mm - 1, dd)).toISOString().slice(0, 10);
  switch (preset) {
    case "this-month": return [iso(y, m, 1), iso(y, m + 1, 0)];
    case "last-month": return [iso(y, m - 1, 1), iso(y, m, 0)];
    case "this-quarter": { const q = Math.floor((m - 1) / 3) * 3 + 1; return [iso(y, q, 1), iso(y, q + 3, 0)]; }
    case "last-quarter": { const q = Math.floor((m - 1) / 3) * 3 + 1; return [iso(y, q - 3, 1), iso(y, q, 0)]; }
    case "this-year": return [iso(y, 1, 1), iso(y, 12, 31)];
    case "last-year": return [iso(y - 1, 1, 1), iso(y - 1, 12, 31)];
    default: return ["1900-01-01", "2999-12-31"];
  }
}

/**
 * Profit & loss for a period.
 * Cash basis: money received (payments) minus expenses paid.
 * Sales basis: invoices issued (excl. VAT) minus expenses (excl. VAT).
 */
export function profitAndLoss(invoices: InvoiceLike[], payments: PaymentLike[], expenses: ExpenseLike[], from: string, to: string) {
  const sales = r2(invoices.filter((i) => i.status !== "cancelled" && inRange(i.issue_date, from, to)).reduce((s, i) => s + num(i.amount), 0));
  const received = r2(payments.filter((p) => inRange(p.payment_date, from, to)).reduce((s, p) => s + num(p.amount), 0));
  const exp = expenses.filter((e) => inRange(e.expense_date, from, to));
  const costs = r2(exp.reduce((s, e) => s + num(e.amount), 0));
  const paidOut = r2(exp.filter((e) => e.status !== "unpaid").reduce((s, e) => s + expenseTotal(e), 0));
  return { sales, costs, profit: r2(sales - costs), received, paidOut, cashFlow: r2(received - paidOut) };
}

/** VAT return summary (FTA VAT-201 style): output VAT on sales minus input VAT on purchases. */
export function vatSummary(invoices: InvoiceLike[], expenses: ExpenseLike[], from: string, to: string) {
  const output = r2(invoices.filter((i) => i.status !== "cancelled" && inRange(i.issue_date, from, to)).reduce((s, i) => s + invoiceVat(i), 0));
  const input = r2(expenses.filter((e) => inRange(e.expense_date, from, to)).reduce((s, e) => s + num(e.vat_amount), 0));
  return { output, input, payable: r2(output - input) };
}

/** Unpaid balances grouped by how many days past the due date. */
export function agingBuckets(rows: { balance: number; due_date?: string | null; issue_date: string }[], today = new Date().toISOString().slice(0, 10)) {
  const b = { current: 0, d30: 0, d60: 0, d90: 0, d90plus: 0 };
  const t = Date.parse(today);
  for (const r of rows) {
    if (r.balance <= 0) continue;
    const days = Math.floor((t - Date.parse(r.due_date || r.issue_date)) / 864e5);
    const k = days <= 0 ? "current" : days <= 30 ? "d30" : days <= 60 ? "d60" : days <= 90 ? "d90" : "d90plus";
    b[k] = r2(b[k] + r.balance);
  }
  return b;
}

export type StatementRow = { date: string; ref: string; text: string; debit: number; credit: number; balance: number };

/** Customer ledger: invoices are debits, payments credits, with running balance. */
export function customerStatement(
  invoices: (InvoiceLike & { id: string; invoice_no: string })[],
  payments: (PaymentLike & { receipt_no: string; method?: string })[],
): StatementRow[] {
  const ev = [
    ...invoices.filter((i) => i.status !== "cancelled").map((i) => ({ date: i.issue_date, ref: i.invoice_no, text: "Invoice", debit: invoiceTotal(i), credit: 0 })),
    ...payments.map((p) => ({ date: p.payment_date, ref: p.receipt_no, text: `Payment${p.method ? ` (${p.method})` : ""}`, debit: 0, credit: num(p.amount) })),
  ].sort((a, b) => (a.date === b.date ? b.debit - a.debit : a.date < b.date ? -1 : 1));
  let bal = 0;
  return ev.map((e) => ({ ...e, balance: (bal = r2(bal + e.debit - e.credit)) }));
}

/** Monthly money in / money out for the chart. */
export function monthlyCash(payments: PaymentLike[], expenses: ExpenseLike[]) {
  const out: Record<string, { in: number; out: number }> = {};
  for (const p of payments) { const m = p.payment_date.slice(0, 7); (out[m] ??= { in: 0, out: 0 }).in = r2(out[m].in + num(p.amount)); }
  for (const e of expenses) { if (e.status === "unpaid") continue; const m = e.expense_date.slice(0, 7); (out[m] ??= { in: 0, out: 0 }).out = r2(out[m].out + expenseTotal(e)); }
  return out;
}

/** Next document number, e.g. INV-2026-0007, from the numbers already used. */
export function nextNumber(prefix: string, used: (string | null | undefined)[], year = new Date().getFullYear()) {
  const head = `${prefix}-${year}-`;
  const max = used.reduce((m, u) => (u && u.startsWith(head) ? Math.max(m, Number(u.slice(head.length)) || 0) : m), 0);
  return `${head}${String(max + 1).padStart(4, "0")}`;
}

export const aed = (n: number) => `AED ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
function words(n: number): string {
  if (n < 20) return ones[n] ?? "";
  if (n < 100) return `${tens[Math.floor(n / 10)] ?? ""}${n % 10 ? " " + (ones[n % 10] ?? "") : ""}`;
  if (n < 1000) return `${ones[Math.floor(n / 100)] ?? ""} Hundred${n % 100 ? " " + words(n % 100) : ""}`;
  for (const [v, w] of [[1e9, "Billion"], [1e6, "Million"], [1e3, "Thousand"]] as const)
    if (n >= v) return `${words(Math.floor(n / v))} ${w}${n % v ? " " + words(n % v) : ""}`;
  return "";
}
/** "AED One Thousand Fifty and 25/100 Only" — printed on UAE invoices and cheques. */
export function amountInWords(n: number) {
  const whole = Math.floor(r2(n));
  const fils = Math.round((r2(n) - whole) * 100);
  return `AED ${whole === 0 ? "Zero" : words(whole)}${fils ? ` and ${fils}/100` : ""} Only`;
}
