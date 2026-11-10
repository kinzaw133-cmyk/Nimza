"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Award,
  Crown,
} from "lucide-react";
import { supabase, configured } from "@/lib/supabase";
import { toast } from "@/lib/notify";
import NimzaLogo from "@/components/NimzaLogo";

export default function Login() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              full_name: form.name,
            },
          },
        });

        if (error) {
          toast(error.message, "error");
          return;
        }

        toast("VIP Membership Account Created. Welcome to Nimza.", "success");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

        if (error) {
          toast(error.message, "error");
          return;
        }

        toast("Welcome back to Nimza.", "success");
      }

      setTimeout(() => {
        window.location.href = "/";
      }, 900);
    } catch (err: any) {
      toast(err.message || "Authentication error", "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-olive-deep text-ivory flex items-center justify-center px-4 py-32 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] rounded-full bg-gold/15 blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Main Card */}
        <div className="glass-dark rounded-[2.5rem] p-8 md:p-10 border border-gold/40 shadow-2xl relative overflow-hidden">
          {/* Logo Badge */}
          <div className="flex flex-col items-center text-center mb-8">
            <NimzaLogo variant="circle" size="md" />
            <h1 className="font-serif text-3xl font-bold text-ivory mt-4">
              {isRegister ? "Join the VIP Club" : "Welcome Back"}
            </h1>
            <p className="text-xs text-sand/80 mt-1 uppercase tracking-widest font-medium">
              {isRegister ? "Exclusive Privileges & Table Reservations" : "Sign In to Your Gastronomy Account"}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 rounded-full bg-black/30 border border-gold/30 mb-8">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                !isRegister ? "bg-gold text-charcoal shadow-sm" : "text-sand hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                isRegister ? "bg-gold text-charcoal shadow-sm" : "text-sand hover:text-white"
              }`}
            >
              Register VIP
            </button>
          </div>

          {!configured && (
            <div className="mb-6 p-3 rounded-xl bg-gold/15 border border-gold/40 text-gold text-xs text-center">
              Supabase authentication keys configured in .env.local
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-sand/70 mb-1.5">
                  Full Name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Duke Sterling"
                  className="inp-dark !py-3 !text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-sand/70 mb-1.5">
                Email Address
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="sterling@example.com"
                className="inp-dark !py-3 !text-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-sand/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="inp-dark !py-3 !text-sm !pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sand/60 hover:text-gold"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn w-full !py-3.5 mt-6 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-gold/25"
            >
              {isRegister ? <UserPlus size={16} /> : <LogIn size={16} />}
              <span>{isLoading ? "Authenticating..." : isRegister ? "Create VIP Account" : "Sign In to Account"}</span>
            </button>
          </form>

          {/* VIP Privileges Footer */}
          <div className="mt-8 pt-6 border-t border-gold/20 space-y-2 text-[11px] text-sand/70">
            <div className="flex items-center gap-2">
              <Crown size={13} className="text-gold shrink-0" />
              <span>Priority reservations during peak weekend seatings</span>
            </div>
            <div className="flex items-center gap-2">
              <Award size={13} className="text-gold shrink-0" />
              <span>Personalized sommelier wine pairing notes on arrival</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
