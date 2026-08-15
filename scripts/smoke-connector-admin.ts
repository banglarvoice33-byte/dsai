import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";

const ctx: TrpcContext = {
  user: {
    id: 1,
    openId: "smoke-admin",
    name: "Smoke Admin",
    email: "smoke@example.com",
    loginMethod: "smoke",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
};

const caller = appRouter.createCaller(ctx);
const before = await caller.admin.connectors.list();
if (before.length !== 5) throw new Error(`Expected 5 connector records, found ${before.length}`);
const check = await caller.admin.connectors.test({ slug: "twilio" });
if (check.configured || check.status !== "degraded") throw new Error("Expected Twilio to remain in safe degraded mode without provider secrets");
await caller.admin.connectors.setEnabled({ slug: "twilio", enabled: true });
const enabled = (await caller.admin.connectors.list()).find(item => item.slug === "twilio");
if (!enabled || enabled.enabled !== 1 || enabled.status !== "degraded") throw new Error("Enable policy did not persist safe degraded state");
await caller.admin.connectors.setEnabled({ slug: "twilio", enabled: false });
const disabled = (await caller.admin.connectors.list()).find(item => item.slug === "twilio");
if (!disabled || disabled.enabled !== 0 || disabled.status !== "disabled") throw new Error("Disable policy did not persist disabled state");
console.log(JSON.stringify({ connectorCount: before.length, testStatus: check.status, persistedEnable: enabled.enabled, finalStatus: disabled.status }));
