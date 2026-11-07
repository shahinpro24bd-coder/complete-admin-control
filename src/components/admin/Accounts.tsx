import { useMemo, useState } from "react";
import {
  aed, agingBuckets, customerStatement, expenseTotal, invoiceTotal, monthlyCash, paymentStatus, periodRange, profitAndLoss, receivedFor, vatSummary,
} from "@/lib/business";
import { printStatement, useSettings } from "@/components/admin/Billing";
import { belongsTo, PeriodSelect, useTable, type Row } from "@/components/admin/shared";

function Card({ label, value, icon, tone = "text-primary", note }: { label: string; value: string; icon: string; tone?: string; note?: string }) {
  return (
    <div className="col-6 col-lg-3">
      <div className="bg-white p-3 shadow-sm h-100">
        <i className={`fa ${icon} ${tone} mb-2`}></i>
        <div className="fs-5 fw-bold">{value}</div>
        <small className="text-muted d-block">{label}</small>
        {note && <small className="text-muted">{note}</small>}
      </div>
    </div>
  );
}

export function Accounts() {
  const inv = useTable("invoices", "issue_date").rows;
  const pay = useTable("payments", "payment_date").rows;
  const exp = useTable("expenses", "expense_date").rows;
  const jobs = useTable("jobs", "scheduled_date").rows;
  const amc = useTable("amc_contracts").rows;
  const customers = useTable("customers").rows;
  const { settings } = useSettings();
  const [period, setPeriod] = useState("this-month");
  const [vatPeriod, setVatPeriod] = useState("this-quarter");
  const [cust, setCust] = useState("");
  const [from, to] = periodRange(period);

  const pl = useMemo(() => profitAndLoss(inv, pay, exp, from, to), [inv, pay, exp, from, to]);
  const [vf, vt] = periodRange(vatPeriod);
  const vat = useMemo(() => vatSummary(inv, exp, vf, vt), [inv, exp, vf, vt]);

  const open = useMemo(() => inv.map((i) => {
    const total = invoiceTotal(i), rec = receivedFor(i.id, pay);
    const st = paymentStatus(total, rec, i.status === "cancelled");
    return { ...i, total, balance: st === "cancelled" ? 0 : Math.max(0, total - rec) };
  }).filter((i) => i.balance > 0.004), [inv, pay]);
  const aging = agingBuckets(open);
  const receivable = open.reduce((s, i) => s + i.balance, 0);
  const payable = exp.filter((e) => e.status === "unpaid").reduce((s, e) => s + expenseTotal(e), 0);

  const debtors = useMemo(() => {
    const m: Record<string, number> = {};
    for (const i of open) m[i.customer_name] = (m[i.customer_name] ?? 0) + i.balance;
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [open]);

  const byCat = useMemo(() => {
    const m: Record<string, number> = {};
    for (const e of exp) if (e.expense_date >= from && e.expense_date <= to) m[e.category] = (m[e.category] ?? 0) + Number(e.amount);
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [exp, from, to]);

  const months = useMemo(() => Object.entries(monthlyCash(pay, exp)).sort().reverse().slice(0, 12), [pay, exp]);
  const maxM = Math.max(1, ...months.flatMap(([, v]) => [v.in, v.out]));

  const jobProfit = useMemo(() => jobs.map((j) => {
    const sales = inv.filter((i) => i.job_id === j.id && i.status !== "cancelled").reduce((s, i) => s + Number(i.amount), 0);
    const cost = exp.filter((e) => e.job_id === j.id).reduce((s, e) => s + Number(e.amount), 0);
    return { ...j, sales, cost, profit: sales - cost };
  }).filter((j) => j.sales || j.cost), [jobs, inv, exp]);

  const soon = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
  const renewals = amc.filter((a) => a.status === "active" && a.end_date && a.end_date <= soon);
  const customer: Row | undefined = customers.find((c) => c.id === cust);
  const statement = customer ? customerStatement(inv.filter((i) => belongsTo(customer, i)), pay.filter((p) => belongsTo(customer, p))) : [];

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <h4 className="m-0 me-auto">Accounts overview</h4>
        <PeriodSelect value={period} onChange={setPeriod} />
        <small className="text-muted">{from === "1900-01-01" ? "All time" : `${from} → ${to}`}</small>
      </div>

      <h6 className="text-muted text-uppercase small">Profit &amp; loss (excl. VAT)</h6>
      <div className="row g-3 mb-4">
        <Card label="Sales invoiced" value={aed(pl.sales)} icon="fa-file-invoice" note="Work billed in this period" />
        <Card label="Expenses" value={aed(pl.costs)} icon="fa-receipt" tone="text-danger" note="Bills & costs in this period" />
        <Card label={pl.profit >= 0 ? "Net profit" : "Net loss"} value={aed(pl.profit)} icon="fa-chart-line" tone={pl.profit >= 0 ? "text-success" : "text-danger"} note="Sales − expenses" />
        <Card label="Profit margin" value={pl.sales ? `${Math.round((pl.profit / pl.sales) * 100)}%` : "—"} icon="fa-percent" />
      </div>

      <h6 className="text-muted text-uppercase small">Cash (incl. VAT)</h6>
      <div className="row g-3 mb-4">
        <Card label="Money received" value={aed(pl.received)} icon="fa-hand-holding-usd" tone="text-success" note="Payments from customers" />
        <Card label="Money paid out" value={aed(pl.paidOut)} icon="fa-money-bill-wave" tone="text-danger" note="Expenses marked paid" />
        <Card label="Net cash flow" value={aed(pl.cashFlow)} icon="fa-wallet" tone={pl.cashFlow >= 0 ? "text-success" : "text-danger"} />
        <Card label="Customers owe you" value={aed(receivable)} icon="fa-hourglass-half" tone="text-warning" note={`You owe suppliers ${aed(payable)}`} />
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="bg-white p-4 shadow-sm h-100">
            <div className="d-flex align-items-center mb-3"><h5 className="m-0 me-auto">VAT return summary</h5><PeriodSelect value={vatPeriod} onChange={setVatPeriod} /></div>
            <table className="table table-sm mb-2">
              <tbody>
                <tr><td>Output VAT (charged on your invoices)</td><td className="text-end">{aed(vat.output)}</td></tr>
                <tr><td>Input VAT (paid on supplier bills)</td><td className="text-end">− {aed(vat.input)}</td></tr>
                <tr className="fw-bold"><td>{vat.payable >= 0 ? "VAT payable to FTA" : "VAT refundable from FTA"}</td><td className="text-end">{aed(Math.abs(vat.payable))}</td></tr>
              </tbody>
            </table>
            <small className="text-muted">UAE VAT returns are usually filed quarterly. Based on invoice dates (cancelled invoices excluded) and VAT entered on expenses.</small>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="bg-white p-4 shadow-sm h-100">
            <h5 className="mb-3">Receivables ageing</h5>
            <table className="table table-sm mb-2">
              <tbody>
                {([["Not yet due", aging.current, ""], ["1–30 days overdue", aging.d30, "text-warning"], ["31–60 days overdue", aging.d60, "text-warning"], ["61–90 days overdue", aging.d90, "text-danger"], ["Over 90 days", aging.d90plus, "text-danger fw-bold"]] as const).map(([l, v, c]) => (
                  <tr key={l}><td>{l}</td><td className={`text-end ${c}`}>{aed(v)}</td></tr>
                ))}
                <tr className="fw-bold"><td>Total outstanding</td><td className="text-end">{aed(receivable)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-7">
          <div className="bg-white p-4 shadow-sm h-100">
            <h5 className="mb-1">Money in vs money out by month</h5>
            <small className="text-muted d-block mb-3"><span className="d-inline-block bg-success me-1" style={{ width: 10, height: 10 }}></span>In <span className="d-inline-block bg-danger ms-3 me-1" style={{ width: 10, height: 10 }}></span>Out</small>
            {months.length === 0 && <p className="text-muted m-0">No payments or expenses yet.</p>}
            {months.map(([m, v]) => (
              <div key={m} className="d-flex align-items-center gap-2 mb-2 small">
                <span style={{ width: 62 }}>{m}</span>
                <div className="flex-grow-1">
                  <div className="bg-success" style={{ height: 9, width: `${(v.in / maxM) * 100}%` }}></div>
                  <div className="bg-danger mt-1" style={{ height: 9, width: `${(v.out / maxM) * 100}%` }}></div>
                </div>
                <span style={{ width: 150 }} className="text-end"><span className="text-success">{aed(v.in)}</span><br /><span className="text-danger">{aed(v.out)}</span></span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-lg-5">
          <div className="bg-white p-4 shadow-sm h-100">
            <h5 className="mb-3">Expenses by category</h5>
            {byCat.length === 0 && <p className="text-muted m-0">No expenses in this period.</p>}
            <table className="table table-sm mb-0"><tbody>{byCat.map(([c, v]) => <tr key={c}><td>{c}</td><td className="text-end">{aed(v)}</td></tr>)}</tbody></table>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-5">
          <div className="bg-white p-4 shadow-sm h-100">
            <h5 className="mb-3">Who owes you most</h5>
            {debtors.length === 0 && <p className="text-muted m-0">Nothing outstanding. 🎉</p>}
            <table className="table table-sm mb-0"><tbody>{debtors.map(([n, v]) => <tr key={n}><td>{n}</td><td className="text-end text-danger">{aed(v)}</td></tr>)}</tbody></table>
            {renewals.length > 0 && <div className="alert alert-warning small mt-3 mb-0"><b>AMC renewals due in 30 days:</b> {renewals.map((a) => `${a.customer_name} (${a.end_date})`).join(", ")}</div>}
          </div>
        </div>
        <div className="col-lg-7">
          <div className="bg-white p-4 shadow-sm h-100">
            <h5 className="mb-3">Job profit</h5>
            <p className="small text-muted">Link invoices and expenses to a job to see what each job really earned.</p>
            {jobProfit.length === 0 && <p className="text-muted m-0">No linked invoices or expenses yet.</p>}
            {jobProfit.length > 0 && (
              <table className="table table-sm mb-0">
                <thead><tr><th>Job</th><th className="text-end">Billed</th><th className="text-end">Cost</th><th className="text-end">Profit</th></tr></thead>
                <tbody>{jobProfit.map((j) => <tr key={j.id}><td>{j.title}<small className="d-block text-muted">{j.customer_name}</small></td><td className="text-end">{aed(j.sales)}</td><td className="text-end">{aed(j.cost)}</td><td className={`text-end fw-bold ${j.profit >= 0 ? "text-success" : "text-danger"}`}>{aed(j.profit)}</td></tr>)}</tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 shadow-sm">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <h5 className="m-0 me-auto">Customer statement</h5>
          <select className="form-select form-select-sm" style={{ width: 260 }} value={cust} onChange={(e) => setCust(e.target.value)} aria-label="Customer">
            <option value="">Choose a customer…</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {customer && <button className="btn btn-sm btn-outline-dark" onClick={() => printStatement(customer, statement, settings)}><i className="fa fa-print me-1"></i>Print</button>}
        </div>
        {customer && (
          <div className="table-responsive">
            <table className="table table-sm small">
              <thead><tr><th>Date</th><th>Ref</th><th>Details</th><th className="text-end">Invoiced</th><th className="text-end">Paid</th><th className="text-end">Balance</th></tr></thead>
              <tbody>
                {statement.length === 0 && <tr><td colSpan={6} className="text-muted">No transactions.</td></tr>}
                {statement.map((r, i) => <tr key={i}><td>{r.date}</td><td>{r.ref}</td><td>{r.text}</td><td className="text-end">{r.debit ? aed(r.debit) : ""}</td><td className="text-end">{r.credit ? aed(r.credit) : ""}</td><td className="text-end fw-bold">{aed(r.balance)}</td></tr>)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
