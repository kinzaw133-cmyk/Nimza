"use client";

import React, { useState, useMemo } from "react";
import {
  MapPin,
  ExternalLink,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Copy,
  Navigation,
  Compass,
  Check,
  Building,
  Sparkles,
} from "lucide-react";
import { BranchLocation } from "@/lib/branches/branchData";
import { toast } from "@/lib/notify";

interface RealtimeGoogleMapProps {
  branches: BranchLocation[];
  selectedBranchId?: string;
  onSelectBranch?: (branch: BranchLocation) => void;
  heightClass?: string;
  showSelector?: boolean;
  className?: string;
}

export default function RealtimeGoogleMap({
  branches,
  selectedBranchId,
  onSelectBranch,
  heightClass = "h-[420px] md:h-[480px]",
  showSelector = true,
  className = "",
}: RealtimeGoogleMapProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string>(
    selectedBranchId || branches[0]?.id || "branch-downtown"
  );
  const [mapType, setMapType] = useState<"m" | "k" | "h" | "p">("m"); // m = Map, k = Satellite, h = Hybrid, p = Terrain
  const [zoom, setZoom] = useState<number>(15);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync with prop if provided
  const activeId = selectedBranchId || internalSelectedId;
  const currentBranch = useMemo(() => {
    return branches.find((b) => b.id === activeId) || branches[0];
  }, [branches, activeId]);

  const handleBranchClick = (branch: BranchLocation) => {
    setInternalSelectedId(branch.id);
    onSelectBranch?.(branch);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 1, 19));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 1, 10));

  const handleCopyCoords = () => {
    if (!currentBranch) return;
    const text = `${currentBranch.coordinates.lat}, ${currentBranch.coordinates.lng}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast(`Coordinates copied: ${text}`, "success");
    setTimeout(() => setCopied(false), 2500);
  };

  if (!currentBranch) return null;

  // Realtime Google Maps embed URL (works 100% without external API key or billing)
  const mapEmbedUrl = `https://maps.google.com/maps?q=${currentBranch.coordinates.lat},${currentBranch.coordinates.lng}&t=${mapType}&z=${zoom}&hl=en&ie=UTF8&iwloc=&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${currentBranch.coordinates.lat},${currentBranch.coordinates.lng}`;
  const searchGoogleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${currentBranch.name}, ${currentBranch.address}`
  )}`;

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border-2 border-sand/90 bg-[#FAFAF8] shadow-sm transition-all ${
        isFullscreen ? "fixed inset-4 z-50 !h-auto flex flex-col shadow-2xl" : heightClass
      } ${className}`}
    >
      {/* TOP COMMAND BAR */}
      <div className="bg-white/95 backdrop-blur-md px-4 py-3 border-b border-sand/80 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-gold/15 text-[#8C6D2D] border border-gold/40">
            <Compass size={17} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm sm:text-base text-[#1F241F]">
                Realtime Google Map
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Feed (No API Key Required)
              </span>
            </div>
            <p className="text-[10px] text-charcoal/60 hidden sm:block">
              Interactive satellite &amp; street view positioning for all restaurant branches
            </p>
          </div>
        </div>

        {/* MAP CONTROLS & SHORTCUTS */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Map Type Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-xl bg-sand/30 border border-sand text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setMapType("m")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mapType === "m"
                  ? "bg-[#1F241F] text-gold shadow-xs"
                  : "text-charcoal/70 hover:text-[#1F241F]"
              }`}
              title="Standard Roadmap View"
            >
              Roadmap
            </button>
            <button
              type="button"
              onClick={() => setMapType("k")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mapType === "k"
                  ? "bg-[#1F241F] text-gold shadow-xs"
                  : "text-charcoal/70 hover:text-[#1F241F]"
              }`}
              title="Satellite Imagery"
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setMapType("h")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mapType === "h"
                  ? "bg-[#1F241F] text-gold shadow-xs"
                  : "text-charcoal/70 hover:text-[#1F241F]"
              }`}
              title="Hybrid: Satellite + Road Labels"
            >
              Hybrid
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center rounded-xl bg-white border border-sand shadow-2xs">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-sand/30 text-charcoal/70 rounded-l-xl transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <span className="px-2 font-mono text-[10px] font-bold text-charcoal/70">
              {zoom}x
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-sand/30 text-charcoal/70 rounded-r-xl transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          {/* Copy Coordinates */}
          <button
            type="button"
            onClick={handleCopyCoords}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-sand bg-white text-xs font-semibold text-charcoal hover:border-gold hover:text-gold transition-all flex items-center gap-1 shadow-2xs"
            title="Copy Latitude & Longitude"
          >
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            <span className="hidden md:inline text-[10px]">
              {copied ? "Copied" : "Coordinates"}
            </span>
          </button>

          {/* Directions External Link */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn !bg-[#1F241F] hover:!bg-black !text-gold !py-1.5 !px-3 text-[11px] font-bold uppercase tracking-wider rounded-xl shadow-xs flex items-center gap-1 shrink-0"
            title="Open in Google Maps for turn-by-turn navigation"
          >
            <Navigation size={12} />
            <span className="hidden sm:inline">Directions</span>
            <ExternalLink size={10} />
          </a>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl border border-sand bg-white text-charcoal hover:bg-sand/20 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* QUICK BRANCH SELECTOR CHIPS */}
      {showSelector && branches.length > 0 && (
        <div className="bg-sand/20 px-3.5 py-2 border-b border-sand/70 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 z-10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 shrink-0">
            Select Location:
          </span>
          {branches.map((b) => {
            const isSelected = b.id === currentBranch.id;
            return (
              <button
                type="button"
                key={b.id}
                onClick={() => handleBranchClick(b)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-[#1F241F] text-gold border-[#1F241F] shadow-xs scale-102"
                    : "bg-white text-charcoal/80 border-sand hover:border-gold/60 hover:bg-white"
                }`}
              >
                <MapPin size={11} className={isSelected ? "text-gold" : "text-charcoal/40"} />
                <span>{b.name}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                    b.status === "Open"
                      ? "bg-emerald-500/20 text-emerald-800"
                      : "bg-amber-500/20 text-amber-900"
                  }`}
                >
                  {b.cityDistrict}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* EMBEDDED REALTIME GOOGLE MAP IFRAME */}
      <div className="relative flex-1 w-full h-full min-h-[280px] bg-sand/30">
        <iframe
          title={`Google Map - ${currentBranch.name}`}
          width="100%"
          height="100%"
          style={{ border: 0, width: "100%", height: "100%" }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={mapEmbedUrl}
          className="w-full h-full absolute inset-0"
        />

        {/* FLOATING LOCATION SUMMARY BADGE (BOTTOM-LEFT) */}
        <div className="absolute bottom-3 left-3 max-w-xs sm:max-w-sm rounded-2xl bg-white/95 backdrop-blur-md p-3 sm:p-4 border border-sand/80 shadow-lg pointer-events-auto z-10 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-gold block">
                {currentBranch.cityDistrict}
              </span>
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#1F241F] leading-tight">
                {currentBranch.name}
              </h4>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 border ${
                currentBranch.status === "Open"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : currentBranch.status === "Near Capacity"
                  ? "bg-amber-50 text-amber-900 border-amber-300"
                  : "bg-purple-50 text-purple-900 border-purple-300"
              }`}
            >
              {currentBranch.status}
            </span>
          </div>

          <p className="text-[11px] text-charcoal/70 truncate flex items-center gap-1.5">
            <MapPin size={11} className="text-gold shrink-0" />
            <span className="truncate">{currentBranch.address}</span>
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-sand/60 text-[10px] font-mono text-charcoal/60">
            <span>
              {currentBranch.coordinates.lat.toFixed(4)}° N, {currentBranch.coordinates.lng.toFixed(4)}° E
            </span>
            <a
              href={searchGoogleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8C6D2D] hover:underline font-bold inline-flex items-center gap-0.5"
            >
              <span>View on Maps</span>
              <ExternalLink size={9} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
