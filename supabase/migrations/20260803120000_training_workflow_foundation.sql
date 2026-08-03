create type public.training_program_status as enum (
  'draft',
  'under_review',
  'approved',
  'active',
  'needs_adjustment',
  'completed',
  'archived'
);

create type public.workout_session_status as enum (
  'in_progress',
  'completed'
);

create table public.training_programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 3 and 120),
  description text not null check (char_length(trim(description)) between 3 and 1000),
  status public.training_program_status not null default 'draft',
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  check (end_date >= start_date)
);

create table public.program_phases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  program_id uuid not null,
  name text not null check (char_length(trim(name)) between 3 and 120),
  description text not null check (char_length(trim(description)) between 3 and 500),
  phase_number smallint not null check (phase_number between 1 and 52),
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  unique (program_id, phase_number),
  foreign key (program_id, user_id)
    references public.training_programs (id, user_id)
    on delete cascade,
  check (end_date >= start_date)
);

create table public.program_weeks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  phase_id uuid not null,
  week_number smallint not null check (week_number between 1 and 104),
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  unique (phase_id, week_number),
  foreign key (phase_id, user_id)
    references public.program_phases (id, user_id)
    on delete cascade,
  check (end_date >= start_date)
);

create table public.planned_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_id uuid not null,
  name text not null check (char_length(trim(name)) between 3 and 120),
  focus text not null check (char_length(trim(focus)) between 3 and 240),
  instructions text not null check (char_length(trim(instructions)) between 3 and 1000),
  scheduled_date date not null,
  estimated_minutes smallint not null check (estimated_minutes between 5 and 300),
  workout_order smallint not null check (workout_order between 1 and 14),
  created_at timestamptz not null default now(),
  unique (id, user_id),
  unique (week_id, workout_order),
  foreign key (week_id, user_id)
    references public.program_weeks (id, user_id)
    on delete cascade
);

create table public.planned_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  planned_workout_id uuid not null,
  name text not null check (char_length(trim(name)) between 2 and 120),
  planned_sets smallint not null check (planned_sets between 1 and 20),
  planned_reps text not null check (char_length(trim(planned_reps)) between 1 and 40),
  target_weight_kg numeric(6, 2) check (target_weight_kg between 0 and 1000),
  target_rpe numeric(3, 1) check (target_rpe between 1 and 10),
  notes text check (notes is null or char_length(trim(notes)) between 1 and 500),
  exercise_order smallint not null check (exercise_order between 1 and 50),
  created_at timestamptz not null default now(),
  unique (id, planned_workout_id, user_id),
  unique (planned_workout_id, exercise_order),
  foreign key (planned_workout_id, user_id)
    references public.planned_workouts (id, user_id)
    on delete cascade
);

create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  planned_workout_id uuid not null,
  status public.workout_session_status not null default 'in_progress',
  comment text check (comment is null or char_length(trim(comment)) between 1 and 1000),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, planned_workout_id, user_id),
  unique (planned_workout_id, user_id),
  foreign key (planned_workout_id, user_id)
    references public.planned_workouts (id, user_id)
    on delete cascade,
  check (
    (status = 'in_progress' and completed_at is null)
    or (status = 'completed' and completed_at is not null)
  )
);

create table public.actual_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workout_session_id uuid not null,
  planned_workout_id uuid not null,
  planned_exercise_id uuid not null,
  set_number smallint not null check (set_number between 1 and 20),
  reps smallint not null check (reps between 1 and 1000),
  weight_kg numeric(6, 2) check (weight_kg between 0 and 1000),
  rpe numeric(3, 1) not null check (rpe between 1 and 10),
  created_at timestamptz not null default now(),
  unique (workout_session_id, planned_exercise_id, set_number),
  foreign key (workout_session_id, planned_workout_id, user_id)
    references public.workout_sessions (id, planned_workout_id, user_id)
    on delete cascade,
  foreign key (planned_exercise_id, planned_workout_id, user_id)
    references public.planned_exercises (id, planned_workout_id, user_id)
    on delete restrict
);

create unique index training_programs_one_active_per_user_idx
on public.training_programs (user_id)
where status = 'active';

create index program_phases_program_id_idx
on public.program_phases (program_id);

create index program_weeks_phase_id_idx
on public.program_weeks (phase_id);

create index planned_workouts_user_date_idx
on public.planned_workouts (user_id, scheduled_date);

create index planned_exercises_workout_id_idx
on public.planned_exercises (planned_workout_id, exercise_order);

create index workout_sessions_user_completed_idx
on public.workout_sessions (user_id, completed_at desc)
where status = 'completed';

create index actual_sets_session_id_idx
on public.actual_sets (workout_session_id, planned_exercise_id, set_number);

create trigger training_programs_set_updated_at
before update on public.training_programs
for each row execute function public.set_updated_at();

create trigger workout_sessions_set_updated_at
before update on public.workout_sessions
for each row execute function public.set_updated_at();

alter table public.training_programs enable row level security;
alter table public.program_phases enable row level security;
alter table public.program_weeks enable row level security;
alter table public.planned_workouts enable row level security;
alter table public.planned_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.actual_sets enable row level security;

revoke all on public.training_programs from anon;
revoke all on public.program_phases from anon;
revoke all on public.program_weeks from anon;
revoke all on public.planned_workouts from anon;
revoke all on public.planned_exercises from anon;
revoke all on public.workout_sessions from anon;
revoke all on public.actual_sets from anon;

revoke all on public.training_programs from authenticated;
revoke all on public.program_phases from authenticated;
revoke all on public.program_weeks from authenticated;
revoke all on public.planned_workouts from authenticated;
revoke all on public.planned_exercises from authenticated;
revoke all on public.workout_sessions from authenticated;
revoke all on public.actual_sets from authenticated;

grant select on public.training_programs to authenticated;
grant select on public.program_phases to authenticated;
grant select on public.program_weeks to authenticated;
grant select on public.planned_workouts to authenticated;
grant select on public.planned_exercises to authenticated;
grant select on public.workout_sessions to authenticated;
grant select on public.actual_sets to authenticated;

grant usage on type public.training_program_status to authenticated;
grant usage on type public.workout_session_status to authenticated;

create policy "training_programs_own_rows"
on public.training_programs for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "program_phases_own_rows"
on public.program_phases for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "program_weeks_own_rows"
on public.program_weeks for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "planned_workouts_own_rows"
on public.planned_workouts for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "planned_exercises_own_rows"
on public.planned_exercises for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "workout_sessions_own_rows"
on public.workout_sessions for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "actual_sets_own_rows"
on public.actual_sets for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create function public.create_starter_program()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_program_id uuid;
  v_phase_id uuid;
  v_week_one_id uuid;
  v_week_two_id uuid;
  v_workout_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = '28000';
  end if;

  if not exists (
    select 1
    from public.profiles
    where user_id = v_user_id
      and onboarding_completed_at is not null
  ) then
    raise exception 'Complete onboarding before adding a program.' using errcode = 'P0001';
  end if;

  select id into v_program_id
  from public.training_programs
  where user_id = v_user_id
    and status = 'active'
  limit 1;

  if v_program_id is not null then
    return v_program_id;
  end if;

  begin
    insert into public.training_programs (
      user_id,
      name,
      description,
      status,
      start_date,
      end_date
    ) values (
      v_user_id,
      'Базовый тренировочный цикл',
      'Две недели полнотелых тренировок для проверки ручного цикла выполнения.',
      'active',
      current_date,
      current_date + 13
    ) returning id into v_program_id;
  exception
    when unique_violation then
      select id into v_program_id
      from public.training_programs
      where user_id = v_user_id
        and status = 'active'
      limit 1;

      if v_program_id is null then
        raise;
      end if;

      return v_program_id;
  end;

  insert into public.program_phases (
    user_id,
    program_id,
    name,
    description,
    phase_number,
    start_date,
    end_date
  ) values (
    v_user_id,
    v_program_id,
    'Базовая адаптация',
    'Стабильная техника и умеренная субъективная нагрузка.',
    1,
    current_date,
    current_date + 13
  ) returning id into v_phase_id;

  insert into public.program_weeks (
    user_id, phase_id, week_number, start_date, end_date
  ) values (
    v_user_id, v_phase_id, 1, current_date, current_date + 6
  ) returning id into v_week_one_id;

  insert into public.program_weeks (
    user_id, phase_id, week_number, start_date, end_date
  ) values (
    v_user_id, v_phase_id, 2, current_date + 7, current_date + 13
  ) returning id into v_week_two_id;

  insert into public.planned_workouts (
    user_id, week_id, name, focus, instructions,
    scheduled_date, estimated_minutes, workout_order
  ) values (
    v_user_id, v_week_one_id, 'Тренировка A',
    'Базовые движения всего тела',
    'Начните с лёгкой разминки. Выбирайте вес, при котором сохраняется техника.',
    current_date, 45, 1
  ) returning id into v_workout_id;

  insert into public.planned_exercises (
    user_id, planned_workout_id, name, planned_sets, planned_reps,
    target_rpe, notes, exercise_order
  ) values
    (v_user_id, v_workout_id, 'Приседание с гантелью', 3, '10', 6, 'Спокойный темп.', 1),
    (v_user_id, v_workout_id, 'Отжимания от опоры', 3, '8–12', 6, 'Выберите устойчивую высоту опоры.', 2),
    (v_user_id, v_workout_id, 'Тяга гантели в наклоне', 3, '10 на сторону', 6, 'Без рывков.', 3);

  insert into public.planned_workouts (
    user_id, week_id, name, focus, instructions,
    scheduled_date, estimated_minutes, workout_order
  ) values (
    v_user_id, v_week_one_id, 'Тренировка B',
    'Задняя цепь, плечевой пояс и ноги',
    'Выполняйте подходы без отказа и остановитесь, если техника ухудшается.',
    current_date + 3, 45, 2
  ) returning id into v_workout_id;

  insert into public.planned_exercises (
    user_id, planned_workout_id, name, planned_sets, planned_reps,
    target_rpe, notes, exercise_order
  ) values
    (v_user_id, v_workout_id, 'Румынская тяга с гантелями', 3, '10', 6, 'Спина остаётся нейтральной.', 1),
    (v_user_id, v_workout_id, 'Жим гантелей стоя', 3, '8–10', 6, 'Не отклоняйте корпус.', 2),
    (v_user_id, v_workout_id, 'Выпад назад', 3, '8 на сторону', 6, 'Двигайтесь в комфортной амплитуде.', 3);

  insert into public.planned_workouts (
    user_id, week_id, name, focus, instructions,
    scheduled_date, estimated_minutes, workout_order
  ) values (
    v_user_id, v_week_two_id, 'Тренировка A',
    'Повторение базовых движений всего тела',
    'Сохраните тот же вес или повысьте его только при уверенной технике.',
    current_date + 7, 45, 1
  ) returning id into v_workout_id;

  insert into public.planned_exercises (
    user_id, planned_workout_id, name, planned_sets, planned_reps,
    target_rpe, notes, exercise_order
  ) values
    (v_user_id, v_workout_id, 'Приседание с гантелью', 3, '10', 7, 'Спокойный темп.', 1),
    (v_user_id, v_workout_id, 'Отжимания от опоры', 3, '8–12', 7, 'Выберите устойчивую высоту опоры.', 2),
    (v_user_id, v_workout_id, 'Тяга гантели в наклоне', 3, '10 на сторону', 7, 'Без рывков.', 3);

  insert into public.planned_workouts (
    user_id, week_id, name, focus, instructions,
    scheduled_date, estimated_minutes, workout_order
  ) values (
    v_user_id, v_week_two_id, 'Тренировка B',
    'Повторение работы на заднюю цепь, плечи и ноги',
    'Сравните RPE с прошлой неделей и не добавляйте нагрузку автоматически.',
    current_date + 10, 45, 2
  ) returning id into v_workout_id;

  insert into public.planned_exercises (
    user_id, planned_workout_id, name, planned_sets, planned_reps,
    target_rpe, notes, exercise_order
  ) values
    (v_user_id, v_workout_id, 'Румынская тяга с гантелями', 3, '10', 7, 'Спина остаётся нейтральной.', 1),
    (v_user_id, v_workout_id, 'Жим гантелей стоя', 3, '8–10', 7, 'Не отклоняйте корпус.', 2),
    (v_user_id, v_workout_id, 'Выпад назад', 3, '8 на сторону', 7, 'Двигайтесь в комфортной амплитуде.', 3);

  return v_program_id;
end;
$$;

create function public.complete_workout(
  p_planned_workout_id uuid,
  p_comment text,
  p_sets jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_session_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = '28000';
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
    raise exception 'Workout was not found in the active program.' using errcode = 'P0001';
  end if;

  if p_comment is not null and char_length(trim(p_comment)) > 1000 then
    raise exception 'Comment is too long.' using errcode = '22001';
  end if;

  if p_sets is null or jsonb_typeof(p_sets) <> 'array' then
    raise exception 'Actual sets must be an array.' using errcode = '22023';
  end if;

  if jsonb_array_length(p_sets) = 0
    or jsonb_array_length(p_sets) > 100 then
    raise exception 'At least one actual set is required.' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_sets) as actual(
      planned_exercise_id uuid,
      set_number integer,
      reps integer,
      weight_kg numeric,
      rpe numeric
    )
    where actual.planned_exercise_id is null
      or actual.set_number is null
      or actual.set_number not between 1 and 20
      or actual.reps is null
      or actual.reps not between 1 and 1000
      or (actual.weight_kg is not null and actual.weight_kg not between 0 and 1000)
      or actual.rpe is null
      or actual.rpe not between 1 and 10
  ) then
    raise exception 'Actual set values are invalid.' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_sets) as actual(
      planned_exercise_id uuid,
      set_number integer,
      reps integer,
      weight_kg numeric,
      rpe numeric
    )
    group by actual.planned_exercise_id, actual.set_number
    having count(*) > 1
  ) then
    raise exception 'Actual sets contain duplicates.' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_sets) as actual(
      planned_exercise_id uuid,
      set_number integer,
      reps integer,
      weight_kg numeric,
      rpe numeric
    )
    left join public.planned_exercises as exercise
      on exercise.id = actual.planned_exercise_id
      and exercise.planned_workout_id = p_planned_workout_id
      and exercise.user_id = v_user_id
    where exercise.id is null
  ) then
    raise exception 'Actual set does not belong to this workout.' using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.workout_sessions
    where planned_workout_id = p_planned_workout_id
      and user_id = v_user_id
  ) then
    raise exception 'Workout is already completed.' using errcode = '23505';
  end if;

  insert into public.workout_sessions (
    user_id,
    planned_workout_id,
    status,
    comment,
    completed_at
  ) values (
    v_user_id,
    p_planned_workout_id,
    'completed',
    nullif(trim(p_comment), ''),
    now()
  ) returning id into v_session_id;

  insert into public.actual_sets (
    user_id,
    workout_session_id,
    planned_workout_id,
    planned_exercise_id,
    set_number,
    reps,
    weight_kg,
    rpe
  )
  select
    v_user_id,
    v_session_id,
    p_planned_workout_id,
    actual.planned_exercise_id,
    actual.set_number,
    actual.reps,
    actual.weight_kg,
    actual.rpe
  from jsonb_to_recordset(p_sets) as actual(
    planned_exercise_id uuid,
    set_number integer,
    reps integer,
    weight_kg numeric,
    rpe numeric
  );

  return v_session_id;
end;
$$;

revoke all on function public.create_starter_program() from public, anon;
revoke all on function public.complete_workout(uuid, text, jsonb) from public, anon;

grant execute on function public.create_starter_program() to authenticated;
grant execute on function public.complete_workout(uuid, text, jsonb) to authenticated;

comment on table public.training_programs is
  'User-owned training programs. Stage 2 provisions a predefined active program without AI.';

comment on table public.workout_sessions is
  'Actual workout completion records, stored separately from the planned workout.';

comment on table public.actual_sets is
  'Actual repetitions, weight, and RPE for each completed exercise set.';
