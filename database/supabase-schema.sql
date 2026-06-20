create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null,
  avatar_url text,
  favorite_team text,
  followers_count integer not null default 0,
  following_count integer not null default 0,
  correct_predictions integer not null default 0,
  total_predictions integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  official_competition_api_id integer,
  official_competition_name text,
  official_competition_season integer,
  official_competition_logo_url text,
  cover_image_url text,
  is_public boolean not null default true,
  invite_code text unique,
  max_players integer not null default 16,
  starting_round text not null default 'group',
  current_round text not null default 'group',
  start_date date not null,
  has_prizes boolean not null default false,
  is_active boolean not null default false,
  is_draft boolean not null default true,
  setup_incomplete boolean not null default true,
  matches_by_round jsonb not null default '{}'::jsonb,
  round_ids text[] not null default '{}'::text[],
  prizes jsonb not null default '[]'::jsonb,
  award_categories text[] not null default '{}'::text[],
  settings jsonb not null default '{}'::jsonb,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tournaments add column if not exists matches_by_round jsonb not null default '{}'::jsonb;
alter table public.tournaments add column if not exists round_ids text[] not null default '{}'::text[];
alter table public.tournaments add column if not exists prizes jsonb not null default '[]'::jsonb;
alter table public.tournaments add column if not exists award_categories text[] not null default '{}'::text[];
alter table public.tournaments add column if not exists settings jsonb not null default '{}'::jsonb;

create table if not exists public.tournament_participants (
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'player',
  status text not null default 'joined',
  points numeric not null default 0,
  correct_predictions integer not null default 0,
  wrong_predictions integer not null default 0,
  joined_at timestamptz not null default now(),
  primary key (tournament_id, profile_id)
);

create table if not exists public.tournament_round_rules (
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  round_id text not null,
  point_source text not null,
  nomination_type text not null,
  calculation_mode text,
  budget numeric,
  min_points numeric,
  winner_percent numeric,
  loser_percent numeric,
  correct_points numeric,
  wrong_points numeric,
  joker_enabled boolean not null default false,
  joker_uses integer not null default 0,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tournament_id, round_id)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  fixture_id bigint,
  round_id text not null,
  kickoff timestamptz not null,
  home_name text not null,
  away_name text not null,
  home_logo_url text,
  away_logo_url text,
  home_score integer,
  away_score integer,
  status_short text,
  status_long text,
  api_round text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tournament_id, fixture_id)
);

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  round_id text not null,
  outcome text not null,
  points numeric not null default 0,
  joker_used boolean not null default false,
  submitted_at timestamptz not null default now(),
  settled_at timestamptz,
  settlement_points numeric,
  unique (match_id, profile_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  tournament_id uuid references public.tournaments(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  route text,
  unread boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.follows enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_participants enable row level security;
alter table public.tournament_round_rules enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "profiles are readable" on public.profiles;
drop policy if exists "users update own profile" on public.profiles;
drop policy if exists "users insert own profile" on public.profiles;
drop policy if exists "public tournaments are readable" on public.tournaments;
drop policy if exists "owners manage tournaments" on public.tournaments;
drop policy if exists "participants can read participants" on public.tournament_participants;
drop policy if exists "users join as themselves" on public.tournament_participants;
drop policy if exists "users update own participation" on public.tournament_participants;
drop policy if exists "users read own predictions" on public.predictions;
drop policy if exists "users submit own predictions" on public.predictions;
drop policy if exists "users update own predictions before backend lock" on public.predictions;
drop policy if exists "notifications owner read" on public.notifications;
drop policy if exists "notifications owner update" on public.notifications;

create policy "profiles are readable" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "users insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "public tournaments are readable" on public.tournaments for select using (
  is_public = true
  or owner_id = auth.uid()
  or exists (
    select 1
    from public.tournament_participants participant
    where participant.tournament_id = tournaments.id
      and participant.profile_id = auth.uid()
  )
);
create policy "owners manage tournaments" on public.tournaments for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "participants can read participants" on public.tournament_participants for select using (true);
create policy "users join as themselves" on public.tournament_participants for insert with check (profile_id = auth.uid());
create policy "users update own participation" on public.tournament_participants for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "users read own predictions" on public.predictions for select using (profile_id = auth.uid());
create policy "users submit own predictions" on public.predictions for insert with check (profile_id = auth.uid());
create policy "users update own predictions before backend lock" on public.predictions for update using (profile_id = auth.uid());

create policy "notifications owner read" on public.notifications for select using (profile_id = auth.uid());
create policy "notifications owner update" on public.notifications for update using (profile_id = auth.uid());
