create or replace function public.dsai_reserve_image_generation(p_user_id integer)
returns table(allowed boolean, used_today integer, daily_limit integer)
language sql
security definer
set search_path = pg_catalog, private
as $$ select * from private.dsai_reserve_image_generation(p_user_id) $$;
revoke all on function public.dsai_reserve_image_generation(integer) from public, anon, authenticated;
grant execute on function public.dsai_reserve_image_generation(integer) to service_role;

create or replace function public.dsai_refund_image_generation(p_user_id integer)
returns void
language sql
security definer
set search_path = pg_catalog, private
as $$ select private.dsai_refund_image_generation(p_user_id) $$;
revoke all on function public.dsai_refund_image_generation(integer) from public, anon, authenticated;
grant execute on function public.dsai_refund_image_generation(integer) to service_role;

create or replace function public.dsai_get_openrouter_key()
returns text
language sql
security definer
set search_path = pg_catalog, private
as $$ select private.dsai_get_openrouter_key() $$;
revoke all on function public.dsai_get_openrouter_key() from public, anon, authenticated;
grant execute on function public.dsai_get_openrouter_key() to service_role;
