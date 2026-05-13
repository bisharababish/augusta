-- Run this in Supabase SQL Editor (once) to enable ID login.
-- It maps profiles.id_number to auth.users.email using a secure function.

create or replace function public.get_email_by_id_number(p_id_number text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
begin
  select u.email
    into v_email
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.id_number = p_id_number
  limit 1;

  return v_email;
end;
$$;

revoke all on function public.get_email_by_id_number(text) from public;
grant execute on function public.get_email_by_id_number(text) to anon, authenticated;
