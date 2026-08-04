alter table public.profiles enable row level security;
alter table public.workers enable row level security;
alter table public.attendance enable row level security;
alter table public.company_settings enable row level security;
alter table public.backup_preferences enable row level security;

alter table public.profiles force row level security;
alter table public.workers force row level security;
alter table public.attendance force row level security;
alter table public.company_settings force row level security;
alter table public.backup_preferences force row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
on public.profiles
for delete
to authenticated
using (id = auth.uid());

drop policy if exists "workers_select_own" on public.workers;
create policy "workers_select_own"
on public.workers
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "workers_insert_own" on public.workers;
create policy "workers_insert_own"
on public.workers
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "workers_update_own" on public.workers;
create policy "workers_update_own"
on public.workers
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "workers_delete_own" on public.workers;
create policy "workers_delete_own"
on public.workers
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "attendance_select_own" on public.attendance;
create policy "attendance_select_own"
on public.attendance
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "attendance_insert_own" on public.attendance;
create policy "attendance_insert_own"
on public.attendance
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.workers
    where workers.id = attendance.worker_id
      and workers.user_id = auth.uid()
  )
);

drop policy if exists "attendance_update_own" on public.attendance;
create policy "attendance_update_own"
on public.attendance
for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.workers
    where workers.id = attendance.worker_id
      and workers.user_id = auth.uid()
  )
);

drop policy if exists "attendance_delete_own" on public.attendance;
create policy "attendance_delete_own"
on public.attendance
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "company_settings_select_own" on public.company_settings;
create policy "company_settings_select_own"
on public.company_settings
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "company_settings_insert_own" on public.company_settings;
create policy "company_settings_insert_own"
on public.company_settings
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "company_settings_update_own" on public.company_settings;
create policy "company_settings_update_own"
on public.company_settings
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "company_settings_delete_own" on public.company_settings;
create policy "company_settings_delete_own"
on public.company_settings
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "backup_preferences_select_own" on public.backup_preferences;
create policy "backup_preferences_select_own"
on public.backup_preferences
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "backup_preferences_insert_own" on public.backup_preferences;
create policy "backup_preferences_insert_own"
on public.backup_preferences
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "backup_preferences_update_own" on public.backup_preferences;
create policy "backup_preferences_update_own"
on public.backup_preferences
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "backup_preferences_delete_own" on public.backup_preferences;
create policy "backup_preferences_delete_own"
on public.backup_preferences
for delete
to authenticated
using (user_id = auth.uid());
