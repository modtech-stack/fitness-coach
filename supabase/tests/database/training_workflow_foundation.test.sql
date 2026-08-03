begin;

create extension if not exists pgtap with schema extensions;

select plan(40);

select has_table('public', 'training_programs', 'training programs table exists');
select has_table('public', 'program_phases', 'program phases table exists');
select has_table('public', 'program_weeks', 'program weeks table exists');
select has_table('public', 'planned_workouts', 'planned workouts table exists');
select has_table('public', 'planned_exercises', 'planned exercises table exists');
select has_table('public', 'workout_sessions', 'workout sessions table exists');
select has_table('public', 'actual_sets', 'actual sets table exists');
select has_function('public', 'create_starter_program', 'starter program function exists');
select has_function('public', 'complete_workout', 'complete workout function exists');

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '55555555-5555-4555-8555-555555555555',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'training-user-a@example.test',
    crypt('Password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now()
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'training-user-b@example.test',
    crypt('Password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now()
  );

select is(
  (
    select count(*)::integer
    from auth.users
    where id in (
      '55555555-5555-4555-8555-555555555555',
      '66666666-6666-4666-8666-666666666666'
    )
  ),
  2,
  'two training workflow test users are created'
);

insert into public.profiles (
  user_id,
  name,
  birth_date,
  sex,
  height_cm,
  weight_kg,
  training_experience,
  activity_level,
  onboarding_completed_at
)
values
  (
    '55555555-5555-4555-8555-555555555555',
    'Training User A',
    '1990-01-01',
    'prefer_not_to_say',
    175,
    75,
    'under_6_months',
    'moderate',
    now()
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    'Training User B',
    '1992-02-02',
    'prefer_not_to_say',
    165,
    65,
    'six_months_to_two_years',
    'moderate',
    now()
  );

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"55555555-5555-4555-8555-555555555555","role":"authenticated"}',
  true
);

select lives_ok(
  $$ select public.create_starter_program() $$,
  'user A can add the predefined program'
);

select is(
  (select count(*)::integer from public.training_programs where status = 'active'),
  1,
  'user A has one active program'
);

select is(
  (select count(*)::integer from public.program_phases),
  1,
  'starter program contains one phase'
);

select is(
  (select count(*)::integer from public.program_weeks),
  2,
  'starter program contains two weeks'
);

select is(
  (select count(*)::integer from public.planned_workouts),
  4,
  'starter program contains four planned workouts'
);

select is(
  (select count(*)::integer from public.planned_exercises),
  12,
  'starter program contains twelve planned exercises'
);

select lives_ok(
  $$ select public.create_starter_program() $$,
  'adding the starter program is idempotent'
);

select is(
  (select count(*)::integer from public.training_programs where status = 'active'),
  1,
  'idempotent provisioning does not create a second active program'
);

select is(
  (
    select count(*)::integer
    from public.planned_workouts
    where scheduled_date = current_date
  ),
  1,
  'starter program includes a workout for today'
);

select lives_ok(
  $$
    select public.complete_workout(
      (
        select id
        from public.planned_workouts
        where scheduled_date = current_date
        limit 1
      ),
      'The first manual workout is complete.',
      jsonb_build_array(
        jsonb_build_object(
          'planned_exercise_id', (
            select exercise.id
            from public.planned_exercises as exercise
            join public.planned_workouts as workout
              on workout.id = exercise.planned_workout_id
            where workout.scheduled_date = current_date
            order by exercise.exercise_order
            limit 1
          ),
          'set_number', 1,
          'reps', 10,
          'weight_kg', 12.5,
          'rpe', 6
        )
      )
    )
  $$,
  'user A can atomically complete a workout with an actual set'
);

select is(
  (select count(*)::integer from public.workout_sessions where status = 'completed'),
  1,
  'completed workout session is stored'
);

select is(
  (select count(*)::integer from public.actual_sets),
  1,
  'actual set is stored separately from the plan'
);

select is(
  (select comment from public.workout_sessions limit 1),
  'The first manual workout is complete.',
  'workout comment is stored'
);

select throws_ok(
  $$
    select public.complete_workout(
      (
        select id
        from public.planned_workouts
        where scheduled_date = current_date
        limit 1
      ),
      null,
      jsonb_build_array(
        jsonb_build_object(
          'planned_exercise_id', (
            select exercise.id
            from public.planned_exercises as exercise
            join public.planned_workouts as workout
              on workout.id = exercise.planned_workout_id
            where workout.scheduled_date = current_date
            order by exercise.exercise_order
            limit 1
          ),
          'set_number', 1,
          'reps', 10,
          'weight_kg', 12.5,
          'rpe', 6
        )
      )
    )
  $$,
  '23505',
  'Workout is already completed.',
  'a completed workout cannot be submitted twice'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"66666666-6666-4666-8666-666666666666","role":"authenticated"}',
  true
);

select is(
  (select count(*)::integer from public.training_programs),
  0,
  'user B cannot see user A program'
);

select is(
  (select count(*)::integer from public.workout_sessions),
  0,
  'user B cannot see user A completed workout'
);

select is(
  (select count(*)::integer from public.actual_sets),
  0,
  'user B cannot see user A actual sets'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'public.training_programs',
    'INSERT'
  ),
  'authenticated clients cannot bypass starter program validation'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'public.actual_sets',
    'INSERT'
  ),
  'authenticated clients cannot bypass atomic workout completion'
);

select throws_ok(
  $$
    select public.complete_workout(
      (
        select id
        from public.planned_workouts
        where scheduled_date = current_date
        limit 1
      ),
      null,
      '[]'::jsonb
    )
  $$,
  'P0001',
  'Workout was not found in the active program.',
  'user B cannot complete user A workout'
);

select lives_ok(
  $$ select public.create_starter_program() $$,
  'user B can add their own starter program'
);

select is(
  (select count(*)::integer from public.training_programs),
  1,
  'user B sees one own program'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"55555555-5555-4555-8555-555555555555","role":"authenticated"}',
  true
);

select is(
  (select count(*)::integer from public.training_programs),
  1,
  'user A still sees one own program'
);

select is(
  (
    select count(*)::integer
    from public.training_programs
    where user_id = '66666666-6666-4666-8666-666666666666'
  ),
  0,
  'user A cannot see user B program'
);

select is(
  (select count(*)::integer from public.planned_workouts),
  4,
  'user A cannot see user B planned workouts'
);

select is(
  (select count(*)::integer from public.planned_exercises),
  12,
  'user A cannot see user B planned exercises'
);

set local role postgres;

select lives_ok(
  $$
    delete from auth.users
    where id = '55555555-5555-4555-8555-555555555555'
  $$,
  'deleting user A succeeds'
);

select is(
  (
    select count(*)::integer
    from public.training_programs
    where user_id = '55555555-5555-4555-8555-555555555555'
  ),
  0,
  'account deletion cascades to training programs'
);

select is(
  (
    select count(*)::integer
    from public.workout_sessions
    where user_id = '55555555-5555-4555-8555-555555555555'
  ),
  0,
  'account deletion cascades to workout sessions'
);

select is(
  (
    select count(*)::integer
    from public.actual_sets
    where user_id = '55555555-5555-4555-8555-555555555555'
  ),
  0,
  'account deletion cascades to actual sets'
);

select * from finish();

rollback;
