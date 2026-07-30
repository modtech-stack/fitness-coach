begin;

create extension if not exists pgtap with schema extensions;

select plan(33);

select results_eq(
  $$
    select enumlabel
    from pg_enum
    where enumtypid = 'public.training_experience'::regtype
    order by enumsortorder
  $$,
  $$ values
    ('none'::name),
    ('under_6_months'::name),
    ('six_months_to_two_years'::name),
    ('over_two_years'::name)
  $$,
  'training experience uses four concrete duration bands'
);

select results_eq(
  $$
    select enumlabel
    from pg_enum
    where enumtypid = 'public.activity_level'::regtype
    order by enumsortorder
  $$,
  $$ values
    ('low'::name),
    ('moderate'::name),
    ('high'::name)
  $$,
  'daily activity uses three levels'
);

select is(
  (
    select is_nullable
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'constraints'
      and column_name = 'severity'
  ),
  'YES',
  'constraint severity is optional'
);

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
    '33333333-3333-4333-8333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'stage-15-a@example.test',
    crypt('Password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now()
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'stage-15-b@example.test',
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
      '33333333-3333-4333-8333-333333333333',
      '44444444-4444-4444-8444-444444444444'
    )
  ),
  2,
  'two Stage 1.5 test users are created'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}',
  true
);

select lives_ok(
  $$
    insert into public.profiles (
      user_id,
      name,
      birth_date,
      sex,
      height_cm,
      weight_kg,
      training_experience,
      activity_level
    )
    values (
      '33333333-3333-4333-8333-333333333333',
      'Stage 1.5 User A',
      '1990-01-01',
      'prefer_not_to_say',
      175,
      75,
      'none',
      'low'
    )
  $$,
  'user A can create a profile with the new profile values'
);

select lives_ok(
  $$
    update public.profiles
    set training_experience = 'over_two_years',
        activity_level = 'high'
    where user_id = '33333333-3333-4333-8333-333333333333'
  $$,
  'user A can update their profile'
);

select is(
  (
    select training_experience::text
    from public.profiles
    where user_id = '33333333-3333-4333-8333-333333333333'
  ),
  'over_two_years',
  'user A profile update is stored'
);

select lives_ok(
  $$
    insert into public.goals (
      id,
      user_id,
      goal_type,
      description,
      priority,
      status
    )
    values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
      '33333333-3333-4333-8333-333333333333',
      'general_fitness',
      'First active primary goal',
      1,
      'active'
    )
  $$,
  'user A can create an active primary goal'
);

select lives_ok(
  $$
    insert into public.goals (
      id,
      user_id,
      goal_type,
      description,
      priority,
      status
    )
    values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
      '33333333-3333-4333-8333-333333333333',
      'endurance',
      'Secondary goal',
      2,
      'active'
    )
  $$,
  'user A can create a secondary goal'
);

select throws_ok(
  $$
    insert into public.goals (
      user_id,
      goal_type,
      description,
      priority,
      status
    )
    values (
      '33333333-3333-4333-8333-333333333333',
      'endurance',
      'Invalid legacy priority',
      3,
      'active'
    )
  $$,
  '23514',
  null,
  'legacy priorities are rejected'
);

select lives_ok(
  $$
    update public.goals
    set description = 'Updated secondary goal'
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2'
  $$,
  'user A can update their own goal'
);

select is(
  (
    select description
    from public.goals
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2'
  ),
  'Updated secondary goal',
  'user A goal update is stored'
);

select lives_ok(
  $$
    delete from public.goals
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2'
  $$,
  'user A can delete their own goal'
);

select is(
  (
    select count(*)::integer
    from public.goals
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2'
  ),
  0,
  'user A goal deletion is stored'
);

select lives_ok(
  $$
    insert into public.constraints (
      id,
      user_id,
      type,
      description,
      severity
    )
    values (
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
      '33333333-3333-4333-8333-333333333333',
      'pain',
      'Knee discomfort during squats',
      null
    )
  $$,
  'user A can create a constraint without severity'
);

select lives_ok(
  $$
    update public.constraints
    set description = 'Updated knee discomfort'
    where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1'
  $$,
  'user A can update their own constraint'
);

select is(
  (
    select description
    from public.constraints
    where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1'
  ),
  'Updated knee discomfort',
  'user A constraint update is stored'
);

select lives_ok(
  $$
    delete from public.constraints
    where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1'
  $$,
  'user A can delete their own constraint'
);

select is(
  (
    select count(*)::integer
    from public.constraints
    where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1'
  ),
  0,
  'user A constraint deletion is stored'
);

set local role postgres;

insert into public.profiles (
  user_id,
  name,
  birth_date,
  sex,
  height_cm,
  weight_kg,
  training_experience,
  activity_level
)
values (
  '44444444-4444-4444-8444-444444444444',
  'Stage 1.5 User B',
  '1991-02-02',
  'prefer_not_to_say',
  165,
  65,
  'six_months_to_two_years',
  'moderate'
);

insert into public.goals (
  id,
  user_id,
  goal_type,
  description,
  priority,
  status
)
values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
  '44444444-4444-4444-8444-444444444444',
  'endurance',
  'User B goal',
  1,
  'active'
);

insert into public.constraints (
  id,
  user_id,
  type,
  description
)
values (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
  '44444444-4444-4444-8444-444444444444',
  'equipment',
  'User B equipment constraint'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}',
  true
);

select results_eq(
  $$
    update public.profiles
    set name = 'Tampered'
    where user_id = '44444444-4444-4444-8444-444444444444'
    returning id
  $$,
  $$ select null::uuid where false $$,
  'user A cannot update user B profile'
);

select results_eq(
  $$
    update public.goals
    set description = 'Tampered'
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3'
    returning id
  $$,
  $$ select null::uuid where false $$,
  'user A cannot update user B goal'
);

select results_eq(
  $$
    delete from public.goals
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3'
    returning id
  $$,
  $$ select null::uuid where false $$,
  'user A cannot delete user B goal'
);

select results_eq(
  $$
    update public.constraints
    set description = 'Tampered'
    where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2'
    returning id
  $$,
  $$ select null::uuid where false $$,
  'user A cannot update user B constraint'
);

select results_eq(
  $$
    delete from public.constraints
    where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2'
    returning id
  $$,
  $$ select null::uuid where false $$,
  'user A cannot delete user B constraint'
);

select lives_ok(
  $$
    insert into public.goals (
      id,
      user_id,
      goal_type,
      description,
      priority,
      status
    )
    values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
      '33333333-3333-4333-8333-333333333333',
      'recomposition',
      'Replacement active primary goal',
      1,
      'active'
    )
  $$,
  'creating a new primary goal automatically demotes the previous primary'
);

select is(
  (
    select count(*)::integer
    from public.goals
    where user_id = '33333333-3333-4333-8333-333333333333'
      and priority = 1
      and status = 'active'
  ),
  1,
  'user A has exactly one active primary goal'
);

select is(
  (
    select priority::integer
    from public.goals
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
  ),
  2,
  'the previous primary goal is now secondary'
);

select is(
  (select count(*)::integer from public.goals),
  2,
  'RLS continues to hide user B goals from user A'
);

set local role postgres;

select lives_ok(
  $$
    delete from auth.users
    where id = '44444444-4444-4444-8444-444444444444'
  $$,
  'deleting an Auth user succeeds'
);

select is(
  (
    select count(*)::integer
    from auth.users
    where id = '44444444-4444-4444-8444-444444444444'
  ),
  0,
  'the deleted Auth account no longer exists'
);

select is(
  (
    select count(*)::integer
    from public.profiles
    where user_id = '44444444-4444-4444-8444-444444444444'
  ),
  0,
  'account deletion cascades to the profile'
);

select is(
  (
    select count(*)::integer
    from public.goals
    where user_id = '44444444-4444-4444-8444-444444444444'
  ),
  0,
  'account deletion cascades to goals'
);

select is(
  (
    select count(*)::integer
    from public.constraints
    where user_id = '44444444-4444-4444-8444-444444444444'
  ),
  0,
  'account deletion cascades to constraints'
);

select * from finish();

rollback;
