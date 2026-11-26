-- Orders for PayFast checkout. Written ONLY by Netlify functions using the service_role key (which bypasses RLS).
-- No public policies on purpose: the browser can never read or write orders directly.
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id),
  email text not null,
  first_name text,
  amount_cents integer not null check (amount_cents > 0),
  status text not null default 'pending' check (status in ('pending','paid','failed','cancelled')),
  download_token text not null unique,   -- secret in the buyer's return/download link
  download_count integer not null default 0,
  pf_payment_id text,                    -- PayFast's own payment id, from the ITN
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index orders_book_idx on public.orders (book_id);
create index orders_status_idx on public.orders (status, created_at desc);

alter table public.orders enable row level security;

-- Admin (you, signed in) can read orders, e.g. for a future "Orders" page. Nobody else can.
create policy "admin reads orders" on public.orders for select using (public.is_admin());
