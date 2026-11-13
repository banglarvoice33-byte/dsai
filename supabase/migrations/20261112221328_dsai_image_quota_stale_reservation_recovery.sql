alter table public.image_generation_daily_users
  add column if not exists last_reserved_at timestamptz not null default now();

create or replace function private.dsai_reserve_image_generation(p_user_id integer)
returns table(allowed boolean, used_today integer, daily_limit integer, reason text, usage_date date)
language plpgsql security definer set search_path = pg_catalog, public
as $$
declare
  v_date date := (timezone('utc', now()))::date;
  v_global_users integer;
  v_new_user boolean := false;
  v_count integer;
begin
  perform pg_advisory_xact_lock(hashtextextended('dsai-image-generation:' || v_date::text, 0));
  update public.image_generation_usage as usage
  set request_count = greatest(usage.request_count - daily_users.reservations, daily_users.successful_count)
  from public.image_generation_daily_users as daily_users
  where daily_users.usage_date = v_date and daily_users.reservations > 0
    and daily_users.last_reserved_at < now() - interval '15 minutes'
    and usage.user_id = daily_users.user_id and usage.usage_date = daily_users.usage_date;
  update public.image_generation_daily_users as daily_users set reservations = 0
  where daily_users.usage_date = v_date and daily_users.reservations > 0
    and daily_users.last_reserved_at < now() - interval '15 minutes';
  delete from public.image_generation_daily_users as daily_users
  where daily_users.usage_date = v_date and daily_users.reservations = 0 and daily_users.successful_count = 0;

  insert into public.image_generation_daily_users(usage_date,user_id,last_reserved_at)
  values(v_date,p_user_id,now())
  on conflict on constraint image_generation_daily_users_pkey do nothing;
  get diagnostics v_count = row_count; v_new_user := v_count = 1;
  if v_new_user then
    select count(*)::integer into v_global_users from public.image_generation_daily_users as daily_users where daily_users.usage_date = v_date;
    if v_global_users > 500 then
      delete from public.image_generation_daily_users as daily_users where daily_users.usage_date = v_date and daily_users.user_id = p_user_id and daily_users.reservations = 0 and daily_users.successful_count = 0;
      return query select false,0,2,'global_daily_limit'::text,v_date; return;
    end if;
  end if;
  insert into public.image_generation_usage(user_id,usage_date,request_count) values(p_user_id,v_date,1)
  on conflict on constraint image_generation_usage_pkey do update
    set request_count = public.image_generation_usage.request_count + 1
    where public.image_generation_usage.request_count < 2
  returning request_count into v_count;
  if v_count is null then
    select usage.request_count into v_count from public.image_generation_usage as usage where usage.user_id = p_user_id and usage.usage_date = v_date;
    if v_new_user then
      delete from public.image_generation_daily_users as daily_users where daily_users.usage_date = v_date and daily_users.user_id = p_user_id and daily_users.reservations = 0 and daily_users.successful_count = 0;
    end if;
    return query select false,coalesce(v_count,2),2,'daily_limit_reached'::text,v_date; return;
  end if;
  update public.image_generation_daily_users as daily_users
  set reservations = daily_users.reservations + 1, last_reserved_at = now()
  where daily_users.usage_date = v_date and daily_users.user_id = p_user_id;
  return query select true,v_count,2,null::text,v_date;
end;
$$;
revoke all on function private.dsai_reserve_image_generation(integer) from public,anon,authenticated;
grant execute on function private.dsai_reserve_image_generation(integer) to service_role;

create or replace function private.dsai_refund_image_generation(p_user_id integer,p_usage_date date)
returns void language plpgsql security definer set search_path=pg_catalog,public as $$
begin
 perform pg_advisory_xact_lock(hashtextextended('dsai-image-generation:'||p_usage_date::text,0));
 update public.image_generation_usage as usage set request_count=greatest(usage.request_count-1,0) where usage.user_id=p_user_id and usage.usage_date=p_usage_date;
 update public.image_generation_daily_users as daily_users set reservations=greatest(daily_users.reservations-1,0),last_reserved_at=now()
 where daily_users.user_id=p_user_id and daily_users.usage_date=p_usage_date;
 delete from public.image_generation_daily_users as daily_users where daily_users.user_id=p_user_id and daily_users.usage_date=p_usage_date and daily_users.reservations=0 and daily_users.successful_count=0;
end; $$;
revoke all on function private.dsai_refund_image_generation(integer,date) from public,anon,authenticated;
grant execute on function private.dsai_refund_image_generation(integer,date) to service_role;

create or replace function private.dsai_finalize_image_generation(p_user_id integer,p_usage_date date)
returns void language plpgsql security definer set search_path=pg_catalog,public as $$
begin
 perform pg_advisory_xact_lock(hashtextextended('dsai-image-generation:'||p_usage_date::text,0));
 update public.image_generation_daily_users as daily_users set reservations=greatest(daily_users.reservations-1,0),successful_count=least(daily_users.successful_count+1,2),last_reserved_at=now()
 where daily_users.user_id=p_user_id and daily_users.usage_date=p_usage_date and daily_users.reservations>0 and daily_users.successful_count<2;
 if not found then raise exception 'image_generation_reservation_not_found'; end if;
end; $$;
revoke all on function private.dsai_finalize_image_generation(integer,date) from public,anon,authenticated;
grant execute on function private.dsai_finalize_image_generation(integer,date) to service_role;

create or replace function public.dsai_reserve_image_generation(p_user_id integer)
returns table(allowed boolean,used_today integer,daily_limit integer,reason text,usage_date date)
language sql security definer set search_path=pg_catalog,private as $$ select * from private.dsai_reserve_image_generation(p_user_id) $$;
revoke all on function public.dsai_reserve_image_generation(integer) from public,anon,authenticated;
grant execute on function public.dsai_reserve_image_generation(integer) to service_role;
create or replace function public.dsai_refund_image_generation(p_user_id integer,p_usage_date date)
returns void language sql security definer set search_path=pg_catalog,private as $$ select private.dsai_refund_image_generation(p_user_id,p_usage_date) $$;
revoke all on function public.dsai_refund_image_generation(integer,date) from public,anon,authenticated;
grant execute on function public.dsai_refund_image_generation(integer,date) to service_role;
create or replace function public.dsai_finalize_image_generation(p_user_id integer,p_usage_date date)
returns void language sql security definer set search_path=pg_catalog,private as $$ select private.dsai_finalize_image_generation(p_user_id,p_usage_date) $$;
revoke all on function public.dsai_finalize_image_generation(integer,date) from public,anon,authenticated;
grant execute on function public.dsai_finalize_image_generation(integer,date) to service_role;
