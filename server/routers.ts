import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { addWaitlistSignup, createAccessCase, createCreativeRequest, createChangelogEntry, createDeletionRequest, createStudentScholarshipApplication, consumeStudentProUsage, getStudentProStatus, getStudentScholarshipApplication, listAccessCases, listChangelogForAdmin, listConnectors, listCreativeRequests, listDeletionRequests, listPublishedChangelog, listSearchAnalytics, listStudentScholarshipApplications, recordSearchTerm, reviewStudentScholarshipApplication, setChangelogStatus, testConnector, updateConnector, updateDeletionRequest, createAgentTrace, listAgentTraces, listAdminTraceSummaries, listPerformanceSnapshots, recordPerformanceSnapshot, listBenchmarkRuns, recordBenchmarkRun, listReleaseGateChecks, recordReleaseGateCheck, recordOAuthTestRun, listOAuthTestRuns } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { buildLeadActionPlan, leadIntakeSchema } from "./leadAgent";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { FILE_MAX_BYTES, FILE_RETENTION_DAYS, listUserFileAssets, malwareScannerStatus } from "./fileSecurity";
import { captchaConfig, verifyCaptchaToken } from "./captcha";
import { runBengaliBenchmark } from "./bengaliBenchmark";
import { buildCreativePreview } from "./creativePipeline";

const interestSchema = z.enum(["access", "creative", "both"]);
const workflowSchema = z.enum(["document", "government", "healthcare", "jobs", "legal", "billing"]);
const riskSchema = z.enum(["low", "medium", "high"]);
const tierSchema = z.enum(["free", "pro", "creator"]);
const changelogCategorySchema = z.enum(["feature", "improvement", "security", "guide"]);
const changelogStatusSchema = z.enum(["draft", "published"]);
const deletionScopeSchema = z.enum(["account", "all_data", "question"]);
const deletionStatusSchema = z.enum(["pending", "in_review", "completed", "rejected"]);
const searchSourceSchema = z.enum(["homepage"]);
const scholarshipVerificationSchema = z.enum(["institutional_email", "manual_review", "provider_assertion"]);
const scholarshipReviewStatusSchema = z.enum(["in_review", "approved", "rejected"]);
const traceStatusSchema = z.enum(["queued", "running", "paused_for_approval", "completed", "failed"]);
const providerModeSchema = z.enum(["mock", "provider-gated", "local"]);
const benchmarkStatusSchema = z.enum(["passed", "failed", "blocked"]);
const gateCategorySchema = z.enum(["quality", "security", "performance", "provider", "operations"]);
const gateStatusSchema = z.enum(["pending", "pass", "fail", "waived"]);
const oauthScenarioSchema = z.enum(["state_mismatch", "denied_consent", "insufficient_scope", "callback_success", "token_expired", "revoke_success", "post_revoke_denied"]);

function normalizeSearchTerm(term: string) {
  return term.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase().slice(0, 160);
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    captchaConfig: publicProcedure.query(() => captchaConfig()),
    verifyCaptcha: publicProcedure.input(z.object({ token: z.string().min(1).max(4096) })).mutation(({ ctx, input }) => verifyCaptchaToken(input.token, ctx.req.ip)),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  waitlist: router({
    join: publicProcedure
      .input(z.object({ email: z.string().email().max(320), interest: interestSchema.default("both"), language: z.string().max(16).default("bn") }))
      .mutation(({ input }) => addWaitlistSignup(input)),
  }),
  lead: router({
    preview: publicProcedure
      .input(leadIntakeSchema)
      .mutation(({ input }) => buildLeadActionPlan(input)),
  }),
  traces: router({
    list: protectedProcedure.input(z.object({ limit: z.number().int().min(1).max(50).default(50) }).optional()).query(({ ctx, input }) => listAgentTraces(ctx.user.id, input?.limit ?? 50)),
    create: protectedProcedure.input(z.object({ traceKey: z.string().trim().min(8).max(96), agentId: z.string().trim().min(1).max(80), agentName: z.string().trim().min(1).max(120), department: z.string().trim().min(1).max(160), status: traceStatusSchema, providerMode: providerModeSchema, requestLabel: z.string().trim().min(1).max(240), evidenceCount: z.number().int().min(0).max(10000), approvalRequired: z.boolean(), steps: z.array(z.object({ id: z.string().max(96), label: z.string().max(180), role: z.string().max(120), status: z.enum(["started", "completed", "blocked", "failed"]), startedAt: z.number().int().positive(), endedAt: z.number().int().positive().optional(), note: z.string().max(500).optional() })).max(30), startedAt: z.number().int().positive(), endedAt: z.number().int().positive().optional() })).mutation(({ ctx, input }) => createAgentTrace({ ...input, userId: ctx.user.id, startedAt: new Date(input.startedAt), endedAt: input.endedAt ? new Date(input.endedAt) : undefined })),
  }),
  performance: router({
    list: protectedProcedure.input(z.object({ limit: z.number().int().min(1).max(100).default(100) }).optional()).query(({ input }) => listPerformanceSnapshots(input?.limit ?? 100)),
    record: adminProcedure.input(z.object({ module: z.string().trim().min(1).max(120), route: z.string().trim().min(1).max(160), p50Ms: z.number().int().min(0).max(600000), p95Ms: z.number().int().min(0).max(600000), errorRateBps: z.number().int().min(0).max(10000), sampleCount: z.number().int().min(0).max(1000000), source: z.enum(["lab", "field", "synthetic"]) })).mutation(({ input }) => recordPerformanceSnapshot(input)),
  }),
  evaluation: router({
    listBenchmarks: protectedProcedure.input(z.object({ limit: z.number().int().min(1).max(30).default(30) }).optional()).query(({ input }) => listBenchmarkRuns(input?.limit ?? 30)),
    recordBenchmark: adminProcedure.input(z.object({ suiteVersion: z.string().trim().min(1).max(40), language: z.string().trim().max(16).default("bn"), status: benchmarkStatusSchema, scoreBps: z.number().int().min(0).max(10000), sampleCount: z.number().int().min(0).max(100000), resultJson: z.string().max(20000) })).mutation(({ ctx, input }) => recordBenchmarkRun({ ...input, createdBy: ctx.user.id })),
    runBengali: adminProcedure.mutation(({ ctx }) => { const result = runBengaliBenchmark(); return recordBenchmarkRun({ suiteVersion: result.suiteVersion, language: result.language, status: result.status, scoreBps: result.scoreBps, sampleCount: result.sampleCount, resultJson: JSON.stringify(result), createdBy: ctx.user.id }).then(record => ({ record, result })); }),
    listGates: protectedProcedure.input(z.object({ limit: z.number().int().min(1).max(100).default(100) }).optional()).query(({ input }) => listReleaseGateChecks(input?.limit ?? 100)),
    recordGate: adminProcedure.input(z.object({ name: z.string().trim().min(1).max(160), category: gateCategorySchema, status: gateStatusSchema, thresholdLabel: z.string().trim().max(180), observedLabel: z.string().trim().max(180), details: z.string().trim().max(1000) })).mutation(({ ctx, input }) => recordReleaseGateCheck({ ...input, createdBy: ctx.user.id })),
  }),
  oauthTests: router({
    list: protectedProcedure.input(z.object({ limit: z.number().int().min(1).max(50).default(50) }).optional()).query(({ ctx, input }) => listOAuthTestRuns(ctx.user.id, input?.limit ?? 50)),
    record: protectedProcedure.input(z.object({ provider: z.string().trim().min(1).max(80), scenario: oauthScenarioSchema, outcome: benchmarkStatusSchema, scopes: z.string().trim().max(1000), detail: z.string().trim().max(1000) })).mutation(({ ctx, input }) => recordOAuthTestRun({ ...input, userId: ctx.user.id })),
  }),
  admin: router({
    deletion: router({
      list: adminProcedure.query(() => listDeletionRequests()),
      update: adminProcedure.input(z.object({ id: z.number().int().positive(), status: deletionStatusSchema, operatorNote: z.string().trim().max(2000).optional() })).mutation(({ ctx, input }) => updateDeletionRequest({ ...input, reviewedBy: ctx.user.id })),
    }),
    changelog: router({
      list: adminProcedure.query(() => listChangelogForAdmin()),
      create: adminProcedure.input(z.object({ version: z.string().trim().min(1).max(40), title: z.string().trim().min(2).max(180), summary: z.string().trim().min(2).max(500), content: z.string().trim().min(2).max(12000), category: changelogCategorySchema.default("feature") })).mutation(({ ctx, input }) => createChangelogEntry({ ...input, createdBy: ctx.user.id })),
      setStatus: adminProcedure.input(z.object({ id: z.number().int().positive(), status: changelogStatusSchema })).mutation(({ input }) => setChangelogStatus(input.id, input.status)),
    }),
    searchAnalytics: router({
      list: adminProcedure.input(z.object({ limit: z.number().int().min(1).max(100).default(50) }).optional()).query(({ input }) => listSearchAnalytics(input?.limit ?? 50)),
    }),
    connectors: router({
      list: adminProcedure.query(() => listConnectors()),
      test: adminProcedure.input(z.object({ slug: z.string().min(1).max(80) })).mutation(({ input }) => testConnector(input.slug)),
      setEnabled: adminProcedure.input(z.object({ slug: z.string().min(1).max(80), enabled: z.boolean() })).mutation(({ input }) => updateConnector(input.slug, input.enabled)),
    }),
    traces: router({
      list: adminProcedure.input(z.object({ limit: z.number().int().min(1).max(100).default(100) }).optional()).query(({ input }) => listAdminTraceSummaries(input?.limit ?? 100)),
    }),
    scholarship: router({
      list: adminProcedure.query(() => listStudentScholarshipApplications()),
      review: adminProcedure.input(z.object({ id: z.number().int().positive(), status: scholarshipReviewStatusSchema, reviewerNote: z.string().trim().max(1000).optional() })).mutation(({ ctx, input }) => reviewStudentScholarshipApplication({ ...input, reviewerId: ctx.user.id })),
    }),
  }),
  search: router({
    record: publicProcedure
      .input(z.object({ term: z.string().trim().min(2).max(240), source: searchSourceSchema.default("homepage") }))
      .mutation(({ input }) => {
        const normalizedTerm = normalizeSearchTerm(input.term);
        return recordSearchTerm({ normalizedTerm, source: input.source });
      }),
  }),
  changelog: router({
    published: publicProcedure.query(() => listPublishedChangelog()),
  }),
  files: router({
    policy: protectedProcedure.query(() => {
      const scanner = malwareScannerStatus();
      return {
        maxBytes: FILE_MAX_BYTES,
        retentionDays: FILE_RETENTION_DAYS,
        scanner,
        uploadsEnabled: scanner.configured,
        unavailableReason: scanner.configured ? null : "Upload remains disabled until a signed malware-scanner adapter is configured.",
      };
    }),
    list: protectedProcedure.query(({ ctx }) => listUserFileAssets(ctx.user.id)),
  }),
  scholarship: router({
    status: protectedProcedure.query(({ ctx }) => getStudentProStatus(ctx.user.id)),
    application: protectedProcedure.query(({ ctx }) => getStudentScholarshipApplication(ctx.user.id)),
    submit: protectedProcedure.input(z.object({ language: z.string().max(16).default("bn"), country: z.string().trim().min(2).max(80), institution: z.string().trim().min(2).max(180), verificationMethod: scholarshipVerificationSchema.default("manual_review"), evidenceReferenceHash: z.string().trim().max(128).optional(), ageAttested18Plus: z.literal(true) })).mutation(({ ctx, input }) => createStudentScholarshipApplication({ userId: ctx.user.id, language: input.language, country: input.country, institution: input.institution, verificationMethod: input.verificationMethod, evidenceReferenceHash: input.evidenceReferenceHash })),
    consume: protectedProcedure.input(z.object({ units: z.number().int().min(1).max(10).default(1) })).mutation(({ ctx, input }) => consumeStudentProUsage(ctx.user.id, input.units)),
  }),
  privacy: router({
    requestDeletion: publicProcedure.input(z.object({ email: z.string().email().max(320), scope: deletionScopeSchema, details: z.string().trim().max(2000).optional(), identityConfirmed: z.literal(true) })).mutation(({ ctx, input }) => createDeletionRequest({ ...input, userId: ctx.user?.id })),
  }),
  access: router({
    list: protectedProcedure.query(({ ctx }) => listAccessCases(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        title: z.string().trim().min(2).max(180),
        workflow: workflowSchema,
        language: z.string().max(16).default("bn"),
        riskLevel: riskSchema.default("medium"),
        notes: z.string().max(5000).optional(),
      }))
      .mutation(({ ctx, input }) => createAccessCase({ ...input, userId: ctx.user.id })),
  }),
  creative: router({
    list: protectedProcedure.query(({ ctx }) => listCreativeRequests(ctx.user.id)),
    preview: protectedProcedure
      .input(z.object({ mode: z.enum(["text-to-image", "text-to-video", "image-to-video"]), prompt: z.string().trim().min(3).max(4000), durationSeconds: z.number().int().min(1).max(30).optional(), aspectRatio: z.string().trim().max(20).optional(), sourceAssetId: z.string().trim().max(128).optional(), rightsConfirmed: z.boolean(), safetyAcknowledged: z.boolean() }))
      .mutation(({ input }) => buildCreativePreview(input)),
    request: protectedProcedure
      .input(z.object({ prompt: z.string().trim().min(3).max(4000), tier: tierSchema.default("free") }))
      .mutation(({ ctx, input }) => createCreativeRequest({ ...input, userId: ctx.user.id })),
  }),
});

export type AppRouter = typeof appRouter;
