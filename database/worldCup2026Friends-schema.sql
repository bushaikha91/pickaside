create extension if not exists "pgcrypto";

create table if not exists public.worldcup2026friends_users (
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

alter table public.worldcup2026friends_users
  add column if not exists participant_status text not null default 'pending';

alter table public.worldcup2026friends_users
  add column if not exists password_hash text;

alter table public.worldcup2026friends_users
  add column if not exists avatar_url text;

alter table public.worldcup2026friends_users
  add column if not exists password_reset_requested_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'worldcup2026friends_users_participant_status_check'
  ) then
    alter table public.worldcup2026friends_users
      add constraint worldcup2026friends_users_participant_status_check
      check (participant_status in ('pending', 'approved', 'rejected'));
  end if;
end $$;

update public.worldcup2026friends_users
set participant_status = 'approved'
where role = 'organizer';

create table if not exists public.worldcup2026friends_matches (
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

alter table public.worldcup2026friends_matches
  add column if not exists team_a_flag text;

alter table public.worldcup2026friends_matches
  add column if not exists team_b_flag text;

alter table public.worldcup2026friends_matches
  add column if not exists score_a integer;

alter table public.worldcup2026friends_matches
  add column if not exists score_b integer;

create table if not exists public.worldcup2026friends_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.worldcup2026friends_users(id) on delete cascade,
  match_id uuid not null references public.worldcup2026friends_matches(id) on delete cascade,
  winner text not null,
  is_joker boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

alter table public.worldcup2026friends_predictions
  add column if not exists is_joker boolean not null default false;

revoke insert, update, delete on table public.worldcup2026friends_predictions from anon;
revoke insert, update, delete on table public.worldcup2026friends_predictions from authenticated;
grant select on table public.worldcup2026friends_predictions to anon;
grant select on table public.worldcup2026friends_predictions to authenticated;
grant all on table public.worldcup2026friends_predictions to service_role;

create table if not exists public.worldcup2026friends_champion_options (
  id uuid primary key default gen_random_uuid(),
  option_type text not null check (option_type in ('team', 'scorer')),
  name text not null,
  created_at timestamptz not null default now(),
  unique (option_type, name)
);

create table if not exists public.worldcup2026friends_champion_picks (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.worldcup2026friends_users(id) on delete cascade,
  champion_team text,
  top_scorer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (participant_id)
);

alter table public.worldcup2026friends_users disable row level security;
alter table public.worldcup2026friends_matches disable row level security;
alter table public.worldcup2026friends_predictions disable row level security;
alter table public.worldcup2026friends_champion_options disable row level security;
alter table public.worldcup2026friends_champion_picks disable row level security;

grant all on table public.worldcup2026friends_users to anon;
grant all on table public.worldcup2026friends_matches to anon;
grant all on table public.worldcup2026friends_predictions to anon;
grant all on table public.worldcup2026friends_champion_options to anon;
grant all on table public.worldcup2026friends_champion_picks to anon;

grant all on table public.worldcup2026friends_users to authenticated;
grant all on table public.worldcup2026friends_matches to authenticated;
grant all on table public.worldcup2026friends_predictions to authenticated;
grant all on table public.worldcup2026friends_champion_options to authenticated;
grant all on table public.worldcup2026friends_champion_picks to authenticated;

grant all on table public.worldcup2026friends_users to service_role;
grant all on table public.worldcup2026friends_matches to service_role;
grant all on table public.worldcup2026friends_predictions to service_role;
grant all on table public.worldcup2026friends_champion_options to service_role;
grant all on table public.worldcup2026friends_champion_picks to service_role;

create table if not exists public.worldcup2026friends_trivia_questions (
  id uuid primary key default gen_random_uuid(),
  round_id text not null,
  question_text text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option text not null check (correct_option in ('a', 'b', 'c', 'd')),
  points integer not null default 10,
  time_limit_seconds integer not null default 20,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.worldcup2026friends_trivia_questions
  add column if not exists time_limit_seconds integer not null default 20;

create table if not exists public.worldcup2026friends_trivia_assignments (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.worldcup2026friends_users(id) on delete cascade,
  question_id uuid not null references public.worldcup2026friends_trivia_questions(id) on delete cascade,
  round_id text not null,
  started_at timestamptz,
  answered_at timestamptz,
  selected_option text check (selected_option in ('a', 'b', 'c', 'd')),
  is_correct boolean,
  points_awarded integer not null default 0,
  created_at timestamptz not null default now(),
  unique (participant_id, question_id)
);

alter table public.worldcup2026friends_trivia_questions disable row level security;
alter table public.worldcup2026friends_trivia_assignments disable row level security;

grant all on table public.worldcup2026friends_trivia_questions to anon;
grant all on table public.worldcup2026friends_trivia_assignments to anon;
grant all on table public.worldcup2026friends_trivia_questions to authenticated;
grant all on table public.worldcup2026friends_trivia_assignments to authenticated;
grant all on table public.worldcup2026friends_trivia_questions to service_role;
grant all on table public.worldcup2026friends_trivia_assignments to service_role;
