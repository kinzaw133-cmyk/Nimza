"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ChefHat,
  UtensilsCrossed,
  CalendarCheck,
  Star,
  Users,
  User,
  Flame,
  ExternalLink,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Sparkles,
  RefreshCw,
  Volume2,
  Lock,
  ArrowRight,
  Clock,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
  LogIn,
  Boxes,
  QrCode,
  Truck,
  BarChart3,
  Ticket,
  MapPin,
} from "lucide-react";
import { useAuth, setTestSession, clearSession, AUTH_QUERY_KEY } from "@/lib/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "@/lib/notify";
import { PERMANENT_CREDENTIALS, PERMANENT_ADMIN_EMAILS } from "@/lib/authConfig";
import NimzaLogo, { NimzaBowlSvg } from "@/components/NimzaLogo";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Kitchen Pass & Orders",
    href: "/admin/orders",
    icon: ChefHat,
    badge: "Live",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
  {
    label: "Live Kitchen Display (KDS)",
    href: "/chef",
    icon: Flame,
    badge: "KDS Screen",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  },
  {
    label: "Menu Studio & Pricing",
    href: "/admin/menu",
    icon: UtensilsCrossed,
  },
  {
    label: "Inventory & Stock",
    href: "/admin/inventory",
    icon: Boxes,
  },
  {
    label: "Table Floor & Waitlist",
    href: "/admin/tables",
    icon: CalendarCheck,
    badge: "12 Tables",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  },
  {
    label: "Table QR Digital Menus",
    href: "/admin/qr-codes",
    icon: QrCode,
    badge: "QR System",
    badgeColor: "bg-gold/20 text-gold border-gold/40",
  },
  {
    label: "Delivery Management",
    href: "/admin/delivery",
    icon: Truck,
    badge: "Fleet Live",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  },
  {
    label: "Sales Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    badge: "Reports",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  },
  {
    label: "Coupons & Vouchers",
    href: "/admin/coupons",
    icon: Ticket,
  },
  {
    label: "Branch Locations",
    href: "/admin/branches",
    icon: MapPin,
  },
  {
    label: "Customer Reviews",
    href: "/admin/reviews",
    icon: Star,
  },
  {
    label: "Users & Access Roles",
    href: "/admin/users",
    icon: Users,
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, role, loading, isAdmin } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live password validation requirements for strict security
  const hasCapital = /[A-Z]/.test(passwordInput);
  const hasNumber = /[0-9]/.test(passwordInput);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordInput);
  const hasMinLength = passwordInput.length >= 8;

  useEffect(() => {
    setMounted(true);
    // Strict Admin Session Security: If active session email does not match permanent admin credentials, purge it
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("nimza_active_test_user");
        if (raw) {
          const parsed = JSON.parse(raw);
          const cleanUserEmail = parsed.email?.toLowerCase().trim();
          if (parsed.role === "admin" && !PERMANENT_ADMIN_EMAILS.includes(cleanUserEmail)) {
            localStorage.removeItem("nimza_active_test_user");
            document.cookie = `sb-user-role=; path=/; max-age=0; SameSite=Lax`;
            window.location.reload();
          }
        }
      } catch {}
    }
  }, []);

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
      toast("Audio alert chime test played", "info");
    } catch {}
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput.trim(),
          password: passwordInput.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        const errorMsg = data.error || "Invalid Credentials. Access Denied.";
        toast(errorMsg, "error");
        setIsSubmitting(false);
        return;
      }

      // If Chef account enters here, route immediately to Chef Kitchen Station
      if (data.role === "chef") {
        setTestSession("chef", data.user.email, data.user.name);
        queryClient.setQueryData(AUTH_QUERY_KEY, {
          user: data.user,
          role: "chef",
        });
        toast("Executive Chef verified. Directing to Kitchen Station...", "success");
        window.location.href = "/chef";
        return;
      }

      // Administrator account verified
      setTestSession("admin", data.user.email, data.user.name);
      queryClient.setQueryData(AUTH_QUERY_KEY, {
        user: data.user,
        role: "admin",
      });
      toast("Administrator verified successfully", "success");
      playChime();
      window.location.reload();
    } catch (err: any) {
      toast(err.message || "Invalid Credentials. Access Denied.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verified Admin Desk Actions
  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      await supabase.auth.signOut();
    } catch {}
    clearSession();
    queryClient.setQueryData(AUTH_QUERY_KEY, { user: null, role: "" });
    toast("Administrator signed out", "info");
    window.location.href = "/";
  };

  // 1. Initial hydration protection (guarantees identical SSR and initial client pass)
  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-[#1F241F] flex flex-col items-center justify-center p-6">
        <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/40 p-2 flex items-center justify-center animate-pulse overflow-hidden">
          <NimzaBowlSvg className="w-8 h-8" inverted={false} />
        </div>
        <p className="mt-4 font-serif text-lg text-[#1F241F] font-bold tracking-wide">
          Authenticating Nimza Executive Suite...
        </p>
        <span className="text-xs text-charcoal/60 mt-1">Verifying security credentials</span>
      </div>
    );
  }

  // 2. Strict Access Gate if NOT verified admin
  const isVerifiedAdmin =
    isAdmin &&
    role === "admin" &&
    PERMANENT_ADMIN_EMAILS.includes(user?.email?.toLowerCase().trim() || "");

  if (!isVerifiedAdmin) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-[#1F241F] flex items-center justify-center p-6 relative overflow-hidden" suppressHydrationWarning>
        {/* Glow matching hero section */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold/10 blur-[150px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-[2.5rem] bg-white border border-sand/80 shadow-2xl p-8 md:p-10 backdrop-blur-md">
            {/* Logo Header with Dual Admin Bowl & Chef Hat Icons */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-2xl bg-gold/15 p-2 border border-gold/40 shadow-xs flex items-center justify-center overflow-hidden">
                  <NimzaBowlSvg className="w-9 h-9" inverted={false} />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-orange-500/15 p-2 border border-orange-500/40 shadow-xs flex items-center justify-center overflow-hidden">
                  <ChefHat className="w-9 h-9 text-orange-600" />
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 border border-gold/40 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8C6D2D] mb-2">
                <Lock size={12} />
                <span>Restricted Management Portal</span>
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#1F241F]">
                Admin & Chef Panel Access
              </h1>
              <p className="text-xs text-charcoal/70 mt-1 max-w-xs leading-relaxed font-sans">
                Authorized management access for kitchen operations, menus, floor plans, and culinary controls.
              </p>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-charcoal/70 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full rounded-xl bg-[#FAFAF8] border border-sand px-3.5 py-2.5 text-xs text-[#1F241F] outline-none focus:border-gold transition-colors font-medium shadow-2xs"
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
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full rounded-xl bg-[#FAFAF8] border border-sand px-3.5 py-2.5 pr-10 text-xs text-[#1F241F] outline-none focus:border-gold transition-colors font-medium shadow-2xs"
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
                  <span className="text-[10px] font-mono font-bold text-[#8C6D2D]">
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
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1F241F] text-gold py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-black transition-all shadow-sm"
              >
                <LogIn size={14} />
                <span>{isSubmitting ? "Authenticating..." : "Sign In With Password"}</span>
              </button>
            </form>

            {/* Quick Role Selection (Admin & Chef) */}
            <div className="mt-5 pt-4 border-t border-sand/60">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-charcoal/60 mb-2.5 text-center">
                Authorized Account Credentials
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput("admin@nimza.com");
                    setPasswordInput("");
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    emailInput.includes("admin")
                      ? "bg-gold/20 border-gold text-[#1F241F] font-bold shadow-xs"
                      : "bg-[#FAFAF8] border-sand hover:bg-sand/30 text-charcoal/80 font-medium"
                  }`}
                >
                  <ShieldCheck size={16} className="text-gold shrink-0" />
                  <span className="text-xs">Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmailInput("chef@nimza.com");
                    setPasswordInput("");
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    emailInput.includes("chef")
                      ? "bg-orange-500/20 border-orange-500 text-orange-950 font-bold shadow-xs"
                      : "bg-[#FAFAF8] border-sand hover:bg-orange-500/10 text-charcoal/80 font-medium"
                  }`}
                >
                  <ChefHat size={16} className="text-orange-600 shrink-0" />
                  <span className="text-xs">Chef</span>
                </button>
              </div>
            </div>

            {/* Direct Switch Links */}
            <div className="mt-4 pt-3 border-t border-sand/60 text-center space-y-2">
              <Link
                href="/chef"
                className="inline-flex items-center gap-1.5 text-xs text-orange-800 hover:text-orange-950 font-medium transition-colors"
              >
                <ChefHat size={14} className="text-orange-600" />
                <span>Switch to Chef Station Login →</span>
              </Link>
              <div>
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
      </div>
    );
  }

  // 3. Full Separate Admin Panel Layout
  const activeNavItem = NAV_ITEMS.find((item) => item.href === pathname) || {
    label: "Management Desk",
    href: "/admin",
    icon: LayoutDashboard,
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1F241F] flex flex-col lg:flex-row antialiased selection:bg-gold/30" suppressHydrationWarning>
      {/* ========================================================= */}
      {/* DESKTOP SIDEBAR (Static on lg screens - Hero Theme Match) */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex w-72 bg-[#FAF9F5] text-[#1F241F] border-r border-sand/80 flex-col justify-between shrink-0 sticky top-0 h-screen select-none z-30 shadow-xs">
        <div>
          {/* Brand Seal Header */}
          <div className="p-6 border-b border-sand/60">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gold/15 p-1.5 border border-gold/40 shadow-xs flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 overflow-hidden">
                <NimzaBowlSvg className="w-7 h-7" inverted={false} />
              </div>
              <div>
                <span className="font-serif text-lg font-bold text-[#1F241F] tracking-tight group-hover:text-gold transition-colors block">
                  Nimza Admin
                </span>
                <span className="text-[10px] font-bold text-[#8C6D2D] uppercase tracking-widest block">
                  Executive Suite
                </span>
              </div>
            </Link>

            {/* Realtime Status Badge */}
            <div className="mt-4 flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-500/25 px-3 py-1.5 text-[11px] text-emerald-800 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-medium text-emerald-900">Realtime Gateway Active</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-4 py-5 space-y-6 overflow-y-auto max-h-[calc(100vh-270px)]">
            <div>
              <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-charcoal/50 block mb-2">
                Management Modules
              </span>
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      className={`group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-[#1F241F] text-gold shadow-md font-bold"
                          : "text-charcoal/70 hover:bg-sand/40 hover:text-[#1F241F]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={17}
                          className={isActive ? "text-gold" : "text-[#8C6D2D] group-hover:scale-110 transition-transform"}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            isActive
                              ? "bg-gold/20 text-gold border-gold/40"
                              : "bg-sand/60 text-charcoal/70 border-sand/70"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Quick Operations Links */}
            <div>
              <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-charcoal/50 block mb-2">
                Operations & Public
              </span>
              <div className="space-y-1">
                <Link
                  href="/chef"
                  className="group flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-semibold text-amber-900 hover:bg-amber-500/10 border border-amber-500/25 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Flame size={16} className="text-amber-600 group-hover:scale-110 transition-transform" />
                    <span>Chef Kitchen Station</span>
                  </div>
                  <ArrowRight size={13} className="text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/"
                  className="group flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-semibold text-charcoal/70 hover:bg-sand/40 hover:text-[#1F241F] border border-transparent transition-all"
                >
                  <div className="flex items-center gap-3">
                    <ExternalLink size={16} className="text-charcoal/50 group-hover:text-gold transition-colors" />
                    <span>View Public Website</span>
                  </div>
                  <ChevronRight size={14} className="text-charcoal/40" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Admin Profile Card */}
        <div className="p-4 border-t border-sand/60 bg-sand/20">
          <div className="p-3 rounded-2xl bg-white border border-sand/80 shadow-2xs flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gold" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D2D]">
                  Administrator
                </span>
              </div>
              <p className="text-xs font-semibold text-[#1F241F] truncate mt-0.5">
                Executive Administrator
              </p>
              <span className="text-[10px] text-charcoal/60 block truncate">
                admin@nimza.com
              </span>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out of Admin"
              className="grid h-8 w-8 place-items-center rounded-xl bg-sand/30 hover:bg-rose-50 border border-sand/60 hover:border-rose-200 text-charcoal/60 hover:text-rose-700 transition-colors shrink-0"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MOBILE DRAWER SIDEBAR */}
      {/* ========================================================= */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 240 }}
              className="fixed inset-y-0 left-0 w-80 bg-[#FAF9F5] text-[#1F241F] border-r border-sand/80 z-50 flex flex-col justify-between p-6 lg:hidden shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-sand/60 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/15 p-1 border border-gold/40 flex items-center justify-center shrink-0 overflow-hidden">
                      <NimzaBowlSvg className="w-6 h-6" inverted={false} />
                    </div>
                    <div>
                      <span className="font-serif font-bold text-base text-[#1F241F] block">
                        Nimza Admin
                      </span>
                      <span className="text-[10px] text-[#8C6D2D] uppercase tracking-wider block font-bold">
                        Executive Suite
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="grid h-9 w-9 place-items-center rounded-xl bg-sand/40 text-charcoal hover:bg-sand/70"
                  >
                    <X size={18} />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch={true}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold ${
                          isActive
                            ? "bg-[#1F241F] text-gold font-bold shadow-md"
                            : "text-charcoal/70 hover:bg-sand/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} className={isActive ? "text-gold" : "text-[#8C6D2D]"} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-sand/60 text-charcoal/80 border border-sand">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-6 pt-6 border-t border-sand/60 space-y-2">
                  <Link
                    href="/chef"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200"
                  >
                    <Flame size={16} className="text-amber-600" />
                    <span>Chef Kitchen Station</span>
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-charcoal/70 hover:bg-sand/40"
                  >
                    <ExternalLink size={16} />
                    <span>View Public Website</span>
                  </Link>
                </div>
              </div>

              <div className="pt-4 border-t border-sand/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-charcoal/80 block">
                    Executive Administrator
                  </span>
                  <span className="text-[10px] text-charcoal/50 block">
                    admin@nimza.com
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="rounded-xl px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold"
                >
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MAIN ADMIN WORKSPACE (Topbar + Page Content) */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Dedicated Admin Topbar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-sand px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Toggle Navigation Drawer"
              className="lg:hidden grid h-9 w-9 place-items-center rounded-xl border border-sand bg-white text-charcoal hover:bg-sand/20"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb Info */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider text-charcoal/50">
                Admin
              </span>
              <span className="hidden sm:inline-block text-sand/80 text-xs">/</span>
              <div className="flex items-center gap-1.5 font-serif font-bold text-base sm:text-lg text-[#1F241F]">
                <activeNavItem.icon size={16} className="text-gold" />
                <span>{activeNavItem.label}</span>
              </div>
            </div>
          </div>

          {/* Topbar Right Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Clock */}
            <div className="hidden md:flex items-center gap-1.5 rounded-full bg-sand/20 border border-sand px-3 py-1 text-[11px] font-mono text-charcoal/70">
              <Clock size={12} className="text-gold" />
              <span>{currentTime || "12:00:00"}</span>
            </div>

            {/* Sound Chime Tester */}
            <button
              type="button"
              onClick={playChime}
              title="Test Sound Chime Notification"
              className="grid h-8 w-8 place-items-center rounded-full border border-sand bg-white text-charcoal/70 hover:text-gold hover:border-gold transition-colors"
            >
              <Volume2 size={15} />
            </button>

            {/* Executive Station Switcher */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-full bg-sand/30 border border-sand">
              <span className="flex items-center gap-1 rounded-full bg-[#1F241F] text-gold px-2.5 py-0.5 text-[10px] font-bold shadow-xs">
                <ShieldCheck size={11} className="text-gold" /> Admin Desk
              </span>
              <Link
                href="/chef"
                title="Switch to Chef Kitchen Station"
                className="flex items-center gap-1 rounded-full text-charcoal/70 hover:text-[#1F241F] hover:bg-white px-2.5 py-0.5 text-[10px] font-semibold transition-all"
              >
                <ChefHat size={11} /> Chef Station
              </Link>
            </div>

            {/* Admin Badge */}
            <div className="flex items-center gap-1.5 rounded-full bg-gold/15 border border-gold/50 px-2.5 sm:px-3 py-1 text-xs font-bold text-[#1F241F]">
              <ShieldCheck size={14} className="text-gold" />
              <span className="hidden sm:inline">Executive Desk</span>
            </div>
          </div>
        </header>

        {/* Content View Container */}
        <main className="flex-1 bg-[#FAFAF8] overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
