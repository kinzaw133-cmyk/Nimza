"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navigation,
  MapPin,
  Home,
  UtensilsCrossed,
  Bike,
  Clock,
  Gauge,
  Compass,
  Radio,
  Maximize2,
  Minimize2,
  Phone,
  CheckCircle2,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { DeliveryOrder, NIMZA_KITCHEN_COORDS } from "@/lib/delivery/deliveryTypes";

interface LiveDeliveryMapProps {
  order: DeliveryOrder;
  isDriverView?: boolean;
  onUpdateProgress?: (newPercent: number) => void;
  className?: string;
}

export default function LiveDeliveryMap({
  order,
  isDriverView = false,
  onUpdateProgress,
  className = "",
}: LiveDeliveryMapProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [simulatedProgress, setSimulatedProgress] = useState<number>(order.progress_percent || 0);
  const [pulseCount, setPulseCount] = useState<number>(0);

  // Sync with order updates
  useEffect(() => {
    setSimulatedProgress(order.progress_percent || 0);
  }, [order.progress_percent]);

  // Radar beacon pulse ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseCount((p) => (p + 1) % 100);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Map Bounds and Coordinate Projection
  // Kitchen (Start): (180, 420)
  // Destination (End): (820, 180)
  // Intermediate waypoints for realistic city road navigation
  const routeWaypoints = useMemo(() => {
    // Determine target relative to destination
    const startX = 200;
    const startY = 420;
    const endX = 780;
    const endY = 160;

    // Grid road turns (corner avenues)
    return [
      { x: startX, y: startY, label: "Nimza Kitchen Pass" },
      { x: startX + 120, y: startY, label: "Via Monte Napoleone" },
      { x: startX + 120, y: startY - 140, label: "Piazza Grand Avenue" },
      { x: startX + 380, y: startY - 140, label: "Bridge Over Grand Canal" },
      { x: startX + 380, y: endY, label: "Prestige Boulevard" },
      { x: endX, y: endY, label: "Customer Doorstep" },
    ];
  }, []);

  // Calculate current courier position along the multi-point path based on progress % (0 to 100)
  const courierPos = useMemo(() => {
    const pts = routeWaypoints;
    const totalSegments = pts.length - 1;
    const p = Math.max(0, Math.min(100, simulatedProgress)) / 100;
    const globalDist = p * totalSegments;
    const segIndex = Math.min(Math.floor(globalDist), totalSegments - 1);
    const segT = globalDist - segIndex;

    const p1 = pts[segIndex];
    const p2 = pts[segIndex + 1];

    const curX = p1.x + (p2.x - p1.x) * segT;
    const curY = p1.y + (p2.y - p1.y) * segT;

    // Calculate angle of heading
    const angleRad = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const angleDeg = (angleRad * 180) / Math.PI;

    return { x: curX, y: curY, heading: angleDeg };
  }, [simulatedProgress, routeWaypoints]);

  // Traveled SVG polyline points string
  const traveledPolyline = useMemo(() => {
    const pts = routeWaypoints;
    const totalSegments = pts.length - 1;
    const p = Math.max(0, Math.min(100, simulatedProgress)) / 100;
    const globalDist = p * totalSegments;
    const segIndex = Math.min(Math.floor(globalDist), totalSegments - 1);

    const fullPts = pts.slice(0, segIndex + 1).map((pt) => `${pt.x},${pt.y}`);
    fullPts.push(`${courierPos.x.toFixed(1)},${courierPos.y.toFixed(1)}`);
    return fullPts.join(" ");
  }, [simulatedProgress, routeWaypoints, courierPos]);

  // Full route SVG points string
  const fullPolyline = useMemo(() => {
    return routeWaypoints.map((pt) => `${pt.x},${pt.y}`).join(" ");
  }, [routeWaypoints]);

  // Calculated dynamic distance and ETA based on current progress
  const remainingDistKm = Math.max(
    0,
    Number((order.distance_km * (1 - simulatedProgress / 100)).toFixed(1))
  );
  const remainingEtaMins = Math.max(
    0,
    Math.ceil(order.eta_minutes * (1 - simulatedProgress / 100))
  );

  const isDelivered = order.status === "Delivered" || simulatedProgress >= 100;

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border-2 border-gold/40 bg-[#131713] text-sand shadow-2xl ${className}`}
    >
      {/* Top Telemetry HUD Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border shadow-md flex items-center gap-1.5 ${
              isDelivered
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : order.status === "On the Way"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-blue-500/20 text-blue-300 border-blue-500/40"
            }`}
          >
            <Radio size={12} className={!isDelivered ? "animate-pulse text-gold" : ""} />
            <span>{isDelivered ? "Delivered" : order.status}</span>
          </span>

          {/* Live GPS Ping Badge */}
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono bg-black/60 border border-sand/20 text-sand/80 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Live Vector Radar</span>
          </span>
        </div>

        {/* ETA & Distance Telemetry Card */}
        <div className="flex items-center gap-3 bg-black/75 border border-gold/30 rounded-2xl px-4 py-1.5 backdrop-blur-md shadow-lg pointer-events-auto">
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-sand/60 block">
              Estimated Arrival
            </span>
            <span className="font-serif text-sm sm:text-base font-bold text-gold">
              {isDelivered ? "Arrived" : `${remainingEtaMins} mins`}
            </span>
          </div>

          <div className="h-6 w-px bg-sand/20" />

          <div className="text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-sand/60 block">
              Remaining
            </span>
            <span className="font-mono text-sm sm:text-base font-bold text-white">
              {isDelivered ? "0.0 km" : `${remainingDistKm} km`}
            </span>
          </div>
        </div>
      </div>

      {/* SVG City Vector Radar Map */}
      <div className="relative w-full h-[380px] sm:h-[450px] overflow-hidden select-none">
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full object-cover transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="radar-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#1F281F"
                strokeWidth="1"
                opacity="0.6"
              />
            </pattern>

            {/* Glowing Traveled Route Filter */}
            <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Soil & City Blocks */}
          <rect width="1000" height="600" fill="#131713" />
          <rect width="1000" height="600" fill="url(#radar-grid)" />

          {/* City Parks / Greenery Zones */}
          <rect x="60" y="80" width="160" height="180" rx="16" fill="#182318" opacity="0.8" />
          <text x="140" y="175" fill="#2E4A2E" fontSize="12" fontWeight="bold" textAnchor="middle">
            Heritage Royal Park
          </text>

          <rect x="520" y="320" width="220" height="160" rx="20" fill="#182318" opacity="0.8" />
          <text x="630" y="405" fill="#2E4A2E" fontSize="12" fontWeight="bold" textAnchor="middle">
            Botanical Gardens
          </text>

          {/* Grand Canal / River Ribbon */}
          <path
            d="M 0 340 C 300 360, 450 240, 700 280 S 900 200, 1000 220"
            fill="none"
            stroke="#172836"
            strokeWidth="38"
            strokeLinecap="round"
          />
          <path
            d="M 0 340 C 300 360, 450 240, 700 280 S 900 200, 1000 220"
            fill="none"
            stroke="#1E384D"
            strokeWidth="28"
            strokeLinecap="round"
          />
          <text x="490" y="275" fill="#2E526B" fontSize="11" fontWeight="bold" transform="rotate(-6 490 275)">
            Grand City Canal
          </text>

          {/* Primary City Avenues / Roads Grid */}
          <g stroke="#263126" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
            {/* Horizontal Avenues */}
            <line x1="40" y1="420" x2="960" y2="420" />
            <line x1="40" y1="280" x2="960" y2="280" />
            <line x1="40" y1="160" x2="960" y2="160" />

            {/* Vertical Boulevards */}
            <line x1="200" y1="40" x2="200" y2="560" />
            <line x1="320" y1="40" x2="320" y2="560" />
            <line x1="580" y1="40" x2="580" y2="560" />
            <line x1="780" y1="40" x2="780" y2="560" />
          </g>

          {/* Secondary Roads Inner Stripe */}
          <g stroke="#1F241F" strokeWidth="12" strokeLinecap="round">
            <line x1="40" y1="420" x2="960" y2="420" />
            <line x1="40" y1="280" x2="960" y2="280" />
            <line x1="40" y1="160" x2="960" y2="160" />
            <line x1="200" y1="40" x2="200" y2="560" />
            <line x1="320" y1="40" x2="320" y2="560" />
            <line x1="580" y1="40" x2="580" y2="560" />
            <line x1="780" y1="40" x2="780" y2="560" />
          </g>

          {/* Road Name Typography */}
          <text x="320" y="440" fill="#4B5E4B" fontSize="10" fontFamily="sans-serif">
            Via Monte Napoleone
          </text>
          <text x="580" y="145" fill="#4B5E4B" fontSize="10" fontFamily="sans-serif">
            Prestige Boulevard
          </text>
          <text x="215" y="360" fill="#4B5E4B" fontSize="10" fontFamily="sans-serif" transform="rotate(90 215 360)">
            Grand Avenue
          </text>

          {/* Complete Route Path (Dashed Amber Preview) */}
          <polyline
            points={fullPolyline}
            fill="none"
            stroke="#C5A059"
            strokeWidth="6"
            strokeDasharray="8 8"
            strokeOpacity="0.45"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Traveled Route Segment (Solid Gold Glowing Trail) */}
          <polyline
            points={traveledPolyline}
            fill="none"
            stroke="#D4AF37"
            strokeWidth="6"
            filter="url(#gold-glow)"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* RESTAURANT KITCHEN HUB PIN */}
          <g transform={`translate(${routeWaypoints[0].x}, ${routeWaypoints[0].y})`}>
            {/* Radiating Radar Ring */}
            <circle r="22" fill="none" stroke="#D4AF37" strokeWidth="2" opacity="0.3">
              <animate attributeName="r" values="14;28;14" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2.5s" repeatCount="indefinite" />
            </circle>

            <circle r="14" fill="#D4AF37" />
            <circle r="6" fill="#131713" />

            {/* Restaurant Hub Tooltip */}
            <g transform="translate(0, 26)">
              <rect x="-65" y="0" width="130" height="22" rx="11" fill="#1F241F" stroke="#D4AF37" strokeWidth="1.5" />
              <text x="0" y="14" fill="#D4AF37" fontSize="10" fontWeight="bold" textAnchor="middle">
                Nimza Kitchen Pass
              </text>
            </g>
          </g>

          {/* CUSTOMER DESTINATION PIN */}
          <g
            transform={`translate(${routeWaypoints[routeWaypoints.length - 1].x}, ${
              routeWaypoints[routeWaypoints.length - 1].y
            })`}
          >
            {/* Radiating Delivery Target Ring */}
            <circle r="20" fill="none" stroke="#F43F5E" strokeWidth="2" opacity="0.3">
              <animate attributeName="r" values="12;26;12" dur="2s" repeatCount="indefinite" />
            </circle>

            <circle r="14" fill="#F43F5E" />
            <circle r="5" fill="#FFFFFF" />

            {/* Customer Address Tooltip */}
            <g transform="translate(0, -18)">
              <rect x="-70" y="-18" width="140" height="22" rx="11" fill="#1F241F" stroke="#F43F5E" strokeWidth="1.5" />
              <text x="0" y="-4" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
                {order.customer_name.slice(0, 16)}
              </text>
            </g>
          </g>

          {/* COURIER VEHICLE MARKER (Moving along road network) */}
          <g transform={`translate(${courierPos.x}, ${courierPos.y})`}>
            {/* Live Sonar Radar Beacon Waves */}
            <circle r="26" fill="#D4AF37" opacity="0.15">
              <animate attributeName="r" values="16;38;16" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0;0.35" dur="1.5s" repeatCount="indefinite" />
            </circle>

            {/* Courier Outer Halo */}
            <circle r="18" fill="#1F241F" stroke="#D4AF37" strokeWidth="3" shadow-lg="true" />

            {/* Directional Heading Arrow */}
            <g transform={`rotate(${courierPos.heading})`}>
              <polygon points="18,0 12,-5 12,5" fill="#D4AF37" />
            </g>

            {/* Center Vehicle Beacon Dot */}
            <circle r="10" fill="#D4AF37" />
            <circle r="4" fill="#131713" />

            {/* Courier Info Floating Tag */}
            <g transform="translate(0, -28)">
              <rect x="-55" y="-14" width="110" height="20" rx="10" fill="#1F241F" stroke="#D4AF37" strokeWidth="1" />
              <text x="0" y="0" fill="#D4AF37" fontSize="10" fontWeight="bold" textAnchor="middle">
                {order.driver_name || "Assigned Courier"}
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* Bottom Dispatch & Telemetry Bar */}
      <div className="p-4 sm:p-5 bg-charcoal/95 border-t border-gold/20 flex flex-wrap items-center justify-between gap-4">
        {/* Driver Details Card */}
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-gold shadow-md bg-sand/20 shrink-0">
            {order.driver_avatar ? (
              <img
                src={order.driver_avatar}
                alt={order.driver_name || "Courier"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full grid place-items-center bg-gold text-charcoal font-bold">
                <Bike size={20} />
              </div>
            )}
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border border-charcoal" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-serif text-base font-bold text-white leading-tight">
                {order.driver_name || "Pending Driver Assignment"}
              </h4>
              {order.driver_vehicle && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-gold border border-gold/30">
                  {order.driver_vehicle}
                </span>
              )}
            </div>
            <p className="text-xs text-sand/70 mt-0.5 flex items-center gap-1.5">
              <MapPin size={12} className="text-gold" />
              <span className="truncate max-w-xs">{order.delivery_address}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Phone Call & Driver Simulation Controls */}
        <div className="flex items-center gap-2.5">
          {order.driver_phone && (
            <a
              href={`tel:${order.driver_phone}`}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-gold hover:text-charcoal border border-sand/20 text-xs font-bold text-sand transition-all flex items-center gap-1.5"
              title="Call Delivery Driver"
            >
              <Phone size={13} className="text-gold" />
              <span>Call Courier</span>
            </a>
          )}

          {/* Interactive Simulation Controls (For Driver & Admin testing) */}
          {(isDriverView || onUpdateProgress) && (
            <div className="flex items-center gap-1.5 border border-sand/20 bg-black/40 rounded-xl p-1">
              <button
                type="button"
                onClick={() => {
                  const nextP = Math.min(100, simulatedProgress + 25);
                  setSimulatedProgress(nextP);
                  onUpdateProgress?.(nextP);
                }}
                disabled={simulatedProgress >= 100}
                className="px-2.5 py-1 rounded-lg bg-gold text-charcoal hover:bg-gold-light disabled:opacity-40 text-xs font-bold transition-all flex items-center gap-1"
                title="Advance Courier Position +25%"
              >
                <Zap size={12} />
                <span>Advance +25%</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSimulatedProgress(0);
                  onUpdateProgress?.(0);
                }}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-sand/80 text-xs font-medium transition-all"
                title="Reset Route"
              >
                Reset
              </button>
            </div>
          )}

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-1 border border-sand/20 rounded-xl overflow-hidden bg-black/40">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.15))}
              className="p-2 text-sand/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-2 text-[10px] font-mono text-sand/60 hover:text-white"
              title="Reset Zoom"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.9, z - 0.15))}
              className="p-2 text-sand/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Zoom Out"
            >
              -
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
