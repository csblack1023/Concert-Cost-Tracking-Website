-- Currency preference, per-concert currency, and multiple ticket groups

-- User-level default currency
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  preferred_currency text not null default 'USD'
    check (preferred_currency in ('USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'MXN', 'NZD', 'SEK')),
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

drop policy if exists "Users manage own settings" on public.user_settings;
create policy "Users manage own settings"
  on public.user_settings
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Per-concert currency (snapshot at time of entry)
alter table public.concerts
  add column if not exists currency text not null default 'USD'
    check (currency in ('USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'MXN', 'NZD', 'SEK'));

-- Multiple ticket types per concert (quantity must be a whole number)
create table if not exists public.concert_ticket_groups (
  id uuid primary key default gen_random_uuid(),
  concert_id uuid not null references public.concerts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  label text,
  cost_per_ticket numeric(10, 2) not null default 0 check (cost_per_ticket >= 0),
  quantity integer not null default 1 check (quantity >= 1),
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists concert_ticket_groups_concert_id_idx
  on public.concert_ticket_groups (concert_id);

alter table public.concert_ticket_groups enable row level security;

drop policy if exists "Users view own ticket groups" on public.concert_ticket_groups;
create policy "Users view own ticket groups"
  on public.concert_ticket_groups
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users insert own ticket groups" on public.concert_ticket_groups;
create policy "Users insert own ticket groups"
  on public.concert_ticket_groups
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users update own ticket groups" on public.concert_ticket_groups;
create policy "Users update own ticket groups"
  on public.concert_ticket_groups
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own ticket groups" on public.concert_ticket_groups;
create policy "Users delete own ticket groups"
  on public.concert_ticket_groups
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Allow users to update their own concerts (for edit form)
drop policy if exists "Users can update own concerts" on public.concerts;
create policy "Users can update own concerts"
  on public.concerts
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
