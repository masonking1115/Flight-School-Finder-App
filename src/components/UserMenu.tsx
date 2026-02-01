"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const isStudent = user.type === "student";
  const userId = user.profile.id;

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match.");
      return;
    }
    setLoading(true);
    const url = isStudent
      ? `/api/students/${userId}/password`
      : `/api/schools/${userId}/password`;
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setPasswordError(data.error || "Could not update password.");
      return;
    }
    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => {
      setPasswordOpen(false);
      setPasswordSuccess(false);
    }, 1500);
  }

  function handleLogout() {
    setOpen(false);
    logout();
    router.push("/");
  }

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-lg border border-palette-mid bg-white px-3 py-2 text-sm font-semibold text-palette-darkest hover:bg-palette-100 focus-ring min-h-[44px]"
        aria-expanded={open}
        aria-haspopup="true"
      >
        My Profile
        <span className="text-palette-dark">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] rounded-lg border border-palette-mid bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setPasswordOpen(true);
              setPasswordError("");
              setPasswordSuccess(false);
            }}
            className="w-full px-4 py-2 text-left text-sm font-semibold text-palette-darkest hover:bg-palette-100 focus-ring"
          >
            Change password
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-sm font-semibold text-palette-darkest hover:bg-palette-100 focus-ring"
          >
            Log out
          </button>
        </div>
      )}

      {passwordOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg border border-palette-mid bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-palette-darkest mb-4">
              Change password
            </h3>
            {passwordSuccess ? (
              <p className="text-green-700 font-semibold">Password updated.</p>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label htmlFor="current-pw" className="block text-sm font-semibold text-palette-darkest mb-1">
                    Current password
                  </label>
                  <input
                    id="current-pw"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-palette-mid bg-white px-3 py-2 text-palette-darkest focus-ring"
                    autoComplete="current-password"
                  />
                </div>
                <div>
                  <label htmlFor="new-pw" className="block text-sm font-semibold text-palette-darkest mb-1">
                    New password
                  </label>
                  <input
                    id="new-pw"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-palette-mid bg-white px-3 py-2 text-palette-darkest focus-ring"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-pw" className="block text-sm font-semibold text-palette-darkest mb-1">
                    Confirm new password
                  </label>
                  <input
                    id="confirm-pw"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-palette-mid bg-white px-3 py-2 text-palette-darkest focus-ring"
                    autoComplete="new-password"
                  />
                </div>
                {passwordError && (
                  <p className="text-red-600 text-sm" role="alert">{passwordError}</p>
                )}
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-palette-mid text-palette-cream px-4 py-2 text-sm font-semibold hover:bg-palette-dark focus-ring disabled:opacity-50 min-h-[44px]"
                  >
                    {loading ? "Updating…" : "Update password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordOpen(false);
                      setPasswordError("");
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="rounded-lg border border-palette-mid text-palette-darkest px-4 py-2 text-sm font-semibold hover:bg-palette-100 focus-ring min-h-[44px]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
