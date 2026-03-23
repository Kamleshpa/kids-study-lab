import { generateObject } from "ai";
import type { LanguageModel } from "ai";
import { z } from "zod";
import { getLanguageModel, getVerifierLanguageModel } from "@/lib/llm";
import {
  AUTHOR_SYSTEM_PROMPT,
  VERIFIER_SYSTEM_PROMPT,
  buildAuthorUserPrompt,
  buildRegenerationUserPrompt,
  buildVerifierUserPrompt,
} from "@/lib/prompts";
import type {
  GenerateResponse,
  Question,
  SetupInput,
  VerificationMeta,
} from "@/lib/types";

/** Initial generation + at most this many verifier-driven regenerations (3 total LLM content runs max). */
export const MAX_REGENERATION_CYCLES = 2;

const studyPageSchema = z.object({
  title: z.string(),
  content: z.string(),
});

const questionSchema = z.object({
  difficulty: z.enum(["easy", "medium", "hard"]),
  question: z.string(),
  choices: z.array(z.string()).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string(),
});

export function buildGenerationSchema(questionCount: number) {
  return z.object({
    studyPages: z.array(studyPageSchema).min(3).max(6),
    questions: z.array(questionSchema).length(questionCount),
  });
}

export function normalizeGeneratedStudy(
  raw: z.infer<ReturnType<typeof buildGenerationSchema>>
): GenerateResponse {
  const studyPages = raw.studyPages.slice(0, 5);
  const questions: Question[] = raw.questions.map((q, i) => ({
    id: i + 1,
    difficulty: q.difficulty,
    question: q.question,
    choices: q.choices,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
  }));
  return { studyPages, questions };
}

const verifierSchema = z.object({
  approved: z.boolean(),
  feedbackForRegeneration: z.string(),
  studyIssues: z.array(z.string()),
  questionIssues: z.array(
    z.object({
      questionIndex: z.number().int().min(0),
      issue: z.string(),
    })
  ),
  guardrailConcerns: z.array(z.string()),
});

function formatVerifierFeedback(v: z.infer<typeof verifierSchema>): string {
  const parts: string[] = [v.feedbackForRegeneration];
  if (v.studyIssues.length) {
    parts.push(`Study issues:\n- ${v.studyIssues.join("\n- ")}`);
  }
  if (v.questionIssues.length) {
    parts.push(
      `Question issues:\n${v.questionIssues
        .map((q) => `- Question index ${q.questionIndex}: ${q.issue}`)
        .join("\n")}`
    );
  }
  if (v.guardrailConcerns.length) {
    parts.push(`Guardrail concerns:\n- ${v.guardrailConcerns.join("\n- ")}`);
  }
  return parts.filter(Boolean).join("\n\n");
}

export async function generateStudyWithVerifier(
  input: SetupInput,
  models?: { generator: LanguageModel; verifier: LanguageModel }
): Promise<{ data: GenerateResponse; verification: VerificationMeta }> {
  const generator = models?.generator ?? getLanguageModel();
  const verifier = models?.verifier ?? getVerifierLanguageModel();
  const schema = buildGenerationSchema(input.questionCount);

  let lastData: GenerateResponse | null = null;
  let lastVerdict: z.infer<typeof verifierSchema> | null = null;

  for (let cycle = 0; cycle <= MAX_REGENERATION_CYCLES; cycle++) {
    const authorUserPrompt =
      cycle === 0
        ? buildAuthorUserPrompt(input)
        : buildRegenerationUserPrompt(
            input,
            formatVerifierFeedback(lastVerdict!),
            cycle
          );

    const { object } = await generateObject({
      model: generator,
      system: AUTHOR_SYSTEM_PROMPT,
      schema,
      schemaName: "KidsStudyContent",
      schemaDescription:
        "Kid-friendly study pages and multiple-choice quiz for elementary learners",
      prompt: authorUserPrompt,
    });

    lastData = normalizeGeneratedStudy(object);

    const { object: verdict } = await generateObject({
      model: verifier,
      system: VERIFIER_SYSTEM_PROMPT,
      schema: verifierSchema,
      schemaName: "VerifierVerdict",
      schemaDescription:
        "Fact-check, quiz key validation, and child-safety review",
      prompt: buildVerifierUserPrompt(input, lastData),
    });

    lastVerdict = verdict;

    if (verdict.approved) {
      return {
        data: lastData,
        verification: {
          attempts: cycle + 1,
          approved: true,
        },
      };
    }
  }

  return {
    data: lastData!,
    verification: {
      attempts: MAX_REGENERATION_CYCLES + 1,
      approved: false,
      note:
        lastVerdict?.feedbackForRegeneration ||
        "Content could not be verified after maximum revision attempts. Please try a different topic or check your API configuration.",
    },
  };
}
