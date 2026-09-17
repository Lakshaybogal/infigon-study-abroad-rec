"use client";

import React, { useState } from "react";
import { StudentProfile } from "@/lib/types";
import {
  GraduationCap,
  DollarSign,
  Compass,
  BookOpen,
  Calendar,
  Sparkles,
  Zap,
  RotateCcw,
  Globe2,
  MapPin,
  Plus,
  X,
} from "lucide-react";

interface IntakeFormProps {
  onSubmit: (profile: StudentProfile) => void;
  isLoading: boolean;
}

const POPULAR_FIELDS = [
  "Computer Science",
  "Artificial Intelligence",
  "Data Science",
  "Business Administration",
  "Finance",
  "Mechanical Engineering",
  "Biotechnology",
  "Electrical Engineering",
  "Aerospace Engineering",
  "Cybersecurity",
  "Economics",
  "Information Technology",
  "OTHER_CUSTOM",
];

const DEFAULT_COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "Singapore",
  "Netherlands",
  "Ireland",
];

const SUGGESTED_LOCATIONS = [
  "California / Silicon Valley",
  "Boston / Cambridge",
  "London / SE England",
  "Munich / Bavaria",
  "Toronto / Ontario",
  "Vancouver / BC",
  "Singapore",
  "Dublin / Silicon Docks",
];

const PRESETS: { label: string; profile: StudentProfile }[] = [
  {
    label: "Top AI & CS Master's",
    profile: {
      field: "Artificial Intelligence",
      degree: "Master's",
      countries: ["United States", "United Kingdom", "Canada", "Singapore"],
      locations: ["California / Silicon Valley", "Boston / Cambridge"],
      budgetUSD: 60000,
      intakeTerm: "Fall 2026",
      gpaPercent: 88,
      ielts: 7.5,
      greGmat: 325,
      customQuery: "Must be STEM designated with 3-year OPT",
    },
  },
  {
    label: "European Tech (Low Cost)",
    profile: {
      field: "Mechanical Engineering",
      degree: "Master's",
      countries: ["Germany", "Netherlands"],
      locations: ["Munich / Bavaria", "Delft"],
      budgetUSD: 15000,
      intakeTerm: "Winter 2026 / Spring 2027",
      gpaPercent: 80,
      ielts: 7.0,
      customQuery: "Has Co-op / Internship tracks and English curriculum",
    },
  },
  {
    label: "Undergrad CS North America",
    profile: {
      field: "Computer Science",
      degree: "Bachelor's",
      countries: ["United States", "Canada"],
      locations: ["Toronto / Ontario", "California / Silicon Valley"],
      budgetUSD: 45000,
      intakeTerm: "Fall 2026",
      gpaPercent: 86,
      ielts: 7.0,
      customQuery: "Co-op placement rate in tech industry",
    },
  },
  {
    label: "Global MBA & Finance",
    profile: {
      field: "Business Administration",
      degree: "Master's",
      countries: ["United Kingdom", "Australia", "Singapore"],
      locations: ["London / SE England", "Singapore"],
      budgetUSD: 75000,
      intakeTerm: "Fall 2026",
      gpaPercent: 78,
      ielts: 7.5,
      greGmat: 710,
      customQuery: "Post-study work visa eligible and consulting links",
    },
  },
];

export default function IntakeForm({ onSubmit, isLoading }: IntakeFormProps) {
  const [profile, setProfile] = useState<StudentProfile>({
    field: "Computer Science",
    degree: "Master's",
    countries: ["United States", "United Kingdom", "Canada"],
    locations: ["California / Silicon Valley"],
    budgetUSD: 50000,
    intakeTerm: "Fall 2026",
    gpaPercent: 85,
    ielts: 7.0,
    greGmat: 320,
    customQuery: "STEM designated with co-op / internship opportunities",
  });

  const [fieldSelection, setFieldSelection] = useState<string>("Computer Science");
  const [hasSpecificLocations, setHasSpecificLocations] = useState(false);
  const [customCountryInput, setCustomCountryInput] = useState("");
  const [showAddCountry, setShowAddCountry] = useState(false);
  const [customLocationInput, setCustomLocationInput] = useState("");

  const toggleCountry = (country: string) => {
    setProfile((prev) => {
      const exists = prev.countries.includes(country);
      return {
        ...prev,
        countries: exists
          ? prev.countries.filter((c) => c !== country)
          : [...prev.countries, country],
      };
    });
  };

  const handleAddCustomCountry = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customCountryInput.trim();
    if (trimmed && !profile.countries.includes(trimmed)) {
      setProfile((prev) => ({
        ...prev,
        countries: [...prev.countries, trimmed],
      }));
      setCustomCountryInput("");
      setShowAddCountry(false);
    }
  };

  const handleToggleSpecificLocations = (checked: boolean) => {
    setHasSpecificLocations(checked);
    if (!checked) {
      setProfile((prev) => ({ ...prev, locations: [] }));
    }
  };

  const toggleLocation = (location: string) => {
    setProfile((prev) => {
      const locs = prev.locations || [];
      const exists = locs.includes(location);
      return {
        ...prev,
        locations: exists
          ? locs.filter((l) => l !== location)
          : [...locs, location],
      };
    });
  };

  const handleAddCustomLocation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customLocationInput.trim();
    if (trimmed) {
      setProfile((prev) => {
        const locs = prev.locations || [];
        if (!locs.includes(trimmed)) {
          return { ...prev, locations: [...locs, trimmed] };
        }
        return prev;
      });
      setCustomLocationInput("");
    }
  };

  const handleRemoveLocation = (locToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      locations: (prev.locations || []).filter((l) => l !== locToRemove),
    }));
  };

  const handleFieldDropdownChange = (val: string) => {
    setFieldSelection(val);
    if (val !== "OTHER_CUSTOM") {
      setProfile((prev) => ({ ...prev, field: val }));
    } else {
      setProfile((prev) => ({ ...prev, field: "" }));
    }
  };

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setProfile({ ...preset.profile });
    if (POPULAR_FIELDS.includes(preset.profile.field)) {
      setFieldSelection(preset.profile.field);
    } else {
      setFieldSelection("OTHER_CUSTOM");
    }

    if (preset.profile.locations && preset.profile.locations.length > 0) {
      setHasSpecificLocations(true);
    } else {
      setHasSpecificLocations(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(profile);
  };

  const handleReset = () => {
    setProfile({
      field: "",
      degree: "Master's",
      countries: [],
      locations: [],
      budgetUSD: 40000,
      intakeTerm: "Fall 2026",
      gpaPercent: undefined,
      ielts: undefined,
      greGmat: undefined,
      customQuery: "",
    });
    setFieldSelection("OTHER_CUSTOM");
    setHasSpecificLocations(false);
  };

  return (
    <div className="paper-card rounded-2xl p-6 sm:p-8 bg-white border border-[#e2d8cb] shadow-paper mb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-900/10 flex items-center justify-center text-amber-800">
            <Compass className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
              Student Profile & Preference Criteria
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Input student academic credentials, countries, specific locations (city/state), and bespoke requests.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors self-start sm:self-auto font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Form
        </button>
      </div>

      {/* Quick 1-Click Presets */}
      <div className="my-4 p-3 rounded-xl bg-stone-50 border border-stone-200/70 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 uppercase tracking-wider shrink-0">
          <Zap className="w-3.5 h-3.5 text-amber-600" />
          1-Click Presets:
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="text-xs px-3 py-1 rounded-lg bg-white hover:bg-stone-100 text-stone-700 font-medium border border-stone-200 hover:border-stone-300 transition-all shadow-2xs"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form Grid */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section 1: Academic Focus & Budget */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Target Field of Study (5 cols) */}
          <div className="md:col-span-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-stone-500" />
                Target Field of Study
              </span>
            </label>
            <div className="space-y-2">
              <select
                value={fieldSelection}
                onChange={(e) => handleFieldDropdownChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition-all font-medium text-stone-900 cursor-pointer"
              >
                {POPULAR_FIELDS.map((f) => (
                  <option key={f} value={f}>
                    {f === "OTHER_CUSTOM" ? "✏️ Other / Custom Field..." : f}
                  </option>
                ))}
              </select>

              {/* Custom Field of Study Input when "OTHER_CUSTOM" is selected */}
              {fieldSelection === "OTHER_CUSTOM" && (
                <input
                  type="text"
                  required
                  autoFocus
                  value={profile.field}
                  onChange={(e) => setProfile({ ...profile, field: e.target.value })}
                  placeholder="Enter custom field (e.g. Cognitive Science, Nanotech)..."
                  className="w-full px-3.5 py-2 rounded-lg border border-amber-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 text-stone-900 font-medium placeholder:text-stone-400 animate-in fade-in duration-200"
                />
              )}
            </div>
          </div>

          {/* Degree Level (3 cols) */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-stone-500" />
                Degree Level
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["Bachelor's", "Master's"] as const).map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => setProfile({ ...profile, degree: deg })}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all ${
                    profile.degree === deg
                      ? "bg-stone-900 text-stone-50 border-stone-900 shadow-sm"
                      : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  {deg}
                </button>
              ))}
            </div>
          </div>

          {/* Annual Tuition Budget (4 cols) */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-stone-500" />
                Annual Tuition Budget (USD)
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-semibold text-sm">
                $
              </span>
              <input
                type="number"
                min="0"
                step="1000"
                value={profile.budgetUSD}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    budgetUSD: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full pl-8 pr-3.5 py-2.5 rounded-lg border border-stone-300 text-sm bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition-all font-semibold text-stone-900"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Destination Countries & Add Custom Country */}
        <div className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-200/80">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-stone-500" />
              Target Destination Countries
            </label>
            {!showAddCountry && (
              <button
                type="button"
                onClick={() => setShowAddCountry(true)}
                className="text-xs text-amber-800 hover:text-amber-900 font-medium inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Other Country
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Standard preset countries */}
            {DEFAULT_COUNTRIES.map((country) => {
              const selected = profile.countries.includes(country);
              return (
                <button
                  key={country}
                  type="button"
                  onClick={() => toggleCountry(country)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                    selected
                      ? "bg-emerald-800 text-emerald-50 border-emerald-800 shadow-sm"
                      : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  {selected ? "✓ " : "+ "}
                  {country}
                </button>
              );
            })}

            {/* Custom added countries that are not in defaults */}
            {profile.countries
              .filter((c) => !DEFAULT_COUNTRIES.includes(c))
              .map((customC) => (
                <span
                  key={customC}
                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-emerald-800 text-emerald-50 border border-emerald-800 font-medium shadow-sm"
                >
                  ✓ {customC}
                  <button
                    type="button"
                    onClick={() => toggleCountry(customC)}
                    className="hover:bg-emerald-700 rounded-full p-0.5 ml-0.5"
                  >
                    <X className="w-3 h-3 text-emerald-200" />
                  </button>
                </span>
              ))}

            {/* Inline Add Other Country Form */}
            {showAddCountry && (
              <div className="inline-flex items-center gap-1.5 bg-white p-1 rounded-lg border border-amber-300 shadow-2xs">
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g., France, Sweden..."
                  value={customCountryInput}
                  onChange={(e) => setCustomCountryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomCountry();
                    }
                  }}
                  className="text-xs px-2 py-0.5 outline-none text-stone-900 w-32 font-medium"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomCountry()}
                  className="text-xs bg-stone-900 text-stone-50 px-2 py-1 rounded font-medium hover:bg-stone-800"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCountry(false)}
                  className="text-stone-400 hover:text-stone-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section 2b: Specific Location Preferences (Optional with Toggle) */}
        <div className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-200/80 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-amber-700" />
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block cursor-pointer" onClick={() => handleToggleSpecificLocations(!hasSpecificLocations)}>
                  Narrow Down By Specific City, State, or Metropolitan Area?
                </label>
                <p className="text-[11px] text-stone-500">
                  Optional: Filter down to specific tech clusters, states, or campus regions.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={hasSpecificLocations}
              onClick={() => handleToggleSpecificLocations(!hasSpecificLocations)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                hasSpecificLocations ? "bg-amber-800" : "bg-stone-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  hasSpecificLocations ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Expanded Location Options when Toggle is ON */}
          {hasSpecificLocations && (
            <div className="mt-3.5 pt-3 border-t border-stone-200/80 space-y-2.5 animate-in fade-in duration-200">
              {/* Quick Location Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-stone-500 mr-1 font-medium">Popular Areas:</span>
                {SUGGESTED_LOCATIONS.map((loc) => {
                  const selected = (profile.locations || []).includes(loc);
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => toggleLocation(loc)}
                      className={`text-[11px] px-2.5 py-1 rounded-md border transition-all font-medium ${
                        selected
                          ? "bg-amber-800 text-amber-50 border-amber-800 shadow-2xs"
                          : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      {selected ? "✓ " : "+ "}
                      {loc}
                    </button>
                  );
                })}
              </div>

              {/* Custom Location input & Active Selected Tags */}
              <div className="flex flex-wrap items-center gap-2">
                {(profile.locations || [])
                  .filter((l) => !SUGGESTED_LOCATIONS.includes(l))
                  .map((customLoc) => (
                    <span
                      key={customLoc}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-amber-800 text-amber-50 border border-amber-800 font-medium"
                    >
                      <MapPin className="w-2.5 h-2.5" />
                      {customLoc}
                      <button
                        type="button"
                        onClick={() => handleRemoveLocation(customLoc)}
                        className="hover:bg-amber-700 rounded-full p-0.5 ml-0.5"
                      >
                        <X className="w-3 h-3 text-amber-200" />
                      </button>
                    </span>
                  ))}

                <div className="flex-1 min-w-[200px] flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Type city/state (e.g., Munich, New York, Texas, Sydney) & press Add..."
                    value={customLocationInput}
                    onChange={(e) => setCustomLocationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomLocation();
                      }
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 text-stone-900 font-medium placeholder:text-stone-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomLocation()}
                    className="text-xs bg-stone-900 text-stone-50 px-3 py-1.5 rounded-lg font-medium hover:bg-stone-800 shrink-0"
                  >
                    + Add Area
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Academic Scores & Intake Term */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
          {/* Target Intake Term (4 cols) */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                Target Intake Term
              </span>
            </label>
            <select
              value={profile.intakeTerm}
              onChange={(e) => setProfile({ ...profile, intakeTerm: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition-all font-medium text-stone-900"
            >
              <option value="Fall 2026">Fall 2026 Intake</option>
              <option value="Spring 2027">Spring 2027 Intake</option>
              <option value="Fall 2027">Fall 2027 Intake</option>
              <option value="Rolling Admissions">Rolling Admissions</option>
            </select>
          </div>

          {/* Academic GPA (3 cols) */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Academic GPA (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="e.g. 85%"
              value={profile.gpaPercent ?? ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  gpaPercent: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 text-stone-900 font-medium"
            />
          </div>

          {/* IELTS Band (2 cols) */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              IELTS Band
            </label>
            <input
              type="number"
              min="0"
              max="9"
              step="0.5"
              placeholder="e.g. 7.5"
              value={profile.ielts ?? ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  ielts: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 text-stone-900 font-medium"
            />
          </div>

          {/* GRE / GMAT (3 cols) */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              GRE / GMAT (Optional)
            </label>
            <input
              type="number"
              placeholder="e.g. 320"
              value={profile.greGmat ?? ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  greGmat: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 text-stone-900 font-medium"
            />
          </div>
        </div>

        {/* Section 4: Special Inquiries & Bespoke Requirements */}
        <div className="pt-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Special Inquiries & Bespoke Requirements (Optional)
            </span>
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {[
              "Must be STEM designated",
              "Has Co-op / Internship tracks",
              "Post-study work visa eligible",
              "GRE waiver available",
              "Low living expenses",
            ].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() =>
                  setProfile((prev) => ({
                    ...prev,
                    customQuery: prev.customQuery
                      ? `${prev.customQuery}, ${tag}`
                      : tag,
                  }))
                }
                className="text-[11px] px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="e.g., Does this offer 3-year STEM OPT, mandatory co-op, or tuition installment plans?"
            value={profile.customQuery ?? ""}
            onChange={(e) =>
              setProfile({ ...profile, customQuery: e.target.value })
            }
            className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 text-stone-900 font-medium placeholder:text-stone-400"
          />
        </div>

        {/* Submit Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-serif font-bold text-base tracking-wide shadow-paper-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                Scoring Programmes & Grounding Live Web Facts...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Find & Ground Top University Matches
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
