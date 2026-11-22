"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Utensils,
  CalendarCheck,
  Clock,
  Users,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit3,
  Trash2,
  UserCheck,
  UserPlus,
  ArrowRight,
  Phone,
  Mail,
  X,
  ChevronRight,
  Check,
  QrCode,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { toast } from "@/lib/notify";
import NimzaLogo from "@/components/NimzaLogo";

export interface AdminTable {
  no: number;
  seats: number;
  section: string;
  status: "Available" | "Occupied" | "Reserved" | "Cleaning" | "Blocked";
  current_guest: string;
  notes?: string;
  sitting_time?: string;
}

export interface AdminReservation {
  id: number;
  user_id?: string | null;
  name: string;
  phone: string;
  email?: string;
  table_no: number;
  guests: number;
  reserved_at: string;
  section?: string;
  notes?: string;
  package_type?: string;
  package_name?: string;
  package_price?: number;
  status: "Confirmed" | "Waitlisted" | "Completed" | "Cancelled";
  booking_type?: "table_reservation" | "event_booking";
  qr_code?: string;
  waitlist_position?: number;
  created_at?: string;
}

const DEFAULT_ADMIN_TABLES: AdminTable[] = [
  { no: 1, seats: 2, section: "Window Terrace", status: "Occupied", current_guest: "Lord Sterling (2p)", sitting_time: "19:30" },
  { no: 2, seats: 2, section: "Window Terrace", status: "Reserved", current_guest: "Sophia Delacroix (2p)", sitting_time: "20:00" },
  { no: 3, seats: 4, section: "Window Terrace", status: "Occupied", current_guest: "Countess Elena (4p)", sitting_time: "19:00" },
  { no: 4, seats: 4, section: "Grand Dining Hall", status: "Available", current_guest: "Ready for Seating" },
  { no: 5, seats: 6, section: "Grand Dining Hall", status: "Available", current_guest: "Ready for Seating" },
  { no: 6, seats: 6, section: "Grand Dining Hall", status: "Reserved", current_guest: "Dr. Alistair (5p)", sitting_time: "20:30" },
  { no: 7, seats: 4, section: "Garden Veranda", status: "Cleaning", current_guest: "Table Turnover in Progress" },
  { no: 8, seats: 6, section: "Garden Veranda", status: "Available", current_guest: "Ready for Seating" },
  { no: 9, seats: 6, section: "Private Wine Vault", status: "Reserved", current_guest: "Baron Von Essen (6p)", sitting_time: "20:00" },
  { no: 10, seats: 8, section: "Private Wine Vault", status: "Available", current_guest: "Ready for Seating" },
  { no: 11, seats: 4, section: "Chef's Counter VIP", status: "Occupied", current_guest: "Ambassador Vance (4p)", sitting_time: "19:30" },
  { no: 12, seats: 12, section: "Royal Salon", status: "Reserved", current_guest: "Diplomatic Suite (10p)", sitting_time: "20:30" },
];

const DEFAULT_ADMIN_RESERVATIONS: AdminReservation[] = [
  {
    id: 90214,
    name: "Sarah Johnson",
    phone: "+92 300 8472911",
    email: "sarah.j@example.com",
    table_no: 2,
    guests: 2,
    reserved_at: new Date(Date.now() + 2 * 3600000).toISOString(),
    section: "Window Terrace",
    package_name: "Anniversary Romance Package",
    package_type: "anniversary",
    status: "Confirmed",
    notes: "Red roses, quiet corner, celebratory champagne bottle on table.",
    qr_code: "NIMZA-VIP-90214",
  },
  {
    id: 90215,
    name: "Mike Chen",
    phone: "+92 321 5543290",
    email: "mike.chen@foodblog.com",
    table_no: 11,
    guests: 2,
    reserved_at: new Date(Date.now() + 3 * 3600000).toISOString(),
    section: "Chef's Counter VIP",
    package_name: "Chef's Grand Tasting Journey",
    package_type: "chef_dinner",
    status: "Confirmed",
    notes: "Tasting menu with full wine pairing discussion.",
    qr_code: "NIMZA-VIP-90215",
  },
  {
    id: 90216,
    name: "Emma Davis",
    phone: "+92 333 1122334",
    email: "emma.d@techcorp.com",
    table_no: 12,
    guests: 10,
    reserved_at: new Date(Date.now() + 24 * 3600000).toISOString(),
    section: "Royal Salon",
    package_name: "Birthday Celebration Package",
    package_type: "birthday",
    status: "Confirmed",
    notes: "Custom birthday chocolate cake inscription: 'Happy 30th Emma!'.",
    qr_code: "NIMZA-VIP-90216",
  },
  {
    id: 90217,
    name: "Lord Alexander Vance",
    phone: "+92 300 1234567",
    email: "vance@estates.org",
    table_no: 3,
    guests: 4,
    reserved_at: new Date(Date.now() + 4 * 3600000).toISOString(),
    section: "Window Terrace",
    package_name: "Standard VIP Dining",
    package_type: "standard",
    status: "Waitlisted",
    waitlist_position: 1,
    notes: "Prefers Window Terrace or Garden Veranda between 19:30-20:30.",
    qr_code: "NIMZA-VIP-90217",
  },
];

export default function AdminTablesPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  const [tables, setTables] = useState<AdminTable[]>(DEFAULT_ADMIN_TABLES);
  const [reservations, setReservations] = useState<AdminReservation[]>(DEFAULT_ADMIN_RESERVATIONS);
  const [activeSectionFilter, setActiveSectionFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"floor" | "waitlist" | "reservations">("floor");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Seat Waitlisted Guest Modal
  const [seatingGuest, setSeatingGuest] = useState<AdminReservation | null>(null);
  const [selectedSeatTableNo, setSelectedSeatTableNo] = useState<number>(4);

  // Load from Supabase & localStorage on mount
  useEffect(() => {
    loadData();
    const handleSync = () => loadData();
    window.addEventListener("nimza_reservation_updated", handleSync);
    return () => window.removeEventListener("nimza_reservation_updated", handleSync);
  }, []);

  const loadData = async () => {
    setIsRefreshing(true);

    // 1. Load Tables from localStorage or Supabase
    try {
      const storedTables = localStorage.getItem("nimza_admin_tables");
      if (storedTables) {
        setTables(JSON.parse(storedTables));
      }
    } catch {}

    // 2. Load Reservations
    try {
      let combinedRes: any[] = [];

      // A. Fetch from backend API
      try {
        const apiRes = await fetch("/api/reservations");
        if (apiRes.ok) {
          const { reservations } = await apiRes.json();
          if (reservations && reservations.length > 0) {
            combinedRes = reservations;
          }
        }
      } catch {}

      // B. Fetch from Supabase
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .order("reserved_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const map = new Map<number, any>();
        combinedRes.forEach((r) => map.set(r.id, r));
        data.forEach((r: any) => map.set(r.id, r));
        setReservations(Array.from(map.values()));
      } else if (combinedRes.length > 0) {
        setReservations(combinedRes);
      } else {
        const storedRes = localStorage.getItem("nimza-my-reservations");
        if (storedRes) {
          const parsed = JSON.parse(storedRes);
          if (parsed.length > 0) setReservations(parsed);
        }
      }
    } catch {
      // Fallback stays
    } finally {
      setIsRefreshing(false);
    }
  };

  // Cycle table status with 1 click
  const cycleTableStatus = (tableNo: number) => {
    const STATUS_CYCLE: AdminTable["status"][] = ["Available", "Occupied", "Reserved", "Cleaning", "Blocked"];

    const updated = tables.map((t) => {
      if (t.no === tableNo) {
        const currentIdx = STATUS_CYCLE.indexOf(t.status);
        const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];
        const newGuest =
          nextStatus === "Available"
            ? "Ready for Seating"
            : nextStatus === "Occupied"
            ? "Walk-in Guest Seated"
            : nextStatus === "Cleaning"
            ? "Table Sanitization"
            : nextStatus === "Blocked"
            ? "Maintenance / Blocked"
            : t.current_guest;

        return { ...t, status: nextStatus, current_guest: newGuest };
      }
      return t;
    });

    setTables(updated);
    try {
      localStorage.setItem("nimza_admin_tables", JSON.stringify(updated));
    } catch {}

    toast(`Table #${tableNo} status changed`, "info");
  };

  // Seat Waitlisted Guest & Promote to Confirmed Table
  const handleConfirmSeating = async () => {
    if (!seatingGuest) return;

    const chosenTable = tables.find((t) => t.no === selectedSeatTableNo);
    const updatedRes = reservations.map((r) => {
      if (r.id === seatingGuest.id) {
        return {
          ...r,
          status: "Confirmed" as const,
          table_no: selectedSeatTableNo,
          section: chosenTable?.section || "Window Terrace",
          waitlist_position: undefined,
        };
      }
      return r;
    });

    setReservations(updatedRes);
    try {
      localStorage.setItem("nimza-my-reservations", JSON.stringify(updatedRes));
      await supabase
        .from("reservations")
        .update({
          status: "Confirmed",
          table_no: selectedSeatTableNo,
          waitlist_position: null,
        })
        .eq("id", seatingGuest.id);
    } catch {}

    // Update table status to Reserved
    const updatedTables = tables.map((t) => {
      if (t.no === selectedSeatTableNo) {
        return {
          ...t,
          status: "Reserved" as const,
          current_guest: `${seatingGuest.name} (${seatingGuest.guests}p)`,
        };
      }
      return t;
    });

    setTables(updatedTables);
    try {
      localStorage.setItem("nimza_admin_tables", JSON.stringify(updatedTables));
    } catch {}

    window.dispatchEvent(new Event("nimza_reservation_updated"));
    toast(
      `Guest ${seatingGuest.name} successfully seated at Table #${selectedSeatTableNo}! Status advanced to Confirmed.`,
      "success"
    );
    setSeatingGuest(null);
  };

  // Cancel Reservation Action
  const handleCancelReservation = async (id: number, guestName: string) => {
    const updated = reservations.map((r) => (r.id === id ? { ...r, status: "Cancelled" as const } : r));
    setReservations(updated);

    try {
      localStorage.setItem("nimza-my-reservations", JSON.stringify(updated));
      await supabase.from("reservations").update({ status: "Cancelled" }).eq("id", id);
    } catch {}

    window.dispatchEvent(new Event("nimza_reservation_updated"));
    toast(`Reservation #${id} for ${guestName} cancelled. Table released.`, "info");
  };

  // Metrics
  const totalTables = tables.length;
  const availableCount = tables.filter((t) => t.status === "Available").length;
  const occupiedCount = tables.filter((t) => t.status === "Occupied").length;
  const reservedCount = tables.filter((t) => t.status === "Reserved").length;
  const waitlistQueue = reservations.filter((r) => r.status === "Waitlisted");

  return (
    <div className="text-charcoal p-4 sm:p-6 md:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Executive Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-sand">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="rounded-full border border-sand bg-white px-3.5 py-1.5 text-xs font-bold text-olive hover:bg-gold hover:text-charcoal transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>← Executive Desk</span>
            </Link>
            <span className="text-sand/70 text-xs">/</span>
            <span className="font-serif text-sm font-bold text-olive">Table Availability & Floor Ops</span>
          </div>

          {/* Quick Submodule Links */}
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/admin/orders"
              className="px-3 py-1 rounded-full bg-white border border-sand hover:border-gold text-charcoal font-medium transition-all"
            >
              Kitchen Pass
            </Link>
            <Link
              href="/admin/menu"
              className="px-3 py-1 rounded-full bg-white border border-sand hover:border-gold text-charcoal font-medium transition-all"
            >
              Menu Studio
            </Link>
            <Link
              href="/admin/reviews"
              className="px-3 py-1 rounded-full bg-white border border-sand hover:border-gold text-charcoal font-medium transition-all"
            >
              Reviews Studio
            </Link>
            <Link
              href="/admin/users"
              className="px-3 py-1 rounded-full bg-white border border-sand hover:border-gold text-charcoal font-medium transition-all"
            >
              Users & Roles
            </Link>
          </div>
        </div>

        {/* Studio Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-olive mb-2">
              <Utensils size={13} className="text-gold" />
              <span>Restaurant Floor Management Console</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-olive">
              Table Availability & Reservation Floor
            </h1>
            <p className="text-xs sm:text-sm text-charcoal/70 mt-1 max-w-2xl">
              Real-time synchronization for 12 dining tables, floor statuses, customer bookings, celebration packages, and VIP waitlist queue.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={isRefreshing}
              className="btn-o !py-2.5 !px-4 text-xs font-bold flex items-center gap-2"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin text-gold" : "text-gold"} />
              <span>{isRefreshing ? "Refreshing..." : "Sync Live Floor"}</span>
            </button>
            <Link
              href="/reservations"
              className="btn !py-2.5 !px-4 text-xs font-bold flex items-center gap-2"
            >
              <Plus size={14} />
              <span>New Reservation</span>
            </Link>
          </div>
        </div>

        {/* 4 KPI METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white border border-sand shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60">Total Capacity</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-serif text-3xl font-bold text-olive">{totalTables} Tables</span>
              <span className="text-xs font-bold text-charcoal/60">68 Total Seats</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Available Tables</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-serif text-3xl font-bold text-emerald-900">{availableCount} Open</span>
              <span className="text-xs font-bold text-emerald-700">Ready for Seating</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Occupied & Reserved</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-serif text-3xl font-bold text-amber-900">{occupiedCount + reservedCount} Active</span>
              <span className="text-xs font-bold text-amber-700">{Math.round(((occupiedCount + reservedCount) / 12) * 100)}% Floor Load</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gold/15 border border-gold/40 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark">VIP Waitlist Queue</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-serif text-3xl font-bold text-[#1F241F]">{waitlistQueue.length} Waiting</span>
              <button
                type="button"
                onClick={() => setActiveTab("waitlist")}
                className="text-xs font-bold text-gold hover:underline"
              >
                Manage Queue →
              </button>
            </div>
          </div>
        </div>

        {/* PRIMARY VIEW TABS */}
        <div className="flex items-center justify-between border-b border-sand pb-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("floor")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "floor"
                  ? "bg-[#1F241F] text-gold shadow-sm"
                  : "bg-white border border-sand text-charcoal/70 hover:text-charcoal"
              }`}
            >
              <Utensils size={14} />
              <span>Interactive Floor Plan ({tables.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("waitlist")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 relative ${
                activeTab === "waitlist"
                  ? "bg-[#1F241F] text-gold shadow-sm"
                  : "bg-white border border-sand text-charcoal/70 hover:text-charcoal"
              }`}
            >
              <Users size={14} />
              <span>VIP Waitlist Desk</span>
              {waitlistQueue.length > 0 && (
                <span className="rounded-full bg-gold text-[#1F241F] text-[10px] font-extrabold px-1.5 py-0.2">
                  {waitlistQueue.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("reservations")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "reservations"
                  ? "bg-[#1F241F] text-gold shadow-sm"
                  : "bg-white border border-sand text-charcoal/70 hover:text-charcoal"
              }`}
            >
              <CalendarCheck size={14} />
              <span>All Bookings Ledger ({reservations.length})</span>
            </button>

            <Link
              href="/admin/qr-codes"
              className="px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 bg-gold/15 border border-gold/40 text-charcoal hover:bg-gold hover:text-charcoal shadow-2xs"
              title="Manage Table QR Digital Menus & Print Standees"
            >
              <QrCode size={14} className="text-gold" />
              <span>Table QR Digital Menus →</span>
            </Link>
          </div>
        </div>

        {/* TAB 1: INTERACTIVE FLOOR PLAN VIEW */}
        {activeTab === "floor" && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-white border border-sand flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-charcoal/70 mr-2">Filter Section:</span>
                {["All", "Window Terrace", "Grand Dining Hall", "Garden Veranda", "Private Wine Vault", "Chef's Counter VIP", "Royal Salon"].map(
                  (sec) => (
                    <button
                      key={sec}
                      onClick={() => setActiveSectionFilter(sec)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        activeSectionFilter === sec
                          ? "bg-olive text-gold shadow-xs"
                          : "bg-sand/30 text-charcoal/80 hover:bg-sand/60"
                      }`}
                    >
                      {sec}
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-charcoal/70">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Occupied
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Reserved
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Cleaning
                </span>
              </div>
            </div>

            {/* 12-Table Interactive Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tables
                .filter((t) => activeSectionFilter === "All" || t.section === activeSectionFilter)
                .map((table) => {
                  const isAvailable = table.status === "Available";
                  const isOccupied = table.status === "Occupied";
                  const isReserved = table.status === "Reserved";
                  const isCleaning = table.status === "Cleaning";

                  const cardBg = isAvailable
                    ? "bg-emerald-50/60 border-emerald-200 hover:border-emerald-400"
                    : isOccupied
                    ? "bg-amber-50/60 border-amber-200 hover:border-amber-400"
                    : isReserved
                    ? "bg-blue-50/60 border-blue-200 hover:border-blue-400"
                    : isCleaning
                    ? "bg-purple-50/60 border-purple-200 hover:border-purple-400"
                    : "bg-sand/30 border-sand";

                  const badgeColor = isAvailable
                    ? "bg-emerald-100 text-emerald-800"
                    : isOccupied
                    ? "bg-amber-100 text-amber-800"
                    : isReserved
                    ? "bg-blue-100 text-blue-800"
                    : isCleaning
                    ? "bg-purple-100 text-purple-800"
                    : "bg-sand/60 text-charcoal";

                  return (
                    <div
                      key={table.no}
                      className={`p-5 rounded-3xl border transition-all flex flex-col justify-between shadow-xs ${cardBg}`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-serif text-2xl font-bold text-olive">Table #{table.no}</span>
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${badgeColor}`}>
                            {table.status}
                          </span>
                        </div>

                        <p className="text-xs font-bold text-charcoal/80">{table.section}</p>
                        <p className="text-[11px] text-charcoal/60 mt-0.5">Capacity: {table.seats} Diners</p>

                        <div className="mt-3 p-3 rounded-2xl bg-white/80 border border-sand/60 text-xs">
                          <p className="font-semibold text-charcoal truncate">{table.current_guest}</p>
                          {table.sitting_time && (
                            <p className="text-[10px] text-gold font-bold mt-0.5">Sitting: {table.sitting_time}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-sand/50 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => cycleTableStatus(table.no)}
                          className="btn-o !py-1.5 !px-3 text-[11px] font-bold"
                          title="Cycle table status: Available → Occupied → Reserved → Cleaning → Blocked"
                        >
                          Change Status ↻
                        </button>
                        <Link
                          href="/admin/qr-codes"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-olive hover:text-gold transition-colors py-1 px-2 rounded-lg hover:bg-sand/30"
                          title="View QR Code & Print Standee"
                        >
                          <QrCode size={12} className="text-gold" />
                          <span>QR Standee</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 2: VIP WAITLIST DESK */}
        {activeTab === "waitlist" && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-sand shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-sand">
                <div>
                  <h3 className="font-serif text-xl font-bold text-olive flex items-center gap-2">
                    <Users size={20} className="text-gold" />
                    <span>Priority Waitlist Desk</span>
                  </h3>
                  <p className="text-xs text-charcoal/60 mt-0.5">
                    Guests awaiting available tables during peak sitting times. Click &ldquo;Seat Diner&rdquo; to allocate a newly opened table.
                  </p>
                </div>

                <span className="rounded-full bg-gold/15 text-gold-dark text-xs font-bold px-3 py-1 border border-gold/30">
                  {waitlistQueue.length} Guests in Queue
                </span>
              </div>

              {waitlistQueue.length === 0 ? (
                <div className="p-8 text-center text-charcoal/60">
                  <CheckCircle2 size={36} className="text-emerald-600 mx-auto mb-2 opacity-80" />
                  <p className="font-serif font-bold text-base text-olive">Waitlist Queue is Clear</p>
                  <p className="text-xs mt-1">All diners have been seated or allocated to confirmed tables.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {waitlistQueue.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#FAF9F5] border border-gold/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/20 text-[#1F241F] font-serif font-bold text-base shrink-0">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-base text-olive">{item.name}</span>
                            <span className="rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 uppercase">
                              Waitlisted
                            </span>
                            <span className="text-xs text-gold font-bold">{item.package_name || "Standard VIP"}</span>
                          </div>

                          <p className="text-xs text-charcoal/70 mt-0.5">
                            <strong>Contact:</strong> {item.phone} • <strong>Party:</strong> {item.guests} Guests •{" "}
                            <strong>Desired Schedule:</strong> {new Date(item.reserved_at).toLocaleDateString()} at{" "}
                            {new Date(item.reserved_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>

                          {item.notes && (
                            <p className="text-[11px] text-charcoal/60 italic mt-1">&ldquo;{item.notes}&rdquo;</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start md:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSeatingGuest(item);
                            // Find first available table that can fit the party
                            const fit = tables.find((t) => t.status === "Available" && t.seats >= item.guests);
                            if (fit) setSelectedSeatTableNo(fit.no);
                          }}
                          className="btn !py-2 !px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                        >
                          <UserCheck size={14} />
                          <span>Seat Diner at Table</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancelReservation(item.id, item.name)}
                          className="btn-d !py-2 !px-3 text-xs font-bold text-rose-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ALL BOOKINGS LEDGER */}
        {activeTab === "reservations" && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-sand shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-sand">
                <div className="relative flex-1 max-w-sm">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by diner name, phone or table..."
                    className="inp !pl-10 !text-xs !py-2"
                  />
                </div>

                <span className="text-xs text-charcoal/60">
                  Showing {reservations.length} total dining bookings
                </span>
              </div>

              <div className="space-y-3">
                {reservations
                  .filter((r) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      r.name.toLowerCase().includes(q) ||
                      r.phone.includes(q) ||
                      `table ${r.table_no}`.includes(q)
                    );
                  })
                  .map((res) => {
                    const isCancelled = res.status === "Cancelled";
                    const isWaitlist = res.status === "Waitlisted";

                    return (
                      <div
                        key={res.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isCancelled ? "bg-sand/20 border-sand/40 opacity-60" : "bg-white border-sand hover:border-gold/40"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-serif font-bold text-base text-olive">{res.name}</span>
                            <span
                              className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                isCancelled
                                  ? "bg-rose-100 text-rose-800"
                                  : isWaitlist
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {res.status}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold/15 text-gold-dark border border-gold/30">
                              {res.package_name || "Standard VIP"}
                            </span>
                          </div>

                          <p className="text-xs text-charcoal/70">
                            <strong>Table:</strong> #{res.table_no} ({res.section || "Floor Area"}) •{" "}
                            <strong>Schedule:</strong> {new Date(res.reserved_at).toLocaleDateString()} at{" "}
                            {new Date(res.reserved_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} •{" "}
                            <strong>Party:</strong> {res.guests} Guests • <strong>Phone:</strong> {res.phone}
                          </p>

                          {res.notes && (
                            <p className="text-[11px] text-charcoal/60 italic mt-1">&ldquo;{res.notes}&rdquo;</p>
                          )}
                        </div>

                        {!isCancelled && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCancelReservation(res.id, res.name)}
                              className="btn-d !py-1.5 !px-3 text-xs font-bold text-rose-600 hover:bg-rose-50"
                            >
                              Cancel Booking
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* MODAL: SEAT WAITLIST GUEST */}
        <AnimatePresence>
          {seatingGuest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setSeatingGuest(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="w-full max-w-md rounded-[2.5rem] bg-white p-6 sm:p-8 border border-sand shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-sand">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-olive">Allocate Table for {seatingGuest.name}</h3>
                    <p className="text-xs text-charcoal/60">Party Size: {seatingGuest.guests} Diners</p>
                  </div>
                  <button type="button" onClick={() => setSeatingGuest(null)} className="p-2 rounded-full hover:bg-sand/30">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-charcoal/70 mb-1.5">Select Open Table</label>
                    <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                      {tables.map((t) => {
                        const isSelected = selectedSeatTableNo === t.no;
                        const isAvail = t.status === "Available";
                        return (
                          <button
                            type="button"
                            key={t.no}
                            onClick={() => setSelectedSeatTableNo(t.no)}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? "bg-sand/50 border-gold ring-2 ring-gold"
                                : isAvail
                                ? "bg-white border-sand hover:border-gold/60"
                                : "bg-sand/20 border-sand/40 opacity-60"
                            }`}
                          >
                            <p className="font-serif font-bold text-sm text-olive">Table #{t.no}</p>
                            <p className="text-[10px] text-charcoal/70">{t.section} ({t.seats} Seats)</p>
                            <span className="text-[9px] font-bold text-emerald-700 block mt-0.5">{t.status}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-[11px] text-charcoal/70 leading-relaxed bg-[#FAF9F5] p-3 rounded-xl border border-sand">
                    Seating <strong>{seatingGuest.name}</strong> at <strong>Table #{selectedSeatTableNo}</strong> will advance their status to <strong>Confirmed</strong>, remove them from the waitlist, and automatically notify the diner.
                  </p>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSeatingGuest(null)}
                    className="btn-d flex-1 !py-2.5 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSeating}
                    className="btn flex-1 !py-2.5 text-xs font-bold"
                  >
                    Confirm Seating ✓
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
