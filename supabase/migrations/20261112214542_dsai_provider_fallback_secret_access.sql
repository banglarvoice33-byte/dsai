create or replace function private.dsai_get_provider_secret(p_secret_name text)
returns text
language sql
security definer
set search_path = pg_catalog, vault
as $$
  select decrypted_secret from vault.decrypted_secrets
  where name = p_secret_name
    and p_secret_name in ('AGNES_API_KEY','CLOUDFLARE_ACCOUNT_ID','CLOUDFLARE_API_TOKEN','OPENROUTER_API_KEY')
  limit 1
$$;
revoke all on function private.dsai_get_provider_secret(text) from public, anon, authenticated;
grant execute on function private.dsai_get_provider_secret(text) to service_role;
create or replace function public.dsai_get_provider_secret(p_secret_name text)
returns text language sql security definer set search_path = pg_catalog, private
as $$ select private.dsai_get_provider_secret(p_secret_name) $$;
revoke all on function public.dsai_get_provider_secret(text) from public, anon, authenticated;
grant execute on function public.dsai_get_provider_secret(text) to service_role;
