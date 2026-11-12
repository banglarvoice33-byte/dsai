create or replace function private.dsai_refund_image_generation(p_user_id integer)
returns void
language sql
security definer
set search_path = pg_catalog, public
as $$
  update public.image_generation_usage
  set request_count = greatest(request_count - 1, 0)
  where user_id = p_user_id and usage_date = (timezone('utc', now()))::date;
$$;
revoke all on function private.dsai_refund_image_generation(integer) from public, anon, authenticated;
grant execute on function private.dsai_refund_image_generation(integer) to service_role;
