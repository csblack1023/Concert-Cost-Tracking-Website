-- USD only: drop multi-currency settings; remove hours at event

drop table if exists public.user_settings;

alter table public.concerts drop column if exists currency;
alter table public.concerts drop column if exists hours_at_event;
