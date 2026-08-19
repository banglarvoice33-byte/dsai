import { AlertTriangle, Bell, CheckCircle2, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkdeskActivity } from "@/contexts/WorkdeskActivityContext";

export default function GlobalWorkdeskNotifications() {
  const { notifications, dismiss, clearAll } = useWorkdeskActivity();
  if (!notifications.length) return null;
  return <aside className="global-workdesk-notifications" aria-label="Global workdesk notifications" aria-live="polite">
    <div className="global-notification-head"><span><Bell size={14} /> LIVE STATUS</span><Button type="button" variant="ghost" size="sm" onClick={clearAll}>Clear all</Button></div>
    <div className="global-notification-list">{notifications.map(item => <article className={`global-notification-item ${item.severity || "info"}`} key={item.id}><span className="global-notification-icon">{item.severity === "success" ? <CheckCircle2 size={16} /> : item.severity === "error" ? <AlertTriangle size={16} /> : item.severity === "warning" ? <AlertTriangle size={16} /> : <Info size={16} />}</span><div><strong>{item.title}</strong><p>{item.message}</p><small>{item.module || item.kind} · {new Date(item.createdAt).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}</small></div><button type="button" className="global-notification-dismiss" onClick={() => dismiss(item.id)} aria-label={`${item.title} dismiss`}><X size={14} /></button></article>)}</div>
  </aside>;
}
