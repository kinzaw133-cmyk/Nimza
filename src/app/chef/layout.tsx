"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import RoleGuard from "@/components/auth/RoleGuard";
import { ChefHat, Lock, LogIn, CheckCircle2, Circle, Eye, EyeOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth, setTestSession, AUTH_QUERY_KEY } from "@/lib/useAuth";
import { PERMANENT_CREDENTIALS, PERMANENT_CHEF_EMAILS } from "@/lib/authConfig";
import { toast } from "@/lib/notify";

/**
 * Dedicated Chef Panel Access Gate
 * Strictly accepts ONLY the assigned Executive Chef credentials.
 */
function ChefAccessGate() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live password requirement validation
  const hasCapital = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasMinLength = password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        toast(data.error || "Invalid Credentials. Access Denied.", "error");
        setIsSubmitting(false);
        return;
      }

      // If Administrator account logs in from Chef gate, route to Executive Suite
      if (data.role === "admin") {
        setTestSession("admin", data.user.email, data.user.name);
        queryClient.setQueryData(AUTH_QUERY_KEY, { user: data.user, role: "admin" });
        toast("Administrator verified. Directing to Executive Suite...", "success");
        window.location.href = "/admin";
        return;
      }

      setTestSession("chef", data.user.email, data.user.name);
      queryClient.setQueryData(AUTH_QUERY_KEY, { user: data.user, role: "chef" });
      toast("Welcome back, Executive Chef Elias Varga!", "success");
      window.location.reload();
    } catch (err: any) {
      toast(err.message || "Invalid Credentials. Access Denied.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1F241F] flex items-center justify-center p-6 relative overflow-hidden" suppressHydrationWarning>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-orange-500/10 blur-[150px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[2.5rem] bg-white border border-sand/80 shadow-2xl p-8 md:p-10 backdrop-blur-md">
          {/* Logo / Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/15 p-2 border border-orange-500/40 shadow-xs flex items-center justify-center mb-3">
              <ChefHat className="w-10 h-10 text-orange-600" />
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/20 border border-orange-500/40 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-900 mb-2">
              <Lock size={12} />
              <span>Restricted Culinary Station</span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#1F241F]">
              Chef Panel Access
            </h1>
            <p className="text-xs text-charcoal/70 mt-1 max-w-xs leading-relaxed font-sans">
              Authorized Executive Chef access for kitchen pass management, live order brigade, and preparation timers.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-charcoal/70 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-[#FAFAF8] border border-sand px-3.5 py-2.5 text-xs text-[#1F241F] outline-none focus:border-orange-500 transition-colors font-medium shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-charcoal/70 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-[#FAFAF8] border border-sand px-3.5 py-2.5 pr-10 text-xs text-[#1F241F] outline-none focus:border-orange-500 transition-colors font-medium shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Real-time Dynamic Password Requirements Checklist with Green Ticks */}
            <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-sand/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal/70">
                  Password Security Requirements
                </span>
                <span className="text-[10px] font-mono font-bold text-orange-900">
                  {`${[hasCapital, hasNumber, hasSpecial, hasMinLength].filter(Boolean).length}/4 Met`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div
                  className={`flex items-center gap-1.5 transition-colors duration-200 ${
                    hasCapital ? "text-emerald-700 font-bold" : "text-charcoal/50"
                  }`}
                >
                  {hasCapital ? (
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  ) : (
                    <Circle size={13} className="text-charcoal/30 shrink-0" />
                  )}
                  <span>Capital letter (A-Z)</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 transition-colors duration-200 ${
                    hasNumber ? "text-emerald-700 font-bold" : "text-charcoal/50"
                  }`}
                >
                  {hasNumber ? (
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  ) : (
                    <Circle size={13} className="text-charcoal/30 shrink-0" />
                  )}
                  <span>Number digit (0-9)</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 transition-colors duration-200 ${
                    hasSpecial ? "text-emerald-700 font-bold" : "text-charcoal/50"
                  }`}
                >
                  {hasSpecial ? (
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  ) : (
                    <Circle size={13} className="text-charcoal/30 shrink-0" />
                  )}
                  <span>Special character (!@#$)</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 transition-colors duration-200 ${
                    hasMinLength ? "text-emerald-700 font-bold" : "text-charcoal/50"
                  }`}
                >
                  {hasMinLength ? (
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  ) : (
                    <Circle size={13} className="text-charcoal/30 shrink-0" />
                  )}
                  <span>Minimum 8 characters</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1F241F] text-orange-400 hover:text-white py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-black transition-all shadow-sm"
            >
              <LogIn size={14} />
              <span>{isSubmitting ? "Verifying..." : "Sign In to Kitchen Station"}</span>
            </button>
          </form>

          {/* Security Notice & Links */}
          <div className="mt-6 pt-5 border-t border-sand/60 text-center space-y-2">
            <Link
              href="/admin"
              className="block text-xs text-amber-800 hover:text-amber-900 font-medium"
            >
              Switch to Administrator Suite →
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-charcoal/70 hover:text-gold transition-colors font-medium"
            >
              <span>← Return to Public Dining Website</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChefLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const { user, role, loading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isChefVerified =
    role === "chef" &&
    PERMANENT_CHEF_EMAILS.includes(user?.email?.toLowerCase().trim() || "");

  useEffect(() => {
    // Strict Chef Session Security: If active session email does not match permanent chef credentials, purge it
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("nimza_active_test_user");
        if (raw) {
          const parsed = JSON.parse(raw);
          const cleanEmail = parsed.email?.toLowerCase().trim();
          if (parsed.role === "chef" && !PERMANENT_CHEF_EMAILS.includes(cleanEmail)) {
            localStorage.removeItem("nimza_active_test_user");
            document.cookie = `sb-user-role=; path=/; max-age=0; SameSite=Lax`;
            window.location.reload();
          }
        }
      } catch {}
    }
  }, []);

  // 1. Initial hydration protection (guarantees identical SSR and initial client pass)
  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-[#1F241F] flex flex-col items-center justify-center p-6 select-none">
        <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/40 p-2 flex items-center justify-center animate-pulse overflow-hidden">
          <ChefHat className="w-8 h-8 text-orange-600" />
        </div>
        <p className="mt-4 font-serif text-lg text-[#1F241F] font-bold tracking-wide">
          Authenticating Culinary Brigade Pass...
        </p>
        <span className="text-xs text-charcoal/60 mt-1">Verifying kitchen security credentials</span>
      </div>
    );
  }

  // 2. Strict Chef Access Gate if not verified
  if (!isChefVerified) {
    return <ChefAccessGate />;
  }

  // 3. Authorized Executive Chef Station
  return <>{children}</>;
}
