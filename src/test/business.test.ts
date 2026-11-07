import { describe, expect, it } from "vitest";
import { invoiceTotal, isOverdue, monthlyIncome } from "@/lib/business";

describe("invoices", () => {
  it("adds VAT to the amount", () => {
    expect(invoiceTotal({ amount: 1000, vat_percent: 5, status: "unpaid", issue_date: "2026-01-01" })).toBe(1050);
  });
  it("unpaid past due date is overdue, paid is not", () => {
    expect(isOverdue({ amount: 1, vat_percent: 0, status: "unpaid", issue_date: "2026-01-01", due_date: "2026-01-10" }, "2026-02-01")).toBe(true);
    expect(isOverdue({ amount: 1, vat_percent: 0, status: "paid", issue_date: "2026-01-01", due_date: "2026-01-10" }, "2026-02-01")).toBe(false);
  });
  it("monthly income counts only paid invoices", () => {
    const r = monthlyIncome([
      { amount: 100, vat_percent: 5, status: "paid", issue_date: "2026-03-02", paid_date: "2026-04-01" },
      { amount: 500, vat_percent: 5, status: "unpaid", issue_date: "2026-04-02" },
    ]);
    expect(r).toEqual({ "2026-04": 105 });
  });
});
