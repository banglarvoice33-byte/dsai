export type PublicImageQuota = {
  used_today: number;
  remaining_today: number;
  daily_limit: 2;
};

export function toPublicImageQuota(usedToday: number): PublicImageQuota {
  const safeUsedToday = Number.isFinite(usedToday) ? Math.max(0, Math.floor(usedToday)) : 0;
  return {
    used_today: safeUsedToday,
    remaining_today: Math.max(0, 2 - safeUsedToday),
    daily_limit: 2,
  };
}

export function toPublicImageRecord(
  record: Record<string, unknown>,
  previewUrl: string | null,
) {
  return {
    id: String(record.id ?? ""),
    prompt: String(record.prompt ?? ""),
    mime_type: String(record.mime_type ?? "image/png"),
    byte_size: Number(record.byte_size ?? 0),
    created_at: String(record.created_at ?? ""),
    preview_url: previewUrl,
  };
}

/** Collapse internal provider, model, quota and storage errors into safe public codes. */
export function toPublicImageError(message: string): string {
  if (
    ["daily_limit_reached", "global_daily_limit", "global_user_limit", "provider_daily_limit"].includes(message)
  ) return "daily_limit_reached";
  if (message === "provider_minute_limit" || message.includes("openrouter_image_http_429")) {
    return "image_generation_busy";
  }
  if (message === "quota_service_unavailable") return "service_unavailable";
  return "image_generation_unavailable";
}
