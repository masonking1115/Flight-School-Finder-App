"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SchoolDashboardPage() {
  const { user, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    if (user?.type !== "school") {
      router.replace("/school/login");
      return;
    }
    const school = user.profile;
    if (!school.name || !school.address) {
      router.replace("/school/profile");
    } else {
      router.replace("/school/leads");
    }
  }, [user, router, isHydrated]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-12 w-12 rounded-full border-2 border-palette-600 border-t-transparent animate-spin" />
    </div>
  );
}
