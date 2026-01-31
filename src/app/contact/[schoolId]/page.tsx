"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { SchoolProfile } from "@/lib/types";

export default function ContactSchoolPage() {
  const params = useParams();
  const schoolId = params.schoolId as string;
  const router = useRouter();
  const { user, isHydrated } = useAuth();
  const [school, setSchool] = useState<SchoolProfile | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/schools/${schoolId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.id) setSchool(data);
      })
      .catch(() => setSchool(null));
  }, [schoolId]);

  useEffect(() => {
    if (!isHydrated) return;
    if (user != null && user.type !== "student") router.replace("/login");
  }, [user, router, isHydrated]);
  useEffect(() => {
    if (user?.type === "student" && user.profile.email) setEmail(user.profile.email);
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() && !phone.trim()) {
      setError("Please provide an email or phone number.");
      return;
    }
    if (user?.type !== "student") {
      router.replace("/login");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId,
          studentId: user.profile.id,
          studentEmail: email.trim() || undefined,
          studentPhone: phone.trim() || undefined,
          message: message.slice(0, 500) || undefined,
          studentGoals: user.profile.onboarding?.goals,
          studentLocation:
            user.profile.onboarding?.location?.zip ||
            user.profile.onboarding?.location?.city,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }
      router.push(`/contact/confirmation?schoolName=${encodeURIComponent(school?.name || "")}&email=${encodeURIComponent(email.trim() || "")}&phone=${encodeURIComponent(phone.trim() || "")}`);
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-palette-cream">
        <div className="h-12 w-12 rounded-full border-2 border-palette-mid border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-palette-cream">
      <div className="w-full max-w-md">
        <Link
          href={`/school/${schoolId}`}
          className="font-semibold text-palette-darkest hover:underline mb-8 inline-block"
        >
          ← Back to {school.name}
        </Link>
        <h1 className="text-2xl font-bold text-palette-darkest mb-6">
          Request intro to {school.name}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-palette-darkest mb-1">
              Message (optional)
            </label>
            <textarea
              id="message"
              rows={4}
              maxLength={500}
              placeholder="Introduce yourself or ask a question (optional)."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-palette-darkest mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-palette-darkest mb-1">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring"
            />
          </div>
          <p className="text-sm font-medium text-palette-dark">
            Provide at least one so the school can reach you.
          </p>
          {error && (
            <p className="text-red-600 text-sm font-medium" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-palette-mid text-palette-cream py-3 font-semibold hover:bg-palette-dark focus-ring disabled:opacity-50 min-h-[44px]"
          >
            {loading ? "Sending…" : "Send request"}
          </button>
        </form>
      </div>
    </div>
  );
}
