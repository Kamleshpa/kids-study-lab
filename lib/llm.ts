import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

function resolveModel(
  provider: string,
  apiKey: string,
  modelId: string | undefined
) {
  switch (provider) {
    case "openai": {
      const openai = createOpenAI({ apiKey });
      return openai(modelId || "gpt-4o-mini");
    }
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey });
      return anthropic(modelId || "claude-3-5-haiku-20241022");
    }
    case "google":
    case "gemini": {
      const google = createGoogleGenerativeAI({ apiKey });
      return google(modelId || "gemini-2.0-flash");
    }
    default:
      throw new Error(
        `Unknown LLM_PROVIDER "${provider}". Use openai, anthropic, or google.`
      );
  }
}

/** Primary content generator */
export function getLanguageModel() {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error(
      "Missing LLM_API_KEY. Add it to .env.local (see .env.example)."
    );
  }
  const provider = (process.env.LLM_PROVIDER || "openai").toLowerCase();
  const modelId = process.env.LLM_MODEL?.trim();
  return resolveModel(provider, apiKey, modelId);
}

/**
 * Separate verifier model (hallucination / accuracy / guardrails).
 * Uses VERIFIER_* env vars; falls back to main LLM key + provider if verifier key omitted.
 * Default verifier models are stronger than mini/flash defaults when using the same provider.
 */
export function getVerifierLanguageModel() {
  const mainKey = process.env.LLM_API_KEY?.trim();
  const verifierKey =
    process.env.VERIFIER_LLM_API_KEY?.trim() || mainKey || "";
  if (!verifierKey) {
    throw new Error(
      "Verifier needs VERIFIER_LLM_API_KEY or LLM_API_KEY in .env.local."
    );
  }

  const provider = (
    process.env.VERIFIER_LLM_PROVIDER ||
    process.env.LLM_PROVIDER ||
    "openai"
  ).toLowerCase();

  const explicitModel = process.env.VERIFIER_LLM_MODEL?.trim();

  const defaultVerifierModel = (() => {
    if (explicitModel) return explicitModel;
    switch (provider) {
      case "openai":
        return "gpt-4o";
      case "anthropic":
        return "claude-3-5-sonnet-20241022";
      case "google":
      case "gemini":
        return "gemini-2.0-flash";
      default:
        return undefined;
    }
  })();

  return resolveModel(provider, verifierKey, defaultVerifierModel);
}
