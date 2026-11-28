import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const service = readFileSync(new URL("./workDeskTextTasks.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../supabase/migrations/20261121150000_dsai_workdesk_persist_edited_results.sql", import.meta.url), "utf8");
const panel = readFileSync(new URL("../client/src/components/WorkDeskTextPanel.tsx", import.meta.url), "utf8");
const workspace = readFileSync(new URL("../client/src/pages/Workspace.tsx", import.meta.url), "utf8");

describe("WorkDesk owner editing and UI integration", () => {
  it("keeps original AI output and owner-edited output in separate persisted fields", () => {
    const saveStart = service.indexOf("export async function saveWorkDeskTextTaskResult");
    const saveBody = service.slice(saveStart);
    expect(saveBody).toContain("edited_result_text = \${clean}");
    expect(saveBody).toContain("edited_result_updated_at = now()");
    expect(saveBody).not.toContain("SET result_text = \${clean}");
    expect(saveBody).toContain("'edited'");
    expect(service).toContain("originalResult:");
    expect(service).toContain("editedResult:");
    expect(migration).toContain("edited_result_text text");
    expect(migration).toContain("edited_result_updated_at timestamptz");
  });

  it("connects prompt creation, task history, retries, cancellation and editing to real tRPC procedures", () => {
    expect(panel).toContain("trpc.workDesk.createTextTask.useMutation");
    expect(panel).toContain("trpc.workDesk.textTasks.useQuery");
    expect(panel).toContain("trpc.workDesk.retryTextTask.useMutation");
    expect(panel).toContain("trpc.workDesk.cancelTextTask.useMutation");
    expect(panel).toContain("trpc.workDesk.saveTextTaskResult.useMutation");
    expect(panel).toContain("createWorkDeskRequestId,");
  });

  it("returns a durable task ID before starting provider work so the owner can cancel immediately", () => {
    const createStart = service.indexOf("export async function createWorkDeskTextTask");
    const createEnd = service.indexOf("export async function startWorkDeskTextTask");
    const createBody = service.slice(createStart, createEnd);
    const retryStart = service.indexOf("export async function retryWorkDeskTextTask");
    const retryEnd = service.indexOf("async function claimNextTextTask");
    const retryBody = service.slice(retryStart, retryEnd);
    const startStart = service.indexOf("export async function startWorkDeskTextTask");
    const startEnd = service.indexOf("export async function listWorkDeskTextTasks");
    const startBody = service.slice(startStart, startEnd);

    expect(createBody).not.toContain("runWorkDeskTextTaskBatch");
    expect(retryBody).not.toContain("runWorkDeskTextTaskBatch");
    expect(startBody).toContain("runWorkDeskTextTaskBatch(1, userId, taskId)");
    expect(startBody).toContain("getWorkDeskTextTask(userId, taskId)");
    expect(panel).toContain("trpc.workDesk.startTextTask.useMutation");
    expect(panel).toContain("start.mutate({ taskId: result.id })");
    expect(panel).toContain('task.status === "queued"');
  });

  it("polls the owner-scoped database lease and aborts provider I/O after cancellation", () => {
    expect(service).toContain("runWithTaskCancellation");
    expect(service).toContain("cancel_requested_at IS NULL");
    expect(service).toContain("providerAbort.abort(new Error(\"workdesk_task_cancelled\"))");
    expect(service).toContain("signal,");
  });

  it("requires per-request billing consent and never auto-retries user-funded Gemini tasks", () => {
    expect(service).toContain("providerConsent !== true");
    expect(service).toContain("row.requested_provider === \"gemini\"");
    expect(service).toContain("row.requested_provider !== \"gemini\"");
    expect(service).toContain("provider_charge_status");
    expect(service).toContain("billingConsent: existing?.requestedProvider === \"gemini\"");
    expect(panel).toContain("geminiBillingConsent");
    expect(panel).toContain("providerConsent: true");
    expect(panel).toContain("providerChargeStatus === \"unknown\"");
  });
  it("requires natural Bengali, consistent technical terms and complete bounded answers", () => {
    expect(service).toContain("প্রমিত ও সহজ বাংলা");
    expect(service).toContain("বাংলা হরফে ইংরেজি উচ্চারণ");
    expect(service).toContain("সংক্ষিপ্ত কিন্তু পূর্ণাঙ্গ উত্তর");
    expect(service).toContain("maxTokens: 1800");
  });

  it("hydrates a task result when polling changes the same task from queued to completed without overwriting drafts", () => {
    expect(panel).toContain("activeTask.status === \"completed\"");
    expect(panel).toContain("!isEditingResult");
    expect(panel).toContain("hasLocalDraft");
    expect(panel).toContain("setEditedResult(activeTask.result ?? \"\")");
    expect(panel).toContain("activeTask?.result");
    expect(panel).toContain("activeTask?.originalResult");
  });

  it("follows the newest task after stale cached history and preserves explicit history selection", () => {
    expect(panel).toContain("const [followLatestTask, setFollowLatestTask] = useState(true)");
    expect(panel).toContain("followLatestTask && allTasks.length > 0");
    expect(panel).toContain("setFollowLatestTask(false)");
    expect(panel).toContain("setFollowLatestTask(true)");
  });

  it("shows the immutable original only when it differs from the current result", () => {
    expect(panel).toContain("activeTask.originalResult && editedResult !== activeTask.originalResult");
  });

  it("makes WorkDesk the first workspace destination without removing file upload and OCR", () => {
    expect(workspace).toContain('initialShowFiles={window.location.pathname === "/documents" || new URLSearchParams(window.location.search).get("panel") === "files"}');
    expect(workspace).toContain("<WorkDeskTextPanel");
    expect(workspace).toContain("<ContractAcknowledgmentPanel");
    expect(panel).toContain('import FileUploadPanel from "@/components/FileUploadPanel"');
    expect(panel).toContain("ফাইল / ছবি যোগ করুন");
    expect(panel).toContain("onOcrText=");
  });
});
