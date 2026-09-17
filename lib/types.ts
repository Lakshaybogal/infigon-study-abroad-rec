export interface StudentProfile {
  field: string;
  degree: "Bachelor's" | "Master's";
  countries: string[];
  locations?: string[]; // Specific cities, states, or metro areas (e.g., "California", "Munich", "London", "Boston")
  budgetUSD: number;
  intakeTerm: string;
  gpaPercent?: number;
  ielts?: number;
  greGmat?: number;
  customQuery?: string; // Special requests e.g. "STEM designated", "Co-op / Internships", "Post-study work visa"
}

export interface ProgrammeStable {
  id: string;
  name: string;
  country: string;
  city?: string;
  state?: string;
  area?: string;
  program: string;
  field: string;
  degree: "Bachelor's" | "Master's";
  ieltsMin: number;
  gpaMinPercent: number;
  description?: string;
  acceptanceRate?: string;
  ranking?: string;
}

export interface LiveFact {
  tuitionUSD: number | null;
  deadline: string | null;
  scholarship: string | null;
  customInsight?: string | null;
  sources: { url: string; label: string }[];
  fetchedAt: string; // ISO timestamp
  isUnverified?: boolean;
}

export interface MatchResult extends ProgrammeStable {
  score: number;
  reasons: string[];
  live: LiveFact | null; // null while still enriching
  enriching?: boolean;
  error?: string | null;
}
