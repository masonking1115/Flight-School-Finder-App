"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const schoolName = searchParams.get("schoolName") || "The school";
  const email = searchParams.get("email") || "";
  const phone = searchParams.get("phone") || "";
  const contact = [email, phone].filter(Boolean).join(" or ") || "your contact info";

  return (
    <div className="max-w-md text-center">
      <h1 className="text-2xl font-bold text-palette-darkest mb-4">
        Request sent
      </h1>
      <p className="font-semibold text-palette-darkest mb-8">
        {schoolName} will contact you at {contact}. Usually within 1–2 business days.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/results"
          className="rounded-lg bg-palette-mid text-palette-cream px-6 py-3 font-semibold hover:bg-palette-dark focus-ring min-h-[44px] inline-flex items-center justify-center"
        >
          Back to results
        </Link>
        <Link
          href="/compare"
          className="rounded-lg border border-palette-mid text-palette-darkest px-6 py-3 font-semibold hover:bg-palette-100 focus-ring min-h-[44px] inline-flex items-center justify-center"
        >
          Compare more schools
        </Link>
      </div>
    </div>
  );
}

export default function ContactConfirmationPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <Suspense fallback={<div className="h-12 w-12 rounded-full border-2 border-palette-mid border-t-transparent animate-spin" />}>
        <ConfirmationContent />
      </Suspense>
    </div>
  );
}
