import { type PlanLanguage } from "@/lib/languages";

const GOOGLE_TRANSLATE_ENDPOINT =
  "https://translation.googleapis.com/language/translate/v2";

export function isGoogleTranslateAvailable(): boolean {
  return Boolean(process.env.GOOGLE_TRANSLATE_API_KEY?.trim());
}

type TranslateResponse = {
  data?: {
    translations?: Array<{ translatedText: string }>;
  };
  error?: { message?: string };
};

export async function translateTexts(
  texts: string[],
  targetLanguage: PlanLanguage,
  sourceLanguage: PlanLanguage = "en",
): Promise<string[]> {
  if (texts.length === 0) {
    return [];
  }

  if (targetLanguage === sourceLanguage) {
    return texts;
  }

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GOOGLE_TRANSLATE_API_KEY is not configured");
  }

  const params = new URLSearchParams();
  params.set("key", apiKey);
  params.set("target", targetLanguage);
  params.set("source", sourceLanguage);
  params.set("format", "text");

  for (const text of texts) {
    params.append("q", text);
  }

  const response = await fetch(`${GOOGLE_TRANSLATE_ENDPOINT}?${params}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const payload = (await response.json()) as TranslateResponse;

  if (!response.ok) {
    throw new Error(
      payload.error?.message || "Google Translate request failed",
    );
  }

  const translations = payload.data?.translations;

  if (!translations || translations.length !== texts.length) {
    throw new Error("Google Translate returned an unexpected response");
  }

  return translations.map((item) => item.translatedText);
}

export async function translatePlanContent(
  checklist: string[],
  recommendations: string[],
  targetLanguage: PlanLanguage,
): Promise<{ checklist: string[]; recommendations: string[] }> {
  const combined = [...checklist, ...recommendations];
  const translated = await translateTexts(combined, targetLanguage);

  return {
    checklist: translated.slice(0, checklist.length),
    recommendations: translated.slice(checklist.length),
  };
}
