import type { GenerateResponse, SetupInput } from "./types";

export function buildGenerationPrompt(input: SetupInput): string {
  const { grade, subject, topic, questionCount } = input;

  const easy = Math.round(questionCount * 0.5);
  const medium = Math.round(questionCount * 0.3);
  const hard = questionCount - easy - medium;

  return `You are creating kid-friendly study content for elementary school (grades K-5).

## Learner profile
- Grade level: ${grade === "K" ? "Kindergarten" : `Grade ${grade}`}
- Subject area: ${subject}
- Topic the child wants to learn: ${topic}

## Study material
- Write exactly 3 to 4 pages of study material (unless the topic description clearly asks for more pages).
- Each page must have a short, fun title and content the child can read.
- Use vocabulary and sentence length appropriate for the grade.
- Use a warm, encouraging tone. Short paragraphs. You may use **bold** for key words in markdown.
- Content must be accurate and age-appropriate.

## Quiz
- Create exactly ${questionCount} multiple-choice questions that test what was in the study material.
- Each question must have exactly 4 answer choices (strings).
- exactly one correct answer per question; set correctIndex to 0, 1, 2, or 3 for the correct choice.
- Difficulty distribution (counts must match exactly):
  - easy: ${easy} questions
  - medium: ${medium} questions
  - hard: ${hard} questions
- Order questions: put all easy first, then medium, then hard.
- After "Check answer", kids see an explanation: write a short, friendly explanation for each question.

Return only structured data matching the schema—no extra commentary.`;
}

export function buildRegenerationPrompt(
  input: SetupInput,
  verifierFeedback: string,
  attemptNumber: number
): string {
  return `${buildGenerationPrompt(input)}

## Important: revision ${attemptNumber}
A verifier rejected the previous draft. Fix every issue below. Do not repeat factual errors or unsafe content.

### Verifier feedback
${verifierFeedback}

Produce a full new studyPages and questions set matching the schema (same question count and difficulty rules).`;
}

export function buildVerifierPrompt(
  input: SetupInput,
  content: GenerateResponse
): string {
  const pagesJson = JSON.stringify(content.studyPages, null, 0);
  const questionsJson = JSON.stringify(
    content.questions.map((q) => ({
      id: q.id,
      difficulty: q.difficulty,
      question: q.question,
      choices: q.choices,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    })),
    null,
    0
  );

  return `You are an expert fact-checker and safety reviewer for children's educational content (grades K-5).

## Request context
- Grade: ${input.grade === "K" ? "Kindergarten" : `Grade ${input.grade}`}
- Subject: ${input.subject}
- Topic: ${input.topic}

## Your job
1. **Accuracy**: Check that study material and quiz facts match well-established knowledge for this topic. Flag clear errors, hallucinations, or misleading statements.
2. **Quiz consistency**: Each question's \`correctIndex\` must point to the truly correct choice. Explanations must match the keyed answer.
3. **Guardrails**: No inappropriate themes, unsafe instructions, personal data requests, or content above elementary level in sensitivity. Content must be encouraging and suitable for kids.

## Study pages (JSON)
${pagesJson}

## Questions (JSON)
${questionsJson}

Respond with structured output only. Set **approved** to true only if material is accurate enough for a child learner and passes guardrails. If not approved, give **feedbackForRegeneration** with specific, actionable fixes for the author model (what to change, which pages/questions).`;
}

