create table if not exists public.worldcup2026friends_admin_decisions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  details text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.worldcup2026friends_admin_decisions no force row level security;
alter table public.worldcup2026friends_admin_decisions disable row level security;

drop policy if exists worldcup2026friends_admin_decisions_anon_all on public.worldcup2026friends_admin_decisions;
drop policy if exists worldcup2026friends_admin_decisions_authenticated_all on public.worldcup2026friends_admin_decisions;

create policy worldcup2026friends_admin_decisions_anon_all
  on public.worldcup2026friends_admin_decisions
  for all
  to anon
  using (true)
  with check (true);

create policy worldcup2026friends_admin_decisions_authenticated_all
  on public.worldcup2026friends_admin_decisions
  for all
  to authenticated
  using (true)
  with check (true);

grant all on table public.worldcup2026friends_admin_decisions to anon;
grant all on table public.worldcup2026friends_admin_decisions to authenticated;
grant all on table public.worldcup2026friends_admin_decisions to service_role;

notify pgrst, 'reload schema';

select 'friends_admin_decisions_rls_fixed' as status;
