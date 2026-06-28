create extension if not exists "pgcrypto";

create table if not exists public.worldcup2026_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  password_hash text,
  avatar_url text,
  role text not null default 'participant' check (role in ('participant', 'organizer')),
  participant_status text not null default 'pending' check (participant_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.worldcup2026_users
  add column if not exists participant_status text not null default 'pending';

alter table public.worldcup2026_users
  add column if not exists password_hash text;

alter table public.worldcup2026_users
  add column if not exists avatar_url text;

alter table public.worldcup2026_users
  add column if not exists password_reset_requested_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'worldcup2026_users_participant_status_check'
  ) then
    alter table public.worldcup2026_users
      add constraint worldcup2026_users_participant_status_check
      check (participant_status in ('pending', 'approved', 'rejected'));
  end if;
end $$;

update public.worldcup2026_users
set participant_status = 'approved'
where role = 'organizer';

create table if not exists public.worldcup2026_matches (
  id uuid primary key default gen_random_uuid(),
  round_id text not null,
  team_a text not null,
  team_b text not null,
  team_a_flag text,
  team_b_flag text,
  starts_at timestamptz not null,
  vote_ends_at timestamptz not null,
  winner text,
  score_a integer,
  score_b integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.worldcup2026_matches
  add column if not exists team_a_flag text;

alter table public.worldcup2026_matches
  add column if not exists team_b_flag text;

alter table public.worldcup2026_matches
  add column if not exists score_a integer;

alter table public.worldcup2026_matches
  add column if not exists score_b integer;

create table if not exists public.worldcup2026_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.worldcup2026_users(id) on delete cascade,
  match_id uuid not null references public.worldcup2026_matches(id) on delete cascade,
  winner text not null,
  is_joker boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

alter table public.worldcup2026_predictions
  add column if not exists is_joker boolean not null default false;
