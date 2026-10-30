create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'member'
    check (role in ('member', 'admin')),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_status_created_at_idx
  on public.profiles (status, created_at);

alter table public.profiles enable row level security;

-- A SECURITY DEFINER helper avoids recursive profile-policy checks.
create or replace function public.is_approved_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
set row_security = off
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
      and p.status = 'approved'
  );
$$;

revoke all on function public.is_approved_admin() from public;
grant execute on function public.is_approved_admin() to authenticated;

-- Create a profile automatically for every newly registered Auth user.
-- Role and status are set here, never accepted from signup form metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role, status)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'member',
    'pending'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Remove broad table privileges; users must not change their own role/status.
revoke all on table public.profiles from anon;
revoke insert, update, delete on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;
grant update (status) on table public.profiles to authenticated;

drop policy if exists "Users read own profile or admins read all"
  on public.profiles;

create policy "Users read own profile or admins read all"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or (select public.is_approved_admin())
);

drop policy if exists "Approved admins update membership status"
  on public.profiles;

create policy "Approved admins update membership status"
on public.profiles
for update
to authenticated
using ((select public.is_approved_admin()))
with check ((select public.is_approved_admin()));

-- Keep updated_at accurate when an administrator changes membership status.
create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;

create trigger profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_profile_updated_at();