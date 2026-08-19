import { Volume2, VolumeX } from "lucide-react";
import { useWorkdeskActivity, type WorkdeskSeverity } from "@/contexts/WorkdeskActivityContext";

export default function NotificationMuteBadge({ module, category, severity }: { module: string; category?: string; severity?: WorkdeskSeverity }) {
  const { preferences } = useWorkdeskActivity();
  const muted = !preferences.enabled || preferences.mutedModules.includes(module) || Boolean(category && preferences.mutedCategories.includes(category)) || Boolean(severity && preferences.mutedSeverities.includes(severity));
  return <span className={`notification-mute-badge ${muted ? "muted" : "active"}`} title={muted ? "Notifications muted for this module or filter" : "Notifications active for this module"} aria-label={muted ? `${module} notifications muted` : `${module} notifications active`}>{muted ? <VolumeX size={11} /> : <Volume2 size={11} />} {muted ? "Muted" : "Live"}</span>;
}
