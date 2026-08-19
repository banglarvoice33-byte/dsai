import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type WorkdeskEventKind = "scan" | "sync" | "profile" | "system";
export type WorkdeskSeverity = "success" | "warning" | "error" | "info";
export type WorkdeskEvent = { kind: WorkdeskEventKind; category?: string; title: string; message: string; severity?: WorkdeskSeverity; module?: string; };
export type WorkdeskActivity = WorkdeskEvent & { id: string; createdAt: number; readAt?: number; };
export type NotificationPreferences = { enabled: boolean; mutedModules: string[]; mutedCategories: string[]; mutedSeverities: WorkdeskSeverity[]; };

type WorkdeskContextValue = { activities: WorkdeskActivity[]; notifications: WorkdeskActivity[]; preferences: NotificationPreferences; publish: (event: WorkdeskEvent) => void; setNotificationsEnabled: (enabled: boolean) => void; toggleModuleMute: (module: string) => void; toggleCategoryMute: (category: string) => void; toggleSeverityMute: (severity: WorkdeskSeverity) => void; isModuleMuted: (module: string) => boolean; markAllRead: () => void; dismiss: (id: string) => void; clearAll: () => void; };

const EVENT_NAME = "dsai-workdesk-event";
const STORAGE_KEY = "dsai-workdesk-activity-v1";
const PREFERENCES_KEY = "dsai-workdesk-notification-preferences-v2";
const WorkdeskContext = createContext<WorkdeskContextValue | null>(null);
const severities: WorkdeskSeverity[] = ["success", "warning", "error", "info"];

const readStored = (): WorkdeskActivity[] => { try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); return Array.isArray(value) ? value.slice(0, 30) : []; } catch { return []; } };
const readPreferences = (): NotificationPreferences => { try { const value = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || "null"); return { enabled: value?.enabled !== false, mutedModules: Array.isArray(value?.mutedModules) ? value.mutedModules : [], mutedCategories: Array.isArray(value?.mutedCategories) ? value.mutedCategories : [], mutedSeverities: Array.isArray(value?.mutedSeverities) ? value.mutedSeverities.filter((item: unknown): item is WorkdeskSeverity => severities.includes(item as WorkdeskSeverity)) : [] }; } catch { return { enabled: true, mutedModules: [], mutedCategories: [], mutedSeverities: [] }; } };

export function publishWorkdeskEvent(event: WorkdeskEvent) { if (typeof window === "undefined") return; window.dispatchEvent(new CustomEvent<WorkdeskEvent>(EVENT_NAME, { detail: event })); }

export function WorkdeskActivityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<WorkdeskActivity[]>(readStored);
  const [notifications, setNotifications] = useState<WorkdeskActivity[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(readPreferences);
  const persistPreferences = useCallback((next: NotificationPreferences) => { setPreferences(next); try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next)); } catch { /* preference remains in memory */ } }, []);
  const publish = useCallback((event: WorkdeskEvent) => { const item: WorkdeskActivity = { ...event, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: Date.now() }; setActivities(previous => { const next = [item, ...previous].slice(0, 30); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* activity remains in memory */ } return next; }); const category = event.category || event.kind; if (preferences.enabled && !preferences.mutedModules.includes(event.module || event.kind) && !preferences.mutedCategories.includes(category) && !preferences.mutedSeverities.includes(event.severity || "info")) setNotifications(previous => [item, ...previous].slice(0, 5)); }, [preferences]);
  useEffect(() => { const handler = (event: Event) => { const custom = event as CustomEvent<WorkdeskEvent>; if (custom.detail?.title) publish(custom.detail); }; window.addEventListener(EVENT_NAME, handler); return () => window.removeEventListener(EVENT_NAME, handler); }, [publish]);
  const value = useMemo(() => ({ activities, notifications, preferences, publish, setNotificationsEnabled: (enabled: boolean) => persistPreferences({ ...preferences, enabled }), toggleModuleMute: (module: string) => persistPreferences({ ...preferences, mutedModules: preferences.mutedModules.includes(module) ? preferences.mutedModules.filter(item => item !== module) : [...preferences.mutedModules, module] }), toggleCategoryMute: (category: string) => persistPreferences({ ...preferences, mutedCategories: preferences.mutedCategories.includes(category) ? preferences.mutedCategories.filter(item => item !== category) : [...preferences.mutedCategories, category] }), toggleSeverityMute: (severity: WorkdeskSeverity) => persistPreferences({ ...preferences, mutedSeverities: preferences.mutedSeverities.includes(severity) ? preferences.mutedSeverities.filter(item => item !== severity) : [...preferences.mutedSeverities, severity] }), isModuleMuted: (module: string) => !preferences.enabled || preferences.mutedModules.includes(module), markAllRead: () => setNotifications(previous => previous.map(item => ({ ...item, readAt: item.readAt || Date.now() }))), dismiss: (id: string) => setNotifications(previous => previous.filter(item => item.id !== id)), clearAll: () => setNotifications([]) }), [activities, notifications, preferences, publish, persistPreferences]);
  return <WorkdeskContext.Provider value={value}>{children}</WorkdeskContext.Provider>;
}

export function useWorkdeskActivity() { const context = useContext(WorkdeskContext); if (!context) throw new Error("useWorkdeskActivity must be used within WorkdeskActivityProvider"); return context; }
