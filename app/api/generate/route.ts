import { generateStudyWithVerifier } from "@/lib/study-generation";
import { resolveModelsFromRequest } from "@/lib/resolve-request-models";
import type { SetupInput } from "@/lib/types";

export const runtime = "nodejs";
/** Verifier + up to 2 regenerations = several model calls */
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<SetupInput>;
    const grade = body.grade;
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const questionCount = Number(body.questionCount);

    if (!grade || !subject || !topic) {
      return Response.json(
        { error: "grade, subject, and topic are required." },
        { status: 400 }
      );
    }
    if (
      !Number.isFinite(questionCount) ||
      questionCount < 5 ||
      questionCount > 20
    ) {
      return Response.json(
        { error: "questionCount must be between 5 and 20." },
        { status: 400 }
      );
    }

    const input: SetupInput = {
      grade,
      subject,
      topic,
      questionCount,
    };

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
