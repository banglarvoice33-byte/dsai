create table if not exists public.ai_provider_rate_limits (
  subject_hash varchar(64) not null,
  window_start timestamptz not null,
  request_count smallint not null default 1,
  created_at timestamptz not null default now(),
  constraint ai_provider_rate_limits_pkey primary key (subject_hash, window_start),
  constraint ai_provider_rate_limits_hash_check check (subject_hash ~ '^[0-9a-f]{64}$'),
  constraint ai_provider_rate_limits_count_check check (request_count between 1 and 5)
);

create index if not exists ai_provider_rate_limits_window_idx
  on public.ai_provider_rate_limits (window_start);

alter table public.ai_provider_rate_limits enable row level security;
revoke all on table public.ai_provider_rate_limits from public, anon, authenticated;
grant all on table public.ai_provider_rate_limits to service_role;

comment on table public.ai_provider_rate_limits is
  'Server-only hashed subject counters for AI provider spend protection; raw IP addresses are never stored.';
