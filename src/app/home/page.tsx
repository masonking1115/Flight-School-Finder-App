"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import UserMenu from "@/components/UserMenu";
import { useAuth } from "@/context/AuthContext";
import {
  GOALS,
  RADIUS_OPTIONS,
  PART_OPTIONS,
  BUDGET_OPTIONS,
  TIMELINE_OPTIONS,
} from "@/lib/types";
import type { StudentOnboarding, PartPreference, BudgetRange, Timeline, StudentProfile } from "@/lib/types";
import type { SchoolProfile } from "@/lib/types";

type MainTab = "home" | "schools" | "study-guide" | "blogs";
type RecommendedItem = { school: SchoolProfile; distanceMiles?: number };
type RankedResult = { school: SchoolProfile; score: number; distanceMiles: number };

const defaultOnboarding: StudentOnboarding = {
  location: {},
  radiusMiles: 50,
  goals: [],
  partPreference: "no_preference",
  budgetRange: "",
  timeline: "just_browsing",
};

const TABS: { id: MainTab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "schools", label: "Schools" },
  { id: "study-guide", label: "Study Guide" },
  { id: "blogs", label: "Blogs" },
];

const STUDY_NOTES_KEY = "fsf_study_notes";

function StudentHomeContent() {
  const { user, isHydrated, setStudentProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mainTab, setMainTab] = useState<MainTab>("home");

  const [onboarding, setOnboarding] = useState<StudentOnboarding>(defaultOnboarding);
  const [locationInput, setLocationInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendedSchools, setRecommendedSchools] = useState<RecommendedItem[]>([]);
  const [recommendedLoading, setRecommendedLoading] = useState(true);

  const [results, setResults] = useState<RankedResult[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [sort, setSort] = useState<"score" | "distance" | "price">("score");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [search, setSearch] = useState<StudentOnboarding>(defaultOnboarding);
  const [schoolsLocationInput, setSchoolsLocationInput] = useState("");
  const [matchedLocation, setMatchedLocation] = useState<string | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);

  const [studyNotes, setStudyNotes] = useState("");
  const [homeSearchInput, setHomeSearchInput] = useState("");

  useEffect(() => {
    const tab = searchParams.get("tab") as MainTab | null;
    if (tab && TABS.some((t) => t.id === tab)) setMainTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (!isHydrated) return;
    if (user?.type !== "student") {
      router.replace("/login");
      return;
    }
    if (user.profile.onboarding) {
      setOnboarding(user.profile.onboarding);
      const loc = user.profile.onboarding.location.zip || user.profile.onboarding.location.city || "";
      setLocationInput(loc);
      setSchoolsLocationInput(loc);
      setSearch({
        location: user.profile.onboarding.location || {},
        radiusMiles: user.profile.onboarding.radiusMiles ?? 50,
        goals: user.profile.onboarding.goals || [],
        partPreference: user.profile.onboarding.partPreference ?? "no_preference",
        budgetRange: user.profile.onboarding.budgetRange ?? "",
        timeline: user.profile.onboarding.timeline ?? "just_browsing",
      });
    }
  }, [user, router, isHydrated]);

  const currentOnboarding =
    (user?.type === "student" && (user.profile as StudentProfile).onboarding) || defaultOnboarding;

  useEffect(() => {
    if (!isHydrated || user?.type !== "student" || !user.profile.id) return;
    setRecommendedLoading(true);
    fetch("/api/recommended", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: user.profile.id, onboarding: currentOnboarding }),
    })
      .then((res) => res.json())
      .then((data) => setRecommendedSchools(data.schools ?? []))
      .catch(() => setRecommendedSchools([]))
      .finally(() => setRecommendedLoading(false));
  }, [isHydrated, user?.type, user?.profile.id, currentOnboarding?.location?.zip, currentOnboarding?.location?.city, currentOnboarding?.radiusMiles]);

  function runSearch(payload: StudentOnboarding) {
    setSchoolsLoading(true);
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
      .finally(() => setSchoolsLoading(false));
  }

  useEffect(() => {
    if (mainTab !== "schools" || !isHydrated || user?.type !== "student") return;
    const loc = (search.location?.zip || search.location?.city || "").trim();
    if (loc) runSearch(search);
    else {
      setResults([]);
      setSchoolsLoading(false);
    }
  }, [mainTab, isHydrated, user?.type, sort, search.location?.zip, search.location?.city, search.radiusMiles, search.goals?.length, search.partPreference, search.budgetRange, search.timeline]);

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

  useEffect(() => {
    if (typeof window === "undefined" || user?.type !== "student" || !user.profile.id) return;
    const key = `${STUDY_NOTES_KEY}_${user.profile.id}`;
    const saved = localStorage.getItem(key);
    if (saved != null) setStudyNotes(saved);
  }, [user?.type, user?.profile.id]);
  useEffect(() => {
    if (typeof window === "undefined" || user?.type !== "student" || !user.profile.id) return;
    const key = `${STUDY_NOTES_KEY}_${user.profile.id}`;
    localStorage.setItem(key, studyNotes);
  }, [studyNotes, user?.type, user?.profile.id]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-palette-mid border-t-transparent animate-spin" />
      </div>
    );
  }
  if (user?.type !== "student") return null;

  function parseLocation(val: string): { zip?: string; city?: string; state?: string } {
    const v = val.trim();
    const zipMatch = v.match(/^\d{5}(-\d{4})?$/);
    if (zipMatch) return { zip: v };
    const parts = v.split(",").map((p) => p.trim());
    if (parts.length >= 2) return { city: parts[0], state: parts[1].slice(0, 2) };
    if (v.length >= 2) return { city: v };
    return {};
  }

  function handleSavePreferences(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const loc = parseLocation(locationInput);
    if (!loc.zip && !loc.city) {
      setError("Please enter a valid ZIP or city.");
      return;
    }
    if (onboarding.goals.length === 0) {
      setError("Select at least one goal.");
      return;
    }
    const toSave = { ...onboarding, location: loc };
    setLoading(true);
    fetch(`/api/students/${user!.profile.id}/onboarding`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toSave),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.user) {
          setStudentProfile(data.user);
          setSaved(true);
          setOnboarding(data.user.onboarding || toSave);
          setTimeout(() => setSaved(false), 3000);
        } else if (res.status === 404 && user?.type === "student") {
          setStudentProfile({ ...user.profile, onboarding: toSave });
          setSaved(true);
          setOnboarding(toSave);
          setTimeout(() => setSaved(false), 3000);
        } else {
          setError(data.error || "Could not save.");
        }
      })
      .catch(() => setError("Something went wrong."))
      .finally(() => setLoading(false));
  }

  function handleHomeSearch(e: React.FormEvent) {
    e.preventDefault();
    const loc = homeSearchInput.trim();
    if (!loc) return;
    const payload: StudentOnboarding = {
      ...currentOnboarding,
      location: /^\d{5}(-\d{4})?$/.test(loc) ? { zip: loc.slice(0, 5) } : { city: loc },
    };
    setSearch(payload);
    setSchoolsLocationInput(loc);
    setMainTab("schools");
    runSearch(payload);
  }

  function handleAdvancedSearch(e: React.FormEvent) {
    e.preventDefault();
    const loc = schoolsLocationInput.trim();
    if (!loc) return;
    setSearch((s) => ({
      ...s,
      location: /^\d{5}(-\d{4})?$/.test(loc) ? { zip: loc.slice(0, 5) } : { city: loc },
    }));
  }

  function applySuggestion(suggestion: string) {
    const trimmed = suggestion.trim();
    setSchoolsLocationInput(trimmed);
    setLocationSuggestions([]);
    setSearch((s) => ({
      ...s,
      location: /^\d{5}/.test(trimmed) ? { zip: trimmed.slice(0, 5) } : { city: trimmed },
    }));
  }

  function addToCompare(schoolId: string) {
    if (compareIds.length >= 4 || compareIds.includes(schoolId)) return;
    setCompareIds((prev) => [...prev, schoolId]);
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-palette-mid bg-white/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <Link href="/home" className="flex items-center gap-2">
            <Image src="/logo.png" alt="My Flight School" width={100} height={40} className="h-8 w-auto object-contain" />
            <span className="font-semibold text-palette-darkest">My Flight School</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMainTab(tab.id)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold focus-ring min-h-[44px] ${
                  mainTab === tab.id
                    ? "bg-palette-mid text-palette-cream"
                    : "text-palette-darkest hover:bg-palette-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
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
        {mainTab === "home" && (
          <>
            <h1 className="text-2xl font-bold text-palette-darkest mb-6">Dashboard</h1>

            <form onSubmit={handleHomeSearch} className="mb-6">
              <label htmlFor="home-search" className="block text-sm font-semibold text-palette-darkest mb-2">
                Find flight schools
              </label>
              <div className="flex gap-2">
                <input
                  id="home-search"
                  type="text"
                  placeholder="ZIP or city (e.g. 30341 or Atlanta)"
                  value={homeSearchInput}
                  onChange={(e) => setHomeSearchInput(e.target.value)}
                  className="flex-1 rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-palette-mid text-palette-cream px-6 py-3 font-semibold hover:bg-palette-dark focus-ring min-h-[44px]"
                >
                  Search
                </button>
              </div>
            </form>

            <section className="mb-8 rounded-lg border border-palette-mid bg-white p-6">
              <h2 className="text-lg font-bold text-palette-darkest mb-4">Your profile</h2>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-semibold text-palette-dark">Email</dt>
                  <dd className="text-palette-darkest font-medium">{user.profile.email}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-palette-dark">Location</dt>
                  <dd className="text-palette-darkest font-medium">
                    {currentOnboarding.location?.zip || currentOnboarding.location?.city || "Not set"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-palette-dark">Radius</dt>
                  <dd className="text-palette-darkest font-medium">{currentOnboarding.radiusMiles} mi</dd>
                </div>
                <div>
                  <dt className="font-semibold text-palette-dark">Goals</dt>
                  <dd className="text-palette-darkest font-medium">
                    {currentOnboarding.goals?.length ? currentOnboarding.goals.join(", ") : "None set"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-palette-dark">Part preference</dt>
                  <dd className="text-palette-darkest font-medium">
                    {PART_OPTIONS.find((o) => o.value === currentOnboarding.partPreference)?.label ?? "No preference"}
                  </dd>
                </div>
              </dl>
              <Link
                href="/onboarding"
                className="inline-block mt-4 rounded-lg border border-palette-mid text-palette-darkest px-4 py-2 text-sm font-semibold hover:bg-palette-100 focus-ring"
              >
                Update preferences
              </Link>
            </section>

            <section aria-labelledby="recommended-heading">
              <h2 id="recommended-heading" className="text-lg font-bold text-palette-darkest mb-4">
                Recommended flight schools
              </h2>
              {recommendedLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-10 w-10 rounded-full border-2 border-palette-mid border-t-transparent animate-spin" />
                </div>
              ) : recommendedSchools.length === 0 ? (
                <p className="text-palette-dark font-medium rounded-lg border border-palette-mid bg-white p-4">
                  No schools to show yet. Set your preferences or search in the Schools tab.
                </p>
              ) : (
                <ul className="space-y-4" role="list">
                  {recommendedSchools.map(({ school, distanceMiles }) => (
                    <li key={school.id} className="rounded-lg border border-palette-mid bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-palette-darkest">{school.name}</h3>
                          <p className="text-sm font-semibold text-palette-dark mt-1">{school.address}</p>
                          {distanceMiles != null && (
                            <p className="text-sm font-medium text-palette-dark mt-1">
                              {distanceMiles.toFixed(0)} mi from your location
                            </p>
                          )}
                        </div>
                        <Link
                          href={`/school/${school.id}`}
                          className="rounded-lg bg-palette-mid text-palette-cream px-4 py-2 text-sm font-semibold hover:bg-palette-dark focus-ring min-h-[44px] inline-flex items-center justify-center shrink-0"
                        >
                          View profile
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {mainTab === "schools" && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold text-palette-darkest">Schools</h1>
              <div className="flex items-center gap-2">
                <Link href="/onboarding" className="text-sm font-semibold text-palette-darkest hover:underline">
                  Update preferences
                </Link>
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
              </div>
            </div>

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
                    <label htmlFor="adv-location" className="block text-sm font-semibold text-palette-darkest mb-1">ZIP or city *</label>
                    <input
                      id="adv-location"
                      type="text"
                      placeholder="e.g. 30341 or Atlanta"
                      value={schoolsLocationInput}
                      onChange={(e) => setSchoolsLocationInput(e.target.value)}
                      className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring"
                    />
                  </div>
                  <div>
                    <label htmlFor="adv-radius" className="block text-sm font-semibold text-palette-darkest mb-1">Radius (miles)</label>
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
                  <button type="submit" className="rounded-lg bg-palette-mid text-palette-cream px-6 py-3 font-semibold hover:bg-palette-dark focus-ring min-h-[44px]">
                    Search
                  </button>
                </form>
              )}
            </div>

            {matchedLocation && schoolsLocationInput.trim() && (
              <div className="mb-4 rounded-lg border border-palette-mid bg-palette-100 px-4 py-2 text-sm font-medium text-palette-darkest">
                Showing results for <strong>{matchedLocation}</strong>
                {schoolsLocationInput.trim().toLowerCase() !== matchedLocation.toLowerCase() && (
                  <span> (matched &quot;{schoolsLocationInput.trim()}&quot;)</span>
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

            {schoolsLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 rounded-lg bg-palette-light/30 animate-pulse" />
                ))}
              </div>
            )}

            {!schoolsLoading && results.length === 0 && (
              <div className="rounded-lg border border-palette-mid bg-white p-8 text-center">
                <p className="text-palette-darkest font-semibold mb-4">
                  No schools match your criteria. Use Advanced search above or set a location in Update preferences.
                </p>
                <button
                  type="button"
                  onClick={() => setAdvancedOpen(true)}
                  className="inline-flex rounded-lg bg-palette-mid text-palette-cream px-6 py-3 font-semibold hover:bg-palette-dark focus-ring min-h-[44px] items-center justify-center"
                >
                  Open advanced search
                </button>
              </div>
            )}

            {!schoolsLoading && results.length > 0 && (
              <ul className="space-y-4" role="list">
                {results.map(({ school, score, distanceMiles }) => (
                  <li key={school.id} className="rounded-lg border border-palette-mid bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-palette-darkest">{school.name}</h2>
                        <p className="text-sm font-semibold text-palette-dark mt-1">{school.address}</p>
                        <p className="text-sm font-medium text-palette-dark mt-1">
                          {distanceMiles.toFixed(0)} mi away · {score}% match
                        </p>
                        {school.description && (
                          <p className="mt-2 text-sm font-medium text-palette-darkest line-clamp-2">{school.description}</p>
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
          </>
        )}

        {mainTab === "study-guide" && (
          <>
            <h1 className="text-2xl font-bold text-palette-darkest mb-6">Study Guide</h1>
            <p className="text-sm font-medium text-palette-dark mb-4">
              Use this space for your own notes. They are saved automatically in your browser.
            </p>
            <textarea
              value={studyNotes}
              onChange={(e) => setStudyNotes(e.target.value)}
              placeholder="Type your notes here..."
              className="w-full min-h-[300px] rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring font-medium resize-y"
            />
          </>
        )}

        {mainTab === "blogs" && (
          <>
            <h1 className="text-2xl font-bold text-palette-darkest mb-6">Blogs</h1>
            <article className="rounded-lg border border-palette-mid bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-palette-darkest mb-2">Welcome to My Flight School</h2>
              <p className="text-sm font-medium text-palette-dark mb-4">January 30, 2026</p>
              <div className="prose prose-sm text-palette-darkest font-medium space-y-3">
                <p>
                  Whether you&apos;re dreaming of a private pilot certificate or a career in the cockpit, finding the right flight school is the first step. My Flight School helps you compare programs, locations, and pricing so you can make an informed choice.
                </p>
                <p>
                  Use the Schools tab to search by location and preferences, add schools to compare, and reach out when you&apos;re ready. Your dashboard shows recommended schools based on your profile, and you can update your preferences anytime.
                </p>
                <p>
                  We&apos;ll add more blog posts here soon—tips for student pilots, instructor spotlights, and stories from the community. Check back later!
                </p>
              </div>
            </article>
          </>
        )}
      </main>
    </div>
  );
}

export default function StudentHomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-2 border-palette-mid border-t-transparent animate-spin" />
        </div>
      }
    >
      <StudentHomeContent />
    </Suspense>
  );
}
