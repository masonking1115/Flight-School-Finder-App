"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Lead } from "@/lib/types";

export default function LeadDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user, isHydrated } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (user?.type !== "school") {
      router.replace("/school/login");
      return;
    }
    fetch("/api/leads/" + id)
      .then((res) => res.json())
      .then((data) => {
        if (data.id) setLead(data);
      })
      .catch(() => setLead(null))
      .finally(() => setLoading(false));
  }, [id, user, router, isHydrated]);

  function updateStatus(status: Lead["status"]) {
    if (!lead) return;
    setUpdating(true);
    fetch("/api/leads/" + lead.id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.id) setLead(data);
      })
      .finally(() => setUpdating(false));
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-palette-cream flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-palette-mid border-t-transparent animate-spin" />
      </div>
    );
  }
  if (user?.type !== "school") return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-palette-cream">
        <div className="h-12 w-12 rounded-full border-2 border-palette-mid border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-palette-cream">
        <p className="text-palette-darkest font-semibold mb-4">Lead not found.</p>
        <Link href="/school/leads" className="font-semibold text-palette-darkest hover:underline">
          Back to leads
        </Link>
      </div>
    );
  }

  const contact = [lead.studentEmail, lead.studentPhone].filter(Boolean).join(" · ");

  return (
    <div className="min-h-screen bg-palette-cream">
      <header className="border-b border-palette-mid bg-palette-cream">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/school/leads" className="font-semibold text-palette-darkest hover:underline">
            ← Back to leads
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-palette-darkest mb-6">
          Lead details
        </h1>

        <section className="space-y-4 mb-8">
          <div>
            <h2 className="text-sm font-semibold text-palette-darkest mb-1">
              Message
            </h2>
            <p className="font-medium text-palette-darkest whitespace-pre-wrap">
              {lead.message || "No message provided."}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-palette-darkest mb-1">
              Contact
            </h2>
            <p className="font-medium text-palette-darkest">{contact}</p>
            <p className="mt-2 text-sm font-medium text-palette-dark">
              Reply to the student using the email or phone above.
            </p>
          </div>
          {lead.studentGoals?.length ? (
            <div>
              <h2 className="text-sm font-semibold text-palette-darkest mb-1">
                Goals
              </h2>
              <p className="font-medium text-palette-darkest">
                {lead.studentGoals.join(", ")}
              </p>
            </div>
          ) : null}
          {lead.studentLocation && (
            <div>
              <h2 className="text-sm font-semibold text-palette-darkest mb-1">
                Location
              </h2>
              <p className="font-medium text-palette-darkest">{lead.studentLocation}</p>
            </div>
          )}
          <div>
            <span className="text-sm font-medium text-palette-dark">
              Received {new Date(lead.createdAt).toLocaleString()}
            </span>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          {lead.status === "new" && (
            <button
              type="button"
              disabled={updating}
              onClick={() => updateStatus("contacted")}
              className="rounded-lg bg-palette-mid text-palette-cream px-4 py-2 font-semibold hover:bg-palette-dark focus-ring disabled:opacity-50 min-h-[44px]"
            >
              Mark as contacted
            </button>
          )}
          {(lead.status === "new" || lead.status === "contacted") && (
            <button
              type="button"
              disabled={updating}
              onClick={() => updateStatus("closed")}
              className="rounded-lg border border-palette-mid text-palette-darkest px-4 py-2 font-semibold hover:bg-palette-100 focus-ring disabled:opacity-50 min-h-[44px]"
            >
              Mark as closed
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
