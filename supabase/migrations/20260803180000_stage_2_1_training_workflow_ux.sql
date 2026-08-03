alter table public.planned_workouts
add column updated_at timestamptz not null default now();

alter table public.planned_exercises
add column updated_at timestamptz not null default now();

create trigger planned_workouts_set_updated_at
before update on public.planned_workouts
for each row execute function public.set_updated_at();

create trigger planned_exercises_set_updated_at
before update on public.planned_exercises
for each row execute function public.set_updated_at();

create table public.user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  page_url text not null check (char_length(page_url) between 1 and 500),
  message text not null check (char_length(trim(message)) between 3 and 2000),
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

create index user_feedback_user_created_idx
on public.user_feedback (user_id, created_at desc);

alter table public.user_feedback enable row level security;

revoke all on public.user_feedback from anon, authenticated;

create policy "user_feedback_own_rows"
on public.user_feedback for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create function public.update_training_program(
  p_program_id uuid,
  p_name text,
  p_start_date date,
  p_week_count integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_program public.training_programs%rowtype;
  v_phase public.program_phases%rowtype;
  v_current_week_count integer;
  v_date_shift integer;
  v_week_number integer;
  v_new_end_date date;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = '28000';
  end if;

  if p_program_id is null
    or p_name is null
    or char_length(trim(p_name)) not between 3 and 120
    or p_start_date is null
    or p_week_count is null
    or p_week_count not between 1 and 52 then
    raise exception 'Program values are invalid.' using errcode = '22023';
  end if;

  select * into v_program
  from public.training_programs
  where id = p_program_id
    and user_id = v_user_id
    and status = 'active'
  for update;

  if not found then
    raise exception 'Active program was not found.' using errcode = '42501';
  end if;

  if (
    select count(*)
    from public.program_phases
    where program_id = v_program.id
      and user_id = v_user_id
  ) <> 1 then
    raise exception 'Stage 2.1 can edit programs with one phase only.' using errcode = 'P0001';
  end if;

  select * into v_phase
  from public.program_phases
  where program_id = v_program.id
    and user_id = v_user_id
  for update;

  select count(*)::integer into v_current_week_count
  from public.program_weeks
  where phase_id = v_phase.id
    and user_id = v_user_id;

  if v_current_week_count = 0 then
    raise exception 'Program does not contain weeks.' using errcode = 'P0001';
  end if;

  if p_start_date <> v_program.start_date
    and exists (
      select 1
      from public.workout_sessions as session
      join public.planned_workouts as workout
        on workout.id = session.planned_workout_id
        and workout.user_id = session.user_id
      join public.program_weeks as week
        on week.id = workout.week_id
        and week.user_id = workout.user_id
      where week.phase_id = v_phase.id
        and session.user_id = v_user_id
    ) then
    raise exception 'Completed workout dates cannot be moved.' using errcode = 'P0001';
  end if;

  if p_week_count < v_current_week_count
    and exists (
      select 1
      from public.workout_sessions as session
      join public.planned_workouts as workout
        on workout.id = session.planned_workout_id
        and workout.user_id = session.user_id
      join public.program_weeks as week
        on week.id = workout.week_id
        and week.user_id = workout.user_id
      where week.phase_id = v_phase.id
        and week.week_number > p_week_count
        and session.user_id = v_user_id
    ) then
    raise exception 'Weeks with completed workouts cannot be removed.' using errcode = 'P0001';
  end if;

  v_date_shift := p_start_date - v_program.start_date;
  v_new_end_date := p_start_date + (p_week_count * 7 - 1);

  if v_date_shift <> 0 then
    update public.planned_workouts as workout
    set scheduled_date = workout.scheduled_date + v_date_shift
    from public.program_weeks as week
    where workout.week_id = week.id
      and workout.user_id = v_user_id
      and week.user_id = v_user_id
      and week.phase_id = v_phase.id;
  end if;

  if p_week_count < v_current_week_count then
    delete from public.program_weeks
    where phase_id = v_phase.id
      and user_id = v_user_id
      and week_number > p_week_count;
  elsif p_week_count > v_current_week_count then
    for v_week_number in (v_current_week_count + 1)..p_week_count loop
      insert into public.program_weeks (
        user_id,
        phase_id,
        week_number,
        start_date,
        end_date
      ) values (
        v_user_id,
        v_phase.id,
        v_week_number,
        p_start_date + ((v_week_number - 1) * 7),
        p_start_date + ((v_week_number - 1) * 7) + 6
      );
    end loop;
  end if;

  update public.program_weeks
  set
    start_date = p_start_date + ((week_number - 1) * 7),
    end_date = p_start_date + ((week_number - 1) * 7) + 6
  where phase_id = v_phase.id
    and user_id = v_user_id;

  update public.program_phases
  set
    start_date = p_start_date,
    end_date = v_new_end_date
  where id = v_phase.id
    and user_id = v_user_id;

  update public.training_programs
  set
    name = trim(p_name),
    start_date = p_start_date,
    end_date = v_new_end_date
  where id = v_program.id
    and user_id = v_user_id;
end;
$$;

create function public.update_planned_workout(
  p_planned_workout_id uuid,
  p_instructions text,
  p_exercises jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_expected_count integer;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = '28000';
  end if;

  if p_planned_workout_id is null
    or p_instructions is null
    or char_length(trim(p_instructions)) not between 3 and 1000
    or p_exercises is null
    or jsonb_typeof(p_exercises) <> 'array'
    or jsonb_array_length(p_exercises) not between 1 and 50 then
    raise exception 'Workout values are invalid.' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.planned_workouts as workout
    join public.program_weeks as week
      on week.id = workout.week_id and week.user_id = workout.user_id
    join public.program_phases as phase
      on phase.id = week.phase_id and phase.user_id = week.user_id
    join public.training_programs as program
      on program.id = phase.program_id and program.user_id = phase.user_id
    where workout.id = p_planned_workout_id
      and workout.user_id = v_user_id
      and program.status = 'active'
  ) then
    raise exception 'Workout was not found in the active program.' using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.workout_sessions
    where planned_workout_id = p_planned_workout_id
      and user_id = v_user_id
  ) then
    raise exception 'Completed workout cannot be edited.' using errcode = 'P0001';
  end if;

  select count(*)::integer into v_expected_count
  from public.planned_exercises
  where planned_workout_id = p_planned_workout_id
    and user_id = v_user_id;

  if jsonb_array_length(p_exercises) <> v_expected_count
    or exists (
      select 1
      from jsonb_to_recordset(p_exercises) as item(
        id uuid,
        name text,
        planned_sets integer,
        planned_reps text,
        target_weight_kg numeric,
        target_rpe numeric,
        notes text
      )
      where item.id is null
        or item.name is null
        or char_length(trim(item.name)) not between 2 and 120
        or item.planned_sets is null
        or item.planned_sets not between 1 and 20
        or item.planned_reps is null
        or char_length(trim(item.planned_reps)) not between 1 and 40
        or (item.target_weight_kg is not null and item.target_weight_kg not between 0 and 1000)
        or (item.target_rpe is not null and item.target_rpe not between 1 and 10)
        or (item.notes is not null and char_length(trim(item.notes)) not between 1 and 500)
    )
    or exists (
      select 1
      from jsonb_to_recordset(p_exercises) as item(id uuid)
      group by item.id
      having count(*) > 1
    )
    or exists (
      select 1
      from jsonb_to_recordset(p_exercises) as item(id uuid)
      left join public.planned_exercises as exercise
        on exercise.id = item.id
        and exercise.planned_workout_id = p_planned_workout_id
        and exercise.user_id = v_user_id
      where exercise.id is null
    ) then
    raise exception 'Exercise values are invalid.' using errcode = '22023';
  end if;

  update public.planned_workouts
  set instructions = trim(p_instructions)
  where id = p_planned_workout_id
    and user_id = v_user_id;

  update public.planned_exercises as exercise
  set
    name = trim(item.name),
    planned_sets = item.planned_sets,
    planned_reps = trim(item.planned_reps),
    target_weight_kg = item.target_weight_kg,
    target_rpe = item.target_rpe,
    notes = nullif(trim(item.notes), '')
  from jsonb_to_recordset(p_exercises) as item(
    id uuid,
    name text,
    planned_sets integer,
    planned_reps text,
    target_weight_kg numeric,
    target_rpe numeric,
    notes text
  )
  where exercise.id = item.id
    and exercise.planned_workout_id = p_planned_workout_id
    and exercise.user_id = v_user_id;
end;
$$;

create function public.submit_product_feedback(
  p_page_url text,
  p_message text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_feedback_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = '28000';
  end if;

  if p_page_url is null
    or char_length(p_page_url) not between 1 and 500
    or left(p_page_url, 1) <> '/'
    or left(p_page_url, 2) = '//'
    or position('://' in p_page_url) > 0
    or p_page_url ~ '[[:cntrl:]]'
    or p_message is null
    or char_length(trim(p_message)) not between 3 and 2000 then
    raise exception 'Feedback values are invalid.' using errcode = '22023';
  end if;

  insert into public.user_feedback (user_id, page_url, message)
  values (v_user_id, p_page_url, trim(p_message))
  returning id into v_feedback_id;

  return v_feedback_id;
end;
$$;

revoke all on function public.update_training_program(uuid, text, date, integer)
from public, anon;
revoke all on function public.update_planned_workout(uuid, text, jsonb)
from public, anon;
revoke all on function public.submit_product_feedback(text, text)
from public, anon;

grant execute on function public.update_training_program(uuid, text, date, integer)
to authenticated;
grant execute on function public.update_planned_workout(uuid, text, jsonb)
to authenticated;
grant execute on function public.submit_product_feedback(text, text)
to authenticated;

comment on table public.user_feedback is
  'Append-only product feedback with the authenticated user and internal page URL.';

comment on function public.update_training_program(uuid, text, date, integer) is
  'Edits active Stage 2.1 program metadata and week boundaries without regenerating workouts.';

comment on function public.update_planned_workout(uuid, text, jsonb) is
  'Edits a planned workout only while no immutable workout session exists.';
