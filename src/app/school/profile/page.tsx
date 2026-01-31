"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { SchoolProfile } from "@/lib/types";

const PROGRAMS = ["Part 61", "Part 141"];
const RATINGS = ["Private", "Instrument", "Commercial", "CFI"];

export default function SchoolProfileEditorPage() {
  const { user, isHydrated, setSchoolProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Partial<SchoolProfile>>({
    name: "", address: "", phone: "", website: "", photoUrl: "",
    programs: [], ratings: [], aircraftTypes: [], pricing: { type: "contact_for_quote" },
    description: "", differentiators: [], published: false,
  });
  const [aircraftInput, setAircraftInput] = useState("");
  const [diffInput, setDiffInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (user?.type !== "school") { router.replace("/school/login"); return; }
    setForm((prev) => ({ ...prev, ...user.profile, differentiators: user.profile.differentiators?.length ? user.profile.differentiators : [] }));
  }, [user, router, isHydrated]);

  function handleSaveDraft() {
    if (user?.type !== "school") return;
    setError(""); setLoading(true);
    fetch("/api/schools", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ schoolId: user.profile.id, ...form, published: false }) })
      .then((res) => res.json()).then((data) => { if (data.id) setSchoolProfile(data); router.push("/school/leads"); })
      .catch(() => setError("Something went wrong.")).finally(() => setLoading(false));
  }

  function handlePublish() {
    if (user?.type !== "school") return;
    setError("");
    if (!form.name?.trim() || !form.address?.trim() || !form.phone?.trim()) { setError("Please fill required fields to publish."); return; }
    if (!form.programs?.length) { setError("Select at least one program."); return; }
    if (!form.description?.trim() || (form.description?.length ?? 0) > 1000) { setError("Description is required (max 1,000 characters)."); return; }
    setLoading(true);
    fetch("/api/schools", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ schoolId: user.profile.id, ...form, published: true }) })
      .then((res) => res.json()).then((data) => { if (data.id) setSchoolProfile(data); router.push("/school/leads"); })
      .catch(() => setError("Something went wrong.")).finally(() => setLoading(false));
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-palette-cream flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-palette-mid border-t-transparent animate-spin" />
      </div>
    );
  }
  if (user?.type !== "school") return null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-palette-mid bg-palette-cream">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/school/leads" className="font-semibold text-palette-darkest hover:underline">Back to leads</Link>
          <span className="text-sm font-semibold text-palette-dark">Step {step} of 3</span>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold text-palette-darkest mb-6">Basic info</h1>
            <div className="space-y-4">
              <div><label htmlFor="name" className="block text-sm font-semibold text-palette-darkest mb-1">School name *</label>
                <input id="name" required value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring" />
              </div>
              <div><label htmlFor="address" className="block text-sm font-semibold text-palette-darkest mb-1">Address *</label>
                <input id="address" required value={form.address || ""} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring" />
              </div>
              <div><label htmlFor="phone" className="block text-sm font-semibold text-palette-darkest mb-1">Phone *</label>
                <input id="phone" required type="tel" value={form.phone || ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring" />
              </div>
              <div><label htmlFor="website" className="block text-sm font-semibold text-palette-darkest mb-1">Website (optional)</label>
                <input id="website" type="url" value={form.website || ""} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring" />
              </div>
              <div><label htmlFor="photoUrl" className="block text-sm font-semibold text-palette-darkest mb-1">Photo URL (optional)</label>
                <input id="photoUrl" type="url" value={form.photoUrl || ""} onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))} className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring" />
              </div>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h1 className="text-2xl font-bold text-palette-darkest mb-6">Programs and pricing</h1>
            <div className="space-y-4">
              <div><span className="block text-sm font-semibold text-palette-darkest mb-2">Programs *</span>
                <div className="flex flex-wrap gap-2">{PROGRAMS.map((p) => (
                  <label key={p} className="flex items-center gap-2 font-semibold text-palette-darkest">
                    <input type="checkbox" checked={form.programs?.includes(p) ?? false} onChange={(e) => setForm((f) => ({ ...f, programs: e.target.checked ? [...(f.programs || []), p] : (f.programs || []).filter((x) => x !== p) }))} className="rounded border-palette-mid text-palette-mid focus-ring" />
                    {p}
                  </label>
                ))}</div>
              </div>
              <div><span className="block text-sm font-semibold text-palette-darkest mb-2">Ratings offered</span>
                <div className="flex flex-wrap gap-2">{RATINGS.map((r) => (
                  <label key={r} className="flex items-center gap-2 font-semibold text-palette-darkest">
                    <input type="checkbox" checked={form.ratings?.includes(r) ?? false} onChange={(e) => setForm((f) => ({ ...f, ratings: e.target.checked ? [...(f.ratings || []), r] : (f.ratings || []).filter((x) => x !== r) }))} className="rounded border-palette-mid text-palette-mid focus-ring" />
                    {r}
                  </label>
                ))}</div>
              </div>
              <div><label htmlFor="aircraft" className="block text-sm font-semibold text-palette-darkest mb-1">Aircraft types (comma-separated)</label>
                <input id="aircraft" value={aircraftInput} onChange={(e) => { setAircraftInput(e.target.value); setForm((f) => ({ ...f, aircraftTypes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })); }} className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring" />
              </div>
              <div><span className="block text-sm font-semibold text-palette-darkest mb-2">Pricing</span>
                <label className="flex items-center gap-2 mb-2 font-medium text-palette-darkest"><input type="radio" name="pricingType" checked={form.pricing?.type === "contact_for_quote"} onChange={() => setForm((f) => ({ ...f, pricing: { type: "contact_for_quote" } }))} className="text-palette-mid focus-ring" />Contact for quote</label>
                <label className="flex items-center gap-2 font-medium text-palette-darkest"><input type="radio" name="pricingType" checked={form.pricing?.type === "range"} onChange={() => setForm((f) => ({ ...f, pricing: { type: "range", min: 0, max: 0 } }))} className="text-palette-mid focus-ring" />Price range</label>
                {form.pricing?.type === "range" && (
                  <div className="flex gap-4 mt-2">
                    <input type="number" placeholder="Min" value={form.pricing.min ?? ""} onChange={(e) => setForm((f) => ({ ...f, pricing: { type: "range", min: Number(e.target.value) || undefined, max: (f.pricing as { min?: number; max?: number })?.max } }))} className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring" />
                    <input type="number" placeholder="Max" value={form.pricing?.max ?? ""} onChange={(e) => setForm((f) => ({ ...f, pricing: { type: "range", min: (f.pricing as { min?: number; max?: number })?.min, max: Number(e.target.value) || undefined } }))} className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring" />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h1 className="text-2xl font-bold text-palette-darkest mb-6">Describe your school</h1>
            <div className="space-y-4">
              <div><label htmlFor="description" className="block text-sm font-semibold text-palette-darkest mb-1">Description * (max 1,000 chars)</label>
                <textarea id="description" required rows={5} maxLength={1000} value={form.description || ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring" />
              </div>
              <div><label htmlFor="diff" className="block text-sm font-semibold text-palette-darkest mb-1">Key differentiators (one per line)</label>
                <textarea id="diff" rows={3} value={diffInput} onChange={(e) => { setDiffInput(e.target.value); setForm((f) => ({ ...f, differentiators: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })); }} className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring" />
              </div>
            </div>
          </>
        )}
        {error && <p className="mt-4 text-red-600 text-sm font-medium" role="alert">{error}</p>}
        <div className="mt-8 flex flex-wrap gap-4">
          {step > 1 && <button type="button" onClick={() => setStep((s) => s - 1)} className="rounded-lg border border-palette-mid text-palette-darkest px-6 py-3 font-semibold hover:bg-palette-100 focus-ring min-h-[44px]">Back</button>}
          {step < 3 ? <button type="button" onClick={() => setStep((s) => s + 1)} className="rounded-lg bg-palette-mid text-palette-cream px-6 py-3 font-semibold hover:bg-palette-dark focus-ring min-h-[44px]">Next</button> : (
            <><button type="button" onClick={handleSaveDraft} disabled={loading} className="rounded-lg border border-palette-mid text-palette-darkest px-6 py-3 font-semibold hover:bg-palette-100 focus-ring disabled:opacity-50 min-h-[44px]">Save draft</button>
              <button type="button" onClick={handlePublish} disabled={loading} className="rounded-lg bg-palette-mid text-palette-cream px-6 py-3 font-semibold hover:bg-palette-dark focus-ring disabled:opacity-50 min-h-[44px]">Publish profile</button></>
          )}
        </div>
      </main>
    </div>
  );
}
