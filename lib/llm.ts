import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export type NormalizedProvider = "openai" | "anthropic" | "google";

export function normalizeProvider(raw: string): NormalizedProvider {
  const p = raw.trim().toLowerCase();
  if (p === "gemini") return "google";
  if (p === "openai" || p === "anthropic" || p === "google") return p;
  throw new Error(
    `Unknown LLM provider "${raw}". Use openai, anthropic, or google.`
  );
}

function resolveModel(provider: NormalizedProvider, apiKey: string, modelId: string) {
  switch (provider) {
    case "openai": {
      const openai = createOpenAI({ apiKey });
      return openai(modelId);
    }
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey });
      return anthropic(modelId);
    }
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey });
      return google(modelId);
    }
  }
}

const GENERATOR_DEFAULT_MODEL: Record<NormalizedProvider, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-20241022",
  google: "gemini-2.0-flash",
};

const VERIFIER_DEFAULT_MODEL: Record<NormalizedProvider, string> = {
  openai: "gpt-4o",
  anthropic: "claude-3-5-sonnet-20241022",
  google: "gemini-2.0-flash",
};

/**
 * Create a language model from explicit credentials (e.g. user-provided keys on Vercel).
 */
export function createLanguageModelFromCredentials(
  providerRaw: string,
  apiKey: string,
  role: "generator" | "verifier",
  modelOverride?: string | null
) {
  const provider = normalizeProvider(providerRaw);
  const defaults =
    role === "generator" ? GENERATOR_DEFAULT_MODEL : VERIFIER_DEFAULT_MODEL;
  const modelId =
    (modelOverride?.trim() && modelOverride.trim()) || defaults[provider];
  return resolveModel(provider, apiKey.trim(), modelId);
}

/** Primary content generator (server env) */
export function getLanguageModel() {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error(
      "Missing LLM_API_KEY. Add it to .env.local (see .env.example), or use BYOK headers on the request."
    );
  }
  const provider = normalizeProvider(process.env.LLM_PROVIDER || "openai");
  const modelId = process.env.LLM_MODEL?.trim() || null;
  return createLanguageModelFromCredentials(
    provider,
    apiKey,
    "generator",
    modelId
  );
}

/** Verifier model (server env) */
export function getVerifierLanguageModel() {
  const mainKey = process.env.LLM_API_KEY?.trim();
  const verifierKey =
    process.env.VERIFIER_LLM_API_KEY?.trim() || mainKey || "";
  if (!verifierKey) {
    throw new Error(
      "Verifier needs VERIFIER_LLM_API_KEY or LLM_API_KEY in .env.local (or BYOK verifier headers)."
    );
  }

  const provider = normalizeProvider(
    process.env.VERIFIER_LLM_PROVIDER ||
      process.env.LLM_PROVIDER ||
      "openai"
  );

  const explicitModel = process.env.VERIFIER_LLM_MODEL?.trim() || null;

  return createLanguageModelFromCredentials(
    provider,
    verifierKey,
    "verifier",
    explicitModel
  );
}
