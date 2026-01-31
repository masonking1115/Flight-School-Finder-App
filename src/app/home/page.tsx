"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  GOALS,
  RADIUS_OPTIONS,
  PART_OPTIONS,
  BUDGET_OPTIONS,
  TIMELINE_OPTIONS,
} from "@/lib/types";
import type { StudentOnboarding, PartPreference, BudgetRange, Timeline } from "@/lib/types";

const defaultOnboarding: StudentOnboarding = {
  location: {},
  radiusMiles: 50,
  goals: [],
  partPreference: "no_preference",
  budgetRange: "",
  timeline: "just_browsing",
};

export default function StudentHomePage() {
  const { user, isHydrated, setStudentProfile } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"find" | "preferences">("find");
  const [onboarding, setOnboarding] = useState<StudentOnboarding>(defaultOnboarding);
  const [locationInput, setLocationInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    }
  }, [user, router, isHydrated]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-palette-cream flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-palette-mid border-t-transparent animate-spin" />
      </div>
    );
  }

  if (user?.type !== "student") return null;

  const hasPreferences = Boolean(
    (user?.type === "student" && user.profile.onboarding?.location?.zip) ||
    (user?.type === "student" && user.profile.onboarding?.location?.city)
  );

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
        } else if (res.status === 404) {
          const u = user!;
          if (u.type === "student") {
            setStudentProfile({ ...u.profile, onboarding: toSave });
            setSaved(true);
            setOnboarding(toSave);
            setTimeout(() => setSaved(false), 3000);
          }
        } else {
          setError(data.error || "Could not save.");
        }
      })
      .catch(() => setError("Something went wrong."))
      .finally(() => setLoading(false));
  }

  return (
    <div className="min-h-screen bg-palette-cream">
      <header className="border-b border-palette-mid bg-palette-cream">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-semibold text-palette-darkest">
            Flight School Finder
          </Link>
          <nav className="flex gap-4">
            <Link href="/results" className="font-semibold text-palette-darkest hover:underline text-sm">
              Results
            </Link>
            <Link href="/compare" className="font-semibold text-palette-darkest hover:underline text-sm">
              Compare
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-palette-darkest mb-6">
          Home
        </h1>

        <div className="flex border-b border-palette-mid mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("find")}
            className={`px-4 py-3 font-medium text-sm border-b-2 -mb-px focus-ring min-h-[44px] ${
              activeTab === "find"
                ? "border-palette-mid text-palette-darkest"
                : "border-transparent text-palette-dark font-medium hover:text-palette-darkest"
            }`}
          >
            Find flight schools
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preferences")}
            className={`px-4 py-3 font-medium text-sm border-b-2 -mb-px focus-ring min-h-[44px] ${
              activeTab === "preferences"
                ? "border-palette-mid text-palette-darkest"
                : "border-transparent text-palette-dark font-medium hover:text-palette-darkest"
            }`}
          >
            Preferences
          </button>
        </div>

        {activeTab === "find" && (
          <section aria-labelledby="find-heading">
            <h2 id="find-heading" className="sr-only">
              Find flight schools
            </h2>
            <div className="rounded-lg border border-palette-mid bg-white p-6">
              {hasPreferences ? (
                <>
                  <p className="text-palette-dark font-medium mb-4">
                    Your preferences are saved. View matched schools or edit your preferences.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/results"
                      className="inline-flex items-center justify-center rounded-lg bg-palette-mid text-palette-cream px-6 py-3 font-medium hover:bg-palette-dark focus-ring min-h-[44px]"
                    >
                      Find flight schools
                    </Link>
                    <button
                      type="button"
                      onClick={() => setActiveTab("preferences")}
                      className="inline-flex items-center justify-center rounded-lg border border-palette-mid text-palette-darkest px-6 py-3 font-medium hover:bg-palette-light hover:text-palette-cream focus-ring min-h-[44px]"
                    >
                      Edit preferences
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-palette-darkest font-semibold mb-4">
                    Set your location and goals so we can show you matching flight schools.
                  </p>
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center justify-center rounded-lg bg-palette-mid text-palette-cream px-6 py-3 font-medium hover:bg-palette-dark focus-ring min-h-[44px]"
                  >
                    Set preferences & find schools
                  </Link>
                </>
              )}
            </div>
          </section>
        )}

        {activeTab === "preferences" && (
          <section aria-labelledby="preferences-heading">
            <h2 id="preferences-heading" className="sr-only">
              Your preferences
            </h2>
            <form onSubmit={handleSavePreferences} className="space-y-4 rounded-lg border border-palette-mid bg-white p-6">
              <p className="text-palette-darkest font-semibold text-sm mb-4">
                Update your location, goals, and preferences. These are used to rank flight schools.
              </p>
              <div>
                <label htmlFor="pref-location" className="block text-sm font-semibold text-palette-darkest mb-1">
                  ZIP or city *
                </label>
                <input
                  id="pref-location"
                  type="text"
                  placeholder="ZIP or city"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full rounded-lg border border-palette-light bg-white text-palette-darkest px-4 py-3 focus-ring"
                />
              </div>
              <div>
                <label htmlFor="pref-radius" className="block text-sm font-semibold text-palette-darkest mb-1">
                  Radius (miles)
                </label>
                <select
                  id="pref-radius"
                  value={onboarding.radiusMiles}
                  onChange={(e) => setOnboarding((o) => ({ ...o, radiusMiles: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-palette-light bg-white text-palette-darkest px-4 py-3 focus-ring"
                >
                  {RADIUS_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r} mi</option>
                  ))}
                </select>
              </div>
              <div>
                <span className="block text-sm font-medium text-palette-darkest mb-2">Goals *</span>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map((goal) => (
                    <label key={goal} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={onboarding.goals.includes(goal)}
                        onChange={(e) =>
                          setOnboarding((o) => ({
                            ...o,
                            goals: e.target.checked ? [...o.goals, goal] : o.goals.filter((g) => g !== goal),
                          }))
                        }
                        className="rounded border-palette-light text-palette-dark font-medium focus-ring"
                      />
                      <span className="text-palette-darkest text-sm">{goal}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-palette-darkest mb-1">Part 61 / Part 141</label>
                <select
                  value={onboarding.partPreference}
                  onChange={(e) => setOnboarding((o) => ({ ...o, partPreference: e.target.value as PartPreference }))}
                  className="w-full rounded-lg border border-palette-light bg-white text-palette-darkest px-4 py-3 focus-ring"
                >
                  {PART_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-palette-darkest mb-1">Budget range</label>
                <select
                  value={onboarding.budgetRange}
                  onChange={(e) => setOnboarding((o) => ({ ...o, budgetRange: e.target.value as BudgetRange }))}
                  className="w-full rounded-lg border border-palette-light bg-white text-palette-darkest px-4 py-3 focus-ring"
                >
                  {BUDGET_OPTIONS.map((opt) => (
                    <option key={opt.value || "none"} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-palette-darkest mb-1">Timeline</label>
                <select
                  value={onboarding.timeline}
                  onChange={(e) => setOnboarding((o) => ({ ...o, timeline: e.target.value as Timeline }))}
                  className="w-full rounded-lg border border-palette-light bg-white text-palette-darkest px-4 py-3 focus-ring"
                >
                  {TIMELINE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {error && <p className="text-red-600 text-sm" role="alert">{error}</p>}
              {saved && <p className="text-green-700 text-sm" role="status">Preferences saved.</p>}
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-palette-mid text-palette-cream px-6 py-3 font-semibold hover:bg-palette-dark focus-ring disabled:opacity-50 min-h-[44px]"
              >
                {loading ? "Saving…" : "Save preferences"}
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
