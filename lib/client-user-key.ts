const STORAGE_KEY = "kids_study_user_llm_v1";

export type StoredUserLlm = {
  provider: string;
  apiKey: string;
  model?: string;
  verifierApiKey?: string;
  verifierProvider?: string;
  verifierModel?: string;
};

export function readStoredUserLlm(): StoredUserLlm | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredUserLlm;
    if (!data?.apiKey?.trim() || !data?.provider?.trim()) return null;
    return data;
  } catch {
    return null;
  }
}

export function writeStoredUserLlm(data: StoredUserLlm): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearStoredUserLlm(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

/** Headers for POST /api/generate — never log these on the server. */
export function byokHeaders(data: StoredUserLlm): Record<string, string> {
  const h: Record<string, string> = {
    "x-llm-provider": data.provider.trim(),
    "x-llm-api-key": data.apiKey.trim(),
  };
  if (data.model?.trim()) h["x-llm-model"] = data.model.trim();
  if (data.verifierApiKey?.trim()) {
    h["x-verifier-api-key"] = data.verifierApiKey.trim();
  }
  if (data.verifierProvider?.trim()) {
    h["x-verifier-provider"] = data.verifierProvider.trim();
  }
  if (data.verifierModel?.trim()) {
    h["x-verifier-model"] = data.verifierModel.trim();
  }
  return h;
}
