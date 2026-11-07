import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = supabase as any;
export const today = () => new Date().toISOString().slice(0, 10);

export function useTable(table: string, order = "created_at") {
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);
  const load = async () => {
    const { data, error } = await db.from(table).select("*").order(order, { ascending: false });
    if (error) toast.error(error.message); else setRows(data ?? []);
    setLoaded(true);
  };
  useEffect(() => { load(); }, [table]);
  return { rows, load, loaded };
}

/** Finds the saved customer for a typed name (case-insensitive). */
export const matchCustomer = (name: string | null | undefined, customers: Row[]) =>
  customers.find((c) => c.name?.trim().toLowerCase() === String(name ?? "").trim().toLowerCase());

/** True when a record (invoice, payment…) belongs to this customer. */
export const belongsTo = (c: Row, r: Row) =>
  r.customer_id === c.id || (!r.customer_id && r.customer_name?.trim().toLowerCase() === c.name?.trim().toLowerCase());

export function CustomerList({ customers }: { customers: Row[] }) {
  return <datalist id="cust-list">{customers.map((c) => <option key={c.id} value={c.name}>{c.company ?? ""}</option>)}</datalist>;
}

export const pill = (s: string, map: Record<string, string>) => <span className={`badge bg-${map[s] ?? "secondary"} text-capitalize`}>{s}</span>;

export const periods: [string, string][] = [["this-month", "This month"], ["last-month", "Last month"], ["this-quarter", "This quarter"], ["last-quarter", "Last quarter"], ["this-year", "This year"], ["last-year", "Last year"], ["all", "All time"]];
export function PeriodSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <select className="form-select form-select-sm" style={{ width: 160 }} value={value} onChange={(e) => onChange(e.target.value)} aria-label="Period">{periods.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>;
}
