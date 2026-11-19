"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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
  Gift,
  Cake,
  Flame,
  QrCode,
  Download,
  Calendar,
  BellRing,
  AlertCircle,
  Edit3,
  XCircle,
  X,
  Share2,
  Check,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { toast } from "@/lib/notify";
import NimzaLogo, { BotanicalLeafSvg } from "@/components/NimzaLogo";
import QRCodeSvg from "@/components/QRCodeSvg";

// 12 Curated Dining Stations across 5 Signature Zones
const RESTAURANT_TABLES = [
  { no: 1, section: "Window Terrace", cap: 2, desc: "Intimate street & garden view, velvet banquette", status: "Available" },
  { no: 2, section: "Window Terrace", cap: 2, desc: "Sunset window view, marble bistro setting", status: "Available" },
  { no: 3, section: "Window Terrace", cap: 4, desc: "Spacious corner table overlooking illuminated fountain", status: "Available" },
  { no: 4, section: "Grand Dining Hall", cap: 4, desc: "Central salon table with crystal chandelier acoustic calm", status: "Available" },
  { no: 5, section: "Grand Dining Hall", cap: 6, desc: "Spacious family banquet booth with plush leather seating", status: "Available" },
  { no: 6, section: "Grand Dining Hall", cap: 6, desc: "Cozy table near the artisan limestone hearth", status: "Available" },
  { no: 7, section: "Garden Veranda", cap: 4, desc: "Courtyard dining surrounded by olive trees & lanterns", status: "Available" },
  { no: 8, section: "Garden Veranda", cap: 6, desc: "Pergola veranda table with fragrant jasmine trellis", status: "Available" },
  { no: 9, section: "Private Wine Vault", cap: 6, desc: "Surrounded by 120+ vintage Grand Cru reserves in cellar", status: "Available" },
  { no: 10, section: "Private Wine Vault", cap: 8, desc: "Monolithic oak tasting table with dedicated sommelier", status: "Available" },
  { no: 11, section: "Chef's Counter VIP", cap: 4, desc: "Front-row seats facing open flame hearth & live plating", status: "Available" },
  { no: 12, section: "Royal Salon", cap: 12, desc: "Private VIP suite with dedicated entrance & private waitstaff", status: "Available" },
];

// Service sitting hours
const TIME_SLOTS = [
  { time: "12:30", session: "Lunch Sitting" },
  { time: "13:30", session: "Lunch Sitting" },
  { time: "14:30", session: "Lunch Sitting" },
  { time: "18:30", session: "Dinner Sitting" },
  { time: "19:30", session: "Dinner Sitting" },
  { time: "20:30", session: "Dinner Sitting" },
  { time: "21:30", session: "Dinner Sitting" },
];

// VIP Celebration & Dining Packages
interface CelebrationPackage {
  id: string;
  name: string;
  tag: string;
  price: number;
  priceType: "per_guest" | "flat";
  badge: string;
  icon: any;
  description: string;
  highlights: string[];
  image: string;
}

const DINING_PACKAGES: CelebrationPackage[] = [
  {
    id: "standard",
    name: "Standard VIP Dining",
    tag: "A La Carte Experience",
    price: 0,
    priceType: "flat",
    badge: "Included",
    icon: Utensils,
    description: "Classic table seating with full seasonal à la carte selection, artisan bread service, and concierge hosting.",
    highlights: [
      "Access to full contemporary seasonal menu",
      "Complimentary artisan sourdough & amuse-bouche",
      "2-Hour reserved dining sitting with concierge table greeting",
    ],
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
  },
  {
    id: "birthday",
    name: "Birthday Celebration Package",
    tag: "Milestone Celebration",
    price: 45,
    priceType: "per_guest",
    badge: "Most Popular",
    icon: Cake,
    description: "Make milestone birthdays unforgettable with custom artisan cakes, sparkling presentation, and festive culinary touches.",
    highlights: [
      "Handcrafted Valrhona chocolate or berry celebration cake",
      "Golden sparkler & candlelight table presentation",
      "Complimentary champagne or craft mocktail toast for all guests",
      "Bespoke floral table arrangement & chef-signed keepsake menu",
    ],
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
  },
  {
    id: "anniversary",
    name: "Anniversary Romance Package",
    tag: "Romantic Rendezvous",
    price: 120,
    priceType: "flat",
    badge: "Couple's Choice",
    icon: Heart,
    description: "An intimate, sensorial celebration designed for two with candlelit ambiance, vintage champagne, and curated courses.",
    highlights: [
      "Grand bouquet of long-stem Ecuadorian red velvet roses",
      "Chilled bottle of French Champagne upon seating",
      "Candlelit acoustic table in private alcove or veranda",
      "5-Course romantic aphrodisiac tasting journey",
      "Private sommelier visit & artisanal chocolate truffles farewell",
    ],
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
  },
  {
    id: "chef_dinner",
    name: "Chef's Grand Tasting Journey",
    tag: "Haute Gastronomy",
    price: 85,
    priceType: "per_guest",
    badge: "Chef Elias Signature",
    icon: Wine,
    description: "The pinnacle of Mediterranean fine dining. An unhurried 7-course culinary exploration with wine cellar pairings.",
    highlights: [
      "7-Course seasonal tasting menu crafted by Executive Chef Elias",
      "Front-row Chef's Counter or Private Wine Vault seating",
      "Exclusive kitchen pass greeting & culinary philosophy tour",
      "Cellar sommelier pairing notes with rare vintage selections",
    ],
    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80",
  },
];

interface ReservationRecord {
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
  package_type: string;
  package_name: string;
  package_price: number;
  status: "Confirmed" | "Waitlisted" | "Completed" | "Cancelled";
  booking_type: "table_reservation" | "event_booking";
  qr_code?: string;
  reminder_opt_in?: boolean;
  waitlist_position?: number;
  created_at?: string;
}

export default function ReservationsPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  // Primary mode tabs: Table Reservation vs Dining Packages vs Customer History
  const [activeTab, setActiveTab] = useState<"reservation" | "packages" | "history">("reservation");

  // Reservation Wizard Steps
  const [activeStep, setActiveStep] = useState<"details" | "table" | "package">("details");

  // Single-Registration Memory State
  const [savedProfile, setSavedProfile] = useState<{
    name: string;
    phone: string;
    email: string;
    dietaryNotes: string;
  } | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    time: "19:30",
    guests: 2,
    table_no: 3,
    package_id: "standard",
    notes: "",
    reminder_opt_in: true,
    is_waitlist: false,
  });

  const [bookings, setBookings] = useState<ReservationRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Modals
  const [selectedPass, setSelectedPass] = useState<ReservationRecord | null>(null);
  const [modifyingItem, setModifyingItem] = useState<ReservationRecord | null>(null);
  const [modifyForm, setModifyForm] = useState({
    date: "",
    time: "19:30",
    guests: 2,
    table_no: 1,
    package_id: "standard",
    notes: "",
  });
  const [cancellingItem, setCancellingItem] = useState<ReservationRecord | null>(null);

  // Load Single-Registration Memory & Reservations on mount
  useEffect(() => {
    // 1. Try reading saved guest profile from localStorage
    try {
      const storedProfile = localStorage.getItem("nimza_saved_guest_profile");
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        setSavedProfile(parsed);
        setForm((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          phone: parsed.phone || prev.phone,
          email: parsed.email || prev.email,
          notes: parsed.dietaryNotes || prev.notes,
        }));
      } else if (user) {
        // Fallback to auth profile
        const email = user.email || "";
        const name = user.user_metadata?.full_name || email.split("@")[0] || "";
        setForm((prev) => ({ ...prev, name, email }));
      }
    } catch {}

    // 2. Load Customer's Existing Bookings
    loadCustomerBookings();

    const handleSync = () => loadCustomerBookings();
    window.addEventListener("nimza_reservation_updated", handleSync);
    return () => window.removeEventListener("nimza_reservation_updated", handleSync);
  }, [user]);

  const loadCustomerBookings = async () => {
    let localList: ReservationRecord[] = [];
    try {
      const stored = localStorage.getItem("nimza-my-reservations");
      if (stored) {
        localList = JSON.parse(stored);
      }
    } catch {}

    if (user?.id) {
      try {
        const { data, error } = await supabase
          .from("reservations")
          .select("*")
          .eq("user_id", user.id)
          .order("reserved_at", { ascending: false });

        if (!error && data && data.length > 0) {
          // Merge local & supabase
          const map = new Map<number, ReservationRecord>();
          localList.forEach((b) => map.set(b.id, b));
          data.forEach((b: any) => {
            map.set(b.id, {
              id: b.id,
              user_id: b.user_id,
              name: b.name || "VIP Guest",
              phone: b.phone || "",
              email: b.email || "",
              table_no: b.table_no || 1,
              guests: b.guests || 2,
              reserved_at: b.reserved_at,
              notes: b.notes || "",
              package_type: b.package_type || "standard",
              package_name: b.package_name || "Standard VIP Dining",
              package_price: Number(b.package_price || 0),
              status: (b.status as any) || "Confirmed",
              booking_type: (b.booking_type as any) || "table_reservation",
              qr_code: b.qr_code || `NIMZA-VIP-${b.id}`,
              reminder_opt_in: b.reminder_opt_in ?? true,
              waitlist_position: b.waitlist_position,
              created_at: b.created_at,
            });
          });
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.reserved_at).getTime() - new Date(a.reserved_at).getTime()
          );
          setBookings(merged);
          return;
        }
      } catch {}
    }

    if (localList.length > 0) {
      setBookings(localList);
    }
  };

  const selectedTable = RESTAURANT_TABLES.find((t) => t.no === form.table_no) || RESTAURANT_TABLES[2];
  const selectedPackage = DINING_PACKAGES.find((p) => p.id === form.package_id) || DINING_PACKAGES[0];

  // Calculate pricing
  const calculatePackageTotal = (pkg: CelebrationPackage, guests: number) => {
    if (pkg.priceType === "flat") return pkg.price;
    return pkg.price * guests;
  };

  const currentPackagePrice = calculatePackageTotal(selectedPackage, form.guests);

  // Check if chosen time slot is "Fully Booked" (Simulated capacity calculation)
  const isSlotFull = form.time === "20:30" && form.date === new Date().toISOString().slice(0, 10);

  // Save / Submit Reservation or Waitlist
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast("Please provide your full guest name", "error");
      return;
    }

    if (!/^[0-9+ ()-]{7,18}$/.test(form.phone.trim())) {
      toast("Please provide a valid contact number (7-15 digits)", "error");
      return;
    }

    setIsSubmitting(true);

    const reservationId = Math.floor(100000 + Math.random() * 900000);
    const qrToken = `NIMZA-VIP-${reservationId}`;

    const isWaitlisted = form.is_waitlist || isSlotFull;
    const waitlistRank = isWaitlisted ? bookings.filter((b) => b.status === "Waitlisted").length + 1 : undefined;

    const newBooking: ReservationRecord = {
      id: reservationId,
      user_id: user?.id || null,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      table_no: form.table_no,
      guests: form.guests,
      reserved_at: `${form.date}T${form.time}:00`,
      section: selectedTable.section,
      notes: form.notes.trim(),
      package_type: selectedPackage.id,
      package_name: selectedPackage.name,
      package_price: currentPackagePrice,
      status: isWaitlisted ? "Waitlisted" : "Confirmed",
      booking_type: activeTab === "packages" ? "event_booking" : "table_reservation",
      qr_code: qrToken,
      reminder_opt_in: form.reminder_opt_in,
      waitlist_position: waitlistRank,
      created_at: new Date().toISOString(),
    };

    // 1. Single-Registration Memory: Save user info so they NEVER have to re-register
    try {
      const profileToSave = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        dietaryNotes: form.notes.trim(),
      };
      localStorage.setItem("nimza_saved_guest_profile", JSON.stringify(profileToSave));
      setSavedProfile(profileToSave);
    } catch {}

    // 2. Persist to Supabase
    try {
      await supabase.from("reservations").insert({
        id: reservationId,
        user_id: user?.id || null,
        name: newBooking.name,
        phone: newBooking.phone,
        email: newBooking.email,
        table_no: newBooking.table_no,
        guests: newBooking.guests,
        reserved_at: newBooking.reserved_at,
        notes: newBooking.notes,
        package_type: newBooking.package_type,
        package_name: newBooking.package_name,
        package_price: newBooking.package_price,
        status: newBooking.status,
        booking_type: newBooking.booking_type,
        qr_code: newBooking.qr_code,
        reminder_opt_in: newBooking.reminder_opt_in,
        waitlist_position: newBooking.waitlist_position,
      });
    } catch {
      // Local fallback
    }

    // 3. Persist to localStorage
    const updated = [newBooking, ...bookings];
    setBookings(updated);
    try {
      localStorage.setItem("nimza-my-reservations", JSON.stringify(updated));
    } catch {}

    window.dispatchEvent(new Event("nimza_reservation_updated"));

    setIsSubmitting(false);

    if (isWaitlisted) {
      toast(
        `You have been added to the VIP Waitlist (Position #${waitlistRank}) for ${form.date} at ${form.time}!`,
        "info"
      );
    } else {
      toast(
        `Table #${form.table_no} Confirmed for ${form.name} on ${form.date} at ${form.time}!`,
        "success"
      );
    }

    // Automatically open the VIP Digital Pass for the newly created booking
    setSelectedPass(newBooking);
    setActiveTab("history");
  };

  // Modify Booking Handler
  const openModifyModal = (item: ReservationRecord) => {
    setModifyingItem(item);
    const datePart = item.reserved_at.slice(0, 10);
    const timePart = item.reserved_at.slice(11, 16);
    setModifyForm({
      date: datePart,
      time: timePart || "19:30",
      guests: item.guests,
      table_no: item.table_no,
      package_id: item.package_type || "standard",
      notes: item.notes || "",
    });
  };

  const handleSaveModification = async () => {
    if (!modifyingItem) return;

    const chosenPkg = DINING_PACKAGES.find((p) => p.id === modifyForm.package_id) || DINING_PACKAGES[0];
    const newPrice = calculatePackageTotal(chosenPkg, modifyForm.guests);
    const newDateTime = `${modifyForm.date}T${modifyForm.time}:00`;

    const updatedList = bookings.map((b) => {
      if (b.id === modifyingItem.id) {
        return {
          ...b,
          reserved_at: newDateTime,
          guests: modifyForm.guests,
          table_no: modifyForm.table_no,
          package_type: chosenPkg.id,
          package_name: chosenPkg.name,
          package_price: newPrice,
          notes: modifyForm.notes,
        };
      }
      return b;
    });

    setBookings(updatedList);
    try {
      localStorage.setItem("nimza-my-reservations", JSON.stringify(updatedList));
      await supabase
        .from("reservations")
        .update({
          reserved_at: newDateTime,
          guests: modifyForm.guests,
          table_no: modifyForm.table_no,
          package_type: chosenPkg.id,
          package_name: chosenPkg.name,
          package_price: newPrice,
          notes: modifyForm.notes,
        })
        .eq("id", modifyingItem.id);
    } catch {}

    window.dispatchEvent(new Event("nimza_reservation_updated"));
    toast(`Reservation #${modifyingItem.id} updated successfully!`, "success");
    setModifyingItem(null);
  };

  // Cancel Reservation Handler
  const handleConfirmCancel = async () => {
    if (!cancellingItem) return;

    const updatedList = bookings.map((b) => {
      if (b.id === cancellingItem.id) {
        return { ...b, status: "Cancelled" as const };
      }
      return b;
    });

    setBookings(updatedList);
    try {
      localStorage.setItem("nimza-my-reservations", JSON.stringify(updatedList));
      await supabase
        .from("reservations")
        .update({ status: "Cancelled" })
        .eq("id", cancellingItem.id);
    } catch {}

    window.dispatchEvent(new Event("nimza_reservation_updated"));
    toast(`Reservation #${cancellingItem.id} has been cancelled. Table released.`, "info");
    setCancellingItem(null);
  };

  // iCalendar (.ics) Generator
  const downloadCalendarInvite = (booking: ReservationRecord) => {
    const pad = (n: number) => (n < 10 ? "0" + n : n);
    const start = new Date(booking.reserved_at);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours sitting

    const formatIcsDate = (d: Date) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(
        d.getUTCMinutes()
      )}00Z`;

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Nimza Fine Dining//Table Reservation//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `SUMMARY:Nimza Fine Dining - Table #${booking.table_no} (${booking.package_name})`,
      `DESCRIPTION:Reservation Reference: ${booking.qr_code || booking.id}\\nGuest: ${booking.name}\\nParty Size: ${booking.guests} Guests\\nPackage: ${booking.package_name}\\nSmart Casual Attire. Grace Period: 15 Mins.`,
      "LOCATION:Nimza Fine Dining, Grand Boulevard 12, Budapest",
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Nimza-Reservation-${booking.id}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("Calendar invite (.ics) downloaded. Compatible with Apple, Google & Outlook!", "success");
  };

  // Test Reminder Dispatch Simulation
  const handleTestReminder = (booking: ReservationRecord) => {
    toast(
      `📲 Automatic Reminder Dispatched: "Dear ${booking.name}, your table #${booking.table_no} at Nimza is prepared for ${new Date(booking.reserved_at).toLocaleDateString()} at ${new Date(booking.reserved_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. We look forward to welcoming you."`,
      "success"
    );
  };

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-charcoal pt-32 pb-28 px-4 sm:px-6 md:px-12 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Luxury Header Banner */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8DAC2] bg-[#F5EDE0] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#8C6D2D] shadow-xs mb-3">
            <Sparkles size={14} className="text-[#B99A5B]" />
            <span>VIP Dining Concierge & Reservations</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-[#1F241F] tracking-tight">
            Reserve Your <span className="text-[#B99A5B]">Atmospheric</span> Evening
          </h1>

          <p className="mt-3 text-charcoal/70 text-sm sm:text-base font-sans max-w-xl mx-auto leading-relaxed">
            Experience our Michelin-praised dining halls, bespoke anniversary & birthday celebration packages, or join our priority VIP waitlist.
          </p>

          {/* Admin Table Floor Management Link */}
          {isAdmin && (
            <div className="mt-4 flex justify-center gap-3">
              <Link
                href="/admin/tables"
                className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-4 py-1.5 text-xs font-bold text-olive hover:bg-gold hover:text-charcoal transition-all shadow-xs"
              >
                <ShieldCheck size={14} className="text-gold" />
                <span>Admin Console: Live Table Availability & Floor Management ↗</span>
              </Link>
            </div>
          )}
        </div>

        {/* PRIMARY MODE SELECTOR TABS: Reservation vs Experience Packages vs Customer History */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-full bg-sand/40 border border-sand shadow-inner max-w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab("reservation")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "reservation"
                  ? "bg-[#1F241F] text-gold shadow-md"
                  : "text-charcoal/70 hover:text-charcoal"
              }`}
            >
              <CalendarCheck size={15} />
              <span>Table Reservation</span>
            </button>

            <button
              onClick={() => setActiveTab("packages")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "packages"
                  ? "bg-[#1F241F] text-gold shadow-md"
                  : "text-charcoal/70 hover:text-charcoal"
              }`}
            >
              <Gift size={15} />
              <span>Celebration Packages</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap relative ${
                activeTab === "history"
                  ? "bg-[#1F241F] text-gold shadow-md"
                  : "text-charcoal/70 hover:text-charcoal"
              }`}
            >
              <Clock size={15} />
              <span>My Reservations</span>
              {bookings.length > 0 && (
                <span className="rounded-full bg-gold text-[#1F241F] text-[10px] font-extrabold px-2 py-0.2 shadow-xs">
                  {bookings.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* TAB 1 & 2: TABLE RESERVATION & EXPERIENCE PACKAGES */}
        {activeTab !== "history" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Form Wizard & Package Selection */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 md:p-10 rounded-[2.5rem] border border-sand shadow-sm">
              {/* Single-Registration Memory Indicator */}
              {savedProfile && (
                <div className="mb-6 p-3.5 rounded-2xl bg-[#FAF9F5] border border-gold/30 flex items-center justify-between text-xs text-charcoal/80">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                    <span>
                      <strong className="text-[#1F241F]">VIP Profile Loaded:</strong> {savedProfile.name} ({savedProfile.phone})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, name: "", phone: "", email: "", notes: "" }));
                      toast("Guest fields cleared. Enter details for a new guest profile.", "info");
                    }}
                    className="text-[11px] font-bold text-gold hover:underline"
                  >
                    Change Guest
                  </button>
                </div>
              )}

              {/* Step Tabs for Table Reservation Flow */}
              {activeTab === "reservation" && (
                <div className="flex gap-2 p-1.5 rounded-full bg-sand/30 border border-sand mb-8">
                  <button
                    type="button"
                    onClick={() => setActiveStep("details")}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-1.5 ${
                      activeStep === "details"
                        ? "bg-[#1F241F] text-gold shadow-sm"
                        : "text-charcoal/70 hover:text-[#1F241F]"
                    }`}
                  >
                    <CalendarCheck size={14} />
                    <span>1. Date & Sitting</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveStep("table")}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-1.5 ${
                      activeStep === "table"
                        ? "bg-[#1F241F] text-gold shadow-sm"
                        : "text-charcoal/70 hover:text-[#1F241F]"
                    }`}
                  >
                    <Utensils size={14} />
                    <span>2. Select Table #{form.table_no}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveStep("package")}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-1.5 ${
                      activeStep === "package"
                        ? "bg-[#1F241F] text-gold shadow-sm"
                        : "text-charcoal/70 hover:text-[#1F241F]"
                    }`}
                  >
                    <Gift size={14} />
                    <span>3. Package</span>
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* FLOW A: PACKAGES TAB ACTIVE */}
                {activeTab === "packages" ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-olive">
                        Bespoke Dining & Celebration Packages
                      </h3>
                      <p className="text-xs text-charcoal/70 mt-1">
                        Select a curated culinary package. Our concierge team tailors the decor, cake, champagne, and menu for your occasion.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {DINING_PACKAGES.map((pkg) => {
                        const isSelected = form.package_id === pkg.id;
                        const Icon = pkg.icon;
                        return (
                          <div
                            key={pkg.id}
                            onClick={() => setForm({ ...form, package_id: pkg.id })}
                            className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                              isSelected
                                ? "bg-[#FAF9F5] border-gold ring-2 ring-gold shadow-md"
                                : "bg-white border-sand hover:border-gold/50"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 rounded-xl bg-gold/15 text-gold">
                                  <Icon size={20} />
                                </div>
                                <span className="rounded-full bg-gold/20 text-[#1F241F] text-[10px] font-bold px-2.5 py-0.5">
                                  {pkg.badge}
                                </span>
                              </div>

                              <h4 className="font-serif text-lg font-bold text-[#1F241F]">{pkg.name}</h4>
                              <p className="text-xs font-semibold text-gold mt-0.5">
                                {pkg.price === 0 ? "Complimentary" : `$${pkg.price} ${pkg.priceType === "per_guest" ? "/ guest" : "flat for 2"}`}
                              </p>
                              <p className="text-xs text-charcoal/70 mt-2 leading-relaxed">{pkg.description}</p>

                              <ul className="mt-4 space-y-1.5 border-t border-sand/40 pt-3">
                                {pkg.highlights.map((h, i) => (
                                  <li key={i} className="text-[11px] text-charcoal/80 flex items-start gap-1.5">
                                    <Check size={12} className="text-gold shrink-0 mt-0.5" />
                                    <span>{h}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setForm({ ...form, package_id: pkg.id });
                                setActiveStep("details");
                                setActiveTab("reservation");
                              }}
                              className={`mt-5 w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                                isSelected
                                  ? "bg-gold text-[#1F241F]"
                                  : "bg-sand/30 text-charcoal hover:bg-gold hover:text-charcoal"
                              }`}
                            >
                              {isSelected ? "Selected Package ✓" : "Select & Choose Table →"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* FLOW B: TABLE RESERVATION STEP WIZARD */
                  <>
                    {/* STEP 1: DATE, SITTING & GUEST PROFILE */}
                    {activeStep === "details" && (
                      <div className="space-y-6">
                        {/* Name & Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                              Lead Guest Full Name *
                            </label>
                            <div className="relative">
                              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
                              <input
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Lord Alexander Vance"
                                className="inp !pl-10 !text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                              Contact Phone (SMS Reminders) *
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

                        {/* Email & Reminder Notification Preference */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                              Email Address (Optional Confirmation)
                            </label>
                            <input
                              type="email"
                              value={form.email}
                              onChange={(e) => setForm({ ...form, email: e.target.value })}
                              placeholder="guest@example.com"
                              className="inp !text-sm"
                            />
                          </div>

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
                        </div>

                        {/* Party Size Selector */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70">
                              Party Size
                            </label>
                            <span className="text-xs text-charcoal/60">
                              For parties larger than 12, select Royal Salon (Table 12)
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setForm({ ...form, guests: Math.max(1, form.guests - 1) })}
                              className="grid h-11 w-11 place-items-center rounded-xl border border-sand bg-sand/30 hover:bg-gold hover:text-charcoal font-bold text-lg transition-all"
                            >
                              -
                            </button>
                            <div className="flex-1 text-center font-serif text-lg font-bold border border-sand rounded-xl py-2 bg-white">
                              {form.guests} {form.guests === 1 ? "Diner" : "Diners"}
                            </div>
                            <button
                              type="button"
                              onClick={() => setForm({ ...form, guests: Math.min(16, form.guests + 1) })}
                              className="grid h-11 w-11 place-items-center rounded-xl border border-sand bg-sand/30 hover:bg-gold hover:text-charcoal font-bold text-lg transition-all"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Sitting Times */}
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-2">
                            Choose Sitting Slot *
                          </label>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                            {TIME_SLOTS.map(({ time, session }) => {
                              const isSelected = form.time === time;
                              return (
                                <button
                                  type="button"
                                  key={time}
                                  onClick={() => setForm({ ...form, time })}
                                  className={`py-2 px-1.5 rounded-xl text-center transition-all ${
                                    isSelected
                                      ? "bg-[#1F241F] text-gold font-bold shadow-md ring-2 ring-gold scale-105"
                                      : "bg-white border border-sand text-charcoal hover:border-gold hover:text-gold"
                                  }`}
                                >
                                  <p className="text-xs font-bold">{time}</p>
                                  <p className="text-[9px] uppercase tracking-wider opacity-70 truncate">{session}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Fully Booked / Waitlist Banner Alert */}
                        {isSlotFull && (
                          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900">
                            <AlertCircle size={20} className="shrink-0 text-amber-600 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider">
                                Peak Sitting: All Tables Currently Occupied
                              </p>
                              <p className="text-xs mt-0.5">
                                You can join our <strong>Priority VIP Waitlist</strong>. If another party cancels, you will receive first notification and immediate table placement.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Automatic Booking Reminders Checkbox */}
                        <div className="p-3.5 rounded-2xl bg-sand/20 border border-sand flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <BellRing size={16} className="text-gold shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-[#1F241F]">Automatic Concierge Reminders</p>
                              <p className="text-[11px] text-charcoal/60">
                                Receive SMS & WhatsApp alert 24h & 2h before your dining sitting
                              </p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={form.reminder_opt_in}
                            onChange={(e) => setForm({ ...form, reminder_opt_in: e.target.checked })}
                            className="h-4 w-4 rounded border-sand text-gold focus:ring-gold"
                          />
                        </div>

                        {/* Special Occasion / Notes */}
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                            Dietary Requests or Celebration Notes
                          </label>
                          <textarea
                            rows={2}
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            placeholder="Allergies, birthday candle, anniversary cake inscription, window seating preference..."
                            className="inp resize-none !text-xs"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveStep("table")}
                          className="btn w-full !py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-md"
                        >
                          <span>Proceed to Select Table #{form.table_no}</span>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}

                    {/* STEP 2: SELECT TABLE FLOOR PLAN */}
                    {activeStep === "table" && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-serif text-xl font-bold text-olive">Interactive Floor Plan</h3>
                            <p className="text-xs text-charcoal/60 mt-0.5">
                              12 signature tables across 5 architectural dining zones. Tables held for 2 full hours.
                            </p>
                          </div>
                          <span className="text-xs font-bold text-gold uppercase tracking-wider bg-gold/15 px-3 py-1 rounded-full border border-gold/30">
                            Table #{form.table_no} Selected
                          </span>
                        </div>

                        {/* 12-Table Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                          {RESTAURANT_TABLES.map((t) => {
                            const isSelected = form.table_no === t.no;
                            return (
                              <button
                                type="button"
                                key={t.no}
                                onClick={() => setForm({ ...form, table_no: t.no })}
                                className={`p-4 rounded-2xl border text-left transition-all ${
                                  isSelected
                                    ? "bg-[#FAF9F5] border-gold ring-2 ring-gold shadow-md"
                                    : "bg-white border-sand hover:border-gold/60"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-serif text-base font-bold text-olive">
                                    Table #{t.no}
                                  </span>
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-sand/40 text-charcoal/70 px-2 py-0.5 rounded-full border border-sand">
                                    Up to {t.cap} Guests
                                  </span>
                                </div>
                                <p className="text-xs font-bold text-[#1F241F]">{t.section}</p>
                                <p className="text-[11px] text-charcoal/60 mt-1 line-clamp-2">{t.desc}</p>
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setActiveStep("details")}
                            className="btn-d !py-3 !px-5 text-xs font-bold"
                          >
                            ← Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveStep("package")}
                            className="btn flex-1 !py-3 text-sm font-bold flex items-center justify-center gap-2"
                          >
                            <span>Continue to Package Add-ons</span>
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: CELEBRATION PACKAGES ADD-ON */}
                    {activeStep === "package" && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-serif text-xl font-bold text-olive">Enhance Your Evening</h3>
                          <p className="text-xs text-charcoal/60 mt-0.5">
                            Celebrate milestone birthdays, romantic anniversaries, or choose chef tasting menus.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {DINING_PACKAGES.map((pkg) => {
                            const isSelected = form.package_id === pkg.id;
                            const Icon = pkg.icon;
                            return (
                              <button
                                type="button"
                                key={pkg.id}
                                onClick={() => setForm({ ...form, package_id: pkg.id })}
                                className={`p-4 rounded-2xl border text-left transition-all ${
                                  isSelected
                                    ? "bg-[#FAF9F5] border-gold ring-2 ring-gold shadow-md"
                                    : "bg-white border-sand hover:border-gold/50"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Icon size={16} className="text-gold" />
                                    <span className="font-serif font-bold text-sm text-[#1F241F]">{pkg.name}</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-gold">
                                    {pkg.price === 0 ? "Free" : `$${pkg.price}`}
                                  </span>
                                </div>
                                <p className="text-[11px] text-charcoal/70 line-clamp-2">{pkg.description}</p>
                              </button>
                            );
                          })}
                        </div>

                        {/* Waitlist Toggle (If user wishes to waitlist or if tables full) */}
                        <div className="p-4 rounded-2xl bg-sand/30 border border-sand flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-[#1F241F]">Join Priority VIP Waitlist</p>
                            <p className="text-[11px] text-charcoal/60">
                              Check this if you want to be placed in the queue for a preferred window
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={form.is_waitlist}
                            onChange={(e) => setForm({ ...form, is_waitlist: e.target.checked })}
                            className="h-4 w-4 rounded border-sand text-gold focus:ring-gold"
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setActiveStep("table")}
                            className="btn-d !py-3 !px-5 text-xs font-bold"
                          >
                            ← Back
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn flex-1 !py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-gold/20"
                          >
                            <CalendarCheck size={16} />
                            <span>
                              {isSubmitting
                                ? "Securing Table..."
                                : form.is_waitlist
                                ? "Join VIP Waitlist Queue"
                                : `Confirm Table #${form.table_no} Reservation`}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </form>
            </div>

            {/* Right 5 Columns: Live Gold VIP Boarding Pass Summary */}
            <div className="lg:col-span-5 space-y-6">
              {/* Gold Luxury Ticket Pass */}
              <div className="rounded-[2.5rem] bg-[#1F241F] text-ivory p-7 md:p-9 border-2 border-gold/40 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-gold/15 blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-gold/20 pb-4 mb-5">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-gold font-bold">
                      Digital VIP Boarding Pass
                    </span>
                    <h3 className="font-serif text-xl font-bold text-ivory mt-0.5">Nimza Gastronomy</h3>
                  </div>
                  <NimzaLogo variant="circle" size="sm" />
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-sand/70 flex items-center gap-1.5">
                      <User size={13} className="text-gold" />
                      <span>Lead Guest</span>
                    </span>
                    <span className="font-serif text-sm font-bold text-ivory">
                      {form.name || "Awaiting Guest Name"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sand/70 flex items-center gap-1.5">
                      <Clock size={13} className="text-gold" />
                      <span>Sitting Time</span>
                    </span>
                    <span className="font-bold text-gold">
                      {form.date} at {form.time}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sand/70 flex items-center gap-1.5">
                      <Utensils size={13} className="text-gold" />
                      <span>Table Allocation</span>
                    </span>
                    <span className="font-serif font-bold text-ivory">
                      Table #{form.table_no} ({selectedTable.section})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sand/70 flex items-center gap-1.5">
                      <Users size={13} className="text-gold" />
                      <span>Party Count</span>
                    </span>
                    <span className="font-bold text-ivory">{form.guests} Guests</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sand/70 flex items-center gap-1.5">
                      <Gift size={13} className="text-gold" />
                      <span>Dining Package</span>
                    </span>
                    <span className="font-bold text-gold">{selectedPackage.name}</span>
                  </div>

                  {selectedPackage.price > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-gold/20">
                      <span className="text-sand/70">Package Total</span>
                      <span className="font-serif font-bold text-base text-gold">
                        ${currentPackagePrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Scannable Preview QR Section */}
                <div className="mt-6 pt-5 border-t border-dashed border-gold/30 flex items-center gap-4">
                  <QRCodeSvg
                    value={`NIMZA-VIP-RESERVATION | ${form.name || "GUEST"} | Table #${form.table_no} | ${form.date} ${form.time}`}
                    size={80}
                    className="p-1.5 rounded-xl border border-gold/40 shadow-inner"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gold block">
                      Concierge Scan Check-in
                    </span>
                    <p className="text-[11px] text-sand/70 mt-0.5 leading-snug">
                      Present your digital QR pass upon arrival at the host podium for immediate seating.
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gold/20 flex items-center justify-between text-[10px] text-sand/60">
                  <span>Grace Period: 15 Mins</span>
                  <span>Dress Code: Smart Casual</span>
                </div>
              </div>

              {/* Direct Link to My Reservations */}
              {bookings.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("history")}
                  className="w-full p-4 rounded-2xl bg-white border border-sand hover:border-gold transition-all flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-gold" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-[#1F241F]">
                        View My Reservation Ledger ({bookings.length})
                      </p>
                      <p className="text-[11px] text-charcoal/60">
                        Access scannable QR passes, reminders & modification tools
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gold" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* TAB 3: CUSTOMER RESERVATION HISTORY & ACTIVE PASSES */
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand">
              <div>
                <h3 className="font-serif text-2xl font-bold text-olive flex items-center gap-2">
                  <Clock size={22} className="text-gold" />
                  <span>Your VIP Reservation Ledger</span>
                </h3>
                <p className="text-xs text-charcoal/60 mt-0.5">
                  Review all your past and upcoming tables, export calendar invites, download QR passes, or modify/cancel bookings.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("reservation")}
                className="btn !py-2.5 !px-5 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
              >
                <CalendarCheck size={14} />
                <span>Book Another Table +</span>
              </button>
            </div>

            {bookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-sand">
                <CalendarCheck size={40} className="text-gold mx-auto mb-3 opacity-60" />
                <h4 className="font-serif text-lg font-bold text-[#1F241F]">No Reservations Found</h4>
                <p className="text-xs text-charcoal/60 max-w-sm mx-auto mt-1">
                  You haven't placed any table reservations yet. Select your preferred date to reserve your evening.
                </p>
                <button
                  onClick={() => setActiveTab("reservation")}
                  className="btn mt-5 !py-2.5 !px-6 text-xs font-bold"
                >
                  Reserve a Table Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => {
                  const isCancelled = b.status === "Cancelled";
                  const isWaitlist = b.status === "Waitlisted";

                  return (
                    <div
                      key={b.id}
                      className={`p-6 rounded-3xl bg-white border transition-all ${
                        isCancelled
                          ? "border-sand/60 opacity-60"
                          : isWaitlist
                          ? "border-amber-200 bg-amber-50/20"
                          : "border-sand hover:border-gold/50 shadow-sm"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          {/* Mini QR Pass button */}
                          <button
                            type="button"
                            onClick={() => setSelectedPass(b)}
                            className="p-2.5 rounded-2xl bg-sand/30 border border-sand hover:border-gold hover:bg-gold/10 transition-all shrink-0 text-center"
                          >
                            <QrCode size={28} className="text-olive mx-auto" />
                            <span className="text-[9px] font-bold text-gold uppercase tracking-wider block mt-1">
                              View QR
                            </span>
                          </button>

                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-serif font-bold text-lg text-olive">
                                {new Date(b.reserved_at).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                              <span className="text-xs font-bold text-gold">
                                at{" "}
                                {new Date(b.reserved_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>

                              {/* Status Badge */}
                              <span
                                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                  isCancelled
                                    ? "bg-rose-100 text-rose-800"
                                    : isWaitlist
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {isWaitlist ? `Waitlist (Pos #${b.waitlist_position || 1})` : b.status}
                              </span>

                              {/* Package Badge */}
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold/15 text-gold-dark border border-gold/30">
                                {b.package_name || "Standard VIP"}
                              </span>
                            </div>

                            <p className="text-xs text-charcoal/70">
                              <strong>Lead Guest:</strong> {b.name} • <strong>Table:</strong> #{b.table_no} (
                              {b.section || "Window Terrace"}) • <strong>Party:</strong> {b.guests} Guests
                            </p>

                            {b.notes && (
                              <p className="text-[11px] text-charcoal/60 italic mt-1">
                                &ldquo;{b.notes}&rdquo;
                              </p>
                            )}

                            {b.reminder_opt_in && (
                              <p className="text-[10px] text-emerald-700 flex items-center gap-1 mt-1 font-medium">
                                <CheckCircle2 size={11} /> Automatic 24h & 2h concierge reminder active
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons: Pass, Calendar, Modify, Cancel */}
                        <div className="flex flex-wrap items-center gap-2 md:self-center">
                          <button
                            type="button"
                            onClick={() => setSelectedPass(b)}
                            className="btn !py-2 !px-3.5 text-xs font-bold flex items-center gap-1"
                          >
                            <QrCode size={13} />
                            <span>Digital Pass</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => downloadCalendarInvite(b)}
                            className="btn-o !py-2 !px-3 text-xs font-bold flex items-center gap-1"
                            title="Export to Calendar (.ics)"
                          >
                            <Calendar size={13} className="text-gold" />
                            <span>Add to Calendar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTestReminder(b)}
                            className="btn-o !py-2 !px-3 text-xs font-bold flex items-center gap-1"
                            title="Test automated SMS/Email reminder notification"
                          >
                            <BellRing size={13} className="text-gold" />
                            <span>Remind</span>
                          </button>

                          {!isCancelled && (
                            <>
                              <button
                                type="button"
                                onClick={() => openModifyModal(b)}
                                className="p-2 rounded-xl border border-sand hover:border-gold hover:text-gold text-charcoal transition-all"
                                title="Modify Reservation"
                              >
                                <Edit3 size={15} />
                              </button>

                              <button
                                type="button"
                                onClick={() => setCancellingItem(b)}
                                className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all"
                                title="Cancel Reservation"
                              >
                                <XCircle size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MODAL 1: DIGITAL VIP BOARDING PASS WITH SCANNABLE QR CODE */}
        <AnimatePresence>
          {selectedPass && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedPass(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="w-full max-w-md rounded-[2.5rem] bg-[#1F241F] text-ivory border-2 border-gold/40 shadow-2xl p-6 sm:p-8 relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedPass(null)}
                  className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-sand hover:bg-gold hover:text-charcoal transition-all"
                >
                  <X size={16} />
                </button>

                <div className="text-center mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gold block">
                    Verified Digital Ticket
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-ivory mt-0.5">Nimza Gastronomy</h3>
                  <p className="text-xs text-sand/70">Reservation Pass #{selectedPass.qr_code || selectedPass.id}</p>
                </div>

                {/* Scannable Center QR Code */}
                <div className="flex justify-center mb-6">
                  <QRCodeSvg
                    value={`NIMZA-VIP-PASS | REF:${selectedPass.qr_code || selectedPass.id} | GUEST:${selectedPass.name} | TABLE:${selectedPass.table_no} | DATE:${selectedPass.reserved_at} | STATUS:${selectedPass.status}`}
                    size={175}
                    className="p-3 rounded-2xl bg-white border-2 border-gold shadow-lg"
                  />
                </div>

                {/* Pass Details */}
                <div className="space-y-2.5 text-xs bg-[#151915] p-4 rounded-2xl border border-gold/20 mb-6">
                  <div className="flex justify-between">
                    <span className="text-sand/70">Lead Guest</span>
                    <span className="font-bold text-ivory">{selectedPass.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sand/70">Date & Time</span>
                    <span className="font-bold text-gold">
                      {new Date(selectedPass.reserved_at).toLocaleDateString()} at{" "}
                      {new Date(selectedPass.reserved_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sand/70">Table Allocation</span>
                    <span className="font-bold text-ivory">Table #{selectedPass.table_no}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sand/70">Party Count</span>
                    <span className="font-bold text-ivory">{selectedPass.guests} Diners</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sand/70">Package</span>
                    <span className="font-bold text-gold">{selectedPass.package_name || "Standard VIP"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sand/70">Status</span>
                    <span className="font-bold text-emerald-400">{selectedPass.status}</span>
                  </div>
                </div>

                {/* Pass Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => downloadCalendarInvite(selectedPass)}
                    className="btn !bg-gold !text-[#1F241F] hover:!bg-gold-light !py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Calendar size={14} />
                    <span>Save to Calendar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.print();
                    }}
                    className="btn-o !py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 text-sand border-sand/40 hover:border-gold"
                  >
                    <Download size={14} className="text-gold" />
                    <span>Print / Save Pass</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL 2: MODIFY RESERVATION MODAL */}
        <AnimatePresence>
          {modifyingItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setModifyingItem(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="w-full max-w-lg rounded-[2.5rem] bg-white p-6 sm:p-8 border border-sand shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-sand">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-olive">
                      Modify Reservation #{modifyingItem.id}
                    </h3>
                    <p className="text-xs text-charcoal/60">Update schedule, table, guests, or notes</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModifyingItem(null)}
                    className="p-2 rounded-full hover:bg-sand/30"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-charcoal/70 mb-1">New Date</label>
                      <input
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                        value={modifyForm.date}
                        onChange={(e) => setModifyForm({ ...modifyForm, date: e.target.value })}
                        className="inp !text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-charcoal/70 mb-1">Sitting Time</label>
                      <select
                        value={modifyForm.time}
                        onChange={(e) => setModifyForm({ ...modifyForm, time: e.target.value })}
                        className="inp !text-xs cursor-pointer"
                      >
                        {TIME_SLOTS.map(({ time }) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-charcoal/70 mb-1">Party Size</label>
                      <input
                        type="number"
                        min={1}
                        max={16}
                        value={modifyForm.guests}
                        onChange={(e) =>
                          setModifyForm({ ...modifyForm, guests: parseInt(e.target.value) || 2 })
                        }
                        className="inp !text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-charcoal/70 mb-1">Table Allocation</label>
                      <select
                        value={modifyForm.table_no}
                        onChange={(e) =>
                          setModifyForm({ ...modifyForm, table_no: parseInt(e.target.value) || 1 })
                        }
                        className="inp !text-xs cursor-pointer"
                      >
                        {RESTAURANT_TABLES.map((t) => (
                          <option key={t.no} value={t.no}>
                            Table #{t.no} ({t.section} - {t.cap}p)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal/70 mb-1">Celebration Package</label>
                    <select
                      value={modifyForm.package_id}
                      onChange={(e) => setModifyForm({ ...modifyForm, package_id: e.target.value })}
                      className="inp !text-xs cursor-pointer"
                    >
                      {DINING_PACKAGES.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} {pkg.price > 0 ? `($${pkg.price})` : "(Free)"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal/70 mb-1">Special Notes</label>
                    <textarea
                      rows={2}
                      value={modifyForm.notes}
                      onChange={(e) => setModifyForm({ ...modifyForm, notes: e.target.value })}
                      className="inp !text-xs resize-none"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModifyingItem(null)}
                    className="btn-d flex-1 !py-2.5 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveModification}
                    className="btn flex-1 !py-2.5 text-xs font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL 3: CANCEL CONFIRMATION MODAL */}
        <AnimatePresence>
          {cancellingItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setCancellingItem(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="w-full max-w-sm rounded-[2rem] bg-white p-6 border border-sand shadow-2xl text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600 mx-auto mb-3">
                  <XCircle size={28} />
                </div>
                <h4 className="font-serif text-lg font-bold text-olive">Release Table #{cancellingItem.table_no}?</h4>
                <p className="text-xs text-charcoal/70 mt-1 leading-relaxed">
                  Are you sure you want to cancel your reservation for <strong>{cancellingItem.name}</strong> on{" "}
                  <strong>{new Date(cancellingItem.reserved_at).toLocaleDateString()}</strong>? This table will immediately be released to waitlisted diners.
                </p>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCancellingItem(null)}
                    className="btn-d flex-1 !py-2.5 text-xs font-bold"
                  >
                    Keep Table
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCancel}
                    className="btn !bg-rose-600 hover:!bg-rose-700 !text-white flex-1 !py-2.5 text-xs font-bold"
                  >
                    Cancel Booking
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
