-- Little Duet: optional accounts + progress sync (Supabase / Postgres).
-- Run in the Supabase SQL editor. Every table has row level security: a signed-in grown-up
-- can only read and write their own rows.
--
-- Child data minimization (COPPA, Apple Kids, Google Families): the child's nickname is
-- NEVER stored here. Children are random ids + age + play mode; names stay on the device.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.children (
  id text primary key check (char_length(id) between 4 and 64),   -- random app-generated id
  user_id uuid not null references auth.users (id) on delete cascade,
  age smallint not null check (age between 2 and 6),
  play_mode text not null default 'real' check (play_mode in ('real', 'screen')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists children_user_idx on public.children (user_id);

create table if not exists public.progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  child_id text not null references public.children (id) on delete cascade,
  class_id text not null,
  position_sec real not null default 0 check (position_sec >= 0),
  completed boolean not null default false,
  stars smallint not null default 0 check (stars between 0 and 3),
  seg_index smallint,
  last_watched_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (child_id, class_id)
);
create index if not exists progress_user_idx on public.progress (user_id);

create table if not exists public.activity_days (
  user_id uuid not null references auth.users (id) on delete cascade,
  child_id text not null references public.children (id) on delete cascade,
  day date not null,
  primary key (child_id, day)
);

alter table public.profiles enable row level security;
alter table public.children enable row level security;
alter table public.progress enable row level security;
alter table public.activity_days enable row level security;

-- profiles: id is the auth user id
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "own children" on public.children;
create policy "own children" on public.children
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- progress rows must belong to the user AND point at one of the user's children
drop policy if exists "own progress" on public.progress;
create policy "own progress" on public.progress
  for all using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.children c where c.id = child_id and c.user_id = auth.uid())
  );

drop policy if exists "own activity" on public.activity_days;
create policy "own activity" on public.activity_days
  for all using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.children c where c.id = child_id and c.user_id = auth.uid())
  );

-- In-app account deletion (Apple 5.1.1(v), Google Data safety). Deleting the auth user
-- cascades to profiles, children, progress and activity_days.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
