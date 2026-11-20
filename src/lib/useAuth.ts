"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "./supabase";

export type UserRole = "customer" | "chef" | "admin" | "delivery" | "";

export interface AuthSessionData {
  user: any;
  role: UserRole;
}

export interface AuthState {
  user: any;
  role: UserRole;
  loading: boolean;
  isAdmin: boolean;
  isChef: boolean;
  isDelivery: boolean;
  isCustomer: boolean;
  refetchAuth: () => void;
}

export const AUTH_QUERY_KEY = ["auth_session"] as const;

/**
 * Synchronous local reader for 0ms initial auth state (eliminates layout shifts on route changes)
 */
function getInitialAuthData(): AuthSessionData | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    // 1. Check local demo / active test session
    const rawTest = localStorage.getItem("nimza_active_test_user");
    if (rawTest) {
      const parsed = JSON.parse(rawTest);
      const role = (parsed.role as UserRole) || "customer";
      // Ensure cookie is in sync
      document.cookie = `sb-user-role=${role}; path=/; max-age=604800; SameSite=Lax`;
      return { user: parsed, role };
    }

    // 2. Read role from cookie if available
    const cookieMatch = document.cookie.match(/(?:^|;\s*)sb-user-role=([^;]+)/);
    const cookieRole = cookieMatch ? (decodeURIComponent(cookieMatch[1]) as UserRole) : "";
    if (cookieRole) {
      return {
        user: { email: `${cookieRole}@nimza.example`, role: cookieRole },
        role: cookieRole,
      };
    }
  } catch {}

  return undefined;
}

/**
 * Core async session resolver powered by Supabase & Local Cache
 */
async function fetchAuthSession(): Promise<AuthSessionData> {
  let user: any = null;
  let role: UserRole = "";

  // 1. Local active test user (0ms read)
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("nimza_active_test_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        user = parsed;
        role = (parsed.role as UserRole) || "customer";
      }
    } catch {}
  }

  // 2. Real Supabase Session
  if (!user && isSupabaseConfigured) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        user = session.user;
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        role = (data?.role as UserRole) || "customer";
      }
    } catch {}
  }

  // 3. Fallback: Cookie role preservation
  if (!user && typeof document !== "undefined") {
    const cookieMatch = document.cookie.match(/(?:^|;\s*)sb-user-role=([^;]+)/);
    if (cookieMatch && cookieMatch[1]) {
      role = decodeURIComponent(cookieMatch[1]) as UserRole;
      user = { email: `${role}@nimza.example`, role };
    }
  }

  // Synchronize cookie for server-side Next.js compatibility
  if (typeof document !== "undefined") {
    if (user && role) {
      document.cookie = `sb-user-role=${role}; path=/; max-age=604800; SameSite=Lax`;
    } else {
      document.cookie = `sb-user-role=; path=/; max-age=0; SameSite=Lax`;
    }
  }

  return { user, role };
}

/**
 * Enterprise-grade Auth Hook powered by TanStack Query (@tanstack/react-query)
 * Provides instant 0ms routing cache, background revalidation, and cross-tab synchronization.
 */
export function useAuth(): AuthState {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery<AuthSessionData>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchAuthSession,
    initialData: getInitialAuthData,
    staleTime: 5 * 60 * 1000, // 5 minutes fresh cache across all page navigations
    gcTime: 60 * 60 * 1000, // 1 hour memory retention
    refetchOnWindowFocus: false, // Prevent navigation lag on window focus
    refetchOnMount: false, // Use query cache immediately on route transition
  });

  const user = data?.user || null;
  const role: UserRole = data?.role || "";

  // Subscribe to real-time Supabase auth state transitions and cross-tab storage events
  useEffect(() => {
    let unsubscribe = () => {};

    if (isSupabaseConfigured) {
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          try {
            const { data: p } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", session.user.id)
              .single();
            const newRole = (p?.role as UserRole) || "customer";
            queryClient.setQueryData(AUTH_QUERY_KEY, { user: session.user, role: newRole });
            document.cookie = `sb-user-role=${newRole}; path=/; max-age=604800; SameSite=Lax`;
          } catch {
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
          }
        } else if (event === "SIGNED_OUT") {
          queryClient.setQueryData(AUTH_QUERY_KEY, { user: null, role: "" });
          document.cookie = `sb-user-role=; path=/; max-age=0; SameSite=Lax`;
        } else {
          queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
        }
      });
      unsubscribe = () => listener?.subscription?.unsubscribe();
    }

    const handleCustomEvent = () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    };

    window.addEventListener("nimza_auth_changed", handleCustomEvent);
    window.addEventListener("storage", handleCustomEvent);

    return () => {
      unsubscribe();
      window.removeEventListener("nimza_auth_changed", handleCustomEvent);
      window.removeEventListener("storage", handleCustomEvent);
    };
  }, [queryClient]);

  return {
    user,
    role,
    loading: isLoading && !data,
    isAdmin: role === "admin",
    isChef: role === "chef",
    isDelivery: role === "delivery",
    isCustomer: role === "customer",
    refetchAuth: () => refetch(),
  };
}

/**
 * Instant One-Click Role Switcher:
 * Updates TanStack Query cache in 0ms, updates cookie, and dispatches global event.
 */
export function setTestSession(
  role: "admin" | "chef" | "customer" | "delivery",
  email: string = "",
  name: string = ""
) {
  if (typeof window === "undefined") return;

  const user = {
    id: `test-${role}-${Date.now()}`,
    email: email || `${role}@nimza.example`,
    role,
    user_metadata: {
      full_name: name || `Test ${role.toUpperCase()}`,
    },
  };

  try {
    localStorage.setItem("nimza_active_test_user", JSON.stringify(user));
    document.cookie = `sb-user-role=${role}; path=/; max-age=604800; SameSite=Lax`;
    window.dispatchEvent(new Event("nimza_auth_changed"));
  } catch {}
}

/**
 * Instant Logout:
 * Clears TanStack Query cache, removes test session & cookie, and dispatches global event.
 */
export function clearSession() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("nimza_active_test_user");
    document.cookie = `sb-user-role=; path=/; max-age=0; SameSite=Lax`;
    window.dispatchEvent(new Event("nimza_auth_changed"));
  } catch {}
}
