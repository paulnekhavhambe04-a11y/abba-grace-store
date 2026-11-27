-- Availability status for each book. Digital product, so no stock counts.
alter table public.books add column if not exists availability text not null default 'available'
  check (availability in ('available','unavailable','coming_soon'));
