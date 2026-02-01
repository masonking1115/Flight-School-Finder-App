"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import UserMenu from "@/components/UserMenu";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { SchoolProfile } from "@/lib/types";

export default function ComparePage() {
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [schools, setSchools] = useState<SchoolProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated) return;
    if (user?.type !== "student") {
      router.replace("/login");
      return;
    }
    const stored = typeof window !== "undefined" ? localStorage.getItem("fsf_compare") : null;
    const ids: string[] = stored ? JSON.parse(stored) : [];
    setCompareIds(ids);
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    Promise.all(ids.map((id) => fetch(`/api/schools/${id}`).then((r) => r.json())))
      .then((results) => setSchools(results.filter((s) => s.id)))
      .catch(() => setSchools([]))
      .finally(() => setLoading(false));
  }, [user, router, isHydrated]);

  function remove(id: string) {
    const next = compareIds.filter((x) => x !== id);
    setCompareIds(next);
    setSchools((prev) => prev.filter((s) => s.id !== id));
    if (typeof window !== "undefined")
      localStorage.setItem("fsf_compare", JSON.stringify(next));
  }

  function price(s: SchoolProfile) {
    if (s.pricing.type === "range" && s.pricing.min != null && s.pricing.max != null)
      return "$" + s.pricing.min.toLocaleString() + " – $" + s.pricing.max.toLocaleString();
    return "Contact for quote";
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-palette-mid border-t-transparent animate-spin" />
      </div>
    );
  }
  if (user?.type !== "student") return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-12 w-12 rounded-full border-2 border-palette-mid border-t-transparent animate-spin" />
      </div>
    );
  }

  if (schools.length < 2) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
        <h1 className="text-2xl font-bold text-palette-darkest mb-4">
          Compare schools
        </h1>
        <p className="font-semibold text-palette-dark text-center mb-6">
          Add at least 2 schools from your results to compare.
        </p>
        <Link
          href="/results"
          className="rounded-lg bg-palette-mid text-palette-cream px-6 py-3 font-semibold hover:bg-palette-dark focus-ring min-h-[44px] inline-flex items-center justify-center"
        >
          Go to results
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-palette-mid bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/results" className="font-semibold text-palette-darkest hover:underline">
            Back to results
          </Link>
          <UserMenu />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 overflow-x-auto">
        <h1 className="text-2xl font-bold text-palette-darkest mb-6">
          Compare schools
        </h1>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th scope="col" className="p-3 border-b border-palette-mid text-palette-darkest font-semibold w-40 bg-white">
                  Attribute
                </th>
                {schools.map((s) => (
                  <th key={s.id} scope="col" className="p-3 border-b border-palette-mid text-palette-darkest font-bold min-w-[180px] bg-white">
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" className="p-3 border-b border-palette-mid text-palette-darkest font-semibold bg-white">
                  Location
                </th>
                {schools.map((s) => (
                  <td key={s.id} className="p-3 border-b border-palette-mid text-palette-darkest font-medium bg-white">
                    {s.address}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className="p-3 border-b border-palette-mid text-palette-darkest font-semibold bg-white">
                  Programs
                </th>
                {schools.map((s) => (
                  <td key={s.id} className="p-3 border-b border-palette-mid text-palette-darkest font-medium bg-white">
                    {s.programs.join(", ") || "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className="p-3 border-b border-palette-mid text-palette-darkest font-semibold bg-white">
                  Price range
                </th>
                {schools.map((s) => (
                  <td key={s.id} className="p-3 border-b border-palette-mid text-palette-darkest font-medium bg-white">
                    {price(s)}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className="p-3 border-b border-palette-mid text-palette-darkest font-semibold bg-white">
                  Actions
                </th>
                {schools.map((s) => (
                  <td key={s.id} className="p-3 border-b border-palette-mid bg-white">
                    <button
                      type="button"
                      onClick={() => remove(s.id)}
                      className="text-sm font-semibold text-palette-dark hover:text-red-600 focus-ring mr-4"
                    >
                      Remove
                    </button>
                    <Link
                      href={"/contact/" + s.id}
                      className="text-sm font-semibold text-palette-darkest hover:underline focus-ring"
                    >
                      Request intro
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
