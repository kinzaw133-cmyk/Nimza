"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight,
  Search,
  Filter,
  DollarSign,
  Coffee,
  Wine,
  Percent,
  ArrowUpRight,
  Bell,
  SlidersHorizontal,
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
    image_url?: string;
  };
}

interface Order {
  id: number;
  created_at?: string;
  customer_name?: string;
  table_no?: number | string;
  total: number;
  status: "Pending" | "Preparing" | "Ready" | "Delivered" | "Cancelled";
  payment_method?: "cash" | "card" | "wallet" | "transfer";
  payment_status?: string;
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
  package_name?: string;
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
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    customer_name: "Lord Sterling",
    table_no: 3,
    total: 82.0,
    status: "Pending",
    payment_method: "card",
    payment_status: "Paid",
    order_items: [
      {
        quantity: 2,
        menu_items: {
          name: "Truffle Tagliatelle",
          price: 18.0,
          image_url:
            "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&q=80",
        },
      },
      {
        quantity: 1,
        menu_items: {
          name: "Heritage Prime Ribeye",
          price: 46.0,
          image_url:
            "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80",
        },
      },
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
    payment_status: "Paid",
    order_items: [
      {
        quantity: 1,
        menu_items: {
          name: "Burrata Pugliese",
          price: 16.0,
          image_url:
            "https://images.unsplash.com/photo-1592417817098-8f3d69102a47?w=400&q=80",
        },
      },
      {
        quantity: 2,
        menu_items: {
          name: "Pan-Seared Scottish Salmon",
          price: 24.0,
          image_url:
            "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80",
        },
      },
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
    payment_status: "Paid",
    order_items: [
      {
        quantity: 2,
        menu_items: {
          name: "Heritage Prime Ribeye",
          price: 46.0,
          image_url:
            "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80",
        },
      },
      {
        quantity: 1,
        menu_items: {
          name: "Molten Valrhona Sphere",
          price: 14.0,
          image_url:
            "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&q=80",
        },
      },
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
    payment_status: "Paid",
    order_items: [
      {
        quantity: 1,
        menu_items: {
          name: "Truffle Tagliatelle",
          price: 18.0,
          image_url:
            "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&q=80",
        },
      },
      {
        quantity: 1,
        menu_items: {
          name: "Citrus Amalfi Spritz",
          price: 9.0,
          image_url:
            "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80",
        },
      },
      {
        quantity: 1,
        menu_items: {
          name: "Tiramisu al Mascarpone",
          price: 12.0,
          image_url:
            "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80",
        },
      },
    ],
  },
];

const INITIAL_TABLES = [
  { no: 1, seats: 2, section: "Terrace Garden", status: "Occupied", guest: "Table 1 (2 guests)", server: "Alex" },
  { no: 2, seats: 2, section: "Terrace Garden", status: "Delivered", guest: "Sophia Delacroix", server: "Elena" },
  { no: 3, seats: 4, section: "Terrace Garden", status: "Occupied", guest: "Lord Sterling", server: "Marco" },
  { no: 4, seats: 4, section: "Terrace Garden", status: "Available", guest: "Ready for Seating", server: "Unassigned" },
  { no: 5, seats: 4, section: "Main Dining Hall", status: "Available", guest: "Ready for Seating", server: "Unassigned" },
  { no: 6, seats: 6, section: "Main Dining Hall", status: "Reserved", guest: "Dr. Alistair (19:30)", server: "Alex" },
  { no: 7, seats: 4, section: "Main Dining Hall", status: "Occupied", guest: "Countess Elena", server: "Marco" },
  { no: 8, seats: 6, section: "Main Dining Hall", status: "Available", guest: "Ready for Seating", server: "Unassigned" },
  { no: 9, seats: 8, section: "Private Wine Alcove", status: "Reserved", guest: "Baron Von Essen (20:00)", server: "Sommelier Jules" },
  { no: 10, seats: 6, section: "Private Wine Alcove", status: "Available", guest: "Ready for Seating", server: "Unassigned" },
  { no: 11, seats: 8, section: "Chef's Table VIP", status: "Occupied", guest: "Ambassador Vance", server: "Head Waiter David" },
  { no: 12, seats: 10, section: "Royal Salon VIP", status: "Reserved", guest: "Diplomatic Suite (20:30)", server: "Executive Staff" },
];

export default function AdminDashboardPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [menuCount, setMenuCount] = useState({ items: 18, categories: 4 });
  const [activityFilter, setActivityFilter] = useState<"all" | "orders" | "reservations" | "cancellations">("all");

  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([
    {
      id: "act-1",
      type: "order",
      title: "New Culinary Ticket #1042",
      description: "Lord Sterling placed an order for Table 3 ($82.00) via Visa Express",
      timestamp: "5m ago",
      badge: "Order Placed",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      id: "act-2",
      type: "status",
      title: "Kitchen Station Advance",
      description: "Chef brigade moved Ticket #1041 to Over Flame (Cooking Station)",
      timestamp: "14m ago",
      badge: "In Cooking",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      id: "act-3",
      type: "reservation",
      title: "VIP Table Booking Confirmed",
      description: "Dr. Alistair Finch reserved Table 6 for 4 guests (Tonight, 19:30)",
      timestamp: "28m ago",
      badge: "VIP Booking",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "act-4",
      type: "status",
      title: "Plate Ready at Marble Pass",
      description: "Ambassador Vance's order #1040 is Plated and Ready for Table 11",
      timestamp: "35m ago",
      badge: "Ready on Pass",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  ]);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      let dbOrders: any[] | null = null;
      let dbRes: any[] | null = null;
      let itemsCount: number | null = 18;
      let catCount: number | null = 4;

      if (isSupabaseConfigured) {
        const [ordersRes, resRes, itemsRes, catRes] = await Promise.all([
          supabase
            .from("orders")
            .select("*,order_items(quantity,menu_items(name,price,image_url))")
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
          items: itemsCount || 18,
          categories: catCount || 4,
        });
      }

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
            package_name: "Grand Chef Tasting (7 Course)",
          },
          {
            id: 2,
            name: "Baron Von Essen",
            guests: 6,
            table_no: 9,
            reserved_at: "Today, 20:00",
            phone: "+92 321 9988776",
            notes: "Sommelier pairing with dry aged cuts.",
            package_name: "Sommelier Reserve Pairing",
          },
          {
            id: 3,
            name: "Diplomatic Suite delegation",
            guests: 8,
            table_no: 12,
            reserved_at: "Today, 20:30",
            phone: "+92 333 4455667",
            notes: "Private security clearance confirmed.",
            package_name: "Imperial Royal Feast",
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

    // Supabase Realtime Channel
    const ordersChan = supabase
      .channel("admin-modern-orders")
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
            badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
          };
          setActivityFeed((prev) => [newEvt, ...prev.slice(0, 24)]);
          playChime();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChan);
    };
  }, []);

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

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

    playChime();
    toast(`Order #${orderId} moved to ${next}!`, "success");
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
    toast(`Table ${tableNo} status updated`, "info");
  };

  // Metrics
  const pendingOrders = orders.filter((o) => o.status === "Pending");
  const preparingOrders = orders.filter((o) => o.status === "Preparing");
  const readyOrders = orders.filter((o) => o.status === "Ready");
  const deliveredOrders = orders.filter((o) => o.status === "Delivered");
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const activeTablesCount = tables.filter((t) => t.status !== "Available").length;

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = filterStatus === "All" || o.status === filterStatus;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesStatus;
      const matchesId = String(o.id).includes(q);
      const matchesGuest = (o.customer_name || "").toLowerCase().includes(q);
      const matchesTable = String(o.table_no || "").includes(q);
      return matchesStatus && (matchesId || matchesGuest || matchesTable);
    });
  }, [orders, filterStatus, searchQuery]);

  // Modern Photography Cards Config
  const MODULE_CARDS = [
    {
      title: "Menu & Culinary Studio",
      subtitle: `${menuCount.items} active courses across ${menuCount.categories} categories`,
      href: "/admin/menu",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
      tag: "Culinary Catalog",
      tagColor: "bg-emerald-500/80 text-white",
      icon: UtensilsCrossed,
      action: "Manage Menu",
    },
    {
      title: "Kitchen Pass & KDS",
      subtitle: `${preparingOrders.length} tickets over flame, ${readyOrders.length} plated on marble`,
      href: "/chef",
      image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
      tag: "Live Kitchen Pass",
      tagColor: "bg-orange-500/80 text-white",
      icon: Flame,
      action: "Open Station",
    },
    {
      title: "Floor Architecture & Tables",
      subtitle: `${activeTablesCount} of 12 tables occupied or reserved`,
      href: "/admin/tables",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
      tag: "Floor Layout",
      tagColor: "bg-blue-500/80 text-white",
      icon: Compass,
      action: "View Floor Plan",
    },
    {
      title: "Inventory & Wine Cellar",
      subtitle: "Track pantry stock, auto-86 dishes, low threshold alerts",
      href: "/admin/inventory",
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80",
      tag: "Pantry & Stock",
      tagColor: "bg-amber-500/80 text-white",
      icon: Boxes,
      action: "Audit Stock",
    },
    {
      title: "Users & Staff Role Security",
      subtitle: "RBAC controls for Admin, Chef, Courier, and VIP diners",
      href: "/admin/users",
      image: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=800&q=80",
      tag: "Security & RBAC",
      tagColor: "bg-purple-500/80 text-white",
      icon: Users,
      action: "Manage Roles",
    },
    {
      title: "Guest Reviews & Stories",
      subtitle: "Verified dining ratings, critique approval, and featured reviews",
      href: "/admin/reviews",
      image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
      tag: "Testimonials",
      tagColor: "bg-yellow-500/80 text-white",
      icon: Star,
      action: "Moderate Reviews",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E242B] font-sans antialiased p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ── TOP HERO COMMAND DECK (MODERN LUXURY GLASS) ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#171C18] via-[#202721] to-[#121613] p-6 sm:p-8 lg:p-10 text-white shadow-xl border border-white/10">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#E5C778]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>Nimza Executive Operations</span>
                <span className="text-white/40">•</span>
                <span className="text-white/80">Realtime Cloud Synced</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                Restaurant Management Hub
              </h1>

              <p className="text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed">
                Centralized control for gourmet culinary collections, live kitchen pass stepper, floor table architecture, and guest dining reservations.
              </p>

              {/* Service Status Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-medium">
                  <CheckCircle2 size={13} />
                  <span>Wood-Fired Kitchen: Active</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/80 font-medium">
                  <Flame size={13} className="text-amber-400" />
                  <span>{preparingOrders.length} Cooking at Pass</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/80 font-medium">
                  <Compass size={13} className="text-[#E5C778]" />
                  <span>Floor Occupancy: {activeTablesCount} / 12 Tables</span>
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 shrink-0">
              <button
                onClick={loadData}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#E5BE42] hover:to-[#C6A432] text-[#121613] font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                <span>{isRefreshing ? "Syncing..." : "Sync Realtime"}</span>
              </button>

              <Link
                href="/chef"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition-all backdrop-blur-md"
              >
                <ChefHat size={14} className="text-[#E5C778]" />
                <span>Open KDS Station</span>
                <ArrowUpRight size={13} className="text-white/60" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── 5 MODERN METRICS CARDS (CLEAN SANS TYPOGRAPHY) ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          
          {/* 1. Daily Sales */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Gross Sales</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              ${totalRevenue.toFixed(0)}
            </div>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <span>+18.4%</span>
              <span className="text-gray-400 font-normal">vs last night</span>
            </p>
          </div>

          {/* 2. Pending Tickets */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">1. Ticket Queue</span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {pendingOrders.length}
            </div>
            <p className="text-xs text-amber-700 font-medium mt-1">Awaiting Chef Acceptance</p>
          </div>

          {/* 3. Over Flame */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">2. Over Flame</span>
              <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <Flame size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {preparingOrders.length}
            </div>
            <p className="text-xs text-orange-700 font-medium mt-1">In Active Preparation</p>
          </div>

          {/* 4. Ready on Pass */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">3. Marble Pass</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ChefHat size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {readyOrders.length}
            </div>
            <p className="text-xs text-emerald-700 font-medium mt-1">Ready for Delivery</p>
          </div>

          {/* 5. Active Tables */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-all col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Table Floor</span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Compass size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {activeTablesCount} <span className="text-base text-gray-400 font-normal">/ 12</span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">{12 - activeTablesCount} Tables Open</p>
          </div>

        </div>

        {/* ── VISUAL MODULE SHOWCASE CARDS (REALISTIC UNSPLASH PHOTOGRAPHY) ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900">
                Core Operations & Studios
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Direct access to kitchen brigade systems, menu creation, floor architecture, and cellar stock.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODULE_CARDS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                >
                  {/* Photo Header */}
                  <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    
                    {/* Badge Tag */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${item.tagColor}`}>
                        {item.tag}
                      </span>
                    </div>

                    {/* Bottom Title over Photo */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-bold text-lg text-white group-hover:text-[#E5C778] transition-colors leading-snug">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {item.subtitle}
                    </p>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-900 group-hover:text-[#B89628]">
                      <span>{item.action}</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── LIVE ORDERS STREAM & FAST STEPPER (MODERN POS TABLE) ── */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  Live Orders Queue & Kitchen Stepper
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                1-click progression moves tickets through Cooking, Plating, and Delivery stages with live Supabase synchronization.
              </p>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search table or ticket..."
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-[#D4AF37] focus:bg-white transition-all w-44"
                />
              </div>

              <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                {["All", "Pending", "Preparing", "Ready", "Delivered"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      filterStatus === st
                        ? "bg-white text-gray-900 shadow-xs"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders Table */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingBag size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No orders matching &ldquo;{filterStatus}&rdquo; filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    <th className="pb-3">Ticket</th>
                    <th className="pb-3">Table / Guest</th>
                    <th className="pb-3">Ordered Courses</th>
                    <th className="pb-3">Bill</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Kitchen Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => {
                    const statusConfig = {
                      Pending: {
                        label: "Queued",
                        badge: "bg-amber-50 text-amber-700 border-amber-200",
                        actionLabel: "🔥 Cook Over Flame",
                        next: "Preparing",
                      },
                      Preparing: {
                        label: "Cooking",
                        badge: "bg-orange-50 text-orange-700 border-orange-200",
                        actionLabel: "🍽️ Plate on Pass",
                        next: "Ready",
                      },
                      Ready: {
                        label: "Ready",
                        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
                        actionLabel: "✅ Serve Guest",
                        next: "Delivered",
                      },
                      Delivered: {
                        label: "Delivered",
                        badge: "bg-gray-100 text-gray-700 border-gray-200",
                        actionLabel: "",
                        next: null,
                      },
                      Cancelled: {
                        label: "Cancelled",
                        badge: "bg-rose-50 text-rose-700 border-rose-200",
                        actionLabel: "",
                        next: null,
                      },
                    }[order.status] || {
                      label: order.status,
                      badge: "bg-gray-100 text-gray-700",
                      actionLabel: "",
                      next: null,
                    };

                    return (
                      <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 font-mono font-bold text-gray-900">
                          #{order.id}
                        </td>
                        <td className="py-3.5">
                          <p className="font-bold text-gray-900">
                            Table {order.table_no || "Takeaway"}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {order.customer_name || "Esteemed Diner"}
                          </p>
                        </td>
                        <td className="py-3.5 max-w-xs">
                          {order.order_items && order.order_items.length > 0 ? (
                            <div className="space-y-1">
                              {order.order_items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  {item.menu_items?.image_url && (
                                    <div className="relative h-6 w-6 rounded-md overflow-hidden shrink-0 border border-gray-200">
                                      <Image
                                        src={item.menu_items.image_url}
                                        alt={item.menu_items.name || "Dish"}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  )}
                                  <span className="font-semibold text-gray-900">
                                    {item.quantity}×
                                  </span>
                                  <span className="truncate text-gray-700">
                                    {item.menu_items?.name || "Chef Selection"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">Chef Tasting Selection</span>
                          )}
                        </td>
                        <td className="py-3.5 font-bold text-gray-900 text-sm">
                          ${Number(order.total || 0).toFixed(2)}
                        </td>
                        <td className="py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-medium capitalize">
                            <CreditCard size={12} className="text-gray-500" />
                            <span>{order.payment_method || "Card"}</span>
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusConfig.badge}`}
                          >
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          {statusConfig.next ? (
                            <button
                              onClick={() => handleAdvanceStatus(order.id, order.status)}
                              className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-[#E5C778] text-xs font-bold transition-all shadow-xs hover:scale-105 active:scale-95"
                            >
                              {statusConfig.actionLabel}
                            </button>
                          ) : (
                            <span className="text-[11px] font-semibold text-gray-400">
                              {order.status === "Delivered" ? "✓ Completed" : "✕ Closed"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── FLOOR PLAN & VIP DINING RESERVATIONS SPLIT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: 12-Table Restaurant Floor Architecture */}
          <div className="lg:col-span-8 rounded-2xl bg-white border border-gray-200 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Compass size={18} className="text-[#D4AF37]" />
                  <span>Floor Architecture & Table Allocation</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Click any table to cycle availability: Available → Occupied → Reserved.
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Occupied
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> Reserved
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
                  ? "bg-emerald-50/60 border-emerald-200/80 hover:border-emerald-400"
                  : isOccupied
                  ? "bg-amber-50/60 border-amber-200/80 hover:border-amber-400"
                  : "bg-blue-50/60 border-blue-200/80 hover:border-blue-400";

                const statusColor = isAvailable
                  ? "text-emerald-700"
                  : isOccupied
                  ? "text-amber-700"
                  : "text-blue-700";

                return (
                  <button
                    key={table.no}
                    onClick={() => toggleTableStatus(table.no)}
                    className={`flex flex-col justify-between p-3.5 rounded-xl border text-left transition-all hover:scale-[1.02] shadow-2xs ${bgClass}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-base text-gray-900">
                        Table {table.no}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        {table.seats} Seats
                      </span>
                    </div>

                    <div>
                      <p className={`text-xs font-bold ${statusColor}`}>
                        {table.status}
                      </p>
                      <p className="text-[11px] text-gray-600 truncate mt-0.5">
                        {table.guest}
                      </p>
                      <span className="text-[10px] text-gray-400 block mt-1">
                        Server: {table.server}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: VIP Dining Ledger & Party Bookings */}
          <div className="lg:col-span-4 rounded-2xl bg-white border border-gray-200 shadow-xs p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                <h4 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <CalendarCheck size={18} className="text-[#D4AF37]" />
                  <span>VIP Dining Bookings</span>
                </h4>
                <Link
                  href="/reservations"
                  className="text-xs font-bold text-[#B89628] hover:underline"
                >
                  Book VIP +
                </Link>
              </div>

              <div className="space-y-3">
                {reservations.slice(0, 4).map((res) => (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1.5 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-gray-900 truncate">
                        {res.name}
                      </p>
                      <span className="text-[10px] font-bold rounded-full bg-gray-200 text-gray-800 px-2 py-0.5">
                        {res.guests} Guests
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Table {res.table_no || "Allocated"} • {res.reserved_at || "Tonight"}
                    </p>
                    {res.package_name && (
                      <span className="inline-block text-[10px] font-bold text-[#B89628] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        {res.package_name}
                      </span>
                    )}
                    {res.notes && (
                      <p className="text-[10px] text-gray-500 italic truncate">
                        &ldquo;{res.notes}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/admin/orders"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 hover:bg-black py-3 text-xs font-bold uppercase tracking-wider text-[#E5C778] transition-colors shadow-xs"
              >
                <span>Full Kitchen Pass & Orders</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── LIVE AUDIT & ACTIVITY TIMELINE ── */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-emerald-500" />
              <h3 className="font-bold text-base text-gray-900">
                Live Restaurant Event Stream
              </h3>
            </div>
            <span className="text-xs text-gray-400">Synchronized via Supabase</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {activityFeed.slice(0, 4).map((evt) => (
              <div
                key={evt.id}
                className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${evt.badgeColor}`}>
                      {evt.badge}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">{evt.timestamp}</span>
                  </div>
                  <h4 className="font-bold text-xs text-gray-900 truncate">{evt.title}</h4>
                  <p className="text-[11px] text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
