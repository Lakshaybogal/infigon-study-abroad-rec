"use client";

import React, { useState, useRef } from "react";
import IntakeForm from "@/components/IntakeForm";
import ResultCard from "@/components/ResultCard";
import LoadingSteps from "@/components/LoadingSteps";
import { StudentProfile, MatchResult, LiveFact } from "@/lib/types";
import {
  Sparkles,
  Compass,
  Building2,
  ShieldCheck,
  Search,
  CheckCircle2,
} from "lucide-react";

export default function PathfinderPage() {
  const [results, setResults] = useState<MatchResult[]>([]);
  const [currentProfile, setCurrentProfile] = useState<StudentProfile | null>(null);
  const [stage, setStage] = useState<"idle" | "matching" | "enriching" | "complete">("idle");
  const [enrichedCount, setEnrichedCount] = useState<number>(0);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleMatchProfile = async (profile: StudentProfile) => {
    setCurrentProfile(profile);
    setErrorBanner(null);
    setStage("matching");
    setEnrichedCount(0);

    // Scroll to results section smoothly
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    try {
      // Single unified call: Gemini searches, matches, and enriches with live web facts in one request
      const matchRes = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!matchRes.ok) {
        const errData = await matchRes.json().catch(() => null);
        throw new Error(
          errData?.details || errData?.error || `Match API error: ${matchRes.statusText}`
        );
      }

      const matchData = await matchRes.json();
      const initialMatches: MatchResult[] = matchData.results || [];

      // Render shortlisted candidates with all live facts populated in a single shot
      setResults(initialMatches);
      setEnrichedCount(initialMatches.length);
      setStage("complete");
    } catch (err: any) {
      console.error("Infigon match workflow failed:", err);
      setErrorBanner(err.message || "An error occurred while discovering programmes.");
      setStage("idle");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      {/* Institutional Top Navbar */}
      <header className="border-b border-[#e5dcd0] bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-stone-900 flex items-center justify-center text-amber-100 shadow-sm">
              <Compass className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg tracking-tight text-stone-900">
                Infigon
              </span>
              <span className="ml-2 text-[11px] font-semibold uppercase tracking-widest text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Study Abroad Engine
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="hidden sm:flex items-center space-x-1.5 text-stone-600 bg-stone-100 px-3 py-1.5 rounded-full border border-stone-200 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Web Admissions Intelligence</span>
            </div>
            <div className="flex items-center space-x-1 text-stone-500 font-mono text-[11px]">
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Hero Header */}
        <div className="mb-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            AI University Recommendation & Live Fact Engine
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight leading-tight">
            Study-Abroad Counsellor Matching Console
          </h1>
          <p className="mt-2.5 text-stone-600 text-sm sm:text-base leading-relaxed">
            Evaluate student profiles across academic fit, tuition affordability, and country preferences.
            Top candidates are enriched in real-time with verified tuition fees, next application deadlines,
            and international scholarships grounded directly from official web sources.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorBanner && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between shadow-sm">
            <span>{errorBanner}</span>
            <button
              onClick={() => setErrorBanner(null)}
              className="text-xs font-semibold text-rose-600 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TOP SECTION: Counsellor Intake Form (Full Width Responsive) */}
        <section className="w-full">
          <IntakeForm
            onSubmit={handleMatchProfile}
            isLoading={stage === "matching" || stage === "enriching"}
          />
        </section>

        {/* BOTTOM SECTION: Live Stepper & Match Results */}
        <section ref={resultsRef} className="w-full pt-4">
          {/* Live Progress Stepper */}
          {(stage === "matching" || stage === "enriching") && (
            <LoadingSteps
              currentStage={stage}
              completedCount={enrichedCount}
              totalCount={results.length}
            />
          )}

          {/* Results Header */}
          {results.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-stone-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100/70 flex items-center justify-center text-amber-800">
                  <Building2 className="w-4 h-4 text-amber-800" />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                    Shortlisted Programmes ({results.length})
                  </h2>
                  <p className="text-xs text-stone-500">
                    Ranked by admission criteria fit and enriched with live web facts
                  </p>
                </div>
              </div>

              <div className="text-xs">
                {stage === "complete" ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-800 font-semibold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    All {results.length} programmes enriched & verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-indigo-700 font-semibold bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200 animate-pulse">
                    Enriching live web facts in parallel...
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Results Cards: Responsive 2-Column Grid on Tablet/Desktop */}
          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((result) => (
                <ResultCard
                  key={result.id}
                  result={result}
                  studentBudget={currentProfile?.budgetINR || 0}
                />
              ))}
            </div>
          ) : stage === "idle" ? (
            <div className="paper-card rounded-2xl p-12 text-center border-dashed border-2 border-stone-300 bg-stone-50/50">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4 text-stone-400">
                <Search className="w-6 h-6 text-stone-500" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-800">
                No Student Profile Submitted Yet
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-1.5 leading-relaxed">
                Fill in the student&apos;s credentials in the form above, or click any of the 1-click test presets
                to instantly score and ground top university programmes.
              </p>
            </div>
          ) : null}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-stone-200 bg-white py-6 text-stone-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Infigon AI University Matching Engine — Built for International Education Counsellors
          </div>
          <div className="flex items-center space-x-3 text-stone-400">
            <span>Official Admissions Portals</span>
            <span>•</span>
            <span>Live Tuition & Deadline Tracking</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
