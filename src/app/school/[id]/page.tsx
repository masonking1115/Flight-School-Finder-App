"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { SchoolProfile } from "@/lib/types";

export default function SchoolProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const [school, setSchool] = useState<SchoolProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/schools/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.id) setSchool(data);
      })
      .catch(() => setSchool(null))
      .finally(() => setLoading(false));
  }, [id]);

  function addToCompare() {
    if (!school) return;
    const stored = typeof window !== "undefined" ? localStorage.getItem("fsf_compare") : null;
    const arr: string[] = stored ? JSON.parse(stored) : [];
    if (arr.includes(school.id) || arr.length >= 4) return;
    arr.push(school.id);
    localStorage.setItem("fsf_compare", JSON.stringify(arr));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-12 w-12 rounded-full border-2 border-palette-mid border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
        <p className="text-palette-darkest font-semibold mb-4">School not found.</p>
        <Link href="/results" className="font-semibold text-palette-darkest hover:underline">
          Back to results
        </Link>
      </div>
    );
  }

  const priceText =
    school.pricing.type === "range" && school.pricing.min != null && school.pricing.max != null
      ? `$${school.pricing.min.toLocaleString()} – $${school.pricing.max.toLocaleString()}`
      : "Contact for quote";

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(school.address)}`;

  return (
    <div className="min-h-screen">
      <header className="border-b border-palette-200 dark:border-palette-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <Link href="/results" className="text-sky-600 dark:text-sky-400 font-medium">
            ← Back to results
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addToCompare}
              className="rounded-lg border border-palette-300 dark:border-palette-600 text-palette-700 dark:text-palette-300 px-4 py-2 text-sm font-medium hover:bg-palette-100 dark:hover:bg-palette-700 focus-ring min-h-[44px]"
            >
              Add to compare
            </button>
            <Link
              href={user?.type === "student" ? `/contact/${school.id}` : "/login"}
              className="rounded-lg bg-sky-600 text-white px-4 py-2 text-sm font-medium hover:bg-palette-700 focus-ring min-h-[44px] inline-flex items-center justify-center"
            >
              Request intro
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-palette-darkest">
            {school.website ? (
              <>
                <a
                  href={school.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-palette-darkest hover:underline"
                >
                  {school.name}
                </a>
                <span className="text-sm font-normal text-palette-dark"> (Click Me!)</span>
              </>
            ) : (
              school.name
            )}
          </h1>
          <p className="font-semibold text-palette-dark mt-1">{school.address}</p>
        </div>

        {school.photoUrl && (
          <div className="mb-8 rounded-lg overflow-hidden bg-palette-200 dark:bg-palette-700 aspect-video">
            <img
              src={school.photoUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <section className="mb-8" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="text-xl font-bold text-palette-darkest mb-4">
            Overview
          </h2>
          <p className="font-medium text-palette-darkest whitespace-pre-wrap">
            {school.description || "No description provided."}
          </p>
          {school.programs.length > 0 && (
            <p className="mt-2 text-sm font-semibold text-palette-dark">
              Programs: {school.programs.join(", ")}
            </p>
          )}
          {school.ratings.length > 0 && (
            <p className="text-sm font-semibold text-palette-dark">
              Ratings: {school.ratings.join(", ")}
            </p>
          )}
          {school.aircraftTypes.length > 0 && (
            <p className="text-sm font-semibold text-palette-dark">
              Aircraft: {school.aircraftTypes.join(", ")}
            </p>
          )}
        </section>

        <section className="mb-8" aria-labelledby="pricing-heading">
          <h2 id="pricing-heading" className="text-xl font-bold text-palette-darkest mb-2">
            Pricing
          </h2>
          <p className="font-medium text-palette-darkest">{priceText}</p>
        </section>

        <section className="mb-8" aria-labelledby="location-heading">
          <h2 id="location-heading" className="text-xl font-bold text-palette-darkest mb-2">
            Location
          </h2>
          <p className="font-medium text-palette-darkest mb-2">{school.address}</p>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-palette-darkest hover:underline"
          >
            Open in Google Maps
          </a>
        </section>

        {school.differentiators?.length > 0 && (
          <section aria-labelledby="diff-heading">
            <h2 id="diff-heading" className="text-xl font-bold text-palette-darkest mb-2">
              Highlights
            </h2>
            <ul className="list-disc list-inside font-medium text-palette-darkest">
              {school.differentiators.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-8 text-sm font-medium text-palette-dark">
          Last updated: {new Date(school.updatedAt).toLocaleDateString()}
        </p>
      </main>
    </div>
  );
}
