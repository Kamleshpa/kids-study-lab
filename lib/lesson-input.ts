import type { Grade, SetupInput } from "@/lib/types";

export class LessonValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LessonValidationError";
  }
}

/** Subjects allowed by the API (keep in sync with SetupForm). */
export const ALLOWED_SUBJECTS = [
  "Math",
  "Science",
  "Reading",
  "Social Studies",
  "Art",
  "Health",
] as const;

export type AllowedSubject = (typeof ALLOWED_SUBJECTS)[number];

const ALLOWED_SUBJECT_SET = new Set<string>(ALLOWED_SUBJECTS);

const GRADES: Grade[] = ["K", "1", "2", "3", "4", "5"];
const GRADE_SET = new Set<string>(GRADES);

/** Max characters for the free-text topic (server + client). */
export const MAX_TOPIC_LENGTH = 1000;

/**
 * Markers wrapped around user-supplied learning fields in LLM prompts.
 * Stripped from raw topic input so users cannot fake block boundaries.
 */
export const USER_LEARN_MARKERS = {
  begin: "[[[APP_USER_LEARN_BEGIN]]]",
  end: "[[[APP_USER_LEARN_END]]]",
} as const;

export const VERIFIER_FEEDBACK_MARKERS = {
  begin: "[[[APP_VERIFIER_FEEDBACK_BEGIN]]]",
  end: "[[[APP_VERIFIER_FEEDBACK_END]]]",
} as const;

/** Remove NULs, boundary-forgery strings, and enforce max length. */
export function sanitizeTopic(raw: string): string {
  let t = raw.replace(/\u0000/g, "").trim();
  t = t.replaceAll(USER_LEARN_MARKERS.begin, "");
  t = t.replaceAll(USER_LEARN_MARKERS.end, "");
  t = t.replaceAll(VERIFIER_FEEDBACK_MARKERS.begin, "");
  t = t.replaceAll(VERIFIER_FEEDBACK_MARKERS.end, "");
  if (t.length > MAX_TOPIC_LENGTH) {
    t = t.slice(0, MAX_TOPIC_LENGTH).trim();
  }
  return t;
}

/**
 * Validate and normalize POST /api/generate body. Throws Error with safe message.
 */
export function validateLessonRequest(body: {
  grade?: unknown;
  subject?: unknown;
  topic?: unknown;
  questionCount?: unknown;
}): SetupInput {
  const grade = body.grade;
  if (typeof grade !== "string" || !GRADE_SET.has(grade)) {
    throw new LessonValidationError("Invalid grade.");
  }

  const subject =
    typeof body.subject === "string" ? body.subject.trim() : "";
  if (!subject || !ALLOWED_SUBJECT_SET.has(subject)) {
    throw new LessonValidationError("Invalid subject.");
  }

  const topic = sanitizeTopic(typeof body.topic === "string" ? body.topic : "");
  if (!topic) {
    throw new LessonValidationError("Please enter what you want to study.");
  }

  const questionCount = Number(body.questionCount);
  if (
    !Number.isFinite(questionCount) ||
    questionCount < 5 ||
    questionCount > 20
  ) {
    throw new LessonValidationError(
      "questionCount must be between 5 and 20."
    );
  }

  return {
    grade: grade as Grade,
    subject,
    topic,
    questionCount,
  };
}
