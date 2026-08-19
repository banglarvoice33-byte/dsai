import { Volume2, VolumeX } from "lucide-react";
import { Link } from "wouter";
import { useWorkdeskActivity, type WorkdeskSeverity } from "@/contexts/WorkdeskActivityContext";

export default function NotificationMuteBadge({ module, category, severity }: { module: string; category?: string; severity?: WorkdeskSeverity }) {
  const { preferences } = useWorkdeskActivity();
  const muted = !preferences.enabled || preferences.mutedModules.includes(module) || Boolean(category && preferences.mutedCategories.includes(category)) || Boolean(severity && preferences.mutedSeverities.includes(severity));
  return <Link href={`/notification-settings?module=${encodeURIComponent(module)}`} className={`notification-mute-badge ${muted ? "muted" : "active"}`} title={`Open notification settings for ${module}`} aria-label={`${module} notifications ${muted ? "muted" : "active"}; open settings`}>{muted ? <VolumeX size={11} /> : <Volume2 size={11} />} {muted ? "Muted" : "Live"}</Link>;
}
