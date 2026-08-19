import { AlertTriangle, Bell, CheckCircle2, Info, Settings2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkdeskActivity } from "@/contexts/WorkdeskActivityContext";
import { useState } from "react";

export default function GlobalWorkdeskNotifications() {
  const { notifications, preferences, setNotificationsEnabled, toggleModuleMute, markAllRead, dismiss, clearAll } = useWorkdeskActivity();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const modules = Array.from(new Set(notifications.map(item => item.module || item.kind)));
  if (!notifications.length && !settingsOpen) return null;
  const unread = notifications.filter(item => !item.readAt).length;
  return <aside className="global-workdesk-notifications" aria-label="Global workdesk notifications" aria-live="polite">
    <div className="global-notification-head"><span><Bell size={14} /> LIVE STATUS {unread ? `· ${unread} unread` : "· all read"}</span><div className="global-notification-head-actions"><Button type="button" variant="ghost" size="sm" onClick={() => setSettingsOpen(value => !value)} aria-expanded={settingsOpen} aria-label="Notification preferences"><Settings2 size={14} /></Button><Button type="button" variant="ghost" size="sm" onClick={clearAll}>Clear all</Button></div></div>
    {settingsOpen && <section className="global-notification-settings" aria-label="Notification preferences"><label><input type="checkbox" checked={preferences.enabled} onChange={event => setNotificationsEnabled(event.target.checked)} /> Notifications enabled</label><p>Muted modules stay in the activity log but do not create tray alerts.</p>{modules.length ? <div className="global-notification-mutes">{modules.map(module => <label key={module}><input type="checkbox" checked={!preferences.mutedModules.includes(module)} onChange={() => toggleModuleMute(module)} /> {module}</label>)}</div> : <small>New modules appear after their first event.</small>}</section>}
    {notifications.length > 0 && <div className="global-notification-actions"><Button type="button" variant="outline" size="sm" onClick={markAllRead} disabled={!unread}>{unread ? "Mark all as read" : "All read"}</Button><Button type="button" variant="outline" size="sm" onClick={clearAll}>Clear notifications</Button></div>}
    <div className="global-notification-list">{notifications.map(item => <article className={`global-notification-item ${item.severity || "info"} ${item.readAt ? "read" : "unread"}`} key={item.id}><span className="global-notification-icon">{item.severity === "success" ? <CheckCircle2 size={16} /> : item.severity === "error" || item.severity === "warning" ? <AlertTriangle size={16} /> : <Info size={16} />}</span><div><strong>{item.title}</strong><p>{item.message}</p><small>{item.module || item.kind} · {new Date(item.createdAt).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}{item.readAt ? " · read" : ""}</small></div><button type="button" className="global-notification-dismiss" onClick={() => dismiss(item.id)} aria-label={`${item.title} dismiss`}><X size={14} /></button></article>)}</div>
    {preferences.mutedModules.length > 0 && <div className="global-notification-muted-note"><VolumeX size={13} /> Muted: {preferences.mutedModules.join(", ")}</div>}
  </aside>;
}
