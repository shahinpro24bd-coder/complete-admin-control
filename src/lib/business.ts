export type InvoiceLike = { amount: number | string | null; vat_percent: number | string | null; status: string; issue_date: string; paid_date?: string | null; due_date?: string | null };

export const invoiceTotal = (i: InvoiceLike) => {
  const amt = Number(i.amount) || 0;
  const vat = Number(i.vat_percent) || 0;
  return Math.round(amt * (1 + vat / 100) * 100) / 100;
};

export const isOverdue = (i: InvoiceLike, today = new Date().toISOString().slice(0, 10)) =>
  i.status !== "paid" && !!i.due_date && i.due_date < today;

/** Paid income grouped by YYYY-MM (paid date, falling back to issue date). */
export function monthlyIncome(list: InvoiceLike[]) {
  const out: Record<string, number> = {};
  for (const i of list) {
    if (i.status !== "paid") continue;
    const m = (i.paid_date || i.issue_date).slice(0, 7);
    out[m] = Math.round(((out[m] ?? 0) + invoiceTotal(i)) * 100) / 100;
  }
  return out;
}

export const aed = (n: number) => `AED ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
