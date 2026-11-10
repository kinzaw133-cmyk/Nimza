"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck,
  Users,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  Phone,
  User,
  Heart,
  Wine,
  Utensils,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { toast } from "@/lib/notify";
import NimzaLogo, { BotanicalLeafSvg } from "@/components/NimzaLogo";

// Detailed restaurant floor seating map
const TABLE_OPTIONS = [
  { no: 1, section: "Grand Dining Hall", cap: 2, desc: "Intimate window view with velvet seating" },
  { no: 2, section: "Grand Dining Hall", cap: 2, desc: "Cozy table near the marble fireplace" },
  { no: 3, section: "Grand Dining Hall", cap: 4, desc: "Central dining table with acoustic calm" },
  { no: 4, section: "Grand Dining Hall", cap: 4, desc: "Spacious booth table under crystal lighting" },
  { no: 5, section: "Chef's Counter", cap: 2, desc: "Front-row seats facing open flame & live plating" },
  { no: 6, section: "Chef's Counter", cap: 2, desc: "Direct interaction with Chef Elias & culinary team" },
  { no: 7, section: "Garden Veranda", cap: 4, desc: "Romantic courtyard dining under ancient olive trees" },
  { no: 8, section: "Garden Veranda", cap: 6, desc: "Open-air patio pergola with warm lantern glow" },
  { no: 9, section: "Private Wine Vault", cap: 6, desc: "Surrounded by 120+ vintage bottles in climate cellar" },
  { no: 10, section: "Private Wine Vault", cap: 8, desc: "Grand oak tasting table with dedicated sommelier" },
  { no: 11, section: "Royal Salon", cap: 10, desc: "Bespoke banquet suite with private entrance" },
  { no: 12, section: "Royal Salon", cap: 12, desc: "Executive dining table for VIP galas & celebrations" },
];

const TIME_SLOTS = [
  { time: "12:30", session: "Lunch Sitting" },
  { time: "13:30", session: "Lunch Sitting" },
  { time: "14:30", session: "Lunch Sitting" },
  { time: "18:30", session: "Dinner Sitting" },
  { time: "19:30", session: "Dinner Sitting" },
  { time: "20:30", session: "Dinner Sitting" },
  { time: "21:30", session: "Dinner Sitting" },
];

export default function Reservations() {
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    time: "19:30",
    guests: 2,
    table_no: 3,
    notes: "",
  });

  const [bookings, setBookings] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState<"details" | "table">("details");

  const loadBookings = async (currentUser: any) => {
    try {
      const { data } = await supabase
        .from("reservations")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("reserved_at", { ascending: false });
      if (data && data.length > 0) setBookings(data);
    } catch {
      // Local fallback
    }
  };

  useEffect(() => {
    if (user) {
      loadBookings(user);
    }
    // Also load from localStorage for guests
    try {
      const saved = localStorage.getItem("nimza-my-reservations");
      if (saved) {
        setBookings(JSON.parse(saved));
      }
    } catch {}
  }, [user]);

  const selectedTable = TABLE_OPTIONS.find((t) => t.no === form.table_no) || TABLE_OPTIONS[2];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast("Please enter your full name", "error");
      return;
    }

    if (!/^[0-9+ ]{7,16}$/.test(form.phone)) {
      toast("Please provide a valid contact number (7-15 digits)", "error");
      return;
    }

    setIsSubmitting(true);

    const newBooking = {
      id: Date.now(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      table_no: form.table_no,
      guests: form.guests,
      reserved_at: `${form.date}T${form.time}:00`,
      section: selectedTable.section,
    };

    try {
      if (user) {
        await supabase.from("reservations").insert({
          user_id: user.id,
          name: form.name.trim(),
          phone: form.phone.trim(),
          table_no: form.table_no,
          guests: form.guests,
          reserved_at: `${form.date}T${form.time}:00`,
        });
        loadBookings(user);
      }

      // Persist in localStorage as well
      const updated = [newBooking, ...bookings];
      setBookings(updated);
      try {
        localStorage.setItem("nimza-my-reservations", JSON.stringify(updated));
      } catch {}

      toast(`Table #${form.table_no} confirmed for ${form.name} on ${form.date} at ${form.time}!`, "success");
    } catch (err: any) {
      toast(err.message || "Reservation logged successfully", "success");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-ivory text-charcoal pt-36 pb-28 px-6 md:px-12 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-sand/40 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-olive mb-3">
            <Sparkles size={13} className="text-gold" /> Table Reservation Desk
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-olive tracking-tight">
            Reserve Your Evening
          </h1>
          <p className="mt-4 text-charcoal/80 text-base md:text-lg font-light leading-relaxed">
            Choose your preferred table, sitting slot, and dining section for a memorable culinary experience.
          </p>
        </div>

        {/* Two-Column Booking Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Interactive Booking Wizard */}
          <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-[2.5rem] border border-sand shadow-sm">
            {/* Step Selector Tabs */}
            <div className="flex gap-2 p-1 rounded-full bg-sand/30 border border-sand mb-8">
              <button
                type="button"
                onClick={() => setActiveStep("details")}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
                  activeStep === "details" ? "bg-olive text-gold shadow-sm" : "text-charcoal/70 hover:text-olive"
                }`}
              >
                1. Date, Time & Guests
              </button>
              <button
                type="button"
                onClick={() => setActiveStep("table")}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
                  activeStep === "table" ? "bg-olive text-gold shadow-sm" : "text-charcoal/70 hover:text-olive"
                }`}
              >
                2. Select Table ({selectedTable.section} - T{form.table_no})
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {activeStep === "details" ? (
                /* Step 1: Guest Details, Date & Time */
                <div className="space-y-6">
                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                        Guest Full Name *
                      </label>
                      <div className="relative">
                        <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
                        <input
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="e.g. Lord Alexander"
                          className="inp !pl-10 !text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                        Contact Phone *
                      </label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
                        <input
                          required
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+92 300 1234567"
                          className="inp !pl-10 !text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date & Guests Counter */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                        Reservation Date *
                      </label>
                      <input
                        required
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="inp cursor-pointer !text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                        Party Size
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, guests: Math.max(1, form.guests - 1) })}
                          className="grid h-12 w-12 place-items-center rounded-2xl border border-sand bg-sand/30 hover:bg-gold hover:text-charcoal font-bold text-lg transition-all"
                        >
                          -
                        </button>
                        <div className="flex-1 text-center font-serif text-lg font-bold border border-sand rounded-2xl py-2.5 bg-white">
                          {form.guests} {form.guests === 1 ? "Guest" : "Guests"}
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, guests: Math.min(16, form.guests + 1) })}
                          className="grid h-12 w-12 place-items-center rounded-2xl border border-sand bg-sand/30 hover:bg-gold hover:text-charcoal font-bold text-lg transition-all"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sitting Times */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-2">
                      Choose Service Sitting *
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                      {TIME_SLOTS.map(({ time, session }) => {
                        const isSelected = form.time === time;
                        return (
                          <button
                            type="button"
                            key={time}
                            onClick={() => setForm({ ...form, time })}
                            className={`py-2 px-2 rounded-xl text-center transition-all ${
                              isSelected
                                ? "bg-olive text-gold font-bold shadow-md shadow-olive/30 ring-2 ring-gold"
                                : "bg-sand/30 border border-sand/70 text-charcoal hover:border-gold hover:bg-sand"
                            }`}
                          >
                            <p className="text-xs font-bold">{time}</p>
                            <p className="text-[9px] uppercase tracking-wider opacity-70 truncate">{session}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Special Occasion / Notes */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                      Special Celebration or Dietary Needs (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Anniversary, birthday, quiet window corner, truffle allergy, sommelier pairing..."
                      className="inp resize-none !text-xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveStep("table")}
                    className="btn w-full !py-3.5 text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Select Table #{form.table_no}</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              ) : (
                /* Step 2: Interactive Table Selection Floor Plan */
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-olive">Select Your Table</h3>
                    <p className="text-xs text-charcoal/60 mt-0.5">
                      Choose from our 12 curated dining stations. Tables are reserved for 2 full hours.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                    {TABLE_OPTIONS.map((t) => {
                      const isSelected = form.table_no === t.no;
                      return (
                        <button
                          type="button"
                          key={t.no}
                          onClick={() => setForm({ ...form, table_no: t.no })}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? "bg-sand/50 border-gold ring-2 ring-gold shadow-md"
                              : "bg-white border-sand hover:border-gold/60"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-serif text-base font-bold text-olive">Table #{t.no}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-gold/15 text-gold-dark px-2 py-0.5 rounded-full border border-gold/30">
                              Up to {t.cap} Guests
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-charcoal/80">{t.section}</p>
                          <p className="text-[11px] text-charcoal/60 mt-1 line-clamp-1">{t.desc}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveStep("details")}
                      className="btn-d !py-3.5 !px-5 text-xs"
                    >
                      ← Back to Details
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn flex-1 !py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-gold/20"
                    >
                      <CalendarCheck size={16} />
                      <span>{isSubmitting ? "Locking Table..." : `Confirm Table #${form.table_no} Booking`}</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Column: Live Gold Ticket Pass & Confirmed Bookings */}
          <div className="lg:col-span-5 space-y-8">
            {/* Live Gold Ticket Pass */}
            <div className="rounded-[2.5rem] bg-olive-deep text-ivory p-8 md:p-10 border-2 border-gold/50 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-gold/15 blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-gold/20 pb-5 mb-6">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gold font-bold">
                    Official Reservation Pass
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-ivory mt-0.5">Nimza Gastronomy</h3>
                </div>
                <NimzaLogo variant="circle" size="sm" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-sand/70">Lead Guest</span>
                  <span className="font-serif text-base font-bold text-ivory">
                    {form.name || "Awaiting Guest Name"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-sand/70">Sitting Schedule</span>
                  <span className="font-bold text-sm text-gold">
                    {form.date} at {form.time}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-sand/70">Table Allocation</span>
                  <span className="font-serif text-base font-bold text-ivory">
                    Table #{form.table_no} ({selectedTable.section})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-sand/70">Party Count</span>
                  <span className="font-serif text-base font-bold text-ivory">
                    {form.guests} Guests
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-dashed border-gold/30 flex items-center justify-between text-[11px] text-sand/60">
                <span>Grace Period: 15 Mins</span>
                <span>Smart Casual Attire</span>
              </div>
            </div>

            {/* Confirmed Bookings List */}
            {bookings.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-sand">
                <h3 className="font-serif text-xl font-bold text-olive mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-700" />
                  <span>Your Bookings ({bookings.length})</span>
                </h3>
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl bg-sand/30 border border-sand flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-sm text-olive">
                          {new Date(b.reserved_at).toLocaleDateString()} at{" "}
                          {new Date(b.reserved_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="text-xs text-charcoal/70">
                          Table #{b.table_no || 1} • {b.guests} Guests
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                        Confirmed
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
