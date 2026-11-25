-- Abba Grace E-book Store: books, profiles, private storage. Orders/payments come in a later migration.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'customer' check (role in ('admin','customer')),
  created_at timestamptz not null default now()
);

create table public.books (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  author text not null,
  category text not null default 'Devotionals',
  short_description text not null default '',
  description text not null default '',
  cover_path text,            -- file in PUBLIC bucket 'covers'
  file_path text,             -- file in PRIVATE bucket 'book-files'
  price_cents integer not null check (price_cents >= 0),
  sale_price_cents integer check (sale_price_cents >= 0),
  is_published boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index books_published_idx on public.books (is_published, created_at desc);

-- Admin check used by every policy.
create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.books enable row level security;

create policy "own profile readable" on public.profiles for select using (id = auth.uid() or public.is_admin());

-- Public sees published books only. Admin sees and changes everything.
create policy "public reads published books" on public.books for select using (is_published = true);
create policy "admin reads all books" on public.books for select using (public.is_admin());
create policy "admin inserts books" on public.books for insert with check (public.is_admin());
create policy "admin updates books" on public.books for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes books" on public.books for delete using (public.is_admin());

-- Storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('covers', 'covers', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('book-files', 'book-files', false, 104857600, array['application/pdf'])
on conflict (id) do nothing;

-- Covers: anyone can view, only admin can write. Book files: admin only (customers get signed URLs from the server).
create policy "public views covers" on storage.objects for select using (bucket_id = 'covers');
create policy "admin writes covers" on storage.objects for all using (bucket_id = 'covers' and public.is_admin()) with check (bucket_id = 'covers' and public.is_admin());
create policy "admin manages book files" on storage.objects for all using (bucket_id = 'book-files' and public.is_admin()) with check (bucket_id = 'book-files' and public.is_admin());

-- Auto-create a profile row for each new auth user. Role is always 'customer'; promote yourself manually (see README).
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
