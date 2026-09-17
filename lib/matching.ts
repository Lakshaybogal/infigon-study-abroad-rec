import { StudentProfile, ProgrammeStable } from "./types";

export interface ScoredProgramme extends ProgrammeStable {
  score: number;
  reasons: string[];
  live: null;
}

export function matchesCountry(progCountry: string, targetCountries: string[]): boolean {
  if (!targetCountries || targetCountries.length === 0) return true;
  const pCountry = (progCountry || "").trim().toLowerCase();

  return targetCountries.some((tc) => {
    const target = tc.trim().toLowerCase();
    if (!target) return false;

    // Direct match or substring
    if (pCountry === target || pCountry.includes(target) || target.includes(pCountry)) {
      return true;
    }

    // UK Aliases
    if (
      (target === "uk" ||
        target === "united kingdom" ||
        target === "britain" ||
        target === "great britain" ||
        target === "england" ||
        target === "scotland") &&
      (pCountry === "united kingdom" || pCountry === "uk" || pCountry.includes("kingdom") || pCountry.includes("britain"))
    ) {
      return true;
    }

    // US Aliases
    if (
      (target === "us" ||
        target === "usa" ||
        target === "united states" ||
        target === "united states of america" ||
        target === "america") &&
      (pCountry === "united states" || pCountry === "usa" || pCountry === "us")
    ) {
      return true;
    }

    // UAE Aliases
    if (
      (target === "uae" || target === "united arab emirates" || target === "dubai") &&
      (pCountry.includes("emirates") || pCountry.includes("uae"))
    ) {
      return true;
    }

    return false;
  });
}

export function scoreProgrammes(
  profile: StudentProfile,
  catalogue: ProgrammeStable[]
): ScoredProgramme[] {
  // 1. Strict Country Filtering: If countries are explicitly selected, restrict candidate pool to those countries
  const hasCountryFilter = profile.countries && profile.countries.length > 0;
  let pool = catalogue;

  if (hasCountryFilter) {
    const filteredByCountry = catalogue.filter((p) =>
      matchesCountry(p.country, profile.countries)
    );
    if (filteredByCountry.length > 0) {
      pool = filteredByCountry;
    }
  }

  // 2. Score Candidate Pool
  const scored = pool.map((programme) => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Field matching (+35)
    const normProfileField = (profile.field || "").trim().toLowerCase();
    const normProgField = (programme.field || "").trim().toLowerCase();
    const normProgName = (programme.program || "").trim().toLowerCase();

    const isFieldMatch =
      normProfileField.length > 0 &&
      (normProgField.includes(normProfileField) ||
        normProfileField.includes(normProgField) ||
        normProgName.includes(normProfileField));

    if (isFieldMatch) {
      score += 35;
      reasons.push(`Target field matched: ${programme.field}`);
    }

    // 2. Country Match (+20)
    if (hasCountryFilter && matchesCountry(programme.country, profile.countries)) {
      score += 20;
      reasons.push(`Selected country: ${programme.country}`);
    }

    // 2b. Specific Location (City / State / Area / Region) preference (+15)
    if (profile.locations && profile.locations.length > 0) {
      const progLocString = `${programme.city || ""} ${programme.state || ""} ${programme.area || ""}`.toLowerCase();
      const matchedLoc = profile.locations.find((loc) => {
        const norm = loc.trim().toLowerCase();
        return norm.length > 2 && progLocString.includes(norm);
      });

      if (matchedLoc) {
        score += 15;
        reasons.push(`Preferred area matched: ${programme.city || programme.state || matchedLoc}`);
      }
    }

    // 3. Degree level (+10)
    if (profile.degree && profile.degree === programme.degree) {
      score += 10;
      reasons.push(`${programme.degree} degree level aligned`);
    }

    // 4. IELTS requirement (+8 / -15)
    if (
      typeof profile.ielts === "number" &&
      !isNaN(profile.ielts) &&
      typeof programme.ieltsMin === "number"
    ) {
      if (profile.ielts >= programme.ieltsMin) {
        score += 8;
        reasons.push(`IELTS requirement met (${profile.ielts} >= ${programme.ieltsMin})`);
      } else {
        score -= 15;
        reasons.push(`Below minimum IELTS (${profile.ielts} < ${programme.ieltsMin})`);
      }
    }

    // 5. GPA requirement (+7 / -10)
    if (
      typeof profile.gpaPercent === "number" &&
      !isNaN(profile.gpaPercent) &&
      typeof programme.gpaMinPercent === "number"
    ) {
      if (profile.gpaPercent >= programme.gpaMinPercent) {
        score += 7;
        reasons.push(`Academic GPA qualified (${profile.gpaPercent}% >= ${programme.gpaMinPercent}%)`);
      } else {
        score -= 10;
        reasons.push(`Below target GPA threshold (${profile.gpaPercent}% < ${programme.gpaMinPercent}%)`);
      }
    }

    // 6. Custom query / counsellor notes match (+10)
    if (profile.customQuery && profile.customQuery.trim().length > 2) {
      const queryWords = profile.customQuery
        .toLowerCase()
        .split(/[\s,;]+/)
        .filter((w) => w.length > 3 && !["with", "from", "that", "this", "have", "want", "need", "like"].includes(w));

      const searchableText = `${programme.program} ${programme.field} ${programme.description || ""} ${programme.ranking || ""} ${programme.country}`.toLowerCase();

      const matchedWords = queryWords.filter((w) => searchableText.includes(w));
      if (matchedWords.length > 0) {
        score += 10;
        reasons.push(`Special requirement aligned (${matchedWords.slice(0, 2).join(", ")})`);
      }
    }

    // Clamp score to [0, 100]
    const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

    return {
      ...programme,
      score: clampedScore,
      reasons,
      live: null,
    };
  });

  // Sort descending by score, tie-break by ranking/GPA
  scored.sort((a, b) => b.score - a.score || b.gpaMinPercent - a.gpaMinPercent);

  // Return top matching candidates
  return scored.slice(0, 8);
}
