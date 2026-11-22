"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Navigation,
  Compass,
} from "lucide-react";
import {
  BranchLocation,
  getStoredBranches,
  getActiveBranch,
  setActiveBranch,
} from "@/lib/branches/branchData";
import { toast } from "@/lib/notify";
import { NimzaBowlSvg } from "@/components/NimzaLogo";
import RealtimeGoogleMap from "@/components/RealtimeGoogleMap";

export default function BranchesPage() {
  const [branches, setBranches] = useState<BranchLocation[]>([]);
  const [activeBranch, setCurrentActiveBranch] = useState<BranchLocation | null>(null);
  const [mapSelectedId, setMapSelectedId] = useState<string>("");
  const mapSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loaded = getStoredBranches();
    const currentActive = getActiveBranch();
    setBranches(loaded);
    setCurrentActiveBranch(currentActive);
    setMapSelectedId(currentActive?.id || loaded[0]?.id || "");

    const handleUpdate = () => {
      const b = getStoredBranches();
      const a = getActiveBranch();
      setBranches(b);
      setCurrentActiveBranch(a);
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
    setMapSelectedId(branch.id);
    toast(`Set "${branch.name}" as your active dining location!`, "success");
  };

  const handleFocusOnMap = (branchId: string) => {
    setMapSelectedId(branchId);
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-charcoal pt-36 pb-28 px-5 md:px-12 selection:bg-gold/20 overflow-x-hidden">
      <div className="mx-auto max-w-6xl space-y-10">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-sand">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#1F241F] shadow-sm mb-3">
              <MapPin size={13} className="text-gold" />
              <span>Multi-Location Gastronomy Network</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-[#1F241F] tracking-tight">
              Our Branches
            </h1>
            <p className="text-sm md:text-base text-charcoal/70 mt-2 max-w-2xl font-light leading-relaxed">
              Explore our distinguished dining destinations across premier European terroirs: from our Capital Flagship wood-fire hearth and Waterfront coastal terrace, to our Amalfi Riviera pergola and Alpine snow chalet.
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/40 flex items-center justify-center p-2 shadow-xs shrink-0 overflow-hidden">
            <NimzaBowlSvg className="w-8 h-8" inverted={false} />
          </div>
        </div>

        {/* ACTIVE BRANCH BANNER */}
        {activeBranch && (
          <div className="p-5 sm:p-6 rounded-3xl bg-[#1F241F] text-ivory border border-gold/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-gold text-[#1F241F] grid place-items-center font-bold shrink-0 shadow-sm">
                <Building size={24} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold font-bold block">
                  Currently Selected Branch for Orders &amp; Reservations
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mt-0.5">
                  {activeBranch.name} • {activeBranch.cityDistrict}
                </h3>
                <p className="text-xs text-sand/70 truncate max-w-md mt-0.5">
                  {activeBranch.address}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => handleFocusOnMap(activeBranch.id)}
                className="px-4 py-2.5 rounded-full border border-gold/50 bg-white/5 hover:bg-white/10 text-gold text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
              >
                <Compass size={13} />
                <span>View on Map</span>
              </button>

              <Link
                href="/reservations"
                className="btn !bg-gold hover:!bg-gold-light !text-charcoal !py-2.5 !px-5 text-xs font-bold uppercase tracking-wider rounded-full shadow-xs flex items-center justify-center gap-1.5"
              >
                <CalendarCheck size={14} />
                <span>Reserve Table Here</span>
              </Link>
            </div>
          </div>
        )}

        {/* REALTIME GOOGLE MAP VIEWER */}
        <div ref={mapSectionRef} className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1F241F] flex items-center gap-2">
                <Compass size={20} className="text-gold" />
                <span>Realtime Google Maps Intelligence</span>
              </h2>
              <p className="text-xs text-charcoal/60 mt-0.5">
                Explore real satellite terrain, neighborhood streets, and get turn-by-turn navigation without any API key.
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300 w-fit">
              ● Live Google Maps Feed
            </span>
          </div>

          <RealtimeGoogleMap
            branches={branches}
            selectedBranchId={mapSelectedId}
            onSelectBranch={(b) => setMapSelectedId(b.id)}
          />
        </div>

        {/* BRANCHES LIST / CARDS */}
        <div className="space-y-10 pt-4">
          <div className="flex items-center justify-between border-b border-sand pb-4">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1F241F]">
              All Dining Destinations ({branches.length})
            </h3>
            <span className="text-xs font-mono text-charcoal/60">
              White-Glove Hospitality Across 6 Locations
            </span>
          </div>

          {branches.map((branch, idx) => {
            const isCurrentActive = activeBranch?.id === branch.id;
            const isMapSelected = mapSelectedId === branch.id;
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${branch.coordinates.lat},${branch.coordinates.lng}`;

            return (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
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

                    <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold bg-black/70 text-white backdrop-blur-xs border border-white/20">
                      {branch.coordinates.lat.toFixed(2)}°N, {branch.coordinates.lng.toFixed(2)}°E
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-charcoal/80 bg-sand/15 p-4 rounded-2xl border border-sand/60 font-mono">
                      <div className="flex items-start gap-2.5 font-sans">
                        <MapPin size={14} className="text-gold shrink-0 mt-0.5" />
                        <span>{branch.address}</span>
                      </div>
                      <div className="flex items-center gap-2.5 font-sans">
                        <Clock size={14} className="text-gold shrink-0" />
                        <span>{branch.operatingHours}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Phone size={14} className="text-gold shrink-0" />
                        <span>{branch.phone}</span>
                      </div>
                      <div className="flex items-center gap-2.5 font-sans">
                        <Users size={14} className="text-gold shrink-0" />
                        <span>{branch.tableCount} Dining Tables • {branch.seatingCapacity} Seats</span>
                      </div>
                      <div className="flex items-center gap-2.5 font-sans">
                        <ChefHat size={14} className="text-gold shrink-0" />
                        <span>Brigade: {branch.headChef}</span>
                      </div>
                      <div className="flex items-center gap-2.5 font-sans">
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

                      <button
                        type="button"
                        onClick={() => handleFocusOnMap(branch.id)}
                        className={`py-3 px-4 rounded-full text-xs font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5 ${
                          isMapSelected
                            ? "bg-[#1F241F] text-gold border-[#1F241F]"
                            : "border-sand bg-white text-charcoal hover:border-gold hover:text-gold"
                        }`}
                      >
                        <Compass size={14} />
                        <span>View on Realtime Map</span>
                      </button>

                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3 px-4 rounded-full text-xs font-bold uppercase tracking-wider border border-sand bg-white text-charcoal hover:border-gold hover:text-gold transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Directions</span>
                        <ExternalLink size={12} />
                      </a>

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
