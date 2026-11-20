import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { addWaitlistSignup, createAccessCase, createCreativeRequest, createChangelogEntry, createDeletionRequest, createStudentScholarshipApplication, consumeStudentProUsage, getStudentProStatus, getStudentScholarshipApplication, listAccessCases, listChangelogForAdmin, listConnectors, listCreativeRequests, listDeletionRequests, listPublishedChangelog, listSearchAnalytics, listStudentScholarshipApplications, recordSearchTerm, reviewStudentScholarshipApplication, setChangelogStatus, testConnector, updateConnector, updateDeletionRequest, createAgentTrace, listAgentTraces, listAdminTraceSummaries, listPerformanceSnapshots, recordPerformanceSnapshot, listBenchmarkRuns, recordBenchmarkRun, listReleaseGateChecks, recordReleaseGateCheck, recordOAuthTestRun, listOAuthTestRuns, createLeadRecord, listLeadRecords, updateLeadRecord, listLeadActivities } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { buildLeadActionPlan, leadIntakeSchema } from "./leadAgent";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { FILE_MAX_BYTES, FILE_RETENTION_DAYS, fileUploadAvailability, listUserFileAssets, malwareScannerStatus, toUserFileAssetView } from "./fileSecurity";
import { captchaConfig, verifyCaptchaToken } from "./captcha";
import { runBengaliBenchmark } from "./bengaliBenchmark";
import { buildCreativePreview } from "./creativePipeline";
import { buildMediaJobPlan } from "@shared/mediaJobContract";
import { buildGuestDemo } from "./guestDemo";
import { composeMultilingualLead } from "./multilingualLead";
import { multilingualLeadInputSchema } from "@shared/multilingualLead";
import { getAIProviderStatus, getImageGenerationAdminStatus, runAIProvider, runAIProviderWithFallback } from "./aiProviders";
import { runBengaliProviderSmokeBenchmark } from "./bengaliProviderBenchmark";
import { aiConversationHistorySchema } from "./aiAssistantHistory";
import { cancelDocumentTask, createDocumentTask, getDocumentTask, listDocumentTasks, processOwnDocumentTasks, retryDocumentTask } from "./workDeskTasks";
import { TRPCError } from "@trpc/server";

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
const leadStatusSchema = z.enum(["new", "qualified", "contacted", "interested", "converted", "lost"]);
const oauthScenarioSchema = z.enum(["state_mismatch", "denied_consent", "insufficient_scope", "callback_success", "token_expired", "revoke_success", "post_revoke_denied"]);

function normalizeSearchTerm(term: string) {
  return term.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase().slice(0, 160);
}

export const appRouter = router({
  aiProviders: router({
    status: adminProcedure.query(() => getAIProviderStatus()),
    test: adminProcedure.input(z.object({ provider: z.enum(["openrouter", "xai", "openai", "gemini", "cloudflare"]), prompt: z.string().trim().min(1).max(4000) })).mutation(({ input }) => runAIProvider({ provider: input.provider, messages: [{ role: "user", content: input.prompt }], maxTokens: 512 })),
    benchmark: adminProcedure.input(z.object({ provider: z.enum(["openrouter", "xai", "openai", "gemini", "cloudflare"]) })).mutation(({ input }) => runBengaliProviderSmokeBenchmark(input.provider)),
  }),
  aiAssistant: router({
    complete: protectedProcedure
      .input(z.object({
        prompt: z.string().trim().min(3).max(4000).optional(),
        messages: aiConversationHistorySchema.optional(),
        allowGemini: z.boolean().optional().default(false),
      }).refine(input => Boolean(input.prompt) !== Boolean(input.messages), {
        message: "Provide either a single prompt or a conversation history.",
      }))
      .mutation(({ ctx, input }) => {
        const conversation = input.messages ?? [{ role: "user" as const, content: input.prompt! }];
        return runAIProviderWithFallback({
          messages: [
            { role: "system", content: "তুমি DSAI-এর বাংলা-first AI সহকারী। স্পষ্ট, সংক্ষিপ্ত ও যাচাইযোগ্য উত্তর দাও। তথ্য অনিশ্চিত হলে তা স্পষ্ট বলো। ব্যবহারকারীর অনুমতি ছাড়া কোনো বাহ্যিক কাজ, বার্তা পাঠানো, কেনাকাটা বা account পরিবর্তন করো না। গুরুত্বপূর্ণ সিদ্ধান্তে নির্ভরযোগ্য উৎস যাচাইয়ের পরামর্শ দাও। আগের কথোপকথনের প্রাসঙ্গিক তথ্য ব্যবহার করো; ব্যবহারকারী সংশোধন করলে নতুন তথ্য অনুসরণ করো।" },
            ...conversation,
          ],
          maxTokens: 1200,
          requestIdentity: String(ctx.user.id),
          preferredProvider: "openrouter",
          allowGemini: input.allowGemini,
        });
      }),
  }),
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    captchaConfig: publicProcedure.query(() => captchaConfig()),
    verifyCaptcha: publicProcedure.input(z.object({ token: z.string().min(1).max(4096) })).mutation(({ ctx, input }) => verifyCaptchaToken(input.token, (ctx.req as any).ip)),
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
    compose: publicProcedure
      .input(multilingualLeadInputSchema)
      .mutation(({ ctx, input }) => composeMultilingualLead(input, ctx.req.ip || "unknown")),
    list: protectedProcedure
      .input(z.object({ limit: z.number().int().min(1).max(100).default(50) }).optional())
      .query(({ ctx, input }) => listLeadRecords(ctx.user.id, input?.limit ?? 50)),
    save: protectedProcedure
      .input(z.object({
        title: z.string().trim().min(1).max(240),
        company: z.string().trim().max(180).optional(),
        contactName: z.string().trim().max(160).optional(),
        email: z.string().trim().email().max(320).optional(),
        phone: z.string().trim().max(40).optional(),
        website: z.string().trim().url().max(500).optional(),
        source: z.string().trim().min(1).max(120).default("user-entered"),
        sourceUrl: z.string().trim().url().max(1000).optional(),
        sourceEvidence: z.string().max(5000).optional(),
        country: z.string().trim().max(80).optional(),
        language: z.string().trim().max(80).optional(),
        industry: z.string().trim().max(80).optional(),
        notes: z.string().max(5000).optional(),
        draftSubject: z.string().trim().max(240).optional(),
        draftBody: z.string().max(4000).optional(),
      }))
      .mutation(({ ctx, input }) => createLeadRecord({ ...input, userId: ctx.user.id })),
    update: protectedProcedure
      .input(z.object({
        id: z.number().int().positive(),
        status: leadStatusSchema.optional(),
        notes: z.string().max(5000).nullable().optional(),
        nextFollowUpAt: z.date().nullable().optional(),
      }))
      .mutation(({ ctx, input }) => updateLeadRecord({ ...input, userId: ctx.user.id })),
    activities: protectedProcedure
      .input(z.object({ leadId: z.number().int().positive(), limit: z.number().int().min(1).max(100).default(50) }))
      .query(({ ctx, input }) => listLeadActivities(ctx.user.id, input.leadId, input.limit)),
  }),
  guestDemo: router({
    preview: publicProcedure
      .input(z.object({ prompt: z.string().trim().min(1).max(800), language: z.enum(["bn", "en"]).default("bn") }))
      .mutation(({ ctx, input }) => buildGuestDemo(input, ctx.req.ip || (ctx.req as any).header("x-forwarded-for")?.split(",")[0]?.trim() || "unknown")),
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
    imageGeneration: router({
      status: adminProcedure.query(() => getImageGenerationAdminStatus()),
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
  workDesk: router({
    tasks: protectedProcedure
      .input(z.object({ limit: z.number().int().min(1).max(50).default(30) }).optional())
      .query(({ ctx, input }) => listDocumentTasks(ctx.user.id, input?.limit ?? 30)),
    processPending: protectedProcedure
      .mutation(({ ctx }) => processOwnDocumentTasks(ctx.user.id)),
    task: protectedProcedure
      .input(z.object({ taskId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const task = await getDocumentTask(ctx.user.id, input.taskId);
        if (!task) throw new TRPCError({ code: "NOT_FOUND", message: "নথির কাজটি পাওয়া যায়নি।" });
        return task;
      }),
    createTask: protectedProcedure
      .input(z.object({
        fileAssetId: z.number().int().positive(),
        idempotencyKey: z.string().trim().min(16).max(128),
        language: z.enum(["bn", "en", "auto"]).default("bn"),
      }))
      .mutation(async ({ ctx, input }) => {
        try { return await createDocumentTask({ ...input, userId: ctx.user.id }); }
        catch (error) {
          const code = (error as { code?: string }).code;
          if (code === "FILE_NOT_READY" || code === "UNSUPPORTED_FORMAT") {
            throw new TRPCError({ code: "PRECONDITION_FAILED", message: "নিরাপত্তা যাচাই সম্পন্ন বা সমর্থিত নথি নির্বাচন করুন।" });
          }
          if (code === "SCANNER_UNAVAILABLE") {
            throw new TRPCError({ code: "PRECONDITION_FAILED", message: "নিরাপত্তা স্ক্যানার প্রস্তুত না থাকায় নথি প্রক্রিয়া বন্ধ রয়েছে।" });
          }
          if (code === "IDEMPOTENCY_CONFLICT") {
            throw new TRPCError({ code: "CONFLICT", message: "এই request key অন্য নথির কাজে ব্যবহৃত হয়েছে।" });
          }
          throw error;
        }
      }),
    cancelTask: protectedProcedure
      .input(z.object({ taskId: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const task = await cancelDocumentTask(ctx.user.id, input.taskId);
        if (!task) throw new TRPCError({ code: "NOT_FOUND", message: "নথির কাজটি পাওয়া যায়নি।" });
        return task;
      }),
    retryTask: protectedProcedure
      .input(z.object({ taskId: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const task = await retryDocumentTask(ctx.user.id, input.taskId);
          if (!task) throw new TRPCError({ code: "NOT_FOUND", message: "নথির কাজটি পাওয়া যায়নি।" });
          return task;
        } catch (error) {
          if ((error as { code?: string }).code === "FILE_NOT_READY") {
            throw new TRPCError({ code: "PRECONDITION_FAILED", message: "নথিটি আর নিরাপদ বা উপলভ্য নয়; নতুন করে নিরাপত্তা যাচাই প্রয়োজন।" });
          }
          throw error;
        }
      }),
  }),
  files: router({
    policy: protectedProcedure.query(() => {
      const scanner = malwareScannerStatus();
      return {
        maxBytes: FILE_MAX_BYTES,
        retentionDays: FILE_RETENTION_DAYS,
        ...fileUploadAvailability(scanner),
      };
    }),
    list: protectedProcedure.query(async ({ ctx }) =>
      (await listUserFileAssets(ctx.user.id)).map(toUserFileAssetView)
    ),
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
    preview: publicProcedure
      .input(z.object({ mode: z.enum(["text-to-image", "text-to-video", "image-to-video"]), prompt: z.string().trim().min(3).max(4000), variationCount: z.union([z.literal(2), z.literal(3)]).optional(), durationSeconds: z.number().int().min(1).max(30).optional(), aspectRatio: z.string().trim().max(20).optional(), sourceAssetId: z.string().trim().max(128).optional(), rightsConfirmed: z.boolean(), safetyAcknowledged: z.boolean() }))
      .mutation(({ input }) => buildCreativePreview(input)),
    jobPlan: protectedProcedure
      .input(z.object({ requestId: z.string().trim().min(1).max(128), mode: z.enum(["text-to-image", "text-to-video", "image-to-video"]), prompt: z.string().trim().min(3).max(4000), estimatedCredits: z.number().int().min(1).max(1000), providerConfigured: z.boolean(), rightsConfirmed: z.boolean(), safetyAcknowledged: z.boolean() }))
      .mutation(({ ctx, input }) => buildMediaJobPlan({ ...input, userId: ctx.user.id })),
    request: protectedProcedure
      .input(z.object({ prompt: z.string().trim().min(3).max(4000), tier: tierSchema.default("free") }))
      .mutation(({ ctx, input }) => createCreativeRequest({ ...input, userId: ctx.user.id })),
  }),
});

export type AppRouter = typeof appRouter;
