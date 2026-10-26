-- PicklePlay Bakeoff 2 database foundation.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organizer_name text not null default 'Tournament Organizer',
  default_division text not null default 'girls' check (default_division in ('girls','boys','mixed')),
  default_courts integer not null default 2 check (default_courts > 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null, tournament_date date not null, venue text not null,
  courts integer not null default 2 check (courts > 0),
  status text not null default 'draft' check (status in ('draft','live','paused','complete')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.tournament_divisions (
  id uuid primary key default gen_random_uuid(), tournament_id uuid not null references public.tournaments(id) on delete cascade,
  code text not null check (code in ('girls','boys','mixed')), label text not null, short_label text not null, color text not null,
  created_at timestamptz not null default now(), unique (tournament_id, code)
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(), tournament_id uuid not null references public.tournaments(id) on delete cascade,
  division_id uuid not null references public.tournament_divisions(id) on delete cascade, name text not null,
  seed integer not null default 1 check (seed > 0), wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0), points integer not null default 0 check (points >= 0),
  streak text not null default '—', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (division_id, name)
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(), tournament_id uuid not null references public.tournaments(id) on delete cascade,
  name text not null, created_at timestamptz not null default now(), unique (tournament_id, name)
);

create table if not exists public.team_players (
  team_id uuid not null references public.teams(id) on delete cascade, player_id uuid not null references public.players(id) on delete cascade,
  player_order integer not null check (player_order in (1,2)), primary key (team_id, player_id), unique (team_id, player_order)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(), tournament_id uuid not null references public.tournaments(id) on delete cascade,
  division_id uuid not null references public.tournament_divisions(id) on delete cascade,
  round text not null check (round in ('semifinal','final')), bracket_slot integer not null check (bracket_slot > 0),
  team_a_id uuid references public.teams(id) on delete set null, team_b_id uuid references public.teams(id) on delete set null,
  score_a integer check (score_a is null or score_a >= 0), score_b integer check (score_b is null or score_b >= 0),
  winner_team_id uuid references public.teams(id) on delete set null,
  status text not null default 'upcoming' check (status in ('upcoming','live','completed')),
  court integer check (court is null or court > 0), scheduled_at timestamptz,
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (tournament_id, division_id, round, bracket_slot), check (score_a is null or score_b is null or score_a <> score_b)
);

create index if not exists tournaments_owner_id_idx on public.tournaments(owner_id);
create index if not exists divisions_tournament_id_idx on public.tournament_divisions(tournament_id);
create index if not exists teams_division_id_idx on public.teams(division_id);
create index if not exists matches_tournament_id_idx on public.matches(tournament_id);
create index if not exists matches_division_id_idx on public.matches(division_id);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists tournaments_set_updated_at on public.tournaments;
create trigger tournaments_set_updated_at before update on public.tournaments for each row execute function public.set_updated_at();
drop trigger if exists teams_set_updated_at on public.teams;
create trigger teams_set_updated_at before update on public.teams for each row execute function public.set_updated_at();
drop trigger if exists matches_set_updated_at on public.matches;
create trigger matches_set_updated_at before update on public.matches for each row execute function public.set_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, organizer_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'full_name',''), 'Tournament Organizer'))
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.user_owns_tournament(target_tournament_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.tournaments where id = target_tournament_id and owner_id = auth.uid());
$$;

alter table public.profiles enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_divisions enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.team_players enable row level security;
alter table public.matches enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select using (id = auth.uid());
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert with check (id = auth.uid());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists tournaments_owner_all on public.tournaments;
create policy tournaments_owner_all on public.tournaments for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists divisions_owner_all on public.tournament_divisions;
create policy divisions_owner_all on public.tournament_divisions for all using (public.user_owns_tournament(tournament_id)) with check (public.user_owns_tournament(tournament_id));
drop policy if exists teams_owner_all on public.teams;
create policy teams_owner_all on public.teams for all using (public.user_owns_tournament(tournament_id)) with check (public.user_owns_tournament(tournament_id));
drop policy if exists players_owner_all on public.players;
create policy players_owner_all on public.players for all using (public.user_owns_tournament(tournament_id)) with check (public.user_owns_tournament(tournament_id));
drop policy if exists team_players_owner_all on public.team_players;
create policy team_players_owner_all on public.team_players for all using (exists (select 1 from public.teams t where t.id = team_id and public.user_owns_tournament(t.tournament_id))) with check (exists (select 1 from public.teams t where t.id = team_id and public.user_owns_tournament(t.tournament_id)));
drop policy if exists matches_owner_all on public.matches;
create policy matches_owner_all on public.matches for all using (public.user_owns_tournament(tournament_id)) with check (public.user_owns_tournament(tournament_id));

insert into public.profiles (id) select id from auth.users on conflict (id) do nothing;

-- The app only accesses these tables after authentication; RLS remains the data boundary.
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles, public.tournaments, public.tournament_divisions, public.teams, public.players, public.team_players, public.matches to authenticated;
grant usage, select on all sequences in schema public to authenticated;
