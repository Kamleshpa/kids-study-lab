export type Grade = "K" | "1" | "2" | "3" | "4" | "5";
export type Difficulty = "easy" | "medium" | "hard";

export interface StudyPage {
  title: string;
  content: string;
}

export interface Question {
  id: number;
  difficulty: Difficulty;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

export interface GenerateResponse {
  studyPages: StudyPage[];
  questions: Question[];
}

/** Server-side verifier metadata (optional on client) */
export interface VerificationMeta {
  attempts: number;
  approved: boolean;
  note?: string;
}

export type Phase = "setup" | "loading" | "study" | "ready" | "quiz" | "results";

export interface SetupInput {
  grade: Grade;
  subject: string;
  topic: string;
  questionCount: number;
}

export interface AnswerState {
  selectedIndex: number | null;
  checked: boolean;
}
