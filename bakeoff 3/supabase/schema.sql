-- FryRank database schema

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  website_url text,
  logo_url text,
  city text,
  state text,
  created_at timestamptz not null default now()
);

create table if not exists public.fries (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  style text,
  price numeric(8, 2),
  image_url text,
  image_source_url text,
  image_credit text,
  location_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  fry_id uuid not null references public.fries(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score integer not null check (score between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (fry_id, user_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  fry_id uuid not null references public.fries(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fries_restaurant_id_idx on public.fries(restaurant_id);
create index if not exists ratings_fry_id_idx on public.ratings(fry_id);
create index if not exists comments_fry_id_idx on public.comments(fry_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ratings_set_updated_at on public.ratings;
create trigger ratings_set_updated_at
before update on public.ratings
for each row execute function public.set_updated_at();

drop trigger if exists comments_set_updated_at on public.comments;
create trigger comments_set_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    split_part(new.email, '@', 1),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.fries enable row level security;
alter table public.ratings enable row level security;
alter table public.comments enable row level security;

drop policy if exists "Public profiles are readable" on public.profiles;
create policy "Public profiles are readable"
on public.profiles for select
using (true);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Public restaurants are readable" on public.restaurants;
create policy "Public restaurants are readable"
on public.restaurants for select
using (true);

drop policy if exists "Public fries are readable" on public.fries;
create policy "Public fries are readable"
on public.fries for select
using (true);

drop policy if exists "Public ratings are readable" on public.ratings;
create policy "Public ratings are readable"
on public.ratings for select
using (true);

drop policy if exists "Users can create their own ratings" on public.ratings;
create policy "Users can create their own ratings"
on public.ratings for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own ratings" on public.ratings;
create policy "Users can update their own ratings"
on public.ratings for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own ratings" on public.ratings;
create policy "Users can delete their own ratings"
on public.ratings for delete
using (auth.uid() = user_id);

drop policy if exists "Public comments are readable" on public.comments;
create policy "Public comments are readable"
on public.comments for select
using (true);

drop policy if exists "Users can create their own comments" on public.comments;
create policy "Users can create their own comments"
on public.comments for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own comments" on public.comments;
create policy "Users can update their own comments"
on public.comments for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own comments" on public.comments;
create policy "Users can delete their own comments"
on public.comments for delete
using (auth.uid() = user_id);

insert into public.restaurants (name, slug) values
  ('McDonald''s', 'mcdonalds'),
  ('Burger King', 'burger-king'),
  ('Wendy''s', 'wendys'),
  ('Chick-fil-A', 'chick-fil-a'),
  ('Five Guys', 'five-guys'),
  ('In-N-Out Burger', 'in-n-out'),
  ('Shake Shack', 'shake-shack'),
  ('Arby''s', 'arbys'),
  ('Popeyes', 'popeyes'),
  ('Jack in the Box', 'jack-in-the-box'),
  ('Whataburger', 'whataburger'),
  ('Sonic Drive-In', 'sonic'),
  ('Dairy Queen', 'dairy-queen'),
  ('Culver''s', 'culvers'),
  ('Checkers / Rally''s', 'checkers-rallys'),
  ('Carl''s Jr.', 'carls-jr'),
  ('Raising Cane''s', 'raising-canes'),
  ('Del Taco', 'del-taco'),
  ('KFC', 'kfc')
on conflict (slug) do nothing;

insert into public.fries (restaurant_id, name, slug, style, image_url)
select r.id, v.name, v.slug, v.style, v.image_url
from (values
  ('mcdonalds', 'World Famous Fries', 'world-famous-fries', 'Shoestring', '/images/fries/mcdonalds.png'),
  ('burger-king', 'French Fries', 'burger-king-fries', 'Classic cut', '/images/fries/burger-king.png'),
  ('wendys', 'Natural-Cut Fries', 'wendys-fries', 'Skin-on', '/images/fries/wendys.png'),
  ('chick-fil-a', 'Waffle Potato Fries', 'chick-fil-a-fries', 'Waffle', '/images/fries/chick-fil-a.png'),
  ('five-guys', 'Five Guys Style Fries', 'five-guys-fries', 'Boardwalk', '/images/fries/five-guys.png'),
  ('in-n-out', 'Natural Cut Fries', 'in-n-out-fries', 'Fresh cut', '/images/fries/in-n-out.png'),
  ('shake-shack', 'Crinkle Cut Fries', 'shake-shack-fries', 'Crinkle cut', '/images/fries/shake-shack.png'),
  ('arbys', 'Curly Fries', 'arbys-curly-fries', 'Curly', '/images/fries/arbys.png'),
  ('popeyes', 'Cajun Fries', 'popeyes-fries', 'Seasoned', '/images/fries/popeyes.png'),
  ('jack-in-the-box', 'Natural-Cut Fries', 'jack-in-the-box-fries', 'Classic cut', '/images/fries/jack-in-the-box.png'),
  ('whataburger', 'French Fries', 'whataburger-fries', 'Classic cut', '/images/fries/whataburger.png'),
  ('sonic', 'Natural-Cut Fries', 'sonic-fries', 'Classic cut', '/images/fries/sonic.png'),
  ('dairy-queen', 'Regular Fries', 'dairy-queen-fries', 'Classic cut', '/images/fries/dairy-queen.png'),
  ('culvers', 'Crinkle Cut Fries', 'culvers-fries', 'Crinkle cut', '/images/fries/culvers.png'),
  ('checkers-rallys', 'Famous Seasoned Fries', 'checkers-rallys-fries', 'Seasoned', '/images/fries/checkers-rallys.png'),
  ('carls-jr', 'Natural-Cut Fries', 'carls-jr-fries', 'Natural cut', '/images/fries/carls-jr.png'),
  ('raising-canes', 'Crinkle-Cut Fries', 'raising-canes-fries', 'Crinkle cut', '/images/fries/raising-canes.png'),
  ('del-taco', 'Seasoned Fries', 'del-taco-fries', 'Seasoned', '/images/fries/del-taco.png'),
  ('kfc', 'Secret Recipe Fries', 'kfc-fries', 'Seasoned', '/images/fries/kfc.png')
) as v(restaurant_slug, name, slug, style, image_url)
join public.restaurants r on r.slug = v.restaurant_slug
on conflict (slug) do nothing;
