
drop view if exists public.leaderboard;
create view public.leaderboard
  with (security_invoker = true) as
  select id, display_name, avatar_url, total_xp, current_level
  from public.profiles
  order by total_xp desc;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin new.updated_at = now(); return new; end;
$$;
