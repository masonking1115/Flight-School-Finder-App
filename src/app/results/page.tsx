"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ResultsPage() {
  const { user, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    if (user?.type !== "student") {
      router.replace("/login");
      return;
    }
    router.replace("/home?tab=schools");
  }, [isHydrated, user?.type, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="h-12 w-12 rounded-full border-2 border-palette-mid border-t-transparent animate-spin" />
    </div>
  );
}
