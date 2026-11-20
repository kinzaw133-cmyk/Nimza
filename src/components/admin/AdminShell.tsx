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
import { supabase } from "@/lib/supabase";
import { toast } from "@/lib/notify";
import NimzaLogo from "@/components/NimzaLogo";

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

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handle1ClickAdmin = () => {
    setTestSession("admin", "admin@nimza.example", "General Manager & Admin");
    queryClient.setQueryData(AUTH_QUERY_KEY, {
      user: {
        id: "test-admin",
        email: "admin@nimza.example",
        role: "admin",
        user_metadata: { full_name: "General Manager & Admin" },
      },
      role: "admin",
    });
    toast("Executive Administrator access granted", "success");
    playChime();
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailInput,
        password: passwordInput,
      });
      if (error) {
        toast(error.message, "error");
        return;
      }
      let userRole: "customer" | "chef" | "admin" | "delivery" = "customer";
      if (data.user) {
        const { data: p } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();
        if (p?.role) userRole = p.role;
      }
      document.cookie = `sb-user-role=${userRole}; path=/; max-age=604800; SameSite=Lax`;
      if (userRole === "admin") {
        queryClient.setQueryData(AUTH_QUERY_KEY, { user: data.user, role: "admin" });
        toast("Administrator verified successfully", "success");
      } else {
        toast("Account does not have administrator privileges", "error");
      }
    } catch (err: any) {
      toast(err.message || "Login failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearSession();
    queryClient.setQueryData(AUTH_QUERY_KEY, { user: null, role: "" });
    toast("Administrator signed out", "info");
    router.push("/");
  };

  // 1. Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1F241F] text-ivory flex flex-col items-center justify-center p-6">
        <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/30 p-2 flex items-center justify-center animate-pulse">
          <NimzaLogo variant="badge" size="sm" inverted={true} />
        </div>
        <p className="mt-4 font-serif text-lg text-gold font-medium tracking-wide">
          Authenticating Nimza Executive Suite...
        </p>
        <span className="text-xs text-sand/60 mt-1">Verifying security credentials</span>
      </div>
    );
  }

  // 2. Access Gate if NOT admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#1F241F] text-ivory flex items-center justify-center p-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold/15 blur-[150px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-[2.5rem] bg-[#141814]/90 border border-gold/40 shadow-2xl p-8 md:p-10 backdrop-blur-md">
            {/* Logo */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gold/15 p-2 border border-gold/50 shadow-md flex items-center justify-center mb-3">
                <NimzaLogo variant="badge" size="md" inverted={true} />
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 border border-gold/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold mb-2">
                <Lock size={12} />
                <span>Restricted Management Portal</span>
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-ivory">
                Admin Panel Access
              </h1>
              <p className="text-xs text-sand/70 mt-1 max-w-xs leading-relaxed">
                Authorized management access for kitchen operations, menus, floor plans, and system controls.
              </p>
            </div>

            {/* Quick 1-Click Access for Instant Demo */}
            <div className="p-4 rounded-2xl bg-gold/10 border border-gold/40 mb-6 text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gold block mb-1">
                One-Click Access
              </span>
              <p className="text-xs text-sand/90 mb-3">
                Enter immediately with Executive Administrator privileges:
              </p>
              <button
                type="button"
                onClick={handle1ClickAdmin}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold text-[#1F241F] py-3 text-xs font-bold uppercase tracking-wider hover:bg-gold-light hover:scale-[1.02] transition-all shadow-md"
              >
                <ShieldCheck size={16} />
                <span>Enter Admin Panel (1-Click)</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5 text-[10px] uppercase tracking-widest text-sand/50">
              <span className="flex-1 h-px bg-sand/20" />
              <span>Or Supabase Login</span>
              <span className="flex-1 h-px bg-sand/20" />
            </div>

            {/* Credentials Form */}
            <form onSubmit={handlePasswordLogin} className="space-y-3.5">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-sand/70 mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@nimza.example"
                  className="w-full rounded-xl bg-black/40 border border-sand/30 px-3.5 py-2.5 text-xs text-ivory placeholder:text-sand/40 outline-none focus:border-gold transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-sand/70 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-black/40 border border-sand/30 px-3.5 py-2.5 text-xs text-ivory placeholder:text-sand/40 outline-none focus:border-gold transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-gold/40 text-gold py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-gold hover:text-charcoal transition-all"
              >
                <LogIn size={14} />
                <span>{isSubmitting ? "Authenticating..." : "Sign In With Password"}</span>
              </button>
            </form>

            {/* Return to Public Site */}
            <div className="mt-6 pt-5 border-t border-sand/20 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-sand/70 hover:text-gold transition-colors font-medium"
              >
                <span>← Return to Public Dining Website</span>
              </Link>
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
    <div className="min-h-screen bg-[#F4F3ED] text-[#1F241F] flex flex-col lg:flex-row antialiased selection:bg-gold/30">
      {/* ========================================================= */}
      {/* DESKTOP SIDEBAR (Static on lg screens) */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex w-72 bg-[#171B17] text-ivory border-r border-gold/20 flex-col justify-between shrink-0 sticky top-0 h-screen select-none z-30">
        <div>
          {/* Brand Seal Header */}
          <div className="p-6 border-b border-white/10">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gold/15 p-1.5 border border-gold/40 shadow-sm flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
                <NimzaLogo variant="badge" size="sm" inverted={true} />
              </div>
              <div>
                <span className="font-serif text-lg font-bold text-ivory tracking-tight group-hover:text-gold transition-colors block">
                  Nimza Admin
                </span>
                <span className="text-[10px] font-semibold text-gold/90 uppercase tracking-widest block">
                  Executive Suite
                </span>
              </div>
            </Link>

            {/* Realtime Status Badge */}
            <div className="mt-4 flex items-center gap-2 rounded-full bg-black/40 border border-emerald-500/30 px-3 py-1.5 text-[11px] text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-medium text-sand/90">Realtime Gateway Active</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-4 py-5 space-y-6 overflow-y-auto max-h-[calc(100vh-270px)]">
            <div>
              <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-sand/50 block mb-2">
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
                          ? "bg-gold text-[#1F241F] shadow-sm font-bold"
                          : "text-sand/80 hover:bg-white/5 hover:text-ivory"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={17}
                          className={isActive ? "text-[#1F241F]" : "text-gold group-hover:scale-110 transition-transform"}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            isActive
                              ? "bg-[#1F241F]/15 text-[#1F241F] border-[#1F241F]/30"
                              : item.badgeColor || "bg-gold/20 text-gold border-gold/40"
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
              <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-sand/50 block mb-2">
                Operations & Public
              </span>
              <div className="space-y-1">
                <Link
                  href="/chef"
                  className="group flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-semibold text-orange-300 hover:bg-orange-950/40 border border-orange-500/20 hover:border-orange-500/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Flame size={16} className="text-orange-400 group-hover:scale-110 transition-transform" />
                    <span>Chef Kitchen Station</span>
                  </div>
                  <ArrowRight size={13} className="text-orange-400/60 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/"
                  className="group flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-semibold text-sand/80 hover:bg-white/5 hover:text-ivory transition-all"
                >
                  <div className="flex items-center gap-3">
                    <ExternalLink size={16} className="text-sand/60 group-hover:text-gold transition-colors" />
                    <span>View Public Website</span>
                  </div>
                  <ChevronRight size={14} className="text-sand/40" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Admin Profile Card */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gold" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
                  Administrator
                </span>
              </div>
              <p className="text-xs font-semibold text-ivory truncate mt-0.5">
                {user?.email || "admin@nimza.example"}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out of Admin"
              className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 hover:bg-rose-900/60 text-sand hover:text-rose-200 transition-colors shrink-0"
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
              className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 240 }}
              className="fixed inset-y-0 left-0 w-80 bg-[#171B17] text-ivory border-r border-gold/30 z-50 flex flex-col justify-between p-6 lg:hidden"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/15 p-1 border border-gold/40 flex items-center justify-center shrink-0">
                      <NimzaLogo variant="badge" size="sm" inverted={true} />
                    </div>
                    <div>
                      <span className="font-serif font-bold text-base text-ivory block">
                        Nimza Admin
                      </span>
                      <span className="text-[10px] text-gold uppercase tracking-wider block">
                        Executive Suite
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-sand hover:text-white"
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
                            ? "bg-gold text-[#1F241F] font-bold shadow-md"
                            : "text-sand/80 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} className={isActive ? "text-[#1F241F]" : "text-gold"} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
                  <Link
                    href="/chef"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-orange-300 bg-orange-950/40 border border-orange-500/30"
                  >
                    <Flame size={16} />
                    <span>Chef Kitchen Station</span>
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-sand hover:bg-white/5"
                  >
                    <ExternalLink size={16} />
                    <span>View Public Website</span>
                  </Link>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-sand/70 truncate max-w-[180px]">
                  {user?.email || "admin@nimza.example"}
                </span>
                <button
                  onClick={handleSignOut}
                  className="rounded-xl px-3 py-1.5 bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-bold"
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
              <div className="flex items-center gap-1.5 font-serif font-bold text-base sm:text-lg text-olive">
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

            {/* View Public Website */}
            <Link
              href="/"
              target="_blank"
              title="Open public dining site in new tab"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-sand bg-white px-3 py-1.5 text-xs font-semibold text-charcoal hover:border-gold hover:text-gold transition-all"
            >
              <span>Public Site</span>
              <ExternalLink size={12} />
            </Link>

            {/* Admin Badge */}
            <div className="flex items-center gap-1.5 rounded-full bg-gold/15 border border-gold/50 px-2.5 sm:px-3 py-1 text-xs font-bold text-olive">
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
