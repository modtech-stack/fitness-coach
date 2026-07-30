create type public.training_experience_v1_5 as enum (
  'none',
  'under_6_months',
  'six_months_to_two_years',
  'over_two_years'
);

alter table public.profiles
alter column training_experience
type public.training_experience_v1_5
using (
  case training_experience::text
    when 'beginner' then 'under_6_months'
    when 'intermediate' then 'six_months_to_two_years'
    when 'advanced' then 'over_two_years'
  end
)::public.training_experience_v1_5;

drop type public.training_experience;
alter type public.training_experience_v1_5 rename to training_experience;

create type public.activity_level_v1_5 as enum (
  'low',
  'moderate',
  'high'
);

alter table public.profiles
alter column activity_level
type public.activity_level_v1_5
using (
  case activity_level::text
    when 'sedentary' then 'low'
    when 'light' then 'moderate'
    when 'moderate' then 'moderate'
    when 'very_active' then 'high'
  end
)::public.activity_level_v1_5;

drop type public.activity_level;
alter type public.activity_level_v1_5 rename to activity_level;

create type public.constraint_type_v1_5 as enum (
  'pain',
  'injury',
  'health',
  'schedule',
  'equipment',
  'other'
);

alter table public.constraints
alter column type
type public.constraint_type_v1_5
using (
  case type::text
    when 'preference' then 'other'
    else type::text
  end
)::public.constraint_type_v1_5;

drop type public.constraint_type;
alter type public.constraint_type_v1_5 rename to constraint_type;

alter table public.constraints
alter column severity drop not null;

update public.goals
set priority = case when priority = 1 then 1 else 2 end;

with ranked_primary_goals as (
  select
    id,
    row_number() over (
      partition by user_id
      order by created_at, id
    ) as primary_position
  from public.goals
  where priority = 1
    and status = 'active'
)
update public.goals as goals
set priority = 2
from ranked_primary_goals
where goals.id = ranked_primary_goals.id
  and ranked_primary_goals.primary_position > 1;

alter table public.goals
drop constraint goals_priority_check;

alter table public.goals
add constraint goals_priority_check
check (priority in (1, 2));

create unique index goals_one_active_primary_per_user_idx
on public.goals (user_id)
where priority = 1 and status = 'active';

create function public.demote_previous_primary_goal()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.priority = 1 and new.status = 'active' then
    update public.goals
    set priority = 2
    where user_id = new.user_id
      and priority = 1
      and status = 'active'
      and id <> new.id;
  end if;

  return new;
end;
$$;

create trigger goals_demote_previous_primary
before insert or update of user_id, priority, status
on public.goals
for each row execute function public.demote_previous_primary_goal();

grant usage on type public.training_experience to authenticated;
grant usage on type public.activity_level to authenticated;
grant usage on type public.constraint_type to authenticated;

comment on column public.goals.priority is
  '1 is primary, 2 is secondary. At most one active primary goal per user.';

comment on column public.constraints.severity is
  'Reserved for future Training Engine risk assessment; not entered by users.';
