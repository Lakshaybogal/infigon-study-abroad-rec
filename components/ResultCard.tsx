"use client";

import React from "react";
import { MatchResult } from "@/lib/types";
import {
  ExternalLink,
  Clock,
  AlertTriangle,
  Award,
  DollarSign,
  Calendar,
  Sparkles,
  MapPin,
  GraduationCap,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Globe,
} from "lucide-react";

interface ResultCardProps {
  result: MatchResult;
  studentBudget: number;
}

function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return "Just now";
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(isoString).toLocaleDateString();
  } catch {
    return "Recently";
  }
}

function getScoreColor(score: number) {
  if (score >= 70) {
    return {
      badge: "bg-emerald-50 text-emerald-800 border-emerald-300",
      ring: "text-emerald-700",
      dot: "bg-emerald-600",
      label: "Strong Match",
    };
  }
  if (score >= 45) {
    return {
      badge: "bg-amber-50 text-amber-900 border-amber-300",
      ring: "text-amber-700",
      dot: "bg-amber-600",
      label: "Moderate Match",
    };
  }
  return {
    badge: "bg-stone-100 text-stone-700 border-stone-300",
    ring: "text-stone-600",
    dot: "bg-stone-500",
    label: "Reach Option",
  };
}

export default function ResultCard({ result, studentBudget }: ResultCardProps) {
  const isEnriching = result.live === null && !result.error;
  const live = result.live;
  const scoreConfig = getScoreColor(result.score);

  // Budget comparison
  const isOverBudget =
    typeof live?.tuitionUSD === "number" &&
    typeof studentBudget === "number" &&
    studentBudget > 0 &&
    live.tuitionUSD > studentBudget;

  const budgetDifference =
    isOverBudget && live?.tuitionUSD
      ? live.tuitionUSD - studentBudget
      : 0;

  return (
    <div className="paper-card rounded-xl p-6 relative overflow-hidden transition-all duration-300 flex flex-col justify-between">
      {/* Top Header: University & Match Score */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
                <MapPin className="w-3 h-3 text-stone-500" />
                {result.city ? `${result.city}, ${result.country}` : result.country}
              </span>
              {result.area && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-stone-50 text-stone-600 border border-stone-200">
                  {result.area}
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
                <GraduationCap className="w-3 h-3 text-stone-500" />
                {result.degree}
              </span>
              {result.ranking && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  {result.ranking}
                </span>
              )}
            </div>

            <h3 className="font-serif text-xl font-bold text-stone-900 tracking-tight leading-snug">
              {result.name}
            </h3>
            <p className="text-sm font-medium text-stone-700 mt-0.5">
              {result.program}
            </p>
          </div>

          {/* Match Score Badge */}
          <div className="flex flex-col items-end shrink-0">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold shadow-sm ${scoreConfig.badge}`}
            >
              <div className={`w-2 h-2 rounded-full ${scoreConfig.dot}`} />
              <span>{result.score}% Fit</span>
            </div>
            <span className="text-[11px] text-stone-500 font-medium mt-1">
              {scoreConfig.label}
            </span>
          </div>
        </div>

        {/* Scoring Reasons Badges */}
        {result.reasons && result.reasons.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-stone-100 flex flex-wrap gap-1.5">
            {result.reasons.map((reason, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[#f6f2ec] text-stone-700 border border-[#eae2d4]"
              >
                <TrendingUp className="w-2.5 h-2.5 text-stone-500" />
                {reason}
              </span>
            ))}
          </div>
        )}

        {/* Minimum Entry Criteria */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-stone-600 bg-stone-50/80 p-2.5 rounded-lg border border-stone-200/70">
          <div>
            <span className="text-stone-400">Min IELTS: </span>
            <span className="font-semibold text-stone-800">
              {result.ieltsMin ? `${result.ieltsMin} Band` : "N/A"}
            </span>
          </div>
          <div>
            <span className="text-stone-400">Min Academic GPA: </span>
            <span className="font-semibold text-stone-800">
              {result.gpaMinPercent ? `${result.gpaMinPercent}%` : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Live Enrichment Section */}
      <div className="mt-5 pt-4 border-t border-stone-200">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
              Live Admissions Facts
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified
            </span>
          </div>

          {live?.fetchedAt && (
            <div className="flex items-center gap-1 text-[11px] text-stone-500">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>{formatRelativeTime(live.fetchedAt)}</span>
            </div>
          )}
        </div>

        {/* Skeleton while enriching */}
        {isEnriching && (
          <div className="space-y-2.5 py-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-stone-200 animate-pulse" />
              <div className="h-4 bg-stone-200 rounded animate-shimmer w-3/4" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-stone-200 animate-pulse" />
              <div className="h-4 bg-stone-200 rounded animate-shimmer w-1/2" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-stone-200 animate-pulse" />
              <div className="h-4 bg-stone-200 rounded animate-shimmer w-5/6" />
            </div>
            <p className="text-[11px] text-stone-400 italic mt-2 animate-pulse">
              Consulting university records and live admissions search...
            </p>
          </div>
        )}

        {/* Live Fact Details */}
        {!isEnriching && live && (
          <div className="space-y-2.5 text-xs">
            {/* Tuition */}
            <div className="flex items-start justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-200/80">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-stone-200/70 text-stone-700">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[11px] text-stone-500 font-medium">
                    Annual International Tuition
                  </div>
                  <div className="text-sm font-bold text-stone-900">
                    {live.tuitionUSD !== null ? (
                      `$${live.tuitionUSD.toLocaleString()} USD/year`
                    ) : (
                      <span className="text-stone-500 italic font-normal">
                        See official fee schedule
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Over Budget Alert */}
              {isOverBudget ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  +${budgetDifference.toLocaleString()} Over Budget
                </span>
              ) : live.tuitionUSD && studentBudget > 0 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  Within Budget
                </span>
              ) : null}
            </div>

            {/* Application Deadline */}
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-stone-50 border border-stone-200/80">
              <div className="p-1 rounded bg-stone-200/70 text-stone-700">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[11px] text-stone-500 font-medium">
                  Next Application Deadline
                </div>
                <div className="text-xs font-semibold text-stone-800">
                  {live.deadline ? (
                    live.deadline
                  ) : (
                    <span className="text-stone-500 italic font-normal">
                      Check admissions calendar
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Scholarship */}
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-stone-50 border border-stone-200/80">
              <div className="p-1 rounded bg-stone-200/70 text-stone-700">
                <Award className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <div className="text-[11px] text-stone-500 font-medium">
                  Scholarships & Aid
                </div>
                <div className="text-xs font-medium text-stone-800">
                  {live.scholarship ? (
                    live.scholarship
                  ) : (
                    <span className="text-stone-500 italic font-normal">
                      Departmental waivers available upon application
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Query Grounded Insight */}
            {live.customInsight && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-amber-900">
                <div className="p-1 rounded bg-amber-200/70 text-amber-800">
                  <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] text-amber-800 font-bold uppercase tracking-wider">
                    Special Requirement Verified
                  </div>
                  <div className="text-xs font-medium text-amber-950 mt-0.5">
                    {live.customInsight}
                  </div>
                </div>
              </div>
            )}

            {/* Citations & Sources */}
            <div className="pt-2 border-t border-stone-100">
              <div className="text-[11px] font-medium text-stone-500 mb-1.5 flex items-center justify-between">
                <span>Verified Sources:</span>
                {live.isUnverified && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    <HelpCircle className="w-2.5 h-2.5" />
                    Unverified / Check manually
                  </span>
                )}
              </div>

              {live.sources && live.sources.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {live.sources.map((src, sIdx) => (
                    <a
                      key={sIdx}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-white text-indigo-700 hover:text-indigo-900 border border-stone-200 hover:border-indigo-300 hover:shadow-xs transition-all max-w-[240px] truncate"
                      title={src.label || src.url}
                    >
                      <Globe className="w-2.5 h-2.5 shrink-0 text-indigo-500" />
                      <span className="truncate">{src.label || "Official Portal"}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0 text-stone-400" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-stone-400 italic">
                  No direct citations recorded — verify with academic advisor.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Error State */}
        {result.error && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Live search unavailable
            </div>
            <p className="mt-0.5 text-amber-700">
              Couldn&apos;t verify live admissions data. Please verify fees and deadlines manually.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
