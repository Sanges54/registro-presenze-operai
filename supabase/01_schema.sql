create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (length(trim(full_name)) > 0),
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  first_name text not null check (length(trim(first_name)) > 0),
  last_name text not null check (length(trim(last_name)) > 0),
  job_title text,
  hire_date date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workers_user_id_id_unique unique (user_id, id)
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete restrict,
  attendance_date date not null,
  status text not null check (
    status in (
      'present',
      'absent',
      'vacation',
      'sick',
      'leave',
      'rest',
      'travel'
    )
  ),
  regular_hours numeric(5, 2) not null default 0 check (regular_hours >= 0),
  overtime_hours numeric(5, 2) not null default 0 check (overtime_hours >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attendance_worker_date_unique unique (worker_id, attendance_date)
);

create table if not exists public.company_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  company_name text not null check (length(trim(company_name)) > 0),
  logo_url text,
  address text,
  vat_number text,
  owner_name text,
  pdf_footer_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.backup_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  last_backup_at timestamptz,
  reminder_interval_days integer not null default 30 check (reminder_interval_days > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workers_user_id_idx on public.workers(user_id);
create index if not exists workers_active_idx on public.workers(active);
create index if not exists attendance_user_id_idx on public.attendance(user_id);
create index if not exists attendance_worker_id_idx on public.attendance(worker_id);
create index if not exists attendance_date_idx on public.attendance(attendance_date);
create index if not exists attendance_user_date_idx on public.attendance(user_id, attendance_date);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'attendance_worker_belongs_to_user'
  ) then
    alter table public.attendance
      add constraint attendance_worker_belongs_to_user
      foreign key (user_id, worker_id)
      references public.workers(user_id, id)
      on delete restrict;
  end if;
end $$;
