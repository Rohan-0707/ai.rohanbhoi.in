import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getSessionUserId } from "@/lib/auth";
import {
  isGoogleTranslateAvailable,
  translatePlanContent,
} from "@/lib/google-translate";
import { mapHousingTypeToEnum } from "@/lib/housing.server";
import { LANGUAGE_LABELS } from "@/lib/languages";
import { validatePlanRequest } from "@/lib/plan-validation";
import { encryptData, encryptOptional } from "@/lib/encryption";
import { buildPlanWeatherContext } from "@/lib/plan-weather-context";
import { isGeneratedPlan, type ChecklistPhase } from "@/lib/types/plan";
import prisma from "@/lib/prisma";

const PLAN_JSON_SCHEMA = `{
  "checklist": [
    { "phase": "Before the storm", "items": ["2-4 actionable strings for pre-storm prep"] },
    { "phase": "During the storm", "items": ["2-4 actionable strings for active storm response"] },
    { "phase": "After the storm", "items": ["2-4 actionable strings for post-storm recovery"] }
  ],
  "recommendations": ["3 broader household safety guidelines as strings"],
  "travelAdvisories": ["3-5 neighborhood-aware travel strings, e.g. roads/underpasses to avoid and elevated evacuation routes"]
}`;

const ENGLISH_SYSTEM_PROMPT = `You are an expert disaster management AI specializing in monsoon preparedness. Analyze the user's location, family size, housing type, any special medical or accessibility needs, AND the supplied liveWeatherContext from Open-Meteo (current conditions + forecast). Provide a hyper-localized emergency preparedness plan aligned to monsoon flash-flood response.

IMPORTANT:
- Write ALL checklist items, recommendations, and travel advisories in English.
- When liveWeatherContext.available is true, you MUST ground every phase in the actual temperature, rain mm, rain probability, wind, and daily forecast provided. Prioritize actions for imminent rain vs dry windows.
- When liveWeatherContext.available is false, infer risks from the location text and typical monsoon patterns.
- If special needs are provided, adjust evacuation steps, supply quantities, medical preparedness, and travel options accordingly.
- The checklist MUST be categorized into exactly three distinct timeline phases in this order: "Before the storm", "During the storm", and "After the storm". Each phase must contain 2-4 highly actionable, location-specific strings tied to the weather outlook.
- travelAdvisories MUST contain 3-5 specific, neighborhood-aware travel and evacuation strings (e.g., "Avoid the underpass on X Road", "Use elevated Y Road if Z junction floods") informed by current/f forecast rain.
- You MUST respond in pure JSON matching this exact schema:
${PLAN_JSON_SCHEMA}`;

function buildNativeLanguagePrompt(languageLabel: string) {
  return `You are an expert disaster management AI specializing in monsoon preparedness. Analyze the user's location, family size, housing type, language preference, any special medical or accessibility needs, AND the supplied liveWeatherContext from Open-Meteo (current conditions + forecast). Provide a hyper-localized emergency preparedness plan aligned to monsoon flash-flood response.

IMPORTANT:
- Write ALL checklist items, recommendations, and travel advisories in ${languageLabel}.
- When liveWeatherContext.available is true, ground every phase in the actual Open-Meteo readings and forecast in liveWeatherContext.
- When liveWeatherContext.available is false, infer risks from the location text and typical monsoon patterns.
- If special needs are provided, adjust evacuation steps, supply quantities, medical preparedness, and travel options accordingly.
- The checklist MUST be categorized into exactly three distinct timeline phases in this order, with the phase labels written in ${languageLabel} (equivalents of "Before the storm", "During the storm", "After the storm"). Each phase must contain 2-4 highly actionable, location-specific strings tied to the weather outlook.
- travelAdvisories MUST contain 3-5 specific, neighborhood-aware travel and evacuation strings referencing local roads and the current/forecast rain.
- You MUST respond in pure JSON with the same structure as this schema (phase names in ${languageLabel}):
${PLAN_JSON_SCHEMA}`;
}

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return new OpenAI({ apiKey });
}

async function generatePlanWithOpenAI(
  systemPrompt: string,
  userPayload: Record<string, unknown>,
) {
  const openai = getOpenAIClient();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(userPayload) },
    ],
    temperature: 0.4,
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from AI model");
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  if (!isGeneratedPlan(parsed)) {
    throw new Error("AI response did not match expected schema");
  }

  return parsed;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validatePlanRequest(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { location, familySize, housingType, language, specialNeeds } =
      validation.data;
    const languageLabel = LANGUAGE_LABELS[language];

    const { summary: weatherSummary, openAiContext: liveWeatherContext } =
      await buildPlanWeatherContext(location);

    const userPayload = {
      location,
      familySize,
      housingType,
      language,
      languageLabel,
      specialNeeds: specialNeeds || null,
      liveWeatherContext,
    };

    const useGoogleTranslate =
      language !== "en" && isGoogleTranslateAvailable();

    let checklist: ChecklistPhase[];
    let recommendations: string[];
    let travelAdvisories: string[];

    if (useGoogleTranslate) {
      const englishPlan = await generatePlanWithOpenAI(
        ENGLISH_SYSTEM_PROMPT,
        userPayload,
      );

      try {
        const translated = await translatePlanContent(
          englishPlan.checklist,
          englishPlan.recommendations,
          englishPlan.travelAdvisories,
          language,
        );
        checklist = translated.checklist;
        recommendations = translated.recommendations;
        travelAdvisories = translated.travelAdvisories;
      } catch (translateError) {
        console.warn(
          "[api/plan/generate] Google Translate failed, falling back to native AI output:",
          translateError,
        );
        const nativePlan = await generatePlanWithOpenAI(
          buildNativeLanguagePrompt(languageLabel),
          userPayload,
        );
        checklist = nativePlan.checklist;
        recommendations = nativePlan.recommendations;
        travelAdvisories = nativePlan.travelAdvisories;
      }
    } else if (language === "en") {
      const englishPlan = await generatePlanWithOpenAI(
        ENGLISH_SYSTEM_PROMPT,
        userPayload,
      );
      checklist = englishPlan.checklist;
      recommendations = englishPlan.recommendations;
      travelAdvisories = englishPlan.travelAdvisories;
    } else {
      const nativePlan = await generatePlanWithOpenAI(
        buildNativeLanguagePrompt(languageLabel),
        userPayload,
      );
      checklist = nativePlan.checklist;
      recommendations = nativePlan.recommendations;
      travelAdvisories = nativePlan.travelAdvisories;
    }

    const housingEnum = mapHousingTypeToEnum(housingType);
    const userId = await getSessionUserId();

    if (userId) {
      const savedPlan = await prisma.emergencyPlan.create({
        data: {
          userId,
          location: encryptData(location),
          familySize,
          housingType: housingEnum,
          language,
          specialNeeds: encryptOptional(specialNeeds || null),
          checklist,
          safetyRecommendations: recommendations,
          travelAdvisories,
          summary: "Monsoon preparedness plan",
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: {
          defaultLocation: encryptData(location),
          housingType,
        },
      });

      return NextResponse.json({
        id: savedPlan.id,
        checklist,
        recommendations,
        travelAdvisories,
        language,
        translatedWith: useGoogleTranslate ? "google" : "openai",
        saved: true,
        weather: weatherSummary,
      });
    }

    return NextResponse.json({
      id: `guest-${Date.now()}`,
      checklist,
      recommendations,
      travelAdvisories,
      language,
      translatedWith: useGoogleTranslate ? "google" : "openai",
      saved: false,
      weather: weatherSummary,
    });
  } catch (error) {
    console.error("[api/plan/generate] Error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to generate plan";

    const status =
      message === "Empty response from AI model" ||
      message === "AI returned invalid JSON" ||
      message === "AI response did not match expected schema"
        ? 502
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
