"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { SchoolProfile } from "@/lib/types";

type RankedResult = { school: SchoolProfile; score: number; distanceMiles: number };

export default function ResultsPage() {
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<RankedResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"score" | "distance" | "price">("score");
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isHydrated) return;
    if (user?.type !== "student") {
      router.replace("/login");
      return;
    }
    const onboarding = user.profile.onboarding;
    if (!onboarding?.location?.zip && !onboarding?.location?.city) {
      router.replace("/onboarding");
      return;
    }
    if (onboarding) {
      fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboarding, sort }),
      })
        .then((res) => res.json())
        .then((data) => {
          setResults(data.results || []);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    } else {
      const params = new URLSearchParams();
      params.set("studentId", user.profile.id);
      params.set("sort", sort);
      fetch(`/api/results?${params}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.results || []);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }
  }, [user, router, sort, isHydrated]);

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
      <div className="min-h-screen bg-palette-cream flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-palette-mid border-t-transparent animate-spin" />
      </div>
    );
  }
  if (user?.type !== "student") return null;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-palette-mid bg-palette-cream/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-bold text-palette-darkest">
              Flight School Finder
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
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-palette-darkest mb-6">
          Flight schools near you
        </h1>

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
              No schools match your criteria. Try widening your search radius or relaxing filters.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex rounded-lg bg-palette-mid text-palette-cream px-6 py-3 font-semibold hover:bg-palette-dark focus-ring min-h-[44px] items-center justify-center"
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
