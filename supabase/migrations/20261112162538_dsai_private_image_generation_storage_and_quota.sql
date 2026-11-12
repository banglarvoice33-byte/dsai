create schema if not exists private;

create table if not exists public.image_generation_usage (
  user_id integer not null references public.users(id) on delete cascade,
  usage_date date not null default (timezone('utc', now()))::date,
  request_count smallint not null default 0 check (request_count between 0 and 3),
  primary key (user_id, usage_date)
);
alter table public.image_generation_usage enable row level security;
revoke all on public.image_generation_usage from anon, authenticated;
grant select, insert, update, delete on public.image_generation_usage to service_role;

create table if not exists public.generated_images (
  id uuid primary key default gen_random_uuid(),
  user_id integer not null references public.users(id) on delete cascade,
  prompt text not null check (char_length(prompt) between 3 and 4000),
  model text not null,
  storage_path text not null unique,
  mime_type text not null check (mime_type in ('image/png','image/jpeg','image/webp')),
  byte_size integer not null check (byte_size > 0 and byte_size <= 10485760),
  status text not null default 'completed' check (status in ('completed','failed')),
  provider_cost_usd numeric(12,6),
  created_at timestamptz not null default now()
);
create index if not exists generated_images_user_created_idx
  on public.generated_images(user_id, created_at desc);
alter table public.generated_images enable row level security;
revoke all on public.generated_images from anon, authenticated;
grant select, insert, update, delete on public.generated_images to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dsai-generated-images','dsai-generated-images',false,10485760,array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public=false, file_size_limit=10485760, allowed_mime_types=excluded.allowed_mime_types;

create or replace function private.dsai_reserve_image_generation(p_user_id integer)
returns table(allowed boolean, used_today integer, daily_limit integer)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare v_count integer;
begin
  insert into public.image_generation_usage(user_id, usage_date, request_count)
  values (p_user_id, (timezone('utc', now()))::date, 1)
  on conflict (user_id, usage_date) do update
    set request_count = public.image_generation_usage.request_count + 1
    where public.image_generation_usage.request_count < 3
  returning request_count into v_count;
  if v_count is null then
    select u.request_count into v_count from public.image_generation_usage u
    where u.user_id = p_user_id and u.usage_date = (timezone('utc', now()))::date;
    return query select false, coalesce(v_count,3), 3;
  else
    return query select true, v_count, 3;
  end if;
end;
$$;
revoke all on function private.dsai_reserve_image_generation(integer) from public, anon, authenticated;
grant usage on schema private to service_role;
grant execute on function private.dsai_reserve_image_generation(integer) to service_role;

create or replace function private.dsai_get_openrouter_key()
returns text
language sql
security definer
set search_path = pg_catalog, vault
as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'OPENROUTER_API_KEY' limit 1
$$;
revoke all on function private.dsai_get_openrouter_key() from public, anon, authenticated;
grant execute on function private.dsai_get_openrouter_key() to service_role;
