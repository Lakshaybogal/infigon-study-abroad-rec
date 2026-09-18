"use client";

import React from "react";
import { CheckCircle2, Loader2, Sparkles, Search, Award } from "lucide-react";

interface LoadingStepsProps {
  currentStage: "matching" | "enriching" | "complete" | "idle";
  completedCount?: number;
  totalCount?: number;
}

export default function LoadingSteps({
  currentStage,
  completedCount = 0,
  totalCount = 0,
}: LoadingStepsProps) {
  if (currentStage === "complete" || currentStage === "idle") return null;

  interface StepItem {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    status: "active" | "done" | "waiting";
  }

  const steps: StepItem[] = [
    {
      id: "search",
      title: "Discovering Accredited Programmes",
      description: "Searching official university admissions portals for degree matches",
      icon: Search,
      status: "active",
    },
    {
      id: "grounding",
      title: "Grounding Live Tuition & Deadlines",
      description: "Extracting current international tuition in INR (₹), intake deadlines, and currency rates",
      icon: Sparkles,
      status: "active",
    },
    {
      id: "scholarships",
      title: "Verifying Scholarships & Custom Inquiries",
      description: "Checking merit awards, STEM status, and bespoke counsellor requirements",
      icon: Award,
      status: "active",
    },
  ];

  return (
    <div className="w-full bg-stone-900 text-stone-100 rounded-xl p-5 shadow-paper-lg border border-stone-800 mb-6 transition-all">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-800">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <h3 className="font-serif font-semibold text-base text-stone-100 tracking-wide">
            Live Web Discovery & Fact Enrichment in Progress
          </h3>
        </div>
        <span className="text-xs font-mono bg-stone-800 text-emerald-400 px-2.5 py-1 rounded-full border border-stone-700">
          Unified Search & Grounding
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-lg border transition-all ${
                step.status === "active"
                  ? "bg-stone-800/90 border-emerald-500/50 shadow-sm shadow-emerald-500/10"
                  : step.status === "done"
                  ? "bg-stone-800/40 border-stone-700/60 opacity-90"
                  : "bg-stone-800/20 border-stone-800/60 opacity-40"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">
                  {step.status === "done" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : step.status === "active" ? (
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-stone-600 flex items-center justify-center text-[10px] text-stone-400">
                      {idx + 1}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <Icon className={`w-3.5 h-3.5 ${step.status === "active" ? "text-emerald-400" : "text-stone-400"}`} />
                    <p className="text-xs font-medium text-stone-200 truncate">
                      {step.title}
                    </p>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1 leading-tight">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
