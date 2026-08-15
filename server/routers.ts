import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { addWaitlistSignup, createAccessCase, createCreativeRequest, createChangelogEntry, createDeletionRequest, listAccessCases, listChangelogForAdmin, listConnectors, listCreativeRequests, listDeletionRequests, listPublishedChangelog, listSearchAnalytics, recordSearchTerm, setChangelogStatus, testConnector, updateConnector, updateDeletionRequest } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { buildLeadActionPlan, leadIntakeSchema } from "./leadAgent";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";

const interestSchema = z.enum(["access", "creative", "both"]);
const workflowSchema = z.enum(["document", "government", "healthcare", "jobs", "legal", "billing"]);
const riskSchema = z.enum(["low", "medium", "high"]);
const tierSchema = z.enum(["free", "pro", "creator"]);
const changelogCategorySchema = z.enum(["feature", "improvement", "security", "guide"]);
const changelogStatusSchema = z.enum(["draft", "published"]);
const deletionScopeSchema = z.enum(["account", "all_data", "question"]);
const deletionStatusSchema = z.enum(["pending", "in_review", "completed", "rejected"]);
const searchSourceSchema = z.enum(["homepage"]);

function normalizeSearchTerm(term: string) {
  return term.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase().slice(0, 160);
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
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
    request: protectedProcedure
      .input(z.object({ prompt: z.string().trim().min(3).max(4000), tier: tierSchema.default("free") }))
      .mutation(({ ctx, input }) => createCreativeRequest({ ...input, userId: ctx.user.id })),
  }),
});

export type AppRouter = typeof appRouter;
