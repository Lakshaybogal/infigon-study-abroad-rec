export interface TestScore {
  name: string; // e.g. "IELTS", "TOEFL iBT", "PTE", "Duolingo (DET)", "GRE", "GMAT", "SAT", "ACT", "TestDaF", or custom
  score: string; // e.g. "7.5", "105", "325", "720", "1450"
  category?: "Language" | "Standardized" | "Academic" | "Other";
}

export interface StudentProfile {
  field: string;
  degree: "Bachelor's" | "Master's";
  countries: string[];
  locations?: string[]; // Specific cities, states, or metro areas (e.g., "California", "Munich", "London", "Boston")
  budgetINR: number;
  intakeTerm: string;
  academicScore?: string; // e.g., "85%", "8.5 / 10 CGPA", "3.6 / 4.0 GPA", "First Class with Distinction"
  testScores?: TestScore[]; // Dynamic list of any foreign education exams given by student
  gpaPercent?: number; // legacy backwards compatibility
  ielts?: number; // legacy backwards compatibility
  greGmat?: number; // legacy backwards compatibility
  customQuery?: string; // Special requests e.g. "STEM designated", "Co-op / Internships", "Post-study work visa"
}

export interface EligibilityCriteria {
  minAcademicRequirement?: string; // e.g. "Bachelor's in CS/Engineering with min 65-70% or 3.0/4.0 CGPA (UK 2:1 equivalent)"
  languageRequirements?: {
    ielts?: string; // e.g. "6.5 overall (min 6.0 in each band)"
    toefl?: string; // e.g. "90 overall (min 20 subscores)"
    pte?: string;   // e.g. "62 overall"
    duolingo?: string; // e.g. "120+"
    other?: string;
  };
  standardizedTests?: {
    gre?: string;   // e.g. "Optional / 315+ recommended"
    gmat?: string;  // e.g. "650+ / Waived with 2+ yrs work ex"
    satAct?: string;
  };
  workExperience?: string; // e.g. "Not required (1-2 yrs preferred for MBA/Analytics)"
  prerequisites?: string[]; // e.g. ["Calculus", "Linear Algebra", "Data Structures"]
  backlogsAccepted?: string; // e.g. "Up to 5 backlogs accepted"
  documentRequirements?: string[]; // e.g. ["Statement of Purpose (SOP)", "2 Letters of Recommendation (LOR)", "Resume"]
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
  ieltsMin?: number;
  gpaMinPercent?: number;
  description?: string;
  acceptanceRate?: string;
  ranking?: string;
  eligibility?: EligibilityCriteria;
}

export interface LiveFact {
  tuitionINR: number | null;
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
