
-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  email text,
  total_xp integer not null default 0,
  current_level text not null default 'easy',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Badges catalog
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text not null,
  icon text not null,
  created_at timestamptz not null default now()
);
alter table public.badges enable row level security;
create policy "Badges viewable by everyone"
  on public.badges for select using (true);

-- User badges
create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);
alter table public.user_badges enable row level security;
create policy "User badges viewable by everyone"
  on public.user_badges for select using (true);
create policy "Users can earn own badges"
  on public.user_badges for insert with check (auth.uid() = user_id);

-- Level completions
create table public.level_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  level text not null check (level in ('easy','medium','hard')),
  score integer not null default 0,
  xp_earned integer not null default 0,
  questions_total integer not null default 0,
  questions_correct integer not null default 0,
  completed_at timestamptz not null default now()
);
alter table public.level_completions enable row level security;
create policy "Completions viewable by everyone"
  on public.level_completions for select using (true);
create policy "Users insert own completions"
  on public.level_completions for insert with check (auth.uid() = user_id);

-- Auto-create profile trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Seed badges
insert into public.badges (code, name, description, icon) values
  ('first_steps','First Steps','Completed your first quiz','🎯'),
  ('easy_master','Easy Master','Conquered the Easy level','🥉'),
  ('medium_master','Medium Master','Conquered the Medium level','🥈'),
  ('hard_master','Hard Master','Conquered the Hard level','🥇'),
  ('perfectionist','Perfectionist','Got a perfect score on any level','💎'),
  ('champion','English Champion','Completed all three levels','👑');

-- Leaderboard view
create or replace view public.leaderboard as
  select id, display_name, avatar_url, total_xp, current_level
  from public.profiles
  order by total_xp desc;
