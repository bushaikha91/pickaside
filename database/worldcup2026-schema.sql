create extension if not exists "pgcrypto";

create table if not exists public.worldcup2026_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  role text not null default 'participant' check (role in ('participant', 'organizer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.worldcup2026_matches (
  id uuid primary key default gen_random_uuid(),
  round_id text not null,
  team_a text not null,
  team_b text not null,
  starts_at timestamptz not null,
  vote_ends_at timestamptz not null,
  winner text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.worldcup2026_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.worldcup2026_users(id) on delete cascade,
  match_id uuid not null references public.worldcup2026_matches(id) on delete cascade,
  winner text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);
