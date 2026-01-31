"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Lead } from "@/lib/types";

export default function SchoolLeadsPage() {
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    if (user?.type !== "school") {
      router.replace("/school/login");
      return;
    }
    fetch("/api/leads?schoolId=" + encodeURIComponent(user.profile.id))
      .then((res) => res.json())
      .then((data) => setLeads(data.leads || []))
      .catch(() => setLeads([]))
      .finally(() => setLoading(false));
  }, [user, router, isHydrated]);

  const filtered = statusFilter ? leads.filter((l) => l.status === statusFilter) : leads;

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-palette-cream flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-palette-mid border-t-transparent animate-spin" />
      </div>
    );
  }
  if (user?.type !== "school") return null;

  return (
    <div className="min-h-screen bg-palette-cream">
      <header className="border-b border-palette-mid bg-palette-cream">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-bold text-palette-darkest">
              Flight School Finder
            </Link>
            <Link href="/school/profile" className="text-sm font-semibold text-palette-darkest hover:underline">
              Profile
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-palette-darkest mb-6">Leads</h1>

        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-palette-light/30 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && leads.length === 0 && (
          <div className="rounded-lg border border-palette-mid bg-white p-8 text-center">
            <p className="text-palette-darkest font-semibold mb-2">No leads yet.</p>
            <p className="text-sm font-medium text-palette-dark">
              When students request an intro to your school, they will show up here.
            </p>
          </div>
        )}

        {!loading && leads.length > 0 && (
          <>
            <div className="mb-4 flex gap-2">
              <button type="button" onClick={() => setStatusFilter("")} className={"rounded-lg px-3 py-2 text-sm font-semibold focus-ring min-h-[44px] " + (!statusFilter ? "bg-palette-mid text-palette-cream" : "border border-palette-mid text-palette-darkest")}>
                All
              </button>
              <button type="button" onClick={() => setStatusFilter("new")} className={"rounded-lg px-3 py-2 text-sm font-semibold focus-ring min-h-[44px] " + (statusFilter === "new" ? "bg-palette-mid text-palette-cream" : "border border-palette-mid text-palette-darkest")}>
                New
              </button>
              <button type="button" onClick={() => setStatusFilter("contacted")} className={"rounded-lg px-3 py-2 text-sm font-semibold focus-ring min-h-[44px] " + (statusFilter === "contacted" ? "bg-palette-mid text-palette-cream" : "border border-palette-mid text-palette-darkest")}>
                Contacted
              </button>
              <button type="button" onClick={() => setStatusFilter("closed")} className={"rounded-lg px-3 py-2 text-sm font-semibold focus-ring min-h-[44px] " + (statusFilter === "closed" ? "bg-palette-mid text-palette-cream" : "border border-palette-mid text-palette-darkest")}>
                Closed
              </button>
            </div>
            <ul className="divide-y divide-palette-mid border border-palette-mid rounded-lg overflow-hidden bg-white">
              {filtered.map((lead) => (
                <li key={lead.id}>
                  <Link href={"/school/leads/" + lead.id} className="block p-4 hover:bg-palette-100 focus-ring">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-semibold text-palette-darkest">{lead.studentEmail || lead.studentPhone || "Prospect"}</span>
                        <p className="text-sm font-medium text-palette-dark mt-1 line-clamp-1">{lead.message || "No message"}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-palette-dark">{new Date(lead.createdAt).toLocaleDateString()}</span>
                        <span className={"rounded-full px-2 py-1 text-xs font-semibold " + (lead.status === "new" ? "bg-palette-light/30 text-palette-darkest" : lead.status === "contacted" ? "bg-amber-100 text-amber-800" : "bg-palette-100 text-palette-dark")}>
                          {lead.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
