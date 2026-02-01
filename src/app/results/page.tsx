"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import UserMenu from "@/components/UserMenu";
import { useAuth } from "@/context/AuthContext";
import type { SchoolProfile } from "@/lib/types";
import {
  GOALS,
  RADIUS_OPTIONS,
  PART_OPTIONS,
  BUDGET_OPTIONS,
  TIMELINE_OPTIONS,
} from "@/lib/types";
import type { StudentOnboarding, PartPreference, BudgetRange, Timeline } from "@/lib/types";

type RankedResult = { school: SchoolProfile; score: number; distanceMiles: number };

const defaultSearch: StudentOnboarding = {
  location: {},
  radiusMiles: 50,
  goals: [],
  partPreference: "no_preference",
  budgetRange: "",
  timeline: "just_browsing",
};

export default function ResultsPage() {
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<RankedResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"score" | "distance" | "price">("score");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [search, setSearch] = useState<StudentOnboarding>(defaultSearch);
  const [locationInput, setLocationInput] = useState("");
  const [matchedLocation, setMatchedLocation] = useState<string | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!isHydrated) return;
    if (user?.type !== "student") {
      router.replace("/login");
      return;
    }
    const ob = user.profile.onboarding;
    if (ob && (ob.location?.zip || ob.location?.city)) {
      setSearch({
        location: ob.location || {},
        radiusMiles: ob.radiusMiles ?? 50,
        goals: ob.goals || [],
        partPreference: ob.partPreference ?? "no_preference",
        budgetRange: ob.budgetRange ?? "",
        timeline: ob.timeline ?? "just_browsing",
      });
      setLocationInput(ob.location?.zip || ob.location?.city || "");
    }
  }, [user, router, isHydrated]);

  function runSearch(payload: StudentOnboarding) {
    setLoading(true);
    setMatchedLocation(null);
    setLocationSuggestions([]);
    fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboarding: payload, sort }),
    })
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results || []);
        if (data.matchedLocation) setMatchedLocation(data.matchedLocation);
        if (data.locationSuggestions?.length) setLocationSuggestions(data.locationSuggestions);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!isHydrated || user?.type !== "student") return;
    const loc = (search.location?.zip || search.location?.city || "").trim();
    if (loc) {
      runSearch(search);
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [isHydrated, user?.type, sort, search.location?.zip, search.location?.city, search.radiusMiles, search.goals?.length, search.partPreference, search.budgetRange, search.timeline]);

  function applySuggestion(suggestion: string) {
    const trimmed = suggestion.trim();
    setLocationInput(trimmed);
    setLocationSuggestions([]);
    setSearch((s) => ({
      ...s,
      location: /^\d{5}/.test(trimmed) ? { zip: trimmed.slice(0, 5) } : { city: trimmed },
    }));
  }

  function handleAdvancedSearch(e: React.FormEvent) {
    e.preventDefault();
    const loc = locationInput.trim();
    if (!loc) return;
    setSearch((s) => ({
      ...s,
      location: /^\d{5}(-\d{4})?$/.test(loc) ? { zip: loc.slice(0, 5) } : { city: loc },
    }));
  }

  function toggleCompare(schoolId: string) {
    setCompareIds((prev) =>
      prev.includes(schoolId)
        ? prev.filter((id) => id !== schoolId)
        : prev.length >= 4 ? prev : [...prev, schoolId]
    );
  }

  function addToCompare(schoolId: string) {
    if (compareIds.length >= 4 || compareIds.includes(schoolId)) return;
    const next = [...compareIds, schoolId];
    setCompareIds(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("fsf_compare", JSON.stringify(next));
    }
  }

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("fsf_compare") : null;
    if (stored) {
      try {
        const arr = JSON.parse(stored) as string[];
        setCompareIds((prev) => (prev.length ? prev : arr.slice(0, 4)));
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    if (compareIds.length && typeof window !== "undefined")
      localStorage.setItem("fsf_compare", JSON.stringify(compareIds));
  }, [compareIds]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-palette-mid border-t-transparent animate-spin" />
      </div>
    );
  }
  if (user?.type !== "student") return null;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-palette-mid bg-white/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/home" className="flex items-center gap-2">
              <Image src="/logo.png" alt="My Flight School" width={100} height={40} className="h-8 w-auto object-contain" />
              <span className="font-bold text-palette-darkest">My Flight School</span>
            </Link>
            <Link href="/home" className="text-sm font-semibold text-palette-darkest hover:underline">
              Home
            </Link>
            <Link href="/onboarding" className="text-sm font-semibold text-palette-darkest hover:underline">
              Edit preferences
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-palette-darkest">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "score" | "distance" | "price")}
              className="rounded-lg border border-palette-mid bg-white text-palette-darkest font-semibold px-3 py-2 text-sm focus-ring"
            >
              <option value="score">Best match</option>
              <option value="distance">Closest</option>
              <option value="price">Price</option>
            </select>
            {compareIds.length > 0 && (
              <Link
                href="/compare"
                className="rounded-lg bg-palette-mid text-palette-cream px-4 py-2 text-sm font-semibold hover:bg-palette-dark min-h-[44px] inline-flex items-center"
              >
                Compare ({compareIds.length})
              </Link>
            )}
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-palette-darkest mb-6">
          Flight schools near you
        </h1>

        {/* Advanced search */}
        <div className="mb-6 rounded-lg border border-palette-mid bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setAdvancedOpen((o) => !o)}
            className="w-full px-4 py-3 flex items-center justify-between font-semibold text-palette-darkest bg-palette-100 hover:bg-palette-light/20 focus-ring"
          >
            Advanced search
            <span className="text-palette-dark">{advancedOpen ? "▼" : "▶"}</span>
          </button>
          {advancedOpen && (
            <form onSubmit={handleAdvancedSearch} className="p-4 space-y-4 border-t border-palette-mid">
              <div>
                <label htmlFor="adv-location" className="block text-sm font-semibold text-palette-darkest mb-1">
                  ZIP or city *
                </label>
                <input
                  id="adv-location"
                  type="text"
                  placeholder="e.g. 30341 or Atlanta"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring"
                />
                <p className="text-xs font-medium text-palette-dark mt-1">
                  Search is fuzzy — close spellings (e.g. &quot;Atlnata&quot;) will suggest matches.
                </p>
              </div>
              <div>
                <label htmlFor="adv-radius" className="block text-sm font-semibold text-palette-darkest mb-1">
                  Radius (miles)
                </label>
                <select
                  id="adv-radius"
                  value={search.radiusMiles}
                  onChange={(e) => setSearch((s) => ({ ...s, radiusMiles: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring"
                >
                  {RADIUS_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r} mi</option>
                  ))}
                </select>
              </div>
              <div>
                <span className="block text-sm font-semibold text-palette-darkest mb-2">Goals (optional)</span>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map((goal) => (
                    <label key={goal} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={search.goals.includes(goal)}
                        onChange={(e) =>
                          setSearch((s) => ({
                            ...s,
                            goals: e.target.checked ? [...s.goals, goal] : s.goals.filter((g) => g !== goal),
                          }))
                        }
                        className="rounded border-palette-mid text-palette-mid focus-ring"
                      />
                      <span className="text-sm font-medium text-palette-darkest">{goal}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-palette-darkest mb-1">Part 61 / Part 141</label>
                <select
                  value={search.partPreference}
                  onChange={(e) => setSearch((s) => ({ ...s, partPreference: e.target.value as PartPreference }))}
                  className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring"
                >
                  {PART_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-palette-darkest mb-1">Budget range</label>
                <select
                  value={search.budgetRange}
                  onChange={(e) => setSearch((s) => ({ ...s, budgetRange: e.target.value as BudgetRange }))}
                  className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring"
                >
                  {BUDGET_OPTIONS.map((opt) => (
                    <option key={opt.value || "none"} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-palette-darkest mb-1">Timeline</label>
                <select
                  value={search.timeline}
                  onChange={(e) => setSearch((s) => ({ ...s, timeline: e.target.value as Timeline }))}
                  className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring"
                >
                  {TIMELINE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="rounded-lg bg-palette-mid text-palette-cream px-6 py-3 font-semibold hover:bg-palette-dark focus-ring min-h-[44px]"
              >
                Search
              </button>
            </form>
          )}
        </div>

        {/* Location suggestion banner */}
        {matchedLocation && locationInput.trim() && (
          <div className="mb-4 rounded-lg border border-palette-mid bg-palette-100 px-4 py-2 text-sm font-medium text-palette-darkest">
            Showing results for <strong>{matchedLocation}</strong>
            {locationInput.trim().toLowerCase() !== matchedLocation.toLowerCase() && (
              <span> (matched &quot;{locationInput.trim()}&quot;)</span>
            )}
          </div>
        )}
        {locationSuggestions.length > 0 && !matchedLocation && (
          <div className="mb-4 rounded-lg border border-palette-mid bg-palette-100 px-4 py-3">
            <p className="text-sm font-semibold text-palette-darkest mb-2">Did you mean?</p>
            <div className="flex flex-wrap gap-2">
              {locationSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => applySuggestion(s)}
                  className="rounded-lg border border-palette-mid bg-white px-3 py-2 text-sm font-semibold text-palette-darkest hover:bg-palette-mid hover:text-palette-cream focus-ring"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 rounded-lg bg-palette-light/30 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && results.length === 0 && (
          <div className="rounded-lg border border-palette-mid bg-white p-8 text-center">
            <p className="text-palette-darkest font-semibold mb-4">
              No schools match your criteria. Try widening your search radius, relaxing filters, or use Advanced search above.
            </p>
            <button
              type="button"
              onClick={() => setAdvancedOpen(true)}
              className="inline-flex rounded-lg bg-palette-mid text-palette-cream px-6 py-3 font-semibold hover:bg-palette-dark focus-ring min-h-[44px] items-center justify-center"
            >
              Open advanced search
            </button>
            <Link
              href="/onboarding"
              className="ml-3 inline-flex rounded-lg border border-palette-mid text-palette-darkest px-6 py-3 font-semibold hover:bg-palette-100 focus-ring min-h-[44px] items-center justify-center"
            >
              Edit preferences
            </Link>
          </div>
        )}

        {!loading && results.length > 0 && (
          <ul className="space-y-4" role="list">
            {results.map(({ school, score, distanceMiles }) => (
              <li
                key={school.id}
                className="rounded-lg border border-palette-mid bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-palette-darkest">
                      {school.name}
                    </h2>
                    <p className="text-sm font-semibold text-palette-dark mt-1">
                      {school.address}
                    </p>
                    <p className="text-sm font-medium text-palette-dark mt-1">
                      {distanceMiles.toFixed(0)} mi away · {score}% match
                    </p>
                    {school.description && (
                      <p className="mt-2 text-sm font-medium text-palette-darkest line-clamp-2">
                        {school.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => addToCompare(school.id)}
                      disabled={compareIds.includes(school.id) || compareIds.length >= 4}
                      className="rounded-lg border border-palette-mid text-palette-darkest font-semibold px-4 py-2 text-sm hover:bg-palette-100 disabled:opacity-50 focus-ring min-h-[44px]"
                    >
                      Add to compare
                    </button>
                    <Link
                      href={`/school/${school.id}`}
                      className="rounded-lg bg-palette-mid text-palette-cream px-4 py-2 text-sm font-semibold hover:bg-palette-dark focus-ring min-h-[44px] inline-flex items-center justify-center"
                    >
                      View profile
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
