import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const learn = readFileSync(new URL("../client/src/pages/Learn.tsx", import.meta.url), "utf8");
const developer = readFileSync(new URL("../client/src/pages/Developer.tsx", import.meta.url), "utf8");
const method = readFileSync(new URL("../client/src/pages/Method.tsx", import.meta.url), "utf8");
const platform = readFileSync(new URL("../client/src/pages/Platform.tsx", import.meta.url), "utf8");
const workspace = readFileSync(new URL("../client/src/pages/Workspace.tsx", import.meta.url), "utf8");
const evidence = readFileSync(new URL("../client/src/pages/Evidence.tsx", import.meta.url), "utf8");
const privacy = readFileSync(new URL("../client/src/pages/Privacy.tsx", import.meta.url), "utf8");
const changelog = readFileSync(new URL("../client/src/pages/Changelog.tsx", import.meta.url), "utf8");
const app = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const themeContext = readFileSync(new URL("../client/src/contexts/ThemeContext.tsx", import.meta.url), "utf8");
const privacyForm = readFileSync(new URL("../client/src/pages/Privacy.tsx", import.meta.url), "utf8");
const adminDeletion = readFileSync(new URL("../client/src/pages/AdminDeletionRequests.tsx", import.meta.url), "utf8");
const adminSearchAnalytics = readFileSync(new URL("../client/src/pages/AdminSearchAnalytics.tsx", ¶»§q«^