-- Optional demo data.
-- Replace the UUID below with the id of a real authenticated user from auth.users.
-- Run this file only after creating the first user and the profile row.

do $$
declare
  demo_user_id uuid := '00000000-0000-0000-0000-000000000000';
  worker_mario_id uuid;
  worker_luca_id uuid;
begin
  if demo_user_id = '00000000-0000-0000-0000-000000000000' then
    raise notice 'Demo data skipped: replace demo_user_id before running this script.';
    return;
  end if;

  insert into public.company_settings (
    user_id,
    company_name,
    address,
    vat_number,
    owner_name,
    pdf_footer_text
  )
  values (
    demo_user_id,
    'Impresa Demo S.r.l.',
    'Via Esempio 1, 00100 Roma',
    'IT00000000000',
    'Mario Titolare',
    'Documento generato da Registro Presenze Operai.'
  )
  on conflict (user_id) do nothing;

  insert into public.backup_preferences (
    user_id,
    reminder_interval_days
  )
  values (
    demo_user_id,
    30
  )
  on conflict (user_id) do nothing;

  insert into public.workers (
    user_id,
    first_name,
    last_name,
    job_title,
    hire_date
  )
  values (
    demo_user_id,
    'Mario',
    'Rossi',
    'Muratore',
    current_date - interval '2 years'
  )
  returning id into worker_mario_id;

  insert into public.workers (
    user_id,
    first_name,
    last_name,
    job_title,
    hire_date
  )
  values (
    demo_user_id,
    'Luca',
    'Bianchi',
    'Carpentiere',
    current_date - interval '1 year'
  )
  returning id into worker_luca_id;

  insert into public.attendance (
    user_id,
    worker_id,
    attendance_date,
    status,
    regular_hours,
    overtime_hours,
    notes
  )
  values
    (
      demo_user_id,
      worker_mario_id,
      current_date,
      'present',
      8,
      1,
      'Dato demo'
    ),
    (
      demo_user_id,
      worker_luca_id,
      current_date,
      'travel',
      8,
      0,
      'Dato demo'
    )
  on conflict (worker_id, attendance_date) do nothing;
end $$;
