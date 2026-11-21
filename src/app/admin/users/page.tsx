"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  ShieldCheck,
  ChefHat,
  User,
  Search,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  ArrowRight,
  Lock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { toast } from "@/lib/notify";
import { isPermanentSystemEmail } from "@/lib/authConfig";
import NimzaLogo from "@/components/NimzaLogo";

interface UserProfile {
  id: string;
  full_name: string | null;
  role: "customer" | "chef" | "admin";
  created_at?: string;
  email?: string;
}

export default function UsersManagementPage() {
  const { user, role, loading, isAdmin } = useAuth();
  const router = useRouter();

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [filterRole, setFilterRole] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadProfiles = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name", { ascending: true });

      if (data && data.length > 0) {
        setProfiles(data as UserProfile[]);
      } else {
        // Fallback initial profiles for presentation if empty
        setProfiles([
          {
            id: "admin-master",
            full_name: "Executive Administrator",
            role: "admin",
            email: "[Protected Master Account]",
          },
          {
            id: "chef-master",
            full_name: "Executive Chef Elias Varga",
            role: "chef",
            email: "[Protected Master Account]",
          },
          {
            id: "cust-01",
            full_name: "Lord Sterling",
            role: "customer",
            email: "sterling@example.com",
          },
          {
            id: "cust-02",
            full_name: "Countess Elena",
            role: "customer",
            email: "elena@example.com",
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleRoleChange = async (targetUserId: string, newRole: "customer" | "chef" | "admin") => {
    const targetProfile = profiles.find((p) => p.id === targetUserId);
    if (
      targetUserId === "admin-master" ||
      targetUserId === "chef-master" ||
      targetUserId === "admin-01" ||
      targetUserId === "chef-01" ||
      (targetProfile?.email && isPermanentSystemEmail(targetProfile.email)) ||
      targetProfile?.email === "[Protected Master Account]"
    ) {
      toast("Access Denied: Permanent system master accounts cannot be altered.", "error");
      return;
    }

    setUpdatingId(targetUserId);
    try {
      // 1. Execute via Server-side check API route
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId, newRole }),
      });

      if (!res.ok) {
        // Direct Supabase update fallback
        const { error } = await supabase
          .from("profiles")
          .update({ role: newRole })
          .eq("id", targetUserId);
        if (error) throw error;
      }

      setProfiles((prev) =>
        prev.map((p) => (p.id === targetUserId ? { ...p, role: newRole } : p))
      );

      // If user updated their own role, update local auth cookie
      if (user?.id === targetUserId) {
        document.cookie = `sb-user-role=${newRole}; path=/; max-age=604800; SameSite=Lax`;
        window.dispatchEvent(new Event("nimza_auth_changed"));
      }

      toast(`User role updated to ${newRole.toUpperCase()}!`, "success");
    } catch (err: any) {
      toast(err.message || "Failed to update role", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const copySql = (userEmail: string, roleToSet: string) => {
    const sql = `update profiles set role = '${roleToSet}' where id in (select id from auth.users where email = '${userEmail}');`;
    navigator.clipboard.writeText(sql);
    toast("SQL query copied to clipboard!", "success");
  };

  const filtered = profiles.filter((p) => {
    const matchesRole = filterRole === "All" || p.role === filterRole.toLowerCase();
    const matchesSearch =
      (p.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const totalUsers = profiles.length;
  const adminCount = profiles.filter((p) => p.role === "admin").length;
  const chefCount = profiles.filter((p) => p.role === "chef").length;
  const customerCount = profiles.filter((p) => p.role === "customer").length;

  return (
    <div className="text-charcoal p-5 sm:p-8 lg:p-10 selection:bg-gold/20">
      <div className="mx-auto max-w-7xl">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Link
            href="/admin"
            className="rounded-full bg-white border border-sand px-4 py-1.5 text-xs font-bold text-olive hover:border-gold hover:text-gold transition-all shadow-sm"
          >
            ← Executive Dashboard
          </Link>
          <Link
            href="/admin/menu"
            className="rounded-full bg-white border border-sand px-4 py-1.5 text-xs font-bold text-olive hover:border-gold hover:text-gold transition-all shadow-sm"
          >
            Menu Studio
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-full bg-white border border-sand px-4 py-1.5 text-xs font-bold text-olive hover:border-gold hover:text-gold transition-all shadow-sm"
          >
            Kitchen Pass
          </Link>
          <Link
            href="/chef"
            className="rounded-full bg-white border border-sand px-4 py-1.5 text-xs font-bold text-olive hover:border-gold hover:text-gold transition-all shadow-sm"
          >
            Chef Station ↗
          </Link>
          <span className="rounded-full bg-olive text-gold px-4 py-1.5 text-xs font-bold shadow-sm">
            Users & Roles
          </span>
          <Link
            href="/admin/reviews"
            className="rounded-full bg-white border border-sand px-4 py-1.5 text-xs font-bold text-olive hover:border-gold hover:text-gold transition-all shadow-sm"
          >
            Customer Reviews
          </Link>
        </div>

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-10 border-b border-sand">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-sand/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-olive mb-2">
              <ShieldCheck size={13} className="text-gold" /> Access Control Matrix
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-olive">
              Users & Role Management
            </h1>
            <p className="text-sm text-charcoal/70 mt-1">
              Assign roles strictly from the Users section: <strong>customer (default)</strong>, <strong>chef</strong>, and <strong>admin</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadProfiles}
              disabled={isRefreshing}
              className="btn-d !py-2.5 !px-4 text-xs flex items-center gap-2 shadow"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              <span>Refresh Users</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-3xl bg-white border border-sand shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60">
              Total Accounts
            </span>
            <p className="font-serif text-3xl font-bold text-olive mt-1">{totalUsers}</p>
          </div>

          <div className="p-5 rounded-3xl bg-gold/15 border border-gold/40 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
              Administrators
            </span>
            <p className="font-serif text-3xl font-bold text-olive mt-1">{adminCount}</p>
          </div>

          <div className="p-5 rounded-3xl bg-orange-50 border border-orange-200 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-900">
              Chefs (Kitchen Pass)
            </span>
            <p className="font-serif text-3xl font-bold text-orange-950 mt-1">{chefCount}</p>
          </div>

          <div className="p-5 rounded-3xl bg-sand/30 border border-sand shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/70">
              Dining Customers
            </span>
            <p className="font-serif text-3xl font-bold text-charcoal mt-1">{customerCount}</p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-6 md:p-8 rounded-[2rem] bg-white border border-sand shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user by name, email, or user ID..."
                className="inp !pl-10 !py-2.5 !text-xs w-full"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {["All", "Admin", "Chef", "Customer"].map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRole(r)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    filterRole.toLowerCase() === r.toLowerCase()
                      ? "bg-olive text-gold shadow-sm"
                      : "bg-sand/30 text-charcoal hover:bg-sand/60"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-[2rem] bg-white border border-sand shadow-sm overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand/20 border-b border-sand">
                <tr className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60">
                  <th className="py-4 px-6">Patron / User</th>
                  <th className="py-4 px-6">User ID (UUID)</th>
                  <th className="py-4 px-6">Current Role</th>
                  <th className="py-4 px-6">Role Assignment</th>
                  <th className="py-4 px-6 text-right">Supabase SQL Helper</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/50">
                {filtered.map((p) => {
                  const isCurAdmin = p.role === "admin";
                  const isCurChef = p.role === "chef";
                  const isCurCustomer = p.role === "customer";
                  const isPermanent =
                    p.id === "admin-master" ||
                    p.id === "chef-master" ||
                    p.id === "admin-01" ||
                    p.id === "chef-01" ||
                    isPermanentSystemEmail(p.email) ||
                    p.email === "[Protected Master Account]";

                  const displayEmail = isPermanent
                    ? "[Protected Master Account]"
                    : p.email || "patron@nimza.example";

                  return (
                    <tr key={p.id} className="hover:bg-sand/10 transition-colors">
                      {/* Name / Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold ${
                              isCurAdmin
                                ? "bg-gold text-charcoal"
                                : isCurChef
                                ? "bg-orange-500 text-white"
                                : "bg-sand text-charcoal"
                            }`}
                          >
                            {isCurAdmin ? (
                              <ShieldCheck size={16} />
                            ) : isCurChef ? (
                              <ChefHat size={16} />
                            ) : (
                              <User size={16} />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-charcoal">
                              {p.full_name || "Registered Diner"}
                            </p>
                            <p className="text-[11px] text-charcoal/60">
                              {displayEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* User ID */}
                      <td className="py-4 px-6 font-mono text-[11px] text-charcoal/60">
                        {p.id.slice(0, 18)}...
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider border ${
                            isCurAdmin
                              ? "bg-gold/20 text-olive border-gold/50"
                              : isCurChef
                              ? "bg-orange-100 text-orange-950 border-orange-300"
                              : "bg-sand/40 text-charcoal/80 border-sand"
                          }`}
                        >
                          {isCurAdmin && <ShieldCheck size={12} className="text-gold" />}
                          {isCurChef && <ChefHat size={12} className="text-orange-600" />}
                          {isCurCustomer && <User size={12} />}
                          <span>{p.role}</span>
                        </span>
                      </td>

                      {/* Role Changer Select or Locked Master */}
                      <td className="py-4 px-6">
                        {isPermanent ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold/15 border border-gold/40 text-[11px] font-bold text-[#8C6D2D]">
                            <Lock size={12} className="text-gold" />
                            <span>Master Account (Locked)</span>
                          </div>
                        ) : (
                          <select
                            disabled={updatingId === p.id}
                            value={p.role}
                            onChange={(e) =>
                              handleRoleChange(
                                p.id,
                                e.target.value as "customer" | "chef" | "admin"
                              )
                            }
                            className="rounded-xl border border-sand bg-sand/20 px-3 py-1.5 text-xs font-semibold text-charcoal outline-none focus:border-gold hover:border-gold/50 cursor-pointer disabled:opacity-50"
                          >
                            <option value="customer">customer (Diner)</option>
                            <option value="chef">chef (Kitchen Pass)</option>
                            <option value="admin">admin (Full Control)</option>
                          </select>
                        )}
                      </td>

                      {/* Supabase SQL Copy Helper */}
                      <td className="py-4 px-6 text-right">
                        {isPermanent ? (
                          <span className="text-[11px] text-charcoal/40 italic font-mono">
                            Protected Master
                          </span>
                        ) : (
                          <button
                            onClick={() => copySql(p.email || p.id, p.role)}
                            title="Copy Supabase SQL statement"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-charcoal/60 hover:text-gold transition-colors"
                          >
                            <Copy size={13} />
                            <span>Copy SQL</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dashboard SQL Reference Box */}
        <div className="rounded-[2.5rem] bg-olive-deep text-ivory p-8 border border-gold/30">
          <div className="max-w-3xl space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold">
              Supabase Dashboard Integration
            </span>
            <h3 className="font-serif text-2xl font-bold">
              Changing Roles Directly in Supabase
            </h3>
            <p className="text-xs text-sand/80 leading-relaxed font-light">
              Roles are stored in the <code>role</code> column of the <code>profiles</code> table with default <code>&apos;customer&apos;</code>. You can change any user&apos;s role right here in the Users section, or run the following queries in your Supabase SQL Editor:
            </p>
            <div className="rounded-2xl bg-black/40 border border-gold/20 p-4 font-mono text-xs text-sand/90 space-y-1">
              <p>-- Set an account to administrator:</p>
              <p className="text-gold">
                UPDATE profiles SET role = &apos;admin&apos; WHERE id = (SELECT id FROM auth.users WHERE email = &apos;your-email@example.com&apos;);
              </p>
              <p className="pt-2">-- Set an account to chef:</p>
              <p className="text-orange-300">
                UPDATE profiles SET role = &apos;chef&apos; WHERE id = (SELECT id FROM auth.users WHERE email = &apos;chef-email@example.com&apos;);
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
