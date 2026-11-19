"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Users,
  ChefHat,
  Sparkles,
  CheckCircle2,
  CalendarCheck,
  ArrowRight,
  ExternalLink,
  Building,
} from "lucide-react";
import {
  BranchLocation,
  getStoredBranches,
  getActiveBranch,
  setActiveBranch,
} from "@/lib/branches/branchData";
import { toast } from "@/lib/notify";
import NimzaLogo from "@/components/NimzaLogo";

export default function BranchesPage() {
  const [branches, setBranches] = useState<BranchLocation[]>([]);
  const [activeBranch, setCurrentActiveBranch] = useState<BranchLocation | null>(null);

  useEffect(() => {
    setBranches(getStoredBranches());
    setCurrentActiveBranch(getActiveBranch());

    const handleUpdate = () => {
      setBranches(getStoredBranches());
      setCurrentActiveBranch(getActiveBranch());
    };

    window.addEventListener("nimza_branches_updated", handleUpdate);
    window.addEventListener("nimza_active_branch_changed", handleUpdate);
    return () => {
      window.removeEventListener("nimza_branches_updated", handleUpdate);
      window.removeEventListener("nimza_active_branch_changed", handleUpdate);
    };
  }, []);

  const handleSelectBranch = (branch: BranchLocation) => {
    setActiveBranch(branch.id);
    setCurrentActiveBranch(branch);
    toast(`Set "${branch.name}" as your active dining location!`, "success");
  };

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-charcoal pt-36 pb-28 px-5 md:px-12 selection:bg-gold/20 overflow-x-hidden">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 mb-10 border-b border-sand">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#1F241F] shadow-sm mb-3">
              <MapPin size={13} className="text-gold" />
              <span>Multi-Location Gastronomy Network</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-[#1F241F] tracking-tight">
              Our Branches
            </h1>
            <p className="text-sm md:text-base text-charcoal/70 mt-2 max-w-2xl font-light leading-relaxed">
              Explore our three distinguished dining destinations: our Capital Flagship hearth, Waterfront coastal terrace, and Heritage stone vault.
            </p>
          </div>

          <NimzaLogo variant="badge" size="sm" />
        </div>

        {/* ACTIVE BRANCH BANNER */}
        {activeBranch && (
          <div className="mb-10 p-5 rounded-3xl bg-olive text-ivory border border-gold/40 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-gold text-[#1F241F] grid place-items-center font-bold shrink-0">
                <Building size={22} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold block">
                  Currently Selected Branch for Orders &amp; Reservations
                </span>
                <h3 className="font-serif text-xl font-bold text-white">
                  {activeBranch.name} • {activeBranch.cityDistrict}
                </h3>
              </div>
            </div>

            <Link
              href="/reservations"
              className="btn !bg-gold hover:!bg-gold-light !text-charcoal !py-2.5 !px-5 text-xs font-bold uppercase tracking-wider rounded-full shadow-xs flex items-center justify-center gap-1.5 shrink-0"
            >
              <CalendarCheck size={14} />
              <span>Reserve Table Here</span>
            </Link>
          </div>
        )}

        {/* BRANCHES GRID */}
        <div className="space-y-12">
          {branches.map((branch, idx) => {
            const isCurrentActive = activeBranch?.id === branch.id;

            return (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`rounded-[2.5rem] bg-white border-2 p-6 sm:p-8 md:p-10 shadow-sm transition-all overflow-hidden ${
                  isCurrentActive
                    ? "border-gold shadow-md ring-2 ring-gold/20"
                    : "border-sand hover:border-gold/50"
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left: Branch Photography */}
                  <div className="lg:col-span-5 relative h-72 sm:h-84 rounded-3xl overflow-hidden bg-sand/20 shadow-md group">
                    <img
                      src={branch.image_url}
                      alt={branch.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#1F241F]/80 backdrop-blur-xs text-gold border border-gold/40 text-[11px] font-bold uppercase tracking-wider">
                      {branch.status}
                    </div>

                    {isCurrentActive && (
                      <div className="absolute bottom-4 left-4 px-3.5 py-1 rounded-xl bg-gold text-[#1F241F] font-bold text-xs shadow-md flex items-center gap-1.5">
                        <CheckCircle2 size={14} /> Selected Active Branch
                      </div>
                    )}
                  </div>

                  {/* Right: Branch Specifications */}
                  <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-4">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal/50 font-bold block">
                        {branch.cityDistrict}
                      </span>
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F241F] mt-1">
                        {branch.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-charcoal/70 mt-1 leading-relaxed font-light italic">
                        &ldquo;{branch.tagline}&rdquo;
                      </p>
                    </div>

                    {/* Operational Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-charcoal/80 bg-sand/15 p-4 rounded-2xl border border-sand/60">
                      <div className="flex items-start gap-2.5">
                        <MapPin size={14} className="text-gold shrink-0 mt-0.5" />
                        <span>{branch.address}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Clock size={14} className="text-gold shrink-0" />
                        <span>{branch.operatingHours}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Phone size={14} className="text-gold shrink-0" />
                        <span>{branch.phone}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Users size={14} className="text-gold shrink-0" />
                        <span>{branch.tableCount} Dining Tables • {branch.seatingCapacity} Seats</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <ChefHat size={14} className="text-gold shrink-0" />
                        <span>Brigade: {branch.headChef}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Sparkles size={14} className="text-gold shrink-0" />
                        <span>Sommelier: {branch.sommelier}</span>
                      </div>
                    </div>

                    {/* Key Ambiance Features */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {branch.features.map((feat, fIdx) => (
                        <span
                          key={fIdx}
                          className="px-3 py-1 rounded-full bg-sand/30 border border-sand text-[11px] font-semibold text-charcoal/80"
                        >
                          ✓ {feat}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-sand">
                      <button
                        type="button"
                        onClick={() => handleSelectBranch(branch)}
                        className={`py-3 px-6 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                          isCurrentActive
                            ? "bg-olive text-gold border border-gold/40 shadow-xs cursor-default"
                            : "bg-gold hover:bg-gold-light text-[#1F241F] shadow-xs active:scale-95"
                        }`}
                      >
                        {isCurrentActive ? (
                          <>
                            <CheckCircle2 size={14} /> Active Preferred Branch
                          </>
                        ) : (
                          <>Set as Preferred Dining Location</>
                        )}
                      </button>

                      <Link
                        href="/reservations"
                        onClick={() => handleSelectBranch(branch)}
                        className="btn-o !py-3 !px-5 text-xs uppercase tracking-wider font-bold rounded-full flex items-center justify-center gap-1.5"
                      >
                        <CalendarCheck size={14} />
                        <span>Book Table Here</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
