"use client";

import React, { createContext, useContext, useMemo, useReducer } from "react";
import type {
  AnswerState,
  Phase,
  Question,
  SetupInput,
  StudyPage,
  VerificationMeta,
} from "@/lib/types";

type State = {
  phase: Phase;
  setup: SetupInput | null;
  studyPages: StudyPage[];
  questions: Question[];
  studyPageIndex: number;
  quizIndex: number;
  answers: AnswerState[];
  loadingError: string | null;
  verification: VerificationMeta | null;
};

const initialState: State = {
  phase: "setup",
  setup: null,
  studyPages: [],
  questions: [],
  studyPageIndex: 0,
  quizIndex: 0,
  answers: [],
  loadingError: null,
  verification: null,
};

type Action =
  | { type: "SUBMIT_SETUP"; payload: SetupInput }
  | {
      type: "LOAD_SUCCESS";
      payload: {
        studyPages: StudyPage[];
        questions: Question[];
        verification?: VerificationMeta | null;
      };
    }
  | { type: "LOAD_ERROR"; payload: string }
  | { type: "SET_STUDY_PAGE"; payload: number }
  | { type: "GO_READY" }
  | { type: "BACK_TO_STUDY" }
  | { type: "START_QUIZ" }
  | { type: "SET_QUIZ_INDEX"; payload: number }
  | { type: "SELECT_ANSWER"; payload: number }
  | { type: "CHECK_ANSWER" }
  | { type: "SHOW_RESULTS" }
  | { type: "RETRY_QUIZ" }
  | { type: "RESET_APP" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SUBMIT_SETUP":
      return {
        ...initialState,
        phase: "loading",
        setup: action.payload,
      };
    case "LOAD_SUCCESS":
      return {
        ...state,
        phase: "study",
        studyPages: action.payload.studyPages,
        questions: action.payload.questions,
        studyPageIndex: 0,
        quizIndex: 0,
        answers: action.payload.questions.map(() => ({
          selectedIndex: null,
          checked: false,
        })),
        loadingError: null,
        verification: action.payload.verification ?? null,
      };
    case "LOAD_ERROR":
      return {
        ...state,
        phase: "setup",
        loadingError: action.payload,
      };
    case "SET_STUDY_PAGE":
      return {
        ...state,
        studyPageIndex: Math.max(
          0,
          Math.min(action.payload, state.studyPages.length - 1)
        ),
      };
    case "GO_READY":
      return { ...state, phase: "ready" };
    case "BACK_TO_STUDY":
      return { ...state, phase: "study" };
    case "START_QUIZ":
      return { ...state, phase: "quiz", quizIndex: 0 };
    case "SET_QUIZ_INDEX":
      return {
        ...state,
        quizIndex: Math.max(
          0,
          Math.min(action.payload, state.questions.length - 1)
        ),
      };
    case "SELECT_ANSWER": {
      const i = state.quizIndex;
      const cur = state.answers[i];
      if (!cur || cur.checked) return state;
      const next = [...state.answers];
      next[i] = { ...cur, selectedIndex: action.payload };
      return { ...state, answers: next };
    }
    case "CHECK_ANSWER": {
      const i = state.quizIndex;
      const cur = state.answers[i];
      if (!cur || cur.selectedIndex === null || cur.checked) return state;
      const next = [...state.answers];
      next[i] = { ...cur, checked: true };
      return { ...state, answers: next };
    }
    case "SHOW_RESULTS":
      return { ...state, phase: "results" };
    case "RETRY_QUIZ":
      return {
        ...state,
        phase: "quiz",
        quizIndex: 0,
        answers: state.questions.map(() => ({
          selectedIndex: null,
          checked: false,
        })),
      };
    case "RESET_APP":
      return { ...initialState };
    default:
      return state;
  }
}

type StudyContextValue = {
  state: State;
  submitSetup: (input: SetupInput) => void;
  loadSuccess: (payload: {
    studyPages: StudyPage[];
    questions: Question[];
    verification?: VerificationMeta | null;
  }) => void;
  loadError: (message: string) => void;
  setStudyPage: (index: number) => void;
  goReady: () => void;
  backToStudy: () => void;
  startQuiz: () => void;
  setQuizIndex: (index: number) => void;
  selectAnswer: (choiceIndex: number) => void;
  checkAnswer: () => void;
  showResults: () => void;
  retryQuiz: () => void;
  resetApp: () => void;
};

const StudyContext = createContext<StudyContextValue | null>(null);

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo<StudyContextValue>(
    () => ({
      state,
      submitSetup: (payload) => dispatch({ type: "SUBMIT_SETUP", payload }),
      loadSuccess: (payload) => dispatch({ type: "LOAD_SUCCESS", payload }),
      loadError: (payload) => dispatch({ type: "LOAD_ERROR", payload }),
      setStudyPage: (payload) => dispatch({ type: "SET_STUDY_PAGE", payload }),
      goReady: () => dispatch({ type: "GO_READY" }),
      backToStudy: () => dispatch({ type: "BACK_TO_STUDY" }),
      startQuiz: () => dispatch({ type: "START_QUIZ" }),
      setQuizIndex: (payload) => dispatch({ type: "SET_QUIZ_INDEX", payload }),
      selectAnswer: (payload) => dispatch({ type: "SELECT_ANSWER", payload }),
      checkAnswer: () => dispatch({ type: "CHECK_ANSWER" }),
      showResults: () => dispatch({ type: "SHOW_RESULTS" }),
      retryQuiz: () => dispatch({ type: "RETRY_QUIZ" }),
      resetApp: () => dispatch({ type: "RESET_APP" }),
    }),
    [state]
  );

  return (
    <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
  );
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy must be used within StudyProvider");
  return ctx;
}

/** Score uses any selected choice, whether or not "Check answer" was used. */
export function useScore() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useScore must be used within StudyProvider");
  const { state } = ctx;

  return useMemo(() => {
    let correct = 0;
    let answered = 0;
    const byDiff = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 },
    };
    type K = keyof typeof byDiff;

    state.questions.forEach((q, i) => {
      const a = state.answers[i];
      const d = q.difficulty as K;
      if (a != null && a.selectedIndex !== null) {
        answered++;
        byDiff[d].total++;
        if (a.selectedIndex === q.correctIndex) {
          correct++;
          byDiff[d].correct++;
        }
      }
    });

    const incorrect: Question[] = [];
    state.questions.forEach((q, i) => {
      const a = state.answers[i];
      if (
        a != null &&
        a.selectedIndex !== null &&
        a.selectedIndex !== q.correctIndex
      ) {
        incorrect.push(q);
      }
    });

    const unanswered = state.questions.filter(
      (_, i) => state.answers[i]?.selectedIndex === null
    ).length;

    return { correct, answered, byDiff, incorrect, unanswered };
  }, [state.questions, state.answers]);
}
