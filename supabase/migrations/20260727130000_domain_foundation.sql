create type public.profile_sex as enum (
  'female',
  'male',
  'other',
  'prefer_not_to_say'
);

create type public.training_experience as enum (
  'beginner',
  'intermediate',
  'advanced'
);

create type public.activity_level as enum (
  'sedentary',
  'light',
  'moderate',
  'very_active'
);

create type public.goal_type as enum (
  'weight_loss',
  'muscle_gain',
  'recomposition',
  'endurance',
  'general_fitness'
);

create type public.goal_status as enum (
  'active',
  'paused',
  'completed'
);

create type public.constraint_type as enum (
  'health',
  'injury',
  'schedule',
  'equipment',
  'preference',
  'other'
);

create type public.constraint_severity as enum (
  'low',
  'medium',
  'high'
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 80),
  birth_date date not null,
  sex public.profile_sex not null,
  height_cm numeric(5, 2) not null check (height_cm between 100 and 250),
  weight_kg numeric(6, 2) not null check (weight_kg between 30 and 400),
  training_experience public.training_experience not null,
  activity_level public.activity_level not null,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  goal_type public.goal_type not null,
  description text not null check (char_length(trim(description)) between 3 and 500),
  priority smallint not null check (priority between 1 and 5),
  status public.goal_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.constraints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type public.constraint_type not null,
  description text not null check (char_length(trim(description)) between 3 and 500),
  severity public.constraint_severity not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index goals_user_id_idx on public.goals (user_id);
create index constraints_user_id_idx on public.constraints (user_id);

create function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger goals_set_updated_at
before update on public.goals
for each row execute function public.set_updated_at();

create trigger constraints_set_updated_at
before update on public.constraints
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.constraints enable row level security;

revoke all on public.profiles from anon;
revoke all on public.goals from anon;
revoke all on public.constraints from anon;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.goals to authenticated;
grant select, insert, update, delete on public.constraints to authenticated;

grant usage on type public.profile_sex to authenticated;
grant usage on type public.training_experience to authenticated;
grant usage on type public.activity_level to authenticated;
grant usage on type public.goal_type to authenticated;
grant usage on type public.goal_status to authenticated;
grant usage on type public.constraint_type to authenticated;
grant usage on type public.constraint_severity to authenticated;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "profiles_delete_own"
on public.profiles
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "goals_select_own"
on public.goals
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "goals_insert_own"
on public.goals
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "goals_update_own"
on public.goals
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "goals_delete_own"
on public.goals
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "constraints_select_own"
on public.constraints
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "constraints_insert_own"
on public.constraints
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "constraints_update_own"
on public.constraints
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "constraints_delete_own"
on public.constraints
for delete
to authenticated
using ((select auth.uid()) = user_id);

comment on table public.profiles is
  'One onboarding profile per authenticated user.';

comment on table public.goals is
  'Prioritized user-owned fitness goals.';

comment on table public.constraints is
  'User-owned limits and preferences used by future planning features.';
