import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { addWaitlistSignup, createAccessCase, createCreativeRequest, createChangelogEntry, listAccessCases, listChangelogForAdmin, listConnectors, listPublishedChangelog, setChangelogStatus, testConnector, updateConnector } from "./db";
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
    changelog: router({
      list: adminProcedure.query(() => listChangelogForAdmin()),
      create: adminProcedure.input(z.object({ version: z.string().trim().min(1).max(40), title: z.string().trim().min(2).max(180), summary: z.string().trim().min(2).max(500), content: z.string().trim().min(2).max(12000), category: changelogCategorySchema.default("feature") })).mutation(({ ctx, input }) => createChangelogEntry({ ...input, createdBy: ctx.user.id })),
      setStatus: adminProcedure.input(z.object({ id: z.number().int().positive(), status: changelogStatusSchema })).mutation(({ input }) => setChangelogStatus(input.id, input.status)),
    }),
    connectors: router({
      list: adminProcedure.query(() => listConnectors()),
      test: adminProcedure.input(z.object({ slug: z.string().min(1).max(80) })).mutation(({ input }) => testConnector(input.slug)),
      setEnabled: adminProcedure.input(z.object({ slug: z.string().min(1).max(80), enabled: z.boolean() })).mutation(({ input }) => updateConnector(input.slug, input.enabled)),
    }),
  }),
  changelog: router({
    published: publicProcedure.query(() => listPublishedChangelog()),
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
    request: protectedProcedure
      .input(z.object({ prompt: z.string().trim().min(3).max(4000), tier: tierSchema.default("free") }))
      .mutation(({ ctx, input }) => createCreativeRequest({ ...input, userId: ctx.user.id })),
  }),
});

export type AppRouter = typeof appRouter;
