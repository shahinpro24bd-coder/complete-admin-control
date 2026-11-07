-- Link records to customers and add itemised billing
ALTER TABLE public.invoices
  ADD COLUMN customer_id uuid,
  ADD COLUMN job_id uuid,
  ADD COLUMN contract_id uuid,
  ADD COLUMN items jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN discount numeric NOT NULL DEFAULT 0,
  ADD COLUMN customer_trn text,
  ADD COLUMN customer_address text,
  ADD COLUMN lpo_no text;

ALTER TABLE public.jobs ADD COLUMN customer_id uuid;
ALTER TABLE public.amc_contracts ADD COLUMN customer_id uuid, ADD COLUMN billing text NOT NULL DEFAULT 'yearly';
ALTER TABLE public.customers ADD COLUMN trn text;

CREATE TABLE public.quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_no text NOT NULL,
  customer_id uuid,
  customer_name text NOT NULL,
  customer_trn text,
  customer_address text,
  issue_date date NOT NULL DEFAULT current_date,
  valid_until date,
  subject text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  discount numeric NOT NULL DEFAULT 0,
  vat_percent numeric NOT NULL DEFAULT 5,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  invoice_id uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotations TO authenticated;
GRANT ALL ON public.quotations TO service_role;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all" ON public.quotations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_no text NOT NULL,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
  customer_id uuid,
  customer_name text NOT NULL,
  payment_date date NOT NULL DEFAULT current_date,
  amount numeric NOT NULL CHECK (amount > 0),
  method text NOT NULL DEFAULT 'cash',
  reference text,
  cheque_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all" ON public.payments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date date NOT NULL DEFAULT current_date,
  category text NOT NULL DEFAULT 'Materials & spare parts',
  supplier text,
  bill_no text,
  description text,
  amount numeric NOT NULL DEFAULT 0,
  vat_amount numeric NOT NULL DEFAULT 0,
  method text NOT NULL DEFAULT 'cash',
  status text NOT NULL DEFAULT 'paid',
  job_id uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all" ON public.expenses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.business_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_settings TO authenticated;
GRANT ALL ON public.business_settings TO service_role;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all" ON public.business_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));