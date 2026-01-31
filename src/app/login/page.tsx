"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function StudentLoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginStudent, signupStudent } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "signup") {
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords don't match.");
        return;
      }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email.");
      return;
    }
    setLoading(true);
    const fn = mode === "login" ? loginStudent : signupStudent;
    const result = await fn(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/home");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="text-palette-dark font-semibold mb-8 inline-block hover:text-palette-darkest"
        >
          ← Flight School Finder
        </Link>
        <h1 className="text-2xl font-bold text-palette-darkest mb-6">
          {mode === "login" ? "Log in" : "Create account"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-palette-darkest mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-palette-darkest mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={mode === "signup" ? 8 : undefined}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring"
            />
          </div>
          {mode === "signup" && (
            <div>
              <label htmlFor="confirm" className="block text-sm font-semibold text-palette-darkest mb-1">
                Confirm password
              </label>
              <input
                id="confirm"
                name="confirm-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-palette-mid bg-white text-palette-darkest px-4 py-3 focus-ring"
              />
            </div>
          )}
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
            {loading ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>
        {mode === "login" && (
          <p className="mt-4 text-center text-sm font-medium text-palette-dark">
            <a href="#" className="hover:text-palette-darkest">Forgot password?</a>
          </p>
        )}
        <p className="mt-6 text-center text-sm font-medium text-palette-dark">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
            }}
            className="text-palette-darkest font-semibold hover:underline"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}
