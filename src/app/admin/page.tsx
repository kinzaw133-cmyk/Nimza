"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  ChefHat,
  ShoppingBag,
  CalendarCheck,
  TrendingUp,
  Clock,
  Flame,
  CheckCircle2,
  Users,
  Layers,
  ArrowRight,
  RefreshCw,
  Sparkles,
  CreditCard,
  Banknote,
  Smartphone,
  Landmark,
  ShieldCheck,
  ShieldAlert,
  Volume2,
  ExternalLink,
  Plus,
  Compass,
  Activity,
  XCircle,
  AlertCircle,
  Trash2,
  Radio,
  Eye,
  Star,
  Boxes,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { toast } from "@/lib/notify";
import NimzaLogo, { NimzaBowlSvg } from "@/components/NimzaLogo";

interface OrderItem {
  quantity: number;
  menu_items?: {
    name: string;
    price: number;
  };
}

interface Order {
  id: number;
  created_at?: string;
  customer_name?: string;
  table_no?: number;
  total: number;
  status: "Pending" | "Preparing" | "Ready" | "Delivered" | "Cancelled";
  payment_method?: "cash" | "card" | "wallet" | "transfer";
  order_items?: OrderItem[];
}

interface Reservation {
  id: number;
  name: string;
  phone?: string;
  guests: number;
  table_no?: number;
  reserved_at?: string;
  notes?: string;
  status?: string;
}

interface ActivityEvent {
  id: string;
  type: "order" | "status" | "reservation" | "cancel" | "user";
  title: string;
  description: string;
  timestamp: string;
  badge: string;
  badgeColor: string;
}

const SAMPLE_ORDERS: Order[] = [
  {
    id: 1042,
    created_at: new Date(Date.now() - 6 * 60000).toISOString(),
    customer_name: "Lord Sterling",
    table_no: 3,
    total: 82.0,
    status: "Pending",
    payment_method: "card",
    order_items: [
      { quantity: 2, menu_items: { name: "Truffle Tagliatelle", price: 18.0 } },
      { quantity: 1, menu_items: { name: "Prime Ribeye 45-Day", price: 46.0 } },
    ],
  },
  {
    id: 1041,
    created_at: new Date(Date.now() - 14 * 60000).toISOString(),
    customer_name: "Countess Elena",
    table_no: 7,
    total: 64.0,
    status: "Preparing",
    payment_method: "wallet",
    order_items: [
      { quantity: 1, menu_items: { name: "Burrata & Heirloom Fig", price: 16.0 } },
      { quantity: 2, menu_items: { name: "Pan-Seared Scottish Salmon", price: 24.0 } },
    ],
  },
  {
    id: 1040,
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    customer_name: "Ambassador Vance",
    table_no: 11,
    total: 98.0,
    status: "Ready",
    payment_method: "transfer",
    order_items: [
      { quantity: 2, menu_items: { name: "Prime Ribeye 45-Day", price: 46.0 } },
      { quantity: 1, menu_items: { name: "Valrhona Chocolate Fondant", price: 14.0 } },
    ],
  },
  {
    id: 1039,
    created_at: new Date(Date.now() - 48 * 60000).toISOString(),
    customer_name: "Sophia Delacroix",
    table_no: 2,
    total: 39.0,
    status: "Delivered",
    payment_method: "cash",
    order_items: [
      { quantity: 1, menu_items: { name: "Truffle Tagliatelle", price: 18.0 } },
      { quantity: 1, menu_items: { name: "Citrus Amalfi Spritz", price: 9.0 } },
      { quantity: 1, menu_items: { name: "Traditional Tiramisu", price: 12.0 } },
    ],
  },
];

const INITIAL_TABLES = [
  { no: 1, seats: 2, section: "Window Terrace", status: "Occupied", guest: "Table 1 (2 guests)" },
  { no: 2, seats: 2, section: "Window Terrace", status: "Delivered", guest: "Sophia Delacroix" },
  { no: 3, seats: 4, section: "Window Terrace", status: "Occupied", guest: "Lord Sterling" },
  { no: 4, seats: 4, section: "Window Terrace", status: "Available", guest: "Ready for Seating" },
  { no: 5, seats: 4, section: "Central Hearth", status: "Available", guest: "Ready for Seating" },
  { no: 6, seats: 6, section: "Central Hearth", status: "Reserved", guest: "Dr. Alistair (19:30)" },
  { no: 7, seats: 4, section: "Central Hearth", status: "Occupied", guest: "Countess Elena" },
  { no: 8, seats: 6, section: "Central Hearth", status: "Available", guest: "Ready for Seating" },
  { no: 9, seats: 8, section: "Private Wine Alcove", status: "Reserved", guest: "Baron Von Essen (20:00)" },
  { no: 10, seats: 6, section: "Private Wine Alcove", status: "Available", guest: "Ready for Seating" },
  { no: 11, seats: 8, section: "Chef's Table VIP", status: "Occupied", guest: "Ambassador Vance" },
  { no: 12, seats: 10, section: "Royal Salon", status: "Reserved", guest: "Diplomatic Suite (20:30)" },
];

export default function AdminDashboardPage() {
  const { user, role, loading, isAdmin } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [menuCount, setMenuCount] = useState({ items: 14, categories: 4 });
  const [activityFilter, setActivityFilter] = useState<"all" | "orders" | "reservations" | "cancellations">("all");
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([
    {
      id: "act-1",
      type: "order",
      title: "New Culinary Ticket #1042",
      description: "Lord Sterling placed an order for Table 3 ($82.00) via Card",
      timestamp: "6m ago",
      badge: "Order Placed",
      badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
    },
    {
      id: "act-2",
      type: "status",
      title: "Kitchen Station Advance",
      description: "Chef brigade moved Ticket #1041 to Over Flame (Preparing)",
      timestamp: "14m ago",
      badge: "Cooking",
      badgeColor: "bg-orange-100 text-orange-900 border-orange-300",
    },
    {
      id: "act-3",
      type: "reservation",
      title: "VIP Table Booking Confirmed",
      description: "Dr. Alistair Finch reserved Table 6 for 4 guests (Tonight, 19:30)",
      timestamp: "28m ago",
      badge: "Booking",
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    },
    {
      id: "act-4",
      type: "status",
      title: "Plate Plated on Marble Pass",
      description: "Ambassador Vance's order #1040 is Ready to Serve at Table 11",
      timestamp: "35m ago",
      badge: "Ready",
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    },
  ]);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      let dbOrders: any[] | null = null;
      let dbRes: any[] | null = null;
      let itemsCount: number | null = 14;
      let catCount: number | null = 4;

      if (isSupabaseConfigured) {
        // Parallelized fetch for maximum performance (0ms delay)
        const [ordersRes, resRes, itemsRes, catRes] = await Promise.all([
          supabase
            .from("orders")
            .select("*,order_items(quantity,menu_items(name,price))")
            .order("id", { ascending: false })
            .limit(30),
          supabase
            .from("reservations")
            .select("*")
            .order("reserved_at", { ascending: true })
            .limit(30),
          supabase.from("menu_items").select("*", { count: "exact", head: true }),
          supabase.from("categories").select("*", { count: "exact", head: true }),
        ]);

        dbOrders = ordersRes.data;
        dbRes = resRes.data;
        itemsCount = itemsRes.count;
        catCount = catRes.count;
      }

      if (itemsCount !== null && catCount !== null) {
        setMenuCount({
          items: itemsCount || 14,
          categories: catCount || 4,
        });
      }

      // Read local storage placed orders
      let localOrders: Order[] = [];
      try {
        localOrders = JSON.parse(localStorage.getItem("nimza_placed_orders") || "[]");
      } catch {}

      const mergedMap = new Map<number, Order>();
      SAMPLE_ORDERS.forEach((o) => mergedMap.set(o.id, o));
      localOrders.forEach((o) => mergedMap.set(o.id, o));
      (dbOrders || []).forEach((o: any) => mergedMap.set(o.id, o));

      setOrders(Array.from(mergedMap.values()).sort((a, b) => b.id - a.id));

      if (dbRes && dbRes.length > 0) {
        setReservations(dbRes);
      } else {
        setReservations([
          {
            id: 1,
            name: "Dr. Alistair Finch",
            guests: 4,
            table_no: 6,
            reserved_at: "Today, 19:30",
            phone: "+92 300 1122334",
            notes: "Anniversary dinner, window view requested.",
          },
          {
            id: 2,
            name: "Baron Von Essen",
            guests: 6,
            table_no: 9,
            reserved_at: "Today, 20:00",
            phone: "+92 321 9988776",
            notes: "Sommelier pairing with dry aged cuts.",
          },
          {
            id: 3,
            name: "Diplomatic Suite delegation",
            guests: 8,
            table_no: 12,
            reserved_at: "Today, 20:30",
            phone: "+92 333 4455667",
            notes: "Private security clearance confirmed.",
          },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Setup Supabase Realtime for instant updates and live activity tracking
    const ordersChan = supabase
      .channel("admin-central-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload: any) => {
        loadData();

        if (payload.eventType === "INSERT") {
          const newEvt: ActivityEvent = {
            id: "evt-" + Date.now(),
            type: "order",
            title: `New Order #${payload.new.id}`,
            description: `Table ${payload.new.table_no || "Takeaway"} placed order ($${Number(payload.new.total || 0).toFixed(2)})`,
            timestamp: "Just now",
            badge: "Order Placed",
            badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
          };
          setActivityFeed((prev) => [newEvt, ...prev.slice(0, 24)]);
          playChime();
        } else if (payload.eventType === "UPDATE") {
          const isCancel = payload.new.status === "Cancelled";
          const newEvt: ActivityEvent = {
            id: "evt-" + Date.now(),
            type: isCancel ? "cancel" : "status",
            title: isCancel ? `Order #${payload.new.id} Cancelled` : `Order #${payload.new.id} Updated`,
            description: isCancel
              ? `Kitchen ticket #${payload.new.id} cancelled`
              : `Status advanced to: ${payload.new.status}`,
            timestamp: "Just now",
            badge: isCancel ? "Cancelled" : payload.new.status,
            badgeColor: isCancel
              ? "bg-rose-100 text-rose-900 border-rose-300"
              : "bg-emerald-100 text-emerald-900 border-emerald-300",
          };
          setActivityFeed((prev) => [newEvt, ...prev.slice(0, 24)]);
        }
      })
      .subscribe();

    const resChan = supabase
      .channel("admin-central-reservations")
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, (payload: any) => {
        loadData();

        if (payload.eventType === "INSERT") {
          const newEvt: ActivityEvent = {
            id: "evt-" + Date.now(),
            type: "reservation",
            title: `New Booking: ${payload.new.name || "VIP Guest"}`,
            description: `${payload.new.guests || 2} guests at Table ${payload.new.table_no || "Allocated"}`,
            timestamp: "Just now",
            badge: "Reservation",
            badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
          };
          setActivityFeed((prev) => [newEvt, ...prev.slice(0, 24)]);
          playChime();
        } else if (payload.eventType === "DELETE") {
          const newEvt: ActivityEvent = {
            id: "evt-" + Date.now(),
            type: "cancel",
            title: "Reservation Cancelled",
            description: "Table booking was cancelled by administrator",
            timestamp: "Just now",
            badge: "Booking Cancelled",
            badgeColor: "bg-rose-100 text-rose-900 border-rose-300",
          };
          setActivityFeed((prev) => [newEvt, ...prev.slice(0, 24)]);
        }
      })
      .subscribe();

    const handleLocal = () => loadData();
    window.addEventListener("storage", handleLocal);
    window.addEventListener("nimza_order_created", handleLocal);

    return () => {
      supabase.removeChannel(ordersChan);
      supabase.removeChannel(resChan);
      window.removeEventListener("storage", handleLocal);
      window.removeEventListener("nimza_order_created", handleLocal);
    };
  }, []);

  // 1-Click Status Progression Handler
  const handleAdvanceStatus = async (orderId: number, currentStatus: string) => {
    const nextMap: Record<string, "Preparing" | "Ready" | "Delivered"> = {
      Pending: "Preparing",
      Preparing: "Ready",
      Ready: "Delivered",
    };

    const next = nextMap[currentStatus];
    if (!next) return;

    try {
      await supabase.from("orders").update({ status: next }).eq("id", orderId);
    } catch {}

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: next } : o))
    );

    // Update localStorage
    try {
      const stored = JSON.parse(localStorage.getItem("nimza_placed_orders") || "[]");
      const updated = stored.map((o: any) =>
        o.id === orderId ? { ...o, status: next } : o
      );
      localStorage.setItem("nimza_placed_orders", JSON.stringify(updated));
    } catch {}

    // Broadcast event across windows
    window.dispatchEvent(
      new CustomEvent("nimza_order_updated", {
        detail: { orderId, status: next },
      })
    );

    // Add to activity stream
    const newEvt: ActivityEvent = {
      id: "evt-" + Date.now(),
      type: "status",
      title: `Order #${orderId} Advanced`,
      description: `Administrator moved kitchen stage to: ${next}`,
      timestamp: "Just now",
      badge: next,
      badgeColor: next === "Preparing"
        ? "bg-orange-100 text-orange-900 border-orange-300"
        : next === "Ready"
        ? "bg-emerald-100 text-emerald-900 border-emerald-300"
        : "bg-olive text-gold border-gold/40",
    };
    setActivityFeed((prev) => [newEvt, ...prev.slice(0, 24)]);

    playChime();
    toast(`Order #${orderId} moved to ${next}!`, "success");
  };

  // Admin Access: Cancel Any Order
  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm(`Cancel Order #${orderId}? This will remove it from the active kitchen pass.`)) return;

    try {
      await supabase.from("orders").update({ status: "Cancelled" }).eq("id", orderId);
    } catch {}

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "Cancelled" as any } : o))
    );

    try {
      const stored = JSON.parse(localStorage.getItem("nimza_placed_orders") || "[]");
      const updated = stored.map((o: any) =>
        o.id === orderId ? { ...o, status: "Cancelled" } : o
      );
      localStorage.setItem("nimza_placed_orders", JSON.stringify(updated));
    } catch {}

    window.dispatchEvent(
      new CustomEvent("nimza_order_updated", {
        detail: { orderId, status: "Cancelled" },
      })
    );

    // Add cancellation to activity stream
    const newEvt: ActivityEvent = {
      id: "evt-" + Date.now(),
      type: "cancel",
      title: `Order #${orderId} Cancelled`,
      description: `Administrator cancelled kitchen ticket #${orderId}`,
      timestamp: "Just now",
      badge: "Cancelled",
      badgeColor: "bg-rose-100 text-rose-900 border-rose-300",
    };
    setActivityFeed((prev) => [newEvt, ...prev.slice(0, 24)]);

    playChime();
    toast(`Order #${orderId} was cancelled by Admin`, "info");
  };

  // Admin Access: Cancel Any Reservation
  const handleCancelReservation = async (resId: number, name?: string, tableNo?: number) => {
    if (!window.confirm(`Cancel VIP booking for ${name || "esteemed guest"}?`)) return;

    try {
      await supabase.from("reservations").delete().eq("id", resId);
    } catch {}

    setReservations((prev) => prev.filter((r) => r.id !== resId));

    // Add cancellation to activity stream
    const newEvt: ActivityEvent = {
      id: "evt-" + Date.now(),
      type: "cancel",
      title: `Booking Cancelled: ${name || "Guest"}`,
      description: `Administrator cancelled reservation at Table ${tableNo || "Reserved"}`,
      timestamp: "Just now",
      badge: "Cancelled",
      badgeColor: "bg-rose-100 text-rose-900 border-rose-300",
    };
    setActivityFeed((prev) => [newEvt, ...prev.slice(0, 24)]);

    playChime();
    toast(`Reservation for ${name || "guest"} cancelled`, "info");
  };

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  const toggleTableStatus = (tableNo: number) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.no !== tableNo) return t;
        const cycle = {
          Available: "Occupied",
          Occupied: "Reserved",
          Reserved: "Available",
        } as const;
        const nextStatus = cycle[t.status as keyof typeof cycle] || "Available";
        return {
          ...t,
          status: nextStatus,
          guest:
            nextStatus === "Available"
              ? "Ready for Seating"
              : nextStatus === "Occupied"
              ? `Walk-in Guest (${t.seats} seats)`
              : "Reserved Party",
        };
      })
    );
    toast(`Table ${tableNo} updated`, "info");
  };

  // Metrics calculations
  const pendingOrders = orders.filter((o) => o.status === "Pending");
  const preparingOrders = orders.filter((o) => o.status === "Preparing");
  const readyOrders = orders.filter((o) => o.status === "Ready");
  const deliveredOrders = orders.filter((o) => o.status === "Delivered");
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const activeTablesCount = tables.filter((t) => t.status !== "Available").length;

  const filteredOrders =
    filterStatus === "All"
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  const paymentIcon = (pm?: string) => {
    switch (pm) {
      case "card":
        return <CreditCard size={13} className="text-blue-600" />;
      case "wallet":
        return <Smartphone size={13} className="text-emerald-600" />;
      case "transfer":
        return <Landmark size={13} className="text-purple-600" />;
      default:
        return <Banknote size={13} className="text-amber-700" />;
    }
  };

  return (
    <div className="text-charcoal p-5 sm:p-8 lg:p-10 selection:bg-gold/20">
      <div className="mx-auto max-w-7xl">
        {/* TOP EXECUTIVE COMMAND BAR */}
        <div className="relative mb-10 overflow-hidden rounded-[2.5rem] bg-[#1F241F] p-8 md:p-12 text-ivory shadow-xl border border-gold/40">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 rounded-full bg-olive-light/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/15 px-4 py-1 text-xs font-semibold tracking-widest text-gold uppercase shadow-sm">
                <Sparkles size={13} className="text-gold animate-pulse" />
                <span>Executive Command Center</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ivory">
                Nimza Restaurant Management
              </h1>
              <p className="text-sm md:text-base text-sand/85 max-w-2xl leading-relaxed">
                Centralized oversight for Culinary Curation, Kitchen Kanban Stepper, Table Floor Plan, and Supabase Realtime Service Synchronization.
              </p>

              {/* Status Indicators */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-sand/90">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 px-3 py-1 text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Realtime Gateway: Connected</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/30 border border-white/10 px-3 py-1 text-sand">
                  <Flame size={13} className="text-orange-400" />
                  <span>Wood-Fire Kitchen Active</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/30 border border-white/10 px-3 py-1 text-sand">
                  <Users size={13} className="text-gold" />
                  <span>Floor Occupancy: {activeTablesCount} / 12 Tables</span>
                </span>
              </div>
            </div>

            {/* Quick Actions & Demo Mode Toggle */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={loadData}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold px-4 py-2 text-xs font-bold uppercase tracking-wider text-charcoal transition-all hover:bg-gold-light hover:scale-105 shadow"
                >
                  <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                  <span>{isRefreshing ? "Syncing..." : "Sync Realtime"}</span>
                </button>

                <button
                  onClick={playChime}
                  title="Test Sound Alert"
                  className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 bg-white/10 text-gold hover:bg-gold hover:text-charcoal transition-all"
                >
                  <Volume2 size={16} />
                </button>
              </div>

              {/* Demo Mode Toggle Badge */}
              <div className="flex items-center gap-2 rounded-full border border-gold/30 bg-black/40 px-3 py-1.5 text-xs text-sand">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Executive Privileges: <strong className="text-gold">Granted</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* 6 EXECUTIVE KPI STATS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {/* 1. Daily Revenue */}
          <div className="p-5 rounded-3xl bg-white border border-sand shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-charcoal/60 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Gross Sales</span>
              <TrendingUp size={14} className="text-emerald-600" />
            </div>
            <p className="font-serif text-2xl md:text-3xl font-bold text-olive">
              ${totalRevenue.toFixed(0)}
            </p>
            <p className="text-[11px] font-medium text-emerald-700 mt-1">
              ₨ {(totalRevenue * 280).toLocaleString()} • +21.4%
            </p>
          </div>

          {/* 2. Pending Tickets */}
          <div className="p-5 rounded-3xl bg-amber-50/80 border border-amber-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-amber-800 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">1. Pending</span>
              <Clock size={14} className="text-amber-700" />
            </div>
            <p className="font-serif text-2xl md:text-3xl font-bold text-amber-950">
              {pendingOrders.length}
            </p>
            <p className="text-[11px] text-amber-800/80 mt-1">Ticket Queued</p>
          </div>

          {/* 3. Over Flame */}
          <div className="p-5 rounded-3xl bg-orange-50/80 border border-orange-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-orange-800 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">2. Over Flame</span>
              <Flame size={14} className="text-orange-600" />
            </div>
            <p className="font-serif text-2xl md:text-3xl font-bold text-orange-950">
              {preparingOrders.length}
            </p>
            <p className="text-[11px] text-orange-800/80 mt-1">Cooking at Pass</p>
          </div>

          {/* 4. Ready to Serve */}
          <div className="p-5 rounded-3xl bg-emerald-50/80 border border-emerald-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-emerald-800 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">3. Plated</span>
              <ChefHat size={14} className="text-emerald-600" />
            </div>
            <p className="font-serif text-2xl md:text-3xl font-bold text-emerald-950">
              {readyOrders.length}
            </p>
            <p className="text-[11px] text-emerald-800/80 mt-1">Marble Pass Ready</p>
          </div>

          {/* 5. Floor Tables */}
          <div className="p-5 rounded-3xl bg-white border border-sand shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-charcoal/60 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Active Tables</span>
              <Users size={14} className="text-gold" />
            </div>
            <p className="font-serif text-2xl md:text-3xl font-bold text-olive">
              {activeTablesCount} <span className="text-sm font-sans font-normal text-charcoal/50">/ 12</span>
            </p>
            <p className="text-[11px] text-charcoal/60 mt-1">{12 - activeTablesCount} Tables Open</p>
          </div>

          {/* 6. Active Menu */}
          <div className="p-5 rounded-3xl bg-white border border-sand shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-charcoal/60 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Catalog</span>
              <UtensilsCrossed size={14} className="text-gold" />
            </div>
            <p className="font-serif text-2xl md:text-3xl font-bold text-olive">
              {menuCount.items}
            </p>
            <p className="text-[11px] text-charcoal/60 mt-1">{menuCount.categories} Culinary Courses</p>
          </div>
        </div>

        {/* 6 CORE COMMAND MODULES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-12">
          {/* Card 1: Users & Role Control */}
          <Link
            href="/admin/users"
            className="group relative flex flex-col justify-between p-7 rounded-[2rem] bg-white border border-sand shadow-sm hover:shadow-xl hover:border-gold/60 transition-all duration-300 hover:-translate-y-1"
          >
            <div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/20 text-olive group-hover:bg-gold group-hover:text-charcoal transition-colors mb-5">
                <Users size={22} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Access Control</span>
              <h3 className="font-serif text-xl font-bold text-olive mt-1 mb-2 group-hover:text-gold transition-colors">
                Users & Roles
              </h3>
              <p className="text-xs text-charcoal/70 leading-relaxed">
                Assign and modify user roles: <strong>customer</strong>, <strong>chef</strong>, and <strong>admin</strong>.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-6 text-xs font-bold uppercase tracking-wider text-olive group-hover:text-gold">
              <span>Manage Roles</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Menu Management */}
          <Link
            href="/admin/menu"
            className="group relative flex flex-col justify-between p-7 rounded-[2rem] bg-white border border-sand shadow-sm hover:shadow-xl hover:border-gold/60 transition-all duration-300 hover:-translate-y-1"
          >
            <div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sand/40 text-olive group-hover:bg-gold group-hover:text-charcoal transition-colors mb-5">
                <UtensilsCrossed size={22} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold">Culinary Catalog</span>
              <h3 className="font-serif text-xl font-bold text-olive mt-1 mb-2 group-hover:text-gold transition-colors">
                Menu Management
              </h3>
              <p className="text-xs text-charcoal/70 leading-relaxed">
                Add courses, adjust pricing, configure dietary badges (Wood-fired, Chef pick), and select 1-click photography presets.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-6 text-xs font-bold uppercase tracking-wider text-olive group-hover:text-gold">
              <span>Open Menu Studio</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Kitchen Pass Orders */}
          <Link
            href="/admin/orders"
            className="group relative flex flex-col justify-between p-7 rounded-[2rem] bg-white border border-sand shadow-sm hover:shadow-xl hover:border-gold/60 transition-all duration-300 hover:-translate-y-1"
          >
            <div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-900 group-hover:bg-gold group-hover:text-charcoal transition-colors mb-5">
                <ChefHat size={22} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Kitchen Operations</span>
              <h3 className="font-serif text-xl font-bold text-olive mt-1 mb-2 group-hover:text-gold transition-colors">
                Kitchen Pass & Orders
              </h3>
              <p className="text-xs text-charcoal/70 leading-relaxed">
                Real-time kitchen kanban queue with 1-click stage progression buttons and live synchronization.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-6 text-xs font-bold uppercase tracking-wider text-olive group-hover:text-gold">
              <span>Enter Kitchen Pass</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Chef Kitchen Station */}
          <Link
            href="/chef"
            className="group relative flex flex-col justify-between p-7 rounded-[2rem] bg-white border border-sand shadow-sm hover:shadow-xl hover:border-gold/60 transition-all duration-300 hover:-translate-y-1"
          >
            <div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 text-orange-900 group-hover:bg-gold group-hover:text-charcoal transition-colors mb-5">
                <Flame size={22} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800">Chef View</span>
              <h3 className="font-serif text-xl font-bold text-olive mt-1 mb-2 group-hover:text-gold transition-colors">
                Chef Station
              </h3>
              <p className="text-xs text-charcoal/70 leading-relaxed">
                Dedicated kitchen tablet interface for chefs to see all orders and advance cooking stages live.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-6 text-xs font-bold uppercase tracking-wider text-olive group-hover:text-gold">
              <span>Open Chef Station</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 5: Floor & Table Reservations */}
          <Link
            href="/admin/tables"
            className="group relative flex flex-col justify-between p-7 rounded-[2rem] bg-white border border-sand shadow-sm hover:shadow-xl hover:border-gold/60 transition-all duration-300 hover:-translate-y-1"
          >
            <div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-900 group-hover:bg-gold group-hover:text-charcoal transition-colors mb-5">
                <CalendarCheck size={22} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Floor & Availability</span>
              <h3 className="font-serif text-xl font-bold text-olive mt-1 mb-2 group-hover:text-gold transition-colors">
                Table Floor & Waitlist Desk
              </h3>
              <p className="text-xs text-charcoal/70 leading-relaxed">
                Live 12-table availability, floor statuses, guest allocations, packages, and VIP waitlist management.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-6 text-xs font-bold uppercase tracking-wider text-olive group-hover:text-gold">
              <span>Manage Tables & Floor</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 6: Customer Reviews */}
          <Link
            href="/admin/reviews"
            className="group relative flex flex-col justify-between p-7 rounded-[2rem] bg-white border border-sand shadow-sm hover:shadow-xl hover:border-gold/60 transition-all duration-300 hover:-translate-y-1"
          >
            <div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/15 text-gold group-hover:bg-gold group-hover:text-charcoal transition-colors mb-5">
                <Star size={22} className="fill-gold group-hover:fill-charcoal" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark">Guest Testimonials</span>
              <h3 className="font-serif text-xl font-bold text-olive mt-1 mb-2 group-hover:text-gold transition-colors">
                Customer Reviews
              </h3>
              <p className="text-xs text-charcoal/70 leading-relaxed">
                Moderate reviews, approve ratings, and manage featured dining stories displayed on the website.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-6 text-xs font-bold uppercase tracking-wider text-olive group-hover:text-gold">
              <span>Manage Reviews</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 7: Inventory & Stock Management */}
          <Link
            href="/admin/inventory"
            className="group relative flex flex-col justify-between p-7 rounded-[2rem] bg-white border border-sand shadow-sm hover:shadow-xl hover:border-gold/60 transition-all duration-300 hover:-translate-y-1"
          >
            <div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100/70 text-amber-900 group-hover:bg-gold group-hover:text-charcoal transition-colors mb-5">
                <Boxes size={22} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Pantry & Cellar</span>
              <h3 className="font-serif text-xl font-bold text-olive mt-1 mb-2 group-hover:text-gold transition-colors">
                Inventory & Stock Management
              </h3>
              <p className="text-xs text-charcoal/70 leading-relaxed">
                Track ingredient stock, set low-stock alert thresholds, audit order consumption, and auto-86 unavailable dishes.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-6 text-xs font-bold uppercase tracking-wider text-olive group-hover:text-gold">
              <span>Manage Inventory</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* SECTION: LIVE WEBSITE ACTIVITY & AUDIT STREAM (Omniscient Event Stream) */}
        <div className="mb-12 p-6 md:p-8 rounded-[2rem] bg-gradient-to-br from-white via-white to-sand/20 border border-sand shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-sand">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <h3 className="font-serif text-2xl font-bold text-olive">
                  Live Website Activity & Omniscient Feed
                </h3>
                <span className="rounded-full bg-gold/20 text-olive text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-wider">
                  Live Stream
                </span>
              </div>
              <p className="text-xs text-charcoal/60 mt-1">
                Real-time synchronized event log tracking all diner orders, culinary stage shifts, VIP bookings, cancellations, and user actions.
              </p>
            </div>

            {/* Activity Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: "all", label: "All Activity" },
                { key: "orders", label: "Orders" },
                { key: "reservations", label: "Bookings" },
                { key: "cancellations", label: "Cancellations" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActivityFilter(key as any)}
                  className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
                    activityFilter === key
                      ? "bg-olive text-gold shadow-sm"
                      : "bg-sand/30 text-charcoal hover:bg-sand/60"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Cards Stream */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activityFeed
              .filter((evt) => {
                if (activityFilter === "all") return true;
                if (activityFilter === "orders") return evt.type === "order" || evt.type === "status";
                if (activityFilter === "reservations") return evt.type === "reservation";
                if (activityFilter === "cancellations") return evt.type === "cancel";
                return true;
              })
              .slice(0, 8)
              .map((evt) => (
                <div
                  key={evt.id}
                  className="relative p-4 rounded-2xl bg-white border border-sand/70 shadow-sm hover:border-gold/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold border uppercase tracking-wider ${evt.badgeColor}`}
                      >
                        {evt.badge}
                      </span>
                      <span className="text-[10px] text-charcoal/50 font-mono">
                        {evt.timestamp}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-olive truncate">
                      {evt.title}
                    </h4>
                    <p className="text-xs text-charcoal/70 mt-1 leading-relaxed line-clamp-2">
                      {evt.description}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* SECTION 2: LIVE ORDERS COMMAND STREAM WITH 1-CLICK PROGRESSION */}
        <div className="mb-12 p-6 md:p-8 rounded-[2rem] bg-white border border-sand shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-sand">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-serif text-2xl font-bold text-olive">
                  Live Orders Queue & Fast Stepper
                </h3>
              </div>
              <p className="text-xs text-charcoal/60 mt-1">
                Advance kitchen statuses with 1 click. Diners’ live progress lines update simultaneously via Supabase.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {["All", "Pending", "Preparing", "Ready", "Delivered", "Cancelled"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                    filterStatus === st
                      ? "bg-olive text-gold shadow-sm"
                      : "bg-sand/30 text-charcoal hover:bg-sand/60"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-charcoal/50">
              <p className="text-sm">No orders matching status &ldquo;{filterStatus}&rdquo;.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-sand text-[10px] uppercase tracking-wider text-charcoal/60">
                    <th className="pb-3 font-bold">Ticket #</th>
                    <th className="pb-3 font-bold">Table / Guest</th>
                    <th className="pb-3 font-bold">Ordered Courses</th>
                    <th className="pb-3 font-bold">Bill Total</th>
                    <th className="pb-3 font-bold">Payment</th>
                    <th className="pb-3 font-bold">Status</th>
                    <th className="pb-3 font-bold text-right">Kitchen Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/50">
                  {filteredOrders.map((order) => {
                    const statusConfig = {
                      Pending: {
                        label: "Pending",
                        badge: "bg-amber-100 text-amber-900 border-amber-300",
                        actionLabel: "🔥 Cook Over Flame",
                        next: "Preparing",
                      },
                      Preparing: {
                        label: "Preparing",
                        badge: "bg-orange-100 text-orange-900 border-orange-300",
                        actionLabel: "🍽️ Plate & Ready",
                        next: "Ready",
                      },
                      Ready: {
                        label: "Ready",
                        badge: "bg-emerald-100 text-emerald-900 border-emerald-300",
                        actionLabel: "✅ Mark Delivered",
                        next: "Delivered",
                      },
                      Delivered: {
                        label: "Delivered",
                        badge: "bg-olive text-gold border-gold/40",
                        actionLabel: "✨ Served",
                        next: null,
                      },
                      Cancelled: {
                        label: "Cancelled",
                        badge: "bg-rose-100 text-rose-900 border-rose-300",
                        actionLabel: "",
                        next: null,
                      },
                    }[order.status] || {
                      label: order.status,
                      badge: "bg-sand text-charcoal",
                      actionLabel: "",
                      next: null,
                    };

                    return (
                      <tr key={order.id} className="hover:bg-sand/10 transition-colors">
                        <td className="py-4 font-mono font-bold text-olive">
                          #{order.id}
                        </td>
                        <td className="py-4">
                          <p className="font-semibold text-charcoal">
                            Table {order.table_no || "Takeaway"}
                          </p>
                          <p className="text-[11px] text-charcoal/60">
                            {order.customer_name || "Esteemed Diner"}
                          </p>
                        </td>
                        <td className="py-4 max-w-xs">
                          {order.order_items && order.order_items.length > 0 ? (
                            <div className="space-y-0.5">
                              {order.order_items.map((item, idx) => (
                                <div key={idx} className="flex flex-col text-charcoal/80">
                                  <p className="truncate">
                                    <strong className="text-olive">{item.quantity}×</strong>{" "}
                                    {item.menu_items?.name || "Signature Course"}
                                  </p>
                                  {(item as any).customizations && (
                                    <span className="text-[10px] text-charcoal/60 italic truncate pl-3">
                                      ↳ {(item as any).customizations}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-charcoal/50">Chef Tasting Selection</span>
                          )}
                        </td>
                        <td className="py-4 font-serif font-bold text-sm text-olive">
                          ${Number(order.total || 0).toFixed(2)}
                        </td>
                        <td className="py-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-sand/30 border border-sand px-2.5 py-1 text-[11px] font-medium text-charcoal">
                              {paymentIcon(order.payment_method)}
                              <span className="truncate max-w-[130px]">{order.payment_method || "cash"}</span>
                            </span>
                            {order.payment_method?.toLowerCase().includes("card") && (
                              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                Paid (Dummy)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4">
                          <span
                            className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusConfig.badge}`}
                          >
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {statusConfig.next && (
                              <button
                                onClick={() => handleAdvanceStatus(order.id, order.status)}
                                className="rounded-full bg-gold px-3.5 py-1.5 text-[11px] font-bold text-charcoal shadow-sm hover:bg-gold-light hover:scale-105 transition-all"
                              >
                                {statusConfig.actionLabel}
                              </button>
                            )}
                            {order.status === "Delivered" && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                                <CheckCircle2 size={14} /> Completed
                              </span>
                            )}
                            {order.status === "Cancelled" && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                                <AlertCircle size={14} /> Cancelled
                              </span>
                            )}
                            {order.status !== "Delivered" && order.status !== "Cancelled" && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                title="Admin: Cancel Order"
                                className="rounded-full border border-rose-300 bg-rose-50 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                              >
                                ✕ Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECTION 3: FLOOR PLAN & TABLE OCCUPANCY MATRIX (12 TABLES) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Floor Matrix */}
          <div className="lg:col-span-8 p-6 md:p-8 rounded-[2rem] bg-white border border-sand shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-6 border-b border-sand">
              <div>
                <h3 className="font-serif text-2xl font-bold text-olive flex items-center gap-2">
                  <Compass size={20} className="text-gold" />
                  <span>Floor Architecture & Table Matrix</span>
                </h3>
                <p className="text-xs text-charcoal/60 mt-0.5">
                  Click any table to cycle status: Available → Occupied → Reserved.
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Occupied
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-gold" /> Reserved
                </span>
              </div>
            </div>

            {/* 12-Table Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {tables.map((table) => {
                const isAvailable = table.status === "Available";
                const isOccupied = table.status === "Occupied";
                const isReserved = table.status === "Reserved";

                const bgClass = isAvailable
                  ? "bg-emerald-50/70 border-emerald-200 hover:border-emerald-400"
                  : isOccupied
                  ? "bg-amber-50/70 border-amber-200 hover:border-amber-400"
                  : "bg-gold/10 border-gold/40 hover:border-gold";

                const statusColor = isAvailable
                  ? "text-emerald-800"
                  : isOccupied
                  ? "text-amber-800"
                  : "text-amber-950 font-bold";

                return (
                  <button
                    key={table.no}
                    onClick={() => toggleTableStatus(table.no)}
                    className={`flex flex-col justify-between p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] shadow-sm ${bgClass}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-serif text-lg font-bold text-olive">
                        T-{table.no}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60">
                        {table.seats} Seats
                      </span>
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${statusColor}`}>
                        {table.status}
                      </p>
                      <p className="text-[10px] text-charcoal/60 truncate mt-0.5">
                        {table.guest}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Today's Table Reservations Desk */}
          <div className="lg:col-span-4 p-6 md:p-8 rounded-[2rem] bg-white border border-sand shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-sand">
                <h4 className="font-serif text-lg font-bold text-olive flex items-center gap-2">
                  <CalendarCheck size={18} className="text-gold" />
                  <span>VIP Sitting Ledger</span>
                </h4>
                <Link
                  href="/reservations"
                  className="text-[11px] font-bold text-gold hover:underline"
                >
                  Book New +
                </Link>
              </div>

              <div className="space-y-3">
                {reservations.slice(0, 4).map((res) => (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-2xl bg-sand/20 border border-sand/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-serif font-bold text-sm text-olive truncate">
                        {res.name}
                      </p>
                      <span className="text-[10px] font-bold rounded-full bg-gold/20 text-olive px-2 py-0.5">
                        {res.guests} Guests
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal/70">
                      Table {res.table_no || "Reserved"} • {res.reserved_at || "Tonight"}
                    </p>
                    {res.notes && (
                      <p className="text-[10px] text-charcoal/60 italic truncate">
                        &ldquo;{res.notes}&rdquo;
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-sand/40">
                      <span className="text-[10px] text-charcoal/50 font-medium">
                        VIP Seating
                      </span>
                      <button
                        onClick={() => handleCancelReservation(res.id, res.name, res.table_no)}
                        className="rounded-full border border-rose-300 bg-rose-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-700 hover:bg-rose-600 hover:text-white transition-all shadow-xs"
                      >
                        ✕ Cancel Booking
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/admin/orders"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-olive py-3 text-xs font-bold uppercase tracking-wider text-gold hover:bg-olive-deep transition-colors shadow"
              >
                <span>Full Kitchen & Bookings Pass</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM BRAND FOOTNOTE */}
        <div className="rounded-3xl border border-sand bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center p-1 shrink-0 overflow-hidden">
              <NimzaBowlSvg className="w-6 h-6" inverted={false} />
            </div>
            <div>
              <p className="font-serif font-bold text-sm text-olive">
                Nimza Executive Suite
              </p>
              <p className="text-[11px] text-charcoal/60">
                Connected to Supabase PostgreSQL with Realtime Subscriptions enabled.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link href="/" className="hover:text-gold font-medium">
              View Public Website
            </Link>
            <span>•</span>
            <Link href="/menu" className="hover:text-gold font-medium">
              Guest Menu
            </Link>
            <span>•</span>
            <Link href="/payment-methods" className="hover:text-gold font-medium">
              Payment Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
