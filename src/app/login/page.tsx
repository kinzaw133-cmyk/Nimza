"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  ChefHat,
  User,
  Crown,
  Award,
  ArrowRight,
  CheckCircle2,
  Bike,
  Lock,
  AlertCircle,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth, clearSession, AUTH_QUERY_KEY } from "@/lib/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/notify";
import {
  PERMANENT_ADMIN_EMAILS,
  PERMANENT_CHEF_EMAILS,
} from "@/lib/authConfig";
import NimzaLogo from "@/components/NimzaLogo";

export default function Login() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, role } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [targetRedirect, setTargetRedirect] = useState<string>("");
  const [requestedRole, setRequestedRole] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const r = params.get("redirect") || "";
    const rl = params.get("role") || "";
    if (r) setTargetRedirect(r);
    if (rl) setRequestedRole(rl);
  }, []);

  /**
   * Professional Unified Login Handler
   * Routes ALL authentication through the server API (/api/auth/login)
   * — No localStorage fallback, no fake sessions —
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setAuthError("");

    try {
      const cleanEmail = form.email.trim().toLowerCase();

      // 1. Admin email → redirect to Admin Panel gate
      if (PERMANENT_ADMIN_EMAILS.includes(cleanEmail)) {
        toast("Please sign in through the Admin Panel.", "info");
        window.location.href = "/admin";
        setIsLoading(false);
        return;
      }

      // 2. Chef email → redirect to Chef Kitchen gate
      if (PERMANENT_CHEF_EMAILS.includes(cleanEmail)) {
        toast("Please sign in through the Chef Station.", "info");
        window.location.href = "/chef";
        setIsLoading(false);
        return;
      }

      // 3. Customer / Delivery — Server-side authentication
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password.trim(),
          name: form.name.trim(),
          action: isRegister ? "signup" : "login",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        const errorMsg =
          data.error || "Authentication failed. Please check your credentials.";
        setAuthError(errorMsg);
        toast(errorMsg, "error");
        setIsLoading(false);
        return;
      }

      // 4. Server auth succeeded — establish client session if signing in
      if (isSupabaseConfigured && !isRegister) {
        try {
          await supabase.auth.signInWithPassword({
            email: form.email.trim(),
            password: form.password.trim(),
          });
        } catch {
          // Server session is primary — Supabase client session is optional
        }
      }

      // 5. Update client-side auth cache
      queryClient.setQueryData(AUTH_QUERY_KEY, {
        user: data.user,
        role: data.role,
      });

      // 6. Success toast
      if (isRegister) {
        toast(
          `VIP Membership Created! Welcome to Nimza, ${
            data.user?.name || form.email
          }.`,
          "success"
        );
      } else {
        toast(`Welcome back to Nimza!`, "success");
      }

      // 7. Navigate to destination
      const dest =
        targetRedirect &&
        !targetRedirect.startsWith("/admin") &&
        !targetRedirect.startsWith("/chef")
          ? targetRedirect
          : data.redirect || "/";

      window.location.href = dest;
    } catch (err: any) {
      const msg = err.message || "Network error. Please try again.";
      setAuthError(msg);
      toast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      await supabase.auth.signOut();
    } catch {}
    clearSession();
    queryClient.setQueryData(AUTH_QUERY_KEY, { user: null, role: "" });
    toast("Signed out successfully", "info");
    window.location.href = "/";
  };

  // Live password validation
  const hasCapital = /[A-Z]/.test(form.password);
  const hasNumber = /[0-9]/.test(form.password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
    form.password
  );
  const hasMinLength = form.password.length >= 6;

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-[#1F241F] flex items-center justify-center px-4 pt-32 pb-24 relative overflow-hidden">
      {/* Warm Ambient Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[650px] rounded-full bg-gold/10 blur-[160px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Active Session Notification */}
        {user && (
          <div className="mb-6 p-4 rounded-3xl bg-white border border-gold/50 shadow-md text-xs flex items-center justify-between text-[#1F241F]">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-wider text-gold font-bold flex items-center gap-1">
                <Sparkles size={11} /> Currently Active Session
              </span>
              <p className="font-serif font-bold text-sm text-[#1F241F] truncate max-w-[200px]">
                {user.email ||
                  user.user_metadata?.full_name ||
                  "Active Session"}
              </p>
              <span className="inline-block rounded-full bg-gold/20 text-[#1F241F] px-2.5 py-0.5 text-[10px] font-extrabold uppercase border border-gold/30">
                Role: {role || "customer"}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-xs font-bold rounded-full border border-rose-300 bg-rose-50 px-3.5 py-1.5 text-rose-700 hover:bg-rose-600 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Main Authentication Card */}
        <div className="rounded-[2.5rem] bg-white border border-sand/80 shadow-2xl p-8 md:p-10 relative overflow-hidden backdrop-blur-md">
          {/* Logo Seal */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-3 flex items-center justify-center">
              <NimzaLogo variant="circle" size="md" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#1F241F] tracking-tight">
              {isRegister ? "Join the VIP Club" : "Welcome Back"}
            </h1>
            <p className="text-xs text-charcoal/60 mt-1 uppercase tracking-widest font-semibold">
              {isRegister
                ? "Exclusive Privileges & Priority Bookings"
                : "Sign In to Your Gastronomy Account"}
            </p>
          </div>

          {/* Requested Role Guidance Banner */}
          {requestedRole && (
            <div className="mb-6 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 shadow-2xs">
              <ShieldCheck
                size={18}
                className="text-amber-600 shrink-0 mt-0.5"
              />
              <div className="flex-1 text-[11px] leading-relaxed">
                <span className="font-bold uppercase tracking-wider block text-amber-800">
                  {requestedRole.toUpperCase()} Privileges Required
                </span>
                Please sign in with your authorized credentials to access this
                protected portal.
              </div>
            </div>
          )}

          {/* Error Alert */}
          {authError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle
                size={16}
                className="text-rose-500 shrink-0 mt-0.5"
              />
              <span className="text-[11px] leading-relaxed">{authError}</span>
            </div>
          )}

          {/* Tab Switcher */}
          <div className="flex p-1.5 rounded-full bg-sand/30 border border-sand/70 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setAuthError("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                !isRegister
                  ? "bg-[#1F241F] text-gold shadow-sm"
                  : "text-charcoal/70 hover:text-[#1F241F]"
              }`}
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setAuthError("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                isRegister
                  ? "bg-[#1F241F] text-gold shadow-sm"
                  : "text-charcoal/70 hover:text-[#1F241F]"
              }`}
            >
              <Crown size={13} />
              <span>Register VIP</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                  Full Name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="e.g. Duke Sterling"
                  className="w-full rounded-2xl bg-[#FAFAF8] border border-sand/90 px-4 py-3 text-sm text-[#1F241F] placeholder:text-charcoal/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                Email Address
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                placeholder="Enter your email address"
                className="w-full rounded-2xl bg-[#FAFAF8] border border-sand/90 px-4 py-3 text-sm text-[#1F241F] placeholder:text-charcoal/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  minLength={6}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Enter your password"
                  className="w-full rounded-2xl bg-[#FAFAF8] border border-sand/90 px-4 py-3 text-sm text-[#1F241F] placeholder:text-charcoal/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal/50 hover:text-gold transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator (shown during registration) */}
            {isRegister && form.password.length > 0 && (
              <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-sand/80 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal/70">
                  Password Strength
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {[
                    { met: hasMinLength, label: "Min 6 characters" },
                    { met: hasCapital, label: "Capital letter (A-Z)" },
                    { met: hasNumber, label: "Number (0-9)" },
                    { met: hasSpecial, label: "Special char (!@#$)" },
                  ].map((req) => (
                    <div
                      key={req.label}
                      className={`flex items-center gap-1.5 ${
                        req.met
                          ? "text-emerald-700 font-bold"
                          : "text-charcoal/40"
                      }`}
                    >
                      <CheckCircle2
                        size={12}
                        className={
                          req.met ? "text-emerald-500" : "text-charcoal/30"
                        }
                      />
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 rounded-full bg-gold hover:bg-gold-light text-[#1F241F] font-bold text-sm tracking-wide shadow-md shadow-gold/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isRegister ? <UserPlus size={16} /> : <LogIn size={16} />}
              <span>
                {isLoading
                  ? "Authenticating..."
                  : isRegister
                  ? "Create VIP Account"
                  : "Sign In to Account"}
              </span>
            </button>
          </form>

          {/* Server-side auth badge */}
          <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-charcoal/50">
            <Lock size={10} />
            <span>
              Secured with HMAC-SHA256 server-side session encryption
            </span>
          </div>

          {/* Return to Public Site */}
          <div className="mt-6 pt-5 border-t border-sand/60 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-charcoal/60 hover:text-gold transition-colors font-medium"
            >
              <ArrowRight size={13} className="rotate-180" />
              <span>Return to Public Dining Website</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
