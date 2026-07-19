-- Friends-only migration: disciplinary warnings and point deductions.

create table if not exists public.worldcup2026friends_disciplinary_actions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.worldcup2026friends_users(id) on delete cascade,
  action_key text unique,
  action_type text not null default 'warning' check (action_type in ('warning', 'penalty')),
  title text not null default 'إنذار إداري',
  points_deducted numeric not null default 0,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.worldcup2026friends_disciplinary_actions
  add column if not exists action_key text unique;

alter table public.worldcup2026friends_disciplinary_actions
  add column if not exists points_deducted numeric not null default 0;

alter table public.worldcup2026friends_disciplinary_actions
  add column if not exists title text not null default 'إنذار إداري';

alter table public.worldcup2026friends_disciplinary_actions
  add column if not exists reason text;

alter table public.worldcup2026friends_disciplinary_actions disable row level security;
alter table public.worldcup2026friends_disciplinary_actions no force row level security;

grant all on table public.worldcup2026friends_disciplinary_actions to anon;
grant all on table public.worldcup2026friends_disciplinary_actions to authenticated;
grant all on table public.worldcup2026friends_disciplinary_actions to service_role;

insert into public.worldcup2026friends_disciplinary_actions (
  participant_id,
  action_key,
  action_type,
  title,
  points_deducted,
  reason
)
select
  u.id,
  'omar_abdullah_warning_200_20260719',
  'warning',
  'إنذار إداري',
  200,
  'إنذار إداري وخصم 200 نقطة'
from public.worldcup2026friends_users u
where u.role = 'participant'
  and regexp_replace(u.name, '\s+', '', 'g') like '%عمرعبدالله%'
on conflict (action_key) do update
set
  participant_id = excluded.participant_id,
  action_type = excluded.action_type,
  title = excluded.title,
  points_deducted = excluded.points_deducted,
  reason = excluded.reason,
  updated_at = now();

notify pgrst, 'reload schema';
select 'worldCup2026Friends_disciplinary_actions_ready' as status;
