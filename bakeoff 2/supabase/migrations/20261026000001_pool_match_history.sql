-- Persist quick pool-play wins separately from bracket matches.
create table if not exists public.match_history (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  division_id uuid not null references public.tournament_divisions(id) on delete cascade,
  winner_team_id uuid references public.teams(id) on delete set null,
  loser_team_id uuid references public.teams(id) on delete set null,
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists match_history_tournament_id_idx on public.match_history(tournament_id);
create index if not exists match_history_division_id_idx on public.match_history(division_id);

alter table public.match_history enable row level security;
drop policy if exists match_history_owner_all on public.match_history;
create policy match_history_owner_all on public.match_history
  for all using (public.user_owns_tournament(tournament_id))
  with check (public.user_owns_tournament(tournament_id));

grant select, insert, update, delete on public.match_history to authenticated;
