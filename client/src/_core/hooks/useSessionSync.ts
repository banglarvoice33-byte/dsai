import { useEffect } from "react";
import { SESSION_KEY } from "@/lib/supabaseAuthClient";
import { trpc } from "@/lib/trpc";

export function useSessionSync() {
  const utils = trpc.useUtils();
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === SESSION_KEY || event.key === null) void utils.auth.me.invalidate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [utils]);
}
