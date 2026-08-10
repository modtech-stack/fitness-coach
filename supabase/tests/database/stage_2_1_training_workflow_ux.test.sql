begin;

create extension if not exists pgtap with schema extensions;

select plan(27);

select has_table('public', 'user_feedback', 'feedback table exists');
select has_column('public', 'planned_workouts', 'updated_at', 'planned workouts track updates');
select has_column('public', 'planned_exercises', 'updated_at', 'planned exercises track updates');
select has_function('public', 'update_training_program', 'program update function exists');
select has_function('public', 'update_planned_workout', 'workout update function exists');
select has_function('public', 'submit_product_feedback', 'feedback function exists');

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  (
    '77777777-7777-4777-8777-777777777777',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'stage-2-1-a@example.test',
    crypt('Password123', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now()
  ),
  (
    '88888888-8888-4888-8888-888888888888',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'stage-2-1-b@example.test',
    crypt('Password123', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now()
  );

insert into public.profiles (
  user_id, name, birth_date, sex, height_cm, weight_kg,
  training_experience, activity_level, onboarding_completed_at
)
values
  (
    '77777777-7777-4777-8777-777777777777', 'Stage 2.1 A', '1990-01-01',
    'prefer_not_to_say', 175, 75, 'under_6_months', 'moderate', now()
  ),
  (
    '88888888-8888-4888-8888-888888888888', 'Stage 2.1 B', '1992-02-02',
    'prefer_not_to_say', 165, 65, 'six_months_to_two_years', 'moderate', now()
  );

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"77777777-7777-4777-8777-777777777777","role":"authenticated"}',
  true
);

select lives_ok(
  $$ select public.create_starter_program() $$,
  'user A creates the starter program'
);

select set_config(
  'test.program_id',
  (select id::text from public.training_programs where status = 'active'),
  true
);

select lives_ok(
  $$
    select public.update_training_program(
      (select id from public.training_programs where status = 'active'),
      'Мой понятный цикл',
      current_date,
      3
    )
  $$,
  'user A edits program name and duration'
);

select is(
  (select name from public.training_programs where status = 'active'),
  'Мой понятный цикл',
  'program name is updated'
);

select is(
  (select count(*)::integer from public.program_weeks),
  3,
  'program duration contains three weeks'
);

select is(
  (
    select end_date - start_date + 1
    from public.training_programs
    where status = 'active'
  ),
  21,
  'program duration is derived from week count'
);

select is(
  (
    select count(*)::integer
    from public.planned_workouts as workout
    join public.program_weeks as week on week.id = workout.week_id
    where week.week_number = 3
  ),
  0,
  'new week is empty and workouts are not generated automatically'
);

select lives_ok(
  $$
    select public.update_planned_workout(
      (select id from public.planned_workouts where scheduled_date = current_date),
      'Только рабочие подходы и спокойная техника.',
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', exercise.id,
            'name', case when exercise.exercise_order = 1 then 'Приседание с длинным названием' else exercise.name end,
            'planned_sets', exercise.planned_sets,
            'planned_reps', exercise.planned_reps,
            'target_weight_kg', case when exercise.exercise_order = 1 then 40 else exercise.target_weight_kg end,
            'target_rpe', 7,
            'notes', coalesce(exercise.notes, 'Рабочий комментарий')
          ) order by exercise.exercise_order
        )
        from public.planned_exercises as exercise
        join public.planned_workouts as workout
          on workout.id = exercise.planned_workout_id
        where workout.scheduled_date = current_date
      )
    )
  $$,
  'user A edits an uncompleted planned workout'
);

select is(
  (
    select target_weight_kg
    from public.planned_exercises as exercise
    join public.planned_workouts as workout
      on workout.id = exercise.planned_workout_id
    where workout.scheduled_date = current_date
      and exercise.exercise_order = 1
  ),
  40.00::numeric,
  'working weight is stored in the plan'
);

select lives_ok(
  $$ select public.submit_product_feedback('/today', 'Сделайте следующий шаг заметнее.') $$,
  'user A submits product feedback'
);

select throws_ok(
  $$ select public.submit_product_feedback('https://unsafe.example', 'Unsafe URL') $$,
  '22023',
  'Feedback values are invalid.',
  'external feedback URL is rejected'
);

select throws_ok(
  $$ insert into public.user_feedback (user_id, page_url, message) values (
    '77777777-7777-4777-8777-777777777777', '/today', 'Direct insert'
  ) $$,
  '42501',
  null,
  'authenticated user cannot insert feedback directly'
);

select lives_ok(
  $$
    select public.complete_workout(
      (select id from public.planned_workouts where scheduled_date = current_date),
      'Выполнено.',
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
          'weight_kg', 40,
          'rpe', 7
        )
      )
    )
  $$,
  'user A completes the edited workout'
);

select throws_ok(
  $$
    select public.update_planned_workout(
      (select id from public.planned_workouts where scheduled_date = current_date),
      'Попытка изменить результат.',
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', exercise.id,
            'name', exercise.name,
            'planned_sets', exercise.planned_sets,
            'planned_reps', exercise.planned_reps,
            'target_weight_kg', exercise.target_weight_kg,
            'target_rpe', exercise.target_rpe,
            'notes', exercise.notes
          ) order by exercise.exercise_order
        )
        from public.planned_exercises as exercise
        join public.planned_workouts as workout
          on workout.id = exercise.planned_workout_id
        where workout.scheduled_date = current_date
      )
    )
  $$,
  'P0001',
  'Completed workout cannot be edited.',
  'completed workout edit is rejected'
);

select throws_ok(
  $$
    select public.update_training_program(
      (select id from public.training_programs where status = 'active'),
      'Попытка переноса',
      current_date + 1,
      3
    )
  $$,
  'P0001',
  'Completed workout dates cannot be moved.',
  'completed workout prevents moving program dates'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"88888888-8888-4888-8888-888888888888","role":"authenticated"}',
  true
);

select throws_ok(
  $$
    select public.update_training_program(
      current_setting('test.program_id')::uuid,
      'Чужая программа', current_date, 2
    )
  $$,
  '42501',
  'Active program was not found.',
  'user B cannot edit user A program by id'
);

select is(
  (select count(*)::integer from public.training_programs),
  0,
  'user B cannot see user A program'
);

set local role postgres;

select is(
  (
    select count(*)::integer
    from public.user_feedback
    where user_id = '77777777-7777-4777-8777-777777777777'
      and page_url = '/today'
  ),
  1,
  'feedback stores user and page URL'
);

select is(
  (
    select count(*)::integer
    from public.workout_sessions
    where user_id = '77777777-7777-4777-8777-777777777777'
      and status = 'completed'
  ),
  1,
  'completed session remains immutable and present'
);

select is(
  (
    select count(*)::integer
    from public.actual_sets
    where user_id = '77777777-7777-4777-8777-777777777777'
  ),
  1,
  'actual set remains present after blocked edits'
);

select lives_ok(
  $$ delete from auth.users where id = '77777777-7777-4777-8777-777777777777' $$,
  'deleting user A succeeds'
);

select is(
  (
    select count(*)::integer
    from public.user_feedback
    where user_id = '77777777-7777-4777-8777-777777777777'
  ),
  0,
  'account deletion cascades to feedback'
);

select * from finish();

rollback;
