"use client";

import React from "react";
import dynamic from "next/dynamic";

const AdminShell = dynamic(() => import("@/components/admin/AdminShell"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1F241F] flex flex-col items-center justify-center p-6 select-none">
      <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/40 p-2 flex items-center justify-center animate-pulse">
        <div className="w-6 h-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
      <p className="mt-4 font-serif text-lg text-[#1F241F] font-bold tracking-wide">
        Loading Nimza Executive Suite...
      </p>
      <span className="text-xs text-charcoal/60 mt-1">Initializing management workspace</span>
    </div>
  ),
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
