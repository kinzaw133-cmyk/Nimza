"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, UserRole } from "@/lib/useAuth";
import { PERMANENT_CREDENTIALS, PERMANENT_ADMIN_EMAILS, PERMANENT_CHEF_EMAILS } from "@/lib/authConfig";
import { toast } from "@/lib/notify";
import NimzaLogo from "@/components/NimzaLogo";
import { Lock, ShieldAlert } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  requiredRoleName?: string;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

/**
 * Enterprise Route Guard powered by TanStack Query & Next.js Navigation
 * Provides instant 0ms routing, eliminates flickering, and guards authorized endpoints.
 */
export default function RoleGuard({
  children,
  allowedRoles,
  requiredRoleName,
  redirectTo,
  fallback,
}: RoleGuardProps) {
  const [mounted, setMounted] = useState(false);
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  let isAuthorized = Boolean(role && allowedRoles.includes(role));
  if (role === "admin" && !PERMANENT_ADMIN_EMAILS.includes(user?.email || "")) {
    isAuthorized = false;
  }
  if (role === "chef" && !PERMANENT_CHEF_EMAILS.includes(user?.email || "")) {
    isAuthorized = false;
  }

  useEffect(() => {
    if (mounted && !loading && !isAuthorized && !fallback) {
      const targetRole = requiredRoleName || allowedRoles[0] || "admin";
      let dest = redirectTo;
      if (!dest) {
        if (targetRole === "admin") {
          dest = `/admin`;
        } else if (targetRole === "chef") {
          dest = `/chef`;
        } else {
          dest = `/login?role=${encodeURIComponent(targetRole)}&redirect=${encodeURIComponent(
            pathname || "/"
          )}`;
        }
      }

      toast(
        `Restricted Access: ${targetRole.toUpperCase()} credentials required.`,
        "error"
      );
      window.location.href = dest;
    }
  }, [mounted, loading, isAuthorized, fallback, redirectTo, requiredRoleName, allowedRoles, pathname]);

  // 1. Initial hydration loader (matches server and client perfectly before mount)
  if (!mounted || loading) {
    return (
      <div
        className="min-h-screen bg-[#FAFAF8] text-[#1F241F] flex flex-col items-center justify-center p-6 select-none"
        suppressHydrationWarning
      >
        <div className="w-16 h-16 rounded-2xl bg-gold/15 border border-gold/40 p-2 flex items-center justify-center animate-pulse">
          <NimzaLogo variant="circle" size="sm" />
        </div>
        <p className="mt-4 font-serif text-lg text-[#1F241F] font-bold tracking-wide">
          Verifying Security Credentials...
        </p>
        <span className="text-xs text-charcoal/60 mt-1">
          Synchronizing via TanStack Query
        </span>
      </div>
    );
  }

  // 2. Unauthorized with custom fallback (e.g. Admin Executive gate)
  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Default unauthorized barrier while router redirects
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-[#1F241F] flex flex-col items-center justify-center p-6 select-none">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-300 text-rose-600 flex items-center justify-center mb-4 shadow-sm">
          <ShieldAlert size={26} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#1F241F]">Access Restricted</h2>
        <p className="text-xs text-charcoal/60 mt-1 max-w-sm text-center">
          Redirecting to authorized gastronomy authentication portal...
        </p>
      </div>
    );
  }

  // 3. Authorized access granted with zero lag
  return <>{children}</>;
}
