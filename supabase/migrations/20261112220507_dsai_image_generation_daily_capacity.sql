-- Enforce a strict per-user limit of two successful images and a global cap of 500 distinct users per UTC day.
-- Reservations are counted before provider calls and refunded on failure; successful generations are finalized atomically.
create schema if not exists private;

alter table public.image_generation_usage
  drop constraint if exists image_generation_usage_request_count_check;
alter table public.image_generation_usage
  add constraint image_generation_usage_request_count_check check (request_count between 0 and 2);

create table if not exists public.image_generation_daily_users (
  usage_date date not null,
  user_id integer not null references public.users(id) on delete cascade,
  reservations smallint not null default 0 check (reservations between 0 and 2),
  successful_count smallint not null default 0 check (successful_count between 0 and 2),
  created_at timestamptz not null default now(),
  primary key (usage_date, user_id)
);
create index if not exists image_generation_daily_users_date_idx
  on public.image_generation_daily_users (usage_date);
alter table public.image_generation_daily_users enable row level security;
revoke all on public.image_generation_daily_users from public, anon, authenticated;
grant select, insert, update, delete on public.image_generation_daily_users to service_role;

drop function if exists public.dsai_reserve_image_generation(integer);
drop function if exists private.dsai_reserve_image_generation(integer);

create function private.dsai_reserve_image_generation(p_user_id integer)
returns table(allowed boolean, used_today integer, daily_limit integer, reason text, usage_date date)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_date date := (timezone('utc', now()))::date;
  v_global_users integer;
  v_new_user boolean := false;
  v_count integer;
begin
  -- Serialize first-use capacity checks so two concurrent requests cannot admit user 501.
  perform pg_advisory_xact_lock(hashtextextended('dsai-image-generation:' || v_date::text, 0));

  insert into public.image_generation_daily_users(usage_date, user_id)
  values (v_date, p_user_id)
  on conflict (usage_date, user_id) do nothing;
  get diagnostics v_count = row_count;
  v_new_user := v_count = 1;

  if v_new_user then
    select count(*)::integer into v_global_users
    from public.image_generation_daily_users where usage_date = v_date;
    if v_global_users > 500 then
      delete from public.image_generation_daily_users
      where usage_date = v_date and user_id = p_user_id
        and reservations = 0 and successful_count = 0;
      return query select false, 0, 2, 'global_daily_limit', v_date;
      return;
    end if;
  end if;

  insert into public.image_generation_usage(user_id, usage_date, request_count)
  values (p_user_id, v_date, 1)
  on conflict (user_id, usage_date) do update
    set request_count = public.image_generation_usage.request_count + 1
    where public.image_generation_usage.request_count < 2
  returning request_count into v_count;

  if v_count is null then
    select u.request_count into v_count from public.image_generation_usage u
    where u.user_id = p_user_id and u.usage_date = v_date;
    if v_new_user then
      delete from public.image_generation_daily_users
      where usage_date = v_date and user_id = p_user_id
        and reservations = 0 and successful_count = 0;
    end if;
    return query select false, coalesce(v_count, 2), 2, 'daily_limit_reached', v_date;
    return;
  end if;

  update public.image_generation_daily_users
  set reservations = reservations + 1
  where usage_date = v_date and user_id = p_user_id;
  return query select true, v_count, 2, null::text, v_date;
end;
$$;
revoke all on function private.dsai_reserve_image_generation(integer) from public, anon, authenticated;
grant usage on schema private to service_role;
grant execute on function private.dsai_reserve_image_generation(integer) to service_role;

create or replace function private.dsai_refund_image_generation(p_user_id integer, p_usage_date date)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended('dsai-image-generation:' || p_usage_date::text, 0));
  update public.image_generation_usage
    set request_count = greatest(request_count - 1, 0)
    where user_id = p_user_id and usage_date = p_usage_date;
  update public.image_generation_daily_users
    set reservations = greatest(reservations - 1, 0)
    where user_id = p_user_id and usage_date = p_usage_date;
  delete from public.image_generation_daily_users
    where user_id = p_user_id and usage_date = p_usage_date
      and reservations = 0 and successful_count = 0;
end;
$$;
revoke all on function private.dsai_refund_image_generation(integer,date) from public, anon, authenticated;
grant execute on function private.dsai_refund_image_generation(integer,date) to service_role;

create or replace function private.dsai_finalize_image_generation(p_user_id integer, p_usage_date date)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended('dsai-image-generation:' || p_usage_date::text, 0));
  update public.image_generation_daily_users
    set reservations = greatest(reservations - 1, 0),
        successful_count = least(successful_count + 1, 2)
    where user_id = p_user_id and usage_date = p_usage_date
      and reservations > 0 and successful_count < 2;
  if not found then
    raise exception 'image_generation_reservation_not_found';
  end if;
end;
$$;
revoke all on function private.dsai_finalize_image_generation(integer,date) from public, anon, authenticated;
grant execute on function private.dsai_finalize_image_generation(integer,date) to service_role;

create function public.dsai_reserve_image_generation(p_user_id integer)
returns table(allowed boolean, used_today integer, daily_limit integer, reason text, usage_date date)
language sql security definer set search_path = pg_catalog, private
as $$ select * from private.dsai_reserve_image_generation(p_user_id) $$;
revoke all on function public.dsai_reserve_image_generation(integer) from public, anon, authenticated;
grant execute on function public.dsai_reserve_image_generation(integer) to service_role;

create or replace function public.dsai_refund_image_generation(p_user_id integer, p_usage_date date)
returns void
language sql security definer set search_path = pg_catalog, private
as $$ select private.dsai_refund_image_generation(p_user_id, p_usage_date) $$;
revoke all on function public.dsai_refund_image_generation(integer,date) from public, anon, authenticated;
grant execute on function public.dsai_refund_image_generation(integer,date) to service_role;

create or replace function public.dsai_finalize_image_generation(p_user_id integer, p_usage_date date)
returns void
language sql security definer set search_path = pg_catalog, private
as $$ select private.dsai_finalize_image_generation(p_user_id, p_usage_date) $$;
revoke all on function public.dsai_finalize_image_generation(integer,date) from public, anon, authenticated;
grant execute on function public.dsai_finalize_image_generation(integer,date) to service_role;
