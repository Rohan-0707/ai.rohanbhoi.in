import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getSessionUserId } from "@/lib/auth";
import {
  isGoogleTranslateAvailable,
  translatePlanContent,
} from "@/lib/google-translate";
import { mapHousingTypeToEnum } from "@/lib/housing.server";
import {
  isValidPlanLanguage,
  LANGUAGE_LABELS,
  type PlanLanguage,
} from "@/lib/languages";
import { isGeneratedPlan } from "@/lib/types/plan";
import prisma from "@/lib/prisma";

const ENGLISH_SYSTEM_PROMPT = `You are an expert disaster management AI specializing in monsoon preparedness. Analyze the user's location, family size, housing type, and any special medical or accessibility needs. Provide a hyper-localized emergency preparedness plan.

IMPORTANT:
- Write ALL checklist items and safety recommendations in English.
- If special needs are provided, adjust evacuation steps, supply quantities, and medical preparedness accordingly.
- You MUST respond in pure JSON with exactly two top-level keys: 'checklist' (an array of 5 highly actionable, specific prep strings) and 'recommendations' (an array of 3 broader safety guidelines).`;

function buildNativeLanguagePrompt(languageLabel: string) {
  return `You are an expert disaster management AI specializing in monsoon preparedness. Analyze the user's location, family size, housing type, language preference, and any special medical or accessibility needs. Provide a hyper-localized emergency preparedness plan.

IMPORTANT:
- Write ALL checklist items and safety recommendations in ${languageLabel}.
- If special needs are provided, adjust evacuation steps, supply quantities, and medical preparedness accordingly.
- You MUST respond in pure JSON with exactly two top-level keys: 'checklist' (an array of 5 highly actionable, specific prep strings) and 'recommendations' (an array of 3 broader safety guidelines).`;
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
    const location = typeof body.location === "string" ? body.location.trim() : "";
    const familySize = Number(body.familySize);
    const housingType =
      typeof body.housingType === "string" ? body.housingType.trim() : "";
    const language =
      typeof body.language === "string" ? body.language.trim() : "en";
    const specialNeeds =
      typeof body.specialNeeds === "string" ? body.specialNeeds.trim() : "";

    if (!location) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 },
      );
    }

    if (!Number.isInteger(familySize) || familySize < 1 || familySize > 20) {
      return NextResponse.json(
        { error: "Family size must be between 1 and 20" },
        { status: 400 },
      );
    }

    const validHousingTypes = ["Apartment", "Independent House", "Ground Floor"];

    if (!validHousingTypes.includes(housingType)) {
      return NextResponse.json(
        { error: "Invalid housing type" },
        { status: 400 },
      );
    }

    if (!isValidPlanLanguage(language)) {
      return NextResponse.json(
        { error: "Invalid language preference" },
        { status: 400 },
      );
    }

    const planLanguage = language as PlanLanguage;
    const languageLabel = LANGUAGE_LABELS[planLanguage];
    const userPayload = {
      location,
      familySize,
      housingType,
      language: planLanguage,
      languageLabel,
      specialNeeds: specialNeeds || null,
    };

    const useGoogleTranslate =
      planLanguage !== "en" && isGoogleTranslateAvailable();

    let checklist: string[];
    let recommendations: string[];

    if (useGoogleTranslate) {
      const englishPlan = await generatePlanWithOpenAI(
        ENGLISH_SYSTEM_PROMPT,
        userPayload,
      );

      try {
        const translated = await translatePlanContent(
          englishPlan.checklist,
          englishPlan.recommendations,
          planLanguage,
        );
        checklist = translated.checklist;
        recommendations = translated.recommendations;
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
      }
    } else if (planLanguage === "en") {
      const englishPlan = await generatePlanWithOpenAI(
        ENGLISH_SYSTEM_PROMPT,
        userPayload,
      );
      checklist = englishPlan.checklist;
      recommendations = englishPlan.recommendations;
    } else {
      const nativePlan = await generatePlanWithOpenAI(
        buildNativeLanguagePrompt(languageLabel),
        userPayload,
      );
      checklist = nativePlan.checklist;
      recommendations = nativePlan.recommendations;
    }

    const housingEnum = mapHousingTypeToEnum(housingType);
    const userId = await getSessionUserId();

    const savedPlan = await prisma.emergencyPlan.create({
      data: {
        userId,
        location,
        familySize,
        housingType: housingEnum,
        language: planLanguage,
        specialNeeds: specialNeeds || null,
        checklist,
        safetyRecommendations: recommendations,
        summary: `Monsoon preparedness plan for ${location}`,
      },
    });

    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          defaultLocation: location,
          housingType,
        },
      });
    }

    return NextResponse.json({
      id: savedPlan.id,
      checklist,
      recommendations,
      language: planLanguage,
      translatedWith: useGoogleTranslate ? "google" : "openai",
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
