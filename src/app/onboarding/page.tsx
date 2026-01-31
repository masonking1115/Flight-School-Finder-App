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

export default function OnboardingPage() {
  const { user, isHydrated, setStudentProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [onboarding, setOnboarding] = useState<StudentOnboarding>(defaultOnboarding);
  const [locationInput, setLocationInput] = useState("");
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

  function parseLocation(val: string): { zip?: string; city?: string; state?: string } {
    const v = val.trim();
    const zipMatch = v.match(/^\d{5}(-\d{4})?$/);
    if (zipMatch) return { zip: v };
    const parts = v.split(",").map((p) => p.trim());
    if (parts.length >= 2) return { city: parts[0], state: parts[1].slice(0, 2) };
    if (v.length >= 2) return { city: v };
    return {};
  }

  function handleNext() {
    setError("");
    if (step === 1) {
      const loc = parseLocation(locationInput);
      if (!loc.zip && !loc.city) {
        setError("Please enter a valid ZIP or city.");
        return;
      }
      setOnboarding((o) => ({ ...o, location: loc }));
      setStep(2);
    } else if (step === 2) {
      if (onboarding.goals.length === 0) {
        setError("Select at least one.");
        return;
      }
      setStep(3);
    } else {
      setLoading(true);
      fetch(`/api/students/${user!.profile.id}/onboarding`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(onboarding),
      })
        .then(async (res) => {
          const data = await res.json();
          if (res.ok && data.user) {
            setStudentProfile(data.user);
            router.push("/home");
          } else if (res.status === 404) {
            const u = user!;
            if (u.type === "student") {
              setStudentProfile({ ...u.profile, onboarding });
              router.push("/home");
            }
          } else {
            setError(data.error || "Could not save. Please try again.");
          }
        })
        .catch(() => setError("Something went wrong. Please try again."))
        .finally(() => setLoading(false));
    }
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-palette-cream flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-palette-mid border-t-transparent animate-spin" />
      </div>
    );
  }
  if (user?.type !== "student") return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/home"
          className="text-palette-dark font-semibold mb-8 inline-block hover:text-palette-darkest"
        >
          ← Back to Home
        </Link>
        <p className="text-sm font-semibold text-palette-dark mb-6">
          Step {step} of 3
        </p>

        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold text-palette-darkest mb-2">
              Where do you want to fly?
            </h1>
            <p className="text-palette-dark font-medium mb-4">
              We&apos;ll show schools within your chosen radius.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-palette-darkest mb-1">
                  ZIP or city
                </label>
                <input
                  id="location"
                  type="text"
                  placeholder="ZIP or city"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring"
                />
              </div>
              <div>
                <label htmlFor="radius" className="block text-sm font-semibold text-palette-darkest mb-1">
                  Radius (miles)
                </label>
                <select
                  id="radius"
                  value={onboarding.radiusMiles}
                  onChange={(e) =>
                    setOnboarding((o) => ({
                      ...o,
                      radiusMiles: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring"
                >
                  {RADIUS_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r} mi
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-bold text-palette-darkest mb-2">
              What&apos;s your goal?
            </h1>
            <p className="text-palette-dark font-medium mb-4">
              Select at least one.
            </p>
            <div className="space-y-2">
              {GOALS.map((goal) => (
                <label
                  key={goal}
                  className="flex items-center gap-3 p-3 rounded-lg border border-palette-mid cursor-pointer hover:bg-palette-100"
                >
                  <input
                    type="checkbox"
                    checked={onboarding.goals.includes(goal)}
                    onChange={(e) =>
                      setOnboarding((o) => ({
                        ...o,
                        goals: e.target.checked
                          ? [...o.goals, goal]
                          : o.goals.filter((g) => g !== goal),
                      }))
                    }
                    className="rounded border-palette-mid text-palette-mid focus-ring w-4 h-4"
                  />
                  <span className="font-semibold text-palette-darkest">{goal}</span>
                </label>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-2xl font-bold text-palette-darkest mb-2">
              Any preferences?
            </h1>
            <p className="text-palette-dark font-medium mb-4">
              We&apos;ll use this to rank schools.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-palette-darkest mb-2">
                  Part 61 / Part 141
                </label>
                <select
                  value={onboarding.partPreference}
                  onChange={(e) =>
                    setOnboarding((o) => ({
                      ...o,
                      partPreference: e.target.value as PartPreference,
                    }))
                  }
                  className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring"
                >
                  {PART_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-palette-darkest mb-2">
                  Budget range (optional)
                </label>
                <select
                  value={onboarding.budgetRange}
                  onChange={(e) =>
                    setOnboarding((o) => ({
                      ...o,
                      budgetRange: e.target.value as BudgetRange,
                    }))
                  }
                  className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring"
                >
                  {BUDGET_OPTIONS.map((opt) => (
                    <option key={opt.value || "none"} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-palette-darkest mb-2">
                  Timeline
                </label>
                <select
                  value={onboarding.timeline}
                  onChange={(e) =>
                    setOnboarding((o) => ({
                      ...o,
                      timeline: e.target.value as Timeline,
                    }))
                  }
                  className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring"
                >
                  {TIMELINE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {error && (
          <p className="mt-4 text-red-600 text-sm font-medium" role="alert">
            {error}
          </p>
        )}
        <div className="mt-8 flex gap-4">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="rounded-lg border border-palette-mid text-palette-darkest px-6 py-3 font-semibold hover:bg-palette-100 focus-ring min-h-[44px]"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="flex-1 rounded-lg bg-palette-mid text-palette-cream py-3 font-semibold hover:bg-palette-dark focus-ring disabled:opacity-50 min-h-[44px]"
          >
            {loading ? "Loading…" : step === 3 ? "See schools" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
