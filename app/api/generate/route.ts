import { generateStudyWithVerifier } from "@/lib/study-generation";
import { LessonValidationError, validateLessonRequest } from "@/lib/lesson-input";
import { resolveModelsFromRequest } from "@/lib/resolve-request-models";

export const runtime = "nodejs";
/** Verifier + up to 2 regenerations = several model calls */
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const input = validateLessonRequest(body);

    const { generator, verifier } = resolveModelsFromRequest(req);

    const { data, verification } = await generateStudyWithVerifier(input, {
      generator,
      verifier,
    });

    return Response.json({
      studyPages: data.studyPages,
      questions: data.questions,
      verification,
    });
  } catch (e) {
    if (e instanceof LessonValidationError) {
      return Response.json({ error: e.message }, { status: 400 });
    }
    const message =
      e instanceof Error ? e.message : "Failed to generate content.";
    const status = message.includes("This deployment uses your own API key")
      ? 401
      : 500;
    // Never log request headers (may contain user API keys)
    console.error("[api/generate]", message);
    return Response.json({ error: message }, { status });
  }
}
