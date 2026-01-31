"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { StudentProfile, SchoolProfile } from "@/lib/types";

type User = { type: "student"; profile: StudentProfile } | { type: "school"; profile: SchoolProfile };

const AuthContext = createContext<{
  user: User | null;
  isHydrated: boolean;
  loginStudent: (email: string, password: string) => Promise<{ error?: string }>;
  signupStudent: (email: string, password: string) => Promise<{ error?: string }>;
  loginSchool: (email: string, password: string) => Promise<{ error?: string }>;
  signupSchool: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  setStudentProfile: (p: StudentProfile | null) => void;
  setSchoolProfile: (p: SchoolProfile | null) => void;
} | null>(null);

const STUDENT_KEY = "fsf_student";
const SCHOOL_KEY = "fsf_school";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const s = localStorage.getItem(STUDENT_KEY);
      const h = localStorage.getItem(SCHOOL_KEY);
      if (s) {
        const p = JSON.parse(s) as StudentProfile;
        setUser({ type: "student", profile: p });
      } else if (h) {
        const p = JSON.parse(h) as SchoolProfile;
        setUser({ type: "school", profile: p });
      }
    } catch (_) {}
    setIsHydrated(true);
  }, []);

  const loginStudent = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, action: "login" }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Invalid email or password." };
    localStorage.setItem(STUDENT_KEY, JSON.stringify(data.user));
    setUser({ type: "student", profile: data.user });
    return {};
  }, []);

  const signupStudent = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, action: "signup" }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Sign up failed." };
    localStorage.setItem(STUDENT_KEY, JSON.stringify(data.user));
    setUser({ type: "student", profile: data.user });
    return {};
  }, []);

  const loginSchool = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/school", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, action: "login" }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Invalid email or password." };
    localStorage.setItem(SCHOOL_KEY, JSON.stringify(data.user));
    setUser({ type: "school", profile: data.user });
    return {};
  }, []);

  const signupSchool = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/school", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, action: "signup" }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Sign up failed." };
    localStorage.setItem(SCHOOL_KEY, JSON.stringify(data.user));
    setUser({ type: "school", profile: data.user });
    return {};
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STUDENT_KEY);
    localStorage.removeItem(SCHOOL_KEY);
    setUser(null);
  }, []);

  const setStudentProfile = useCallback((p: StudentProfile | null) => {
    if (p) {
      localStorage.setItem(STUDENT_KEY, JSON.stringify(p));
      setUser({ type: "student", profile: p });
    } else {
      localStorage.removeItem(STUDENT_KEY);
      setUser(null);
    }
  }, []);

  const setSchoolProfile = useCallback((p: SchoolProfile | null) => {
    if (p) {
      localStorage.setItem(SCHOOL_KEY, JSON.stringify(p));
      setUser({ type: "school", profile: p });
    } else {
      localStorage.removeItem(SCHOOL_KEY);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isHydrated,
        loginStudent,
        signupStudent,
        loginSchool,
        signupSchool,
        logout,
        setStudentProfile,
        setSchoolProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
