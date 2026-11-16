import { z } from "zod";

const userTurnSchema = z.object({
  role: z.literal("user"),
  content: z.string().trim().min(1).max(4000),
});
const assistantTurnSchema = z.object({
  role: z.literal("assistant"),
  content: z.string().trim().min(1).max(8000),
});

/**
 * Conversation history accepted by the authenticated Workspace assistant.
 * System messages are server-owned and cannot be supplied by clients.
 */
export const aiConversationHistorySchema = z
  .array(z.discriminatedUnion("role", [userTurnSchema, assistantTurnSchema]))
  .min(1)
  .max(12)
  .superRefine((messages, context) => {
    if (messages[0]?.role !== "user") {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Conversation must start with a user message." });
    }
    if (messages[messages.length - 1]?.role !== "user") {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Conversation must end with the current user message." });
    }
    for (let index = 1; index < messages.length; index += 1) {
      if (messages[index]?.role === messages[index - 1]?.role) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Conversation roles must alternate." });
        break;
      }
    }
    const totalCharacters = messages.reduce((total, message) => total + message.content.length, 0);
    if (totalCharacters > 16000) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Conversation context exceeds the 16,000-character limit." });
    }
  });

export type AIConversationTurn = z.infer<typeof aiConversationHistorySchema>[number];
