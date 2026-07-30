begin;

create extension if not exists pgtap with schema extensions;

select plan(18);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'goals', 'goals table exists');
select has_table('public', 'constraints', 'constraints table exists');

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
    '11111111-1111-4111-8111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'user-a@example.test',
    crypt('Password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now()
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'user-b@example.test',
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
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222'
    )
  ),
  2,
  'two test users are created'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',
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
      '11111111-1111-4111-8111-111111111111',
      'Test User A',
      '1990-01-01',
      'prefer_not_to_say',
      175,
      75,
      'under_6_months',
      'moderate'
    )
  $$,
  'user A can save a profile'
);

select lives_ok(
  $$
    insert into public.goals (
      user_id,
      goal_type,
      description,
      priority,
      status
    )
    values (
      '11111111-1111-4111-8111-111111111111',
      'general_fitness',
      'Build a consistent training routine',
      1,
      'active'
    )
  $$,
  'user A can save a goal'
);

select lives_ok(
  $$
    insert into public.constraints (
      user_id,
      type,
      description,
      severity
    )
    values (
      '11111111-1111-4111-8111-111111111111',
      'schedule',
      'Weekday sessions are limited to one hour',
      'medium'
    )
  $$,
  'user A can save a constraint'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}',
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
      '22222222-2222-4222-8222-222222222222',
      'Test User B',
      '1992-02-02',
      'prefer_not_to_say',
      165,
      65,
      'six_months_to_two_years',
      'moderate'
    )
  $$,
  'user B can save a profile'
);

select lives_ok(
  $$
    insert into public.goals (
      user_id,
      goal_type,
      description,
      priority,
      status
    )
    values (
      '22222222-2222-4222-8222-222222222222',
      'endurance',
      'Improve aerobic endurance',
      1,
      'active'
    )
  $$,
  'user B can save a goal'
);

select lives_ok(
  $$
    insert into public.constraints (
      user_id,
      type,
      description,
      severity
    )
    values (
      '22222222-2222-4222-8222-222222222222',
      'equipment',
      'Only resistance bands are available',
      'low'
    )
  $$,
  'user B can save a constraint'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',
  true
);

select is(
  (select count(*)::integer from public.profiles),
  1,
  'user A sees only one profile'
);

select is(
  (
    select count(*)::integer
    from public.profiles
    where user_id = '22222222-2222-4222-8222-222222222222'
  ),
  0,
  'user A cannot see user B profile'
);

select is(
  (select count(*)::integer from public.goals),
  1,
  'user A sees only their own goal'
);

select is(
  (
    select count(*)::integer
    from public.goals
    where user_id = '22222222-2222-4222-8222-222222222222'
  ),
  0,
  'user A cannot see user B goal'
);

select is(
  (select count(*)::integer from public.constraints),
  1,
  'user A sees only their own constraint'
);

select is(
  (
    select count(*)::integer
    from public.constraints
    where user_id = '22222222-2222-4222-8222-222222222222'
  ),
  0,
  'user A cannot see user B constraint'
);

select lives_ok(
  $$
    update public.profiles
    set weight_kg = 74.5
    where user_id = '11111111-1111-4111-8111-111111111111'
  $$,
  'user A can update their profile'
);

select is(
  (
    select weight_kg
    from public.profiles
    where user_id = '11111111-1111-4111-8111-111111111111'
  ),
  74.50::numeric,
  'user A profile update is stored'
);

select * from finish();

rollback;
