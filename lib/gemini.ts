import { GoogleGenAI } from "@google/genai";
import { StudentProfile, MatchResult, LiveFact } from "./types";

interface SourceItem {
  url: string;
  label: string;
}

function extractGroundingSourcesFromResponse(response: any): SourceItem[] {
  const sources: SourceItem[] = [];
  const seenUrls = new Set<string>();

  try {
    // 1. Check interactions API shape
    if (response?.steps) {
      for (const step of response.steps) {
        if (step.grounding_metadata || step.groundingMetadata) {
          const gm = step.grounding_metadata || step.groundingMetadata;
          const chunks = gm.grounding_chunks || gm.groundingChunks || [];
          for (const chunk of chunks) {
            const url = chunk.web?.uri || chunk.web?.url || chunk.url;
            const title = chunk.web?.title || chunk.title || (url ? new URL(url).hostname : "Official Portal");
            if (url && !seenUrls.has(url)) {
              seenUrls.add(url);
              sources.push({ url, label: title });
            }
          }
        }
      }
    }

    // 2. Check generateContent candidates shape
    const candidate = response?.candidates?.[0];
    const gm = candidate?.groundingMetadata || candidate?.grounding_metadata || response?.groundingMetadata;
    if (gm) {
      const chunks = gm.groundingChunks || gm.grounding_chunks || [];
      for (const chunk of chunks) {
        const url = chunk.web?.uri || chunk.web?.url || chunk.url;
        const title = chunk.web?.title || chunk.title || (url ? new URL(url).hostname : "Official Portal");
        if (url && !seenUrls.has(url)) {
          seenUrls.add(url);
          sources.push({ url, label: title });
        }
      }

      const searchQueries = gm.webSearchQueries || gm.web_search_queries || [];
      if (sources.length === 0 && searchQueries.length > 0) {
        for (const query of searchQueries) {
          sources.push({
            url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            label: `Admissions Portal: "${query}"`
          });
        }
      }
    }
  } catch (err) {
    console.warn("Failed parsing grounding metadata sources:", err);
  }

  return sources;
}

/**
 * Dynamically search and discover university programmes using Gemini with Google Search grounding
 */
export async function searchAndMatchProgrammes(
  profile: StudentProfile
): Promise<MatchResult[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_key_here") {
    console.warn("No GEMINI_API_KEY set in environment.");
    throw new Error(
      "GEMINI_API_KEY is not configured. Please add your Google Gemini API key to .env.local to dynamically discover and search university programmes via Google Search grounding."
    );
  }

  const countriesTarget =
    profile.countries && profile.countries.length > 0
      ? profile.countries.join(", ")
      : "Top Global Destinations (e.g. UK, US, Canada, Germany, Singapore, Australia, Netherlands)";

  const locationsTarget =
    profile.locations && profile.locations.length > 0
      ? profile.locations.join(", ")
      : "Any major city or tech cluster";

  const prompt = `
You are an expert AI Study-Abroad Counsellor Engine.
Search the live web using Google Search grounding across official university admissions portals for real university programmes matching this student's profile:

Student Profile:
- Target Field of Study: ${profile.field || "Computer Science / Engineering / Business"}
- Degree Level: ${profile.degree || "Master's"}
- Target Destination Countries: ${countriesTarget}
- Specific Location Preferences: ${locationsTarget}
- Annual Tuition Budget: $${profile.budgetUSD || 50000} USD/year
- Target Intake Term: ${profile.intakeTerm || "Fall 2026"}
- Academic Metrics: GPA: ${profile.gpaPercent ? profile.gpaPercent + "%" : "Not specified"}, IELTS: ${profile.ielts ? profile.ielts + " Band" : "Not specified"}, GRE: ${profile.greGmat || "Not specified"}
${profile.customQuery ? `- Special Inquiries / Bespoke Requirements: "${profile.customQuery}"` : ""}

CRITICAL SEARCH RULES:
1. ONLY return real, active universities located in the requested destination countries (${countriesTarget}). Do NOT include universities from any other unrequested countries.
2. Find 6 to 8 distinct reputable universities with accredited programmes in this field.
3. For each university programme, search and extract:
   - Annual international tuition fee (converted to numeric USD)
   - Next available application deadline (e.g. "15 Jan 2026", "Rolling")
   - Specific international scholarships, grants, or merit fellowships
   - If special student inquiries were provided ("${profile.customQuery || ""}"), verify whether the programme satisfies it (e.g. STEM status, co-op tracks, work visa) in 1 concise sentence.
   - Realistic match fit score (0-100%) and 3-4 specific bullet point reasons why it fits this student profile.

End your answer with ONLY a fenced JSON array in this exact shape:
\`\`\`json
[
  {
    "id": "university-program-slug",
    "name": "Full University Name",
    "country": "Country Name",
    "city": "City Name",
    "state": "State / Province / County",
    "area": "Metropolitan Area or Cluster",
    "program": "Exact Full Degree Programme Title",
    "field": "${profile.field || "Selected Field"}",
    "degree": "${profile.degree || "Master's"}",
    "ieltsMin": 6.5,
    "gpaMinPercent": 75,
    "ranking": "e.g. QS Top 50 / Russell Group / Group of Eight",
    "description": "1-2 sentence description of curriculum focus and career pathways.",
    "score": 85,
    "reasons": [
      "Target field matched: ${profile.field}",
      "Selected country: Country Name",
      "IELTS requirement met"
    ],
    "live": {
      "tuitionUSD": 45000,
      "deadline": "15 Jan 2026",
      "scholarship": "International Merit Award ($10,000)",
      "customInsight": ${profile.customQuery ? `"Verified answer to student custom request"` : `null`}
    }
  }
]
\`\`\`
`.trim();

  try {
    const client = new GoogleGenAI({ apiKey });
    let responseText = "";
    let rawResponse: any = null;

    // Try modern interactions API
    if (typeof (client as any).interactions?.create === "function") {
      try {
        const interaction = await (client as any).interactions.create({
          model: "gemini-3.5-flash",
          input: prompt,
          tools: [{ type: "google_search" }],
        });
        rawResponse = interaction;
        const modelStep = interaction?.steps?.find((s: any) => s.type === "model_output");
        responseText = modelStep?.content?.find((c: any) => c.type === "text")?.text ?? "";
      } catch (e: any) {
        console.warn("interactions.create error in dynamic search, falling back:", e?.message);
      }
    }

    // Try generateContent
    if (!responseText) {
      const modelsToTry = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.5-flash", "gemini-1.5-flash"];
      for (const modelName of modelsToTry) {
        try {
          const response = await client.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              tools: [{ googleSearch: {} }],
            },
          });
          rawResponse = response;
          responseText = response.text || "";
          if (responseText) break;
        } catch (modelErr: any) {
          console.warn(`generateContent with ${modelName} failed in dynamic search:`, modelErr?.message);
        }
      }
    }

    // Parse JSON array
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)```/);
    let parsedList: any[] = [];

    if (jsonMatch && jsonMatch[1]) {
      try {
        parsedList = JSON.parse(jsonMatch[1].trim());
      } catch (pe) {
        console.error("Failed to parse dynamic programmes JSON:", pe);
      }
    } else {
      const arrayMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (arrayMatch) {
        try {
          parsedList = JSON.parse(arrayMatch[0].trim());
        } catch {
          // ignore
        }
      }
    }

    if (Array.isArray(parsedList) && parsedList.length > 0) {
      const globalSources = extractGroundingSourcesFromResponse(rawResponse);
      const nowIso = new Date().toISOString();

      const dynamicResults: MatchResult[] = parsedList.map((item, idx) => {
        const liveData = item.live || {};
        const sources = globalSources.length > 0 ? globalSources : [
          {
            url: `https://www.google.com/search?q=${encodeURIComponent(item.name + " " + item.program + " admissions")}`,
            label: `${item.name} Official Admissions`
          }
        ];

        return {
          id: item.id || `live-uni-${idx}-${Date.now()}`,
          name: item.name || "University Programme",
          country: item.country || (profile.countries?.[0] || "International"),
          city: item.city || "",
          state: item.state || "",
          area: item.area || "",
          program: item.program || item.name,
          field: item.field || profile.field,
          degree: item.degree || profile.degree,
          ieltsMin: typeof item.ieltsMin === "number" ? item.ieltsMin : 6.5,
          gpaMinPercent: typeof item.gpaMinPercent === "number" ? item.gpaMinPercent : 75,
          ranking: item.ranking || "Accredited International University",
          description: item.description || "",
          score: typeof item.score === "number" ? item.score : 80,
          reasons: Array.isArray(item.reasons) ? item.reasons : [`Target field matched: ${profile.field}`],
          live: {
            tuitionUSD: typeof liveData.tuitionUSD === "number" ? liveData.tuitionUSD : null,
            deadline: typeof liveData.deadline === "string" ? liveData.deadline : "Next Intake Admissions Open",
            scholarship: typeof liveData.scholarship === "string" ? liveData.scholarship : "Departmental scholarships available",
            customInsight: typeof liveData.customInsight === "string" ? liveData.customInsight : null,
            sources,
            fetchedAt: nowIso,
            isUnverified: false,
          },
        };
      });

      return dynamicResults;
    }

    throw new Error(
      "Gemini search completed but did not return a valid list of universities. Please verify query parameters and try again."
    );
  } catch (error: any) {
    console.error("searchAndMatchProgrammes error:", error);
    throw error;
  }
}

/**
 * Fetch live facts for single candidate (used for individual re-enrichment)
 */
export async function fetchLiveFacts(
  universityName: string,
  programName: string,
  customQuery?: string
): Promise<LiveFact> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_key_here") {
    console.warn("No valid GEMINI_API_KEY configured in environment.");
    return {
      tuitionUSD: null,
      deadline: null,
      scholarship: null,
      customInsight: null,
      sources: [],
      fetchedAt: new Date().toISOString(),
      isUnverified: true,
    };
  }

  const prompt = `
Find CURRENT, up-to-date official information for this university programme:
University: ${universityName}
Programme: ${programName}

Search for:
1. Annual international tuition fee (in USD; convert to USD if quoted in local currency like EUR/GBP/AUD/SGD with estimated conversion).
2. Current application deadline for international students for the next available upcoming intake (e.g., Fall 2025/2026/2027 or Spring).
3. Specific international scholarships, grants, or merit fellowships available for this programme.
${customQuery && customQuery.trim() ? `4. Counsellor / Student Inquiry: "${customQuery.trim()}". Verify whether this programme satisfies this requirement (e.g., STEM designation, Co-op/internship tracks, work visa eligibility, GRE waivers, campus safety) and provide a concise 1-sentence verified answer.` : ""}

After your research, end your response with ONLY a fenced JSON block in exactly this shape (no extra commentary inside the JSON block):
\`\`\`json
{
  "tuitionUSD": <number or null>,
  "deadline": "<string like '15 Jan 2026' or 'Rolling Admissions' or null>",
  "scholarship": "<short string summarizing specific scholarship name or availability, or null>",
  "customInsight": ${customQuery && customQuery.trim() ? `"<1-sentence factual answer to the custom inquiry>" ` : `null`}
}
\`\`\`
`.trim();

  try {
    const client = new GoogleGenAI({ apiKey });

    let responseText = "";
    let rawResponse: any = null;

    if (typeof (client as any).interactions?.create === "function") {
      try {
        const interaction = await (client as any).interactions.create({
          model: "gemini-3.5-flash",
          input: prompt,
          tools: [{ type: "google_search" }],
        });
        rawResponse = interaction;
        const modelStep = interaction?.steps?.find((s: any) => s.type === "model_output");
        responseText = modelStep?.content?.find((c: any) => c.type === "text")?.text ?? "";
      } catch (interactionErr: any) {
        console.warn("interactions.create error, falling back to generateContent:", interactionErr?.message);
      }
    }

    if (!responseText) {
      const modelsToTry = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.5-flash", "gemini-1.5-flash"];
      for (const modelName of modelsToTry) {
        try {
          const response = await client.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              tools: [{ googleSearch: {} }],
            },
          });
          rawResponse = response;
          responseText = response.text || "";
          if (responseText) break;
        } catch (modelErr: any) {
          console.warn(`generateContent with ${modelName} failed:`, modelErr?.message);
        }
      }
    }

    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)```/);
    let parsed: {
      tuitionUSD?: number | null;
      deadline?: string | null;
      scholarship?: string | null;
      customInsight?: string | null;
    } = {
      tuitionUSD: null,
      deadline: null,
      scholarship: null,
      customInsight: null,
    };

    if (jsonMatch && jsonMatch[1]) {
      try {
        parsed = JSON.parse(jsonMatch[1].trim());
      } catch (parseError) {
        console.error("Failed to parse JSON match:", jsonMatch[1], parseError);
      }
    } else {
      const braceMatch = responseText.match(/\{[\s\S]*"tuitionUSD"[\s\S]*\}/);
      if (braceMatch) {
        try {
          parsed = JSON.parse(braceMatch[0].trim());
        } catch {
          // ignore
        }
      }
    }

    const sources = extractGroundingSourcesFromResponse(rawResponse);
    const hasData =
      parsed.tuitionUSD !== null ||
      parsed.deadline !== null ||
      parsed.scholarship !== null ||
      Boolean(parsed.customInsight);
    const isUnverified = sources.length === 0;

    return {
      tuitionUSD: typeof parsed.tuitionUSD === "number" ? parsed.tuitionUSD : null,
      deadline: typeof parsed.deadline === "string" ? parsed.deadline : null,
      scholarship: typeof parsed.scholarship === "string" ? parsed.scholarship : null,
      customInsight: typeof parsed.customInsight === "string" ? parsed.customInsight : null,
      sources,
      fetchedAt: new Date().toISOString(),
      isUnverified: !hasData || isUnverified,
    };
  } catch (error: any) {
    console.error(`Error enriching live facts for ${universityName}:`, error?.message || error);
    return {
      tuitionUSD: null,
      deadline: null,
      scholarship: null,
      customInsight: null,
      sources: [],
      fetchedAt: new Date().toISOString(),
      isUnverified: true,
    };
  }
}
