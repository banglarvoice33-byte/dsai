import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type WorkdeskEventKind = "scan" | "sync" | "profile" | "system";
export type WorkdeskEvent = { kind: WorkdeskEventKind; title: string; message: string; severity?: "success" | "warning" | "error" | "info"; module?: string; };
export type WorkdeskActivity = WorkdeskEvent & { id: string; createdAt: number; };

type WorkdeskContextValue = { activities: WorkdeskActivity[]; notifications: WorkdeskActivity[]; publish: (event: WorkdeskEvent) => void; dismiss: (id: string) => void; clearAll: () => void; };

const EVENT_NAME = "dsai-workdesk-event";
const STORAGE_KEY = "dsai-workdesk-activity-v1";
const WorkdeskContext = createContext<WorkdeskContextValue | null>(null);

const readStored = (): WorkdeskActivity[] => { try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); return Array.isArray(value) ? value.slice(0, 30) : []; } catch { return []; } };

export function publishWorkdeskEvent(event: WorkdeskEvent) { if (typeof window === "undefined") return; window.dispatchEvent(new CustomEvent<WorkdeskEvent>(EVENT_NAME, { detail: event })); }

export function WorkdeskActivityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<WorkdeskActivity[]>(readStored);
  const [notifications, setNotifications] = useState<WorkdeskActivity[]>([]);
  const publish = useCallback((event: WorkdeskEvent) => { const item: WorkdeskActivity = { ...event, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: Date.now() }; setActivities(previous => { const next = [item, ...previous].slice(0, 30); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* activity remains in memory */ } return next; }); setNotifications(previous => [item, ...previous].slice(0, 5)); }, []);
  useEffect(() => { const handler = (event: Event) => { const custom = event as CustomEvent<WorkdeskEvent>; if (custom.detail?.title) publish(custom.detail); }; window.addEventListener(EVENT_NAME, handler); return () => window.removeEventListener(EVENT_NAME, handler); }, [publish]);
  const value = useMemo(() => ({ activities, notifications, publish, dismiss: (id: string) => setNotifications(previous => previous.filter(item => item.id !== id)), clearAll: () => setNotifications([]) }), [activities, notifications, publish]);
  return <WorkdeskContext.Provider value={value}>{children}</WorkdeskContext.Provider>;
}

export function useWorkdeskActivity() { const context = useContext(WorkdeskContext); if (!context) throw new Error("useWorkdeskActivity must be used within WorkdeskActivityProvider"); return context; }
