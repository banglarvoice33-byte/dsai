/**
 * Client-side idempotency state for durable WorkDesk task submissions.
 *
 * A request can be committed by the server even when its response is lost.
 * Reusing the same key for an unchanged draft makes a retry return that task
 * instead of creating a duplicate. Any payload change receives a fresh key.
 */
export type WorkDeskTaskSubmissionDraft = {
  prompt: string;
  language: "bn" | "en" | "auto";
  provider?: "openrouter";
};

export type WorkDeskTaskSubmission = WorkDeskTaskSubmissionDraft & {
  idempotencyKey: string;
};

export function resolveWorkDeskTaskSubmission(
  previous: WorkDeskTaskSubmission | null,
  draft: WorkDeskTaskSubmissionDraft,
  createIdempotencyKey: () => string,
): WorkDeskTaskSubmission {
  const prompt = draft.prompt.normalize("NFC").trim();
  const provider = draft.provider ?? undefined;

  if (
    previous &&
    previous.prompt === prompt &&
    previous.language === draft.language &&
    (previous.provider ?? undefined) === provider
  ) {
    return previous;
  }

  return {
    prompt,
    language: draft.language,
    ...(provider ? { provider } : {}),
    idempotencyKey: createIdempotencyKey(),
  };
}
