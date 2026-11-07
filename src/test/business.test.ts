import { describe, expect, it } from "vitest";
import {
  agingBuckets, amountInWords, customerStatement, docTotals, invoiceTotal, isOverdue, nextNumber,
  paymentStatus, periodRange, profitAndLoss, vatSummary,
} from "@/lib/business";

describe("invoice totals", () => {
  it("adds 5% VAT to the amount", () => {
    expect(invoiceTotal({ amount: 1000, vat_percent: 5, status: "unpaid", issue_date: "2026-01-01" })).toBe(1050);
  });
  it("line items: qty x rate, discount before VAT", () => {
    const t = docTotals([{ description: "AC service", qty: 3, rate: 150 }, { description: "Gas top-up", qty: 1, rate: 250 }], 100, 5);
    expect(t).toEqual({ subtotal: 700, discount: 100, taxable: 600, vat: 30, total: 630 });
  });
  it("discount can't exceed subtotal", () => {
    expect(docTotals([{ description: "x", qty: 1, rate: 50 }], 80, 5).total).toBe(0);
  });
});

describe("payments", () => {
  it("status follows money received", () => {
    expect(paymentStatus(1050, 0)).toBe("unpaid");
    expect(paymentStatus(1050, 500)).toBe("partial");
    expect(paymentStatus(1050, 1050)).toBe("paid");
    expect(paymentStatus(1050, 500, true)).toBe("cancelled");
  });
  it("unpaid past due date is overdue, paid is not", () => {
    expect(isOverdue({ amount: 1, vat_percent: 0, status: "unpaid", issue_date: "2026-01-01", due_date: "2026-01-10" }, "2026-02-01")).toBe(true);
    expect(isOverdue({ amount: 1, vat_percent: 0, status: "paid", issue_date: "2026-01-01", due_date: "2026-01-10" }, "2026-02-01")).toBe(false);
  });
  it("ageing buckets by days past due", () => {
    const b = agingBuckets([
      { balance: 100, issue_date: "2026-03-01", due_date: "2026-04-10" },
      { balance: 200, issue_date: "2026-02-01", due_date: "2026-03-20" },
      { balance: 300, issue_date: "2025-12-01", due_date: "2025-12-15" },
    ], "2026-04-01");
    expect(b).toEqual({ current: 100, d30: 200, d60: 0, d90: 0, d90plus: 300 });
  });
});

describe("reports", () => {
  const inv = [
    { amount: 1000, vat_percent: 5, status: "paid", issue_date: "2026-03-05" },
    { amount: 2000, vat_percent: 5, status: "cancelled", issue_date: "2026-03-06" },
    { amount: 400, vat_percent: 5, status: "unpaid", issue_date: "2026-04-01" },
  ];
  const pay = [{ amount: 1050, payment_date: "2026-03-20" }];
  const exp = [
    { expense_date: "2026-03-10", amount: 300, vat_amount: 15, status: "paid" },
    { expense_date: "2026-03-11", amount: 100, vat_amount: 0, status: "unpaid" },
  ];
  it("profit & loss for March ignores cancelled invoices", () => {
    expect(profitAndLoss(inv, pay, exp, "2026-03-01", "2026-03-31")).toEqual({ sales: 1000, costs: 400, profit: 600, received: 1050, paidOut: 315, cashFlow: 735 });
  });
  it("VAT payable = output VAT - input VAT", () => {
    expect(vatSummary(inv, exp, "2026-03-01", "2026-03-31")).toEqual({ output: 50, input: 15, payable: 35 });
  });
  it("quarter ranges", () => {
    expect(periodRange("this-quarter", "2026-05-15")).toEqual(["2026-04-01", "2026-06-30"]);
    expect(periodRange("last-quarter", "2026-02-10")).toEqual(["2025-10-01", "2025-12-31"]);
    expect(periodRange("last-month", "2026-01-15")).toEqual(["2025-12-01", "2025-12-31"]);
  });
  it("customer statement running balance", () => {
    const s = customerStatement(
      [{ id: "a", invoice_no: "INV-1", amount: 1000, vat_percent: 5, status: "unpaid", issue_date: "2026-03-01" }],
      [{ receipt_no: "RCT-1", amount: 500, payment_date: "2026-03-10" }],
    );
    expect(s.map((r) => r.balance)).toEqual([1050, 550]);
  });
  it("document numbers continue from the highest used", () => {
    expect(nextNumber("INV", ["INV-2026-0003", "INV-2026-0010", "INV-2025-0099"], 2026)).toBe("INV-2026-0011");
    expect(nextNumber("QT", [], 2026)).toBe("QT-2026-0001");
  });
  it("amount in words", () => {
    expect(amountInWords(1050.25)).toBe("AED One Thousand Fifty and 25/100 Only");
  });
});
