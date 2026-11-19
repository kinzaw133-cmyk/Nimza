"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type UserRole = "customer" | "chef" | "admin" | "delivery" | "";

export interface AuthState {
  user: any;
  role: UserRole;
  loading: boolean;
  isAdmin: boolean;
  isChef: boolean;
  isDelivery: boolean;
  isCustomer: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: "",
    loading: true,
    isAdmin: false,
    isChef: false,
    isDelivery: false,
    isCustomer: false,
  });

  const checkAuth = async () => {
    try {
      const {
        data: { user: sbUser },
      } = await supabase.auth.getUser();

      let user = sbUser;
      let role: UserRole = "";

      if (user) {
        // Fetch role directly from profiles table
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        role = (data?.role as UserRole) || "customer";
      } else {
        // Check for local active session (e.g. quick test login)
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("nimza_active_test_user");
            if (raw) {
              const parsed = JSON.parse(raw);
              user = parsed;
              role = parsed.role || "customer";
            }
          } catch {}
        }
      }

      // Synchronize role cookie for server-side checks in Next.js middleware and layouts
      if (typeof document !== "undefined") {
        if (user && role) {
          document.cookie = `sb-user-role=${role}; path=/; max-age=604800; SameSite=Lax`;
        } else {
          document.cookie = `sb-user-role=; path=/; max-age=0; SameSite=Lax`;
        }
      }

      setState({
        user,
        role,
        loading: false,
        isAdmin: role === "admin",
        isChef: role === "chef",
        isDelivery: role === "delivery",
        isCustomer: role === "customer",
      });
    } catch {
      if (typeof document !== "undefined") {
        document.cookie = `sb-user-role=; path=/; max-age=0; SameSite=Lax`;
      }
      setState({
        user: null,
        role: "",
        loading: false,
        isAdmin: false,
        isChef: false,
        isDelivery: false,
        isCustomer: false,
      });
    }
  };

  useEffect(() => {
    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    const handleCustomEvent = () => checkAuth();
    window.addEventListener("nimza_auth_changed", handleCustomEvent);
    window.addEventListener("storage", handleCustomEvent);

    return () => {
      listener?.subscription?.unsubscribe();
      window.removeEventListener("nimza_auth_changed", handleCustomEvent);
      window.removeEventListener("storage", handleCustomEvent);
    };
  }, []);

  return state;
}

export function setTestSession(role: UserRole, email: string, name: string) {
  if (typeof window !== "undefined") {
    const testUser = {
      id: `test-${role}-id`,
      email,
      user_metadata: { full_name: name },
      role,
    };
    localStorage.setItem("nimza_active_test_user", JSON.stringify(testUser));
    document.cookie = `sb-user-role=${role}; path=/; max-age=604800; SameSite=Lax`;
    window.dispatchEvent(new Event("nimza_auth_changed"));
  }
}

export function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("nimza_active_test_user");
    document.cookie = `sb-user-role=; path=/; max-age=0; SameSite=Lax`;
    window.dispatchEvent(new Event("nimza_auth_changed"));
  }
}
