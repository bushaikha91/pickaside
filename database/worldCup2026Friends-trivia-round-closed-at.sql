-- Friends-only migration: close trivia rounds for participation without removing scored results.

alter table public.worldcup2026friends_trivia_rounds
  add column if not exists closed_at timestamptz;

notify pgrst, 'reload schema';
select 'worldCup2026Friends_trivia_round_closed_at_ready' as status;
