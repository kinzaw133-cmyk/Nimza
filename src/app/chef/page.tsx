"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  Flame,
  Clock,
  CheckCircle2,
  Utensils,
  RefreshCw,
  LogOut,
  Bell,
  Sparkles,
  Filter,
  Search,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Star,
  Check,
  ShieldCheck,
  Layers,
  ChevronRight,
  PlusCircle,
  X,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth, clearSession } from "@/lib/useAuth";
import { toast } from "@/lib/notify";

export interface KitchenOrderItem {
  id?: number;
  quantity: number;
  menu_items?: {
    name: string;
    price?: number;
    image_url?: string;
  };
  customization?: any;
  customizations?: string;
}

export interface KitchenOrder {
  id: number;
  created_at: string;
  status: "Pending" | "Preparing" | "Ready" | "Delivered" | "Cancelled";
  total: number;
  table_no?: number | string;
  payment_method?: string;
  payment_status?: string;
  notes?: string;
  customer_name?: string;
  order_items: KitchenOrderItem[];
}

export default function KitchenDisplaySystem() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDelayedOnly, setFilterDelayedOnly] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [now, setNow] = useState<Date>(new Date());

  // Real-time ticking clock for preparation timers
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load sound setting from localStorage
  useEffect(() => {
    try {
      const savedSound = localStorage.getItem("nimza_kds_sound");
      if (savedSound !== null) {
        setSoundEnabled(savedSound === "true");
      }
      const savedChecks = localStorage.getItem("nimza_kds_checked_items");
      if (savedChecks) {
        setCheckedItems(JSON.parse(savedChecks));
      }
    } catch {}
  }, []);

  // Web Audio Synthesizer for high-visibility kitchen chimes
  const playChime = useCallback(
    (type: "new" | "advance" | "alert" = "advance") => {
      if (!soundEnabled) return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        if (type === "new") {
          // Tri-tone ascending alert for incoming new order
          const notes = [587.33, 739.99, 880.0]; // D5, F#5, A5
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
            gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + idx * 0.12);
            osc.stop(ctx.currentTime + idx * 0.12 + 0.35);
          });
        } else if (type === "alert") {
          // Urgent double bell for delayed orders
          [880, 880].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.18);
            gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.18);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.18 + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + idx * 0.18);
            osc.stop(ctx.currentTime + idx * 0.18 + 0.28);
          });
        } else {
          // Single cheerful ping for stage advance
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }
      } catch {}
    },
    [soundEnabled]
  );

  // Toggle audio alerts
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem("nimza_kds_sound", String(next));
    } catch {}
    toast(next ? "KDS Audio Chimes: Enabled" : "KDS Audio Chimes: Muted", "info");
  };

  // Fullscreen toggle for kitchen monitors and tablets
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Toggle item check-off for cooks plating dishes
  const toggleItemChecked = (orderId: number, itemIndex: number) => {
    const key = `${orderId}-${itemIndex}`;
    setCheckedItems((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem("nimza_kds_checked_items", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Query live orders from Supabase merged with localStorage cache
  const loadOrders = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch live orders with items and menu details if Supabase is configured
      let data: any = null;
      let error: any = null;
      if (isSupabaseConfigured) {
        const res = await supabase
          .from("orders")
          .select(`
            id,
            user_id,
            status,
            total,
            table_no,
            payment_method,
            payment_status,
            notes,
            created_at,
            order_items (
              id,
              quantity,
              customizations,
              menu_items (
                name,
                price,
                image_url
              )
            )
          `)
          .order("id", { ascending: false });
        data = res.data;
        error = res.error;
      }

      // 2. Fetch local storage orders (offline & instant updates)
      let localOrders: any[] = [];
      try {
        const raw = localStorage.getItem("nimza_placed_orders");
        if (raw) localOrders = JSON.parse(raw);
      } catch {}

      // 3. Merge: Database takes precedence, local fills in optimistic new orders
      const orderMap = new Map<number, KitchenOrder>();

      // Load local orders first
      localOrders.forEach((o: any) => {
        if (o && o.id) {
          orderMap.set(o.id, {
            id: o.id,
            created_at: o.created_at || new Date().toISOString(),
            status: o.status || "Pending",
            total: Number(o.total || 0),
            table_no: o.table_no || 1,
            payment_method: o.payment_method || "Credit Card",
            payment_status: o.payment_status || "Pending",
            notes: o.notes || "",
            customer_name: o.customer_name || `Guest Table ${o.table_no || ""}`,
            order_items: (o.order_items || []).map((it: any) => ({
              quantity: it.quantity || it.qty || 1,
              customization: it.customization,
              customizations: it.customizations,
              menu_items: it.menu_items || { name: it.name || "Chef Special" },
            })),
          });
        }
      });

      // Overlay remote database orders
      if (!error && Array.isArray(data)) {
        data.forEach((row: any) => {
          orderMap.set(row.id, {
            id: row.id,
            created_at: row.created_at,
            status: (row.status as any) || "Pending",
            total: Number(row.total || 0),
            table_no: row.table_no || 1,
            payment_method: row.payment_method || "Credit Card",
            payment_status: row.payment_status || "Pending",
            notes: row.notes || "",
            customer_name: row.customer_name || `Guest Table ${row.table_no || ""}`,
            order_items: (row.order_items || []).map((it: any) => ({
              id: it.id,
              quantity: it.quantity || 1,
              customizations: it.customizations,
              menu_items: it.menu_items || { name: "Chef Tasting Dish" },
            })),
          });
        });
      }

      const finalOrders = Array.from(orderMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setOrders(finalOrders);
    } catch (err) {
      console.error("Error loading KDS orders:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Real-time Supabase listener & event subscription
  useEffect(() => {
    loadOrders();

    // 1. Supabase Realtime Channel if configured
    let channel: any = null;
    if (isSupabaseConfigured) {
      channel = supabase
        .channel("nimza-kitchen-display-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          (payload: any) => {
            if (payload.eventType === "INSERT") {
              playChime("new");
              toast(`🛎️ New Ticket #${payload.new.id} arrived on Kitchen Pass!`, "info");
            } else if (payload.eventType === "UPDATE") {
              playChime("advance");
            }
            loadOrders();
          }
        )
        .subscribe();
    }

    // 2. Cross-tab and local window events
    const handleStorageUpdate = () => loadOrders();
    window.addEventListener("storage", handleStorageUpdate);
    window.addEventListener("nimza_order_created", handleStorageUpdate);
    window.addEventListener("nimza_order_updated", handleStorageUpdate);

    // 3. Periodic safeguard polling every 12 seconds
    const interval = setInterval(() => {
      loadOrders();
    }, 12000);

    return () => {
      if (channel) supabase.removeChannel(channel);
      window.removeEventListener("storage", handleStorageUpdate);
      window.removeEventListener("nimza_order_created", handleStorageUpdate);
      window.removeEventListener("nimza_order_updated", handleStorageUpdate);
      clearInterval(interval);
    };
  }, [loadOrders, playChime]);

  // Update order preparation status in Supabase & local system
  const updateOrderStatus = async (
    orderId: number,
    newStatus: "Pending" | "Preparing" | "Ready" | "Delivered" | "Cancelled"
  ) => {
    try {
      // 1. Update Supabase
      await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    } catch {}

    // 2. Optimistic local state update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    // 3. Update localStorage for customer `/orders` page
    try {
      const raw = localStorage.getItem("nimza_placed_orders");
      if (raw) {
        const stored = JSON.parse(raw);
        const updated = stored.map((o: any) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        );
        localStorage.setItem("nimza_placed_orders", JSON.stringify(updated));
      }
    } catch {}

    // 4. Dispatch custom event for cross-tab synchronization
    window.dispatchEvent(
      new CustomEvent("nimza_order_updated", {
        detail: { id: orderId, status: newStatus },
      })
    );

    // 5. Sound chime
    playChime(newStatus === "Delivered" ? "advance" : "advance");

    const statusNames: Record<string, string> = {
      Pending: "New Order (Ticket Queued)",
      Preparing: "Cooking (Over Flame)",
      Ready: "Plated & Ready on Pass",
      Delivered: "Delivered & Served",
      Cancelled: "Cancelled",
    };

    toast(`Ticket #${orderId} advanced to: ${statusNames[newStatus] || newStatus}`, "success");
  };

  // Helper: Fast Accept All New Orders
  const handleAcceptAllPending = async () => {
    const pendingOrders = orders.filter((o) => o.status === "Pending");
    if (pendingOrders.length === 0) return;

    for (const order of pendingOrders) {
      await updateOrderStatus(order.id, "Preparing");
    }
    toast(`Accepted and began cooking ${pendingOrders.length} orders!`, "success");
  };

  // Helper: Spawn realistic test order if kitchen queue is empty
  const handleSpawnTestOrder = () => {
    const testOrderId = Math.floor(1000 + Math.random() * 9000);
    const tables = [2, 4, 7, 12, "VIP Cellar"];
    const tableChoice = tables[Math.floor(Math.random() * tables.length)];

    const sampleDishes = [
      {
        name: "Truffle Tagliatelle",
        qty: 2,
        customizations: "Portion: Grand Feast | Spice: Medium 🌶️ | Add-ons: Umbrian Truffle Butter",
      },
      {
        name: "Prime Ribeye Steak",
        qty: 1,
        customizations: "Portion: Chef's Standard | Spice: Mild | Note: Medium-rare, bone marrow jus",
      },
      {
        name: "Burrata Pugliese",
        qty: 1,
        customizations: "Portion: Petite Tasting | Add-ons: Confit Heirloom Tomatoes",
      },
    ];

    const newTicket: KitchenOrder = {
      id: testOrderId,
      created_at: new Date().toISOString(),
      status: "Pending",
      total: 89.0,
      table_no: tableChoice,
      payment_method: "Credit Card (Prepaid)",
      payment_status: "Paid",
      notes: "Guest celebrating wedding anniversary. Requested table candle.",
      customer_name: `Lord Sterling (${typeof tableChoice === "number" ? `Table ${tableChoice}` : tableChoice})`,
      order_items: sampleDishes.map((d) => ({
        quantity: d.qty,
        customizations: d.customizations,
        menu_items: { name: d.name, price: 29.0 },
      })),
    };

    // Save to local storage
    try {
      const raw = localStorage.getItem("nimza_placed_orders") || "[]";
      const stored = JSON.parse(raw);
      stored.unshift(newTicket);
      localStorage.setItem("nimza_placed_orders", JSON.stringify(stored));
    } catch {}

    // Update state
    setOrders((prev) => [newTicket, ...prev]);

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent("nimza_order_created", {
        detail: newTicket,
      })
    );

    playChime("new");
    toast(`⚡ Test Ticket #${testOrderId} dispatched to Kitchen Pass!`, "success");
  };

  // Helper: Elapsed minutes & seconds ticker
  const getElapsed = useCallback(
    (createdAt: string) => {
      const start = new Date(createdAt).getTime();
      const current = now.getTime();
      const diffMs = Math.max(0, current - start);

      const totalSec = Math.floor(diffMs / 1000);
      const minutes = Math.floor(totalSec / 60);
      const seconds = totalSec % 60;

      const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      const isDelayed = minutes >= 15;
      const isWarning = minutes >= 10 && minutes < 15;

      return {
        minutes,
        seconds,
        formatted,
        isDelayed,
        isWarning,
      };
    },
    [now]
  );

  // Helper: Priority assessment
  const getPriorityInfo = (order: KitchenOrder, isDelayed: boolean) => {
    const isVip =
      String(order.table_no).toLowerCase().includes("vip") ||
      String(order.notes).toLowerCase().includes("vip") ||
      String(order.notes).toLowerCase().includes("anniversary") ||
      String(order.notes).toLowerCase().includes("celebration");

    const hasAllergy =
      String(order.notes).toLowerCase().includes("allergy") ||
      String(order.notes).toLowerCase().includes("gluten") ||
      String(order.notes).toLowerCase().includes("celiac") ||
      String(order.notes).toLowerCase().includes("nut") ||
      String(order.notes).toLowerCase().includes("dairy");

    return { isVip, hasAllergy, isDelayed };
  };

  // Filtered orders according to search query & delayed toggle
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (filterDelayedOnly) {
        const { isDelayed } = getElapsed(order.created_at);
        if (!isDelayed || order.status === "Delivered") return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchesId = String(order.id).includes(q);
      const matchesTable = String(order.table_no).toLowerCase().includes(q);
      const matchesNotes = (order.notes || "").toLowerCase().includes(q);
      const matchesDish = order.order_items.some((it) =>
        (it.menu_items?.name || "").toLowerCase().includes(q)
      );

      return matchesId || matchesTable || matchesNotes || matchesDish;
    });
  }, [orders, searchQuery, filterDelayedOnly, getElapsed]);

  // Organize orders into the 4 KDS columns
  const columnNewOrders = useMemo(
    () => filteredOrders.filter((o) => o.status === "Pending"),
    [filteredOrders]
  );
  const columnPreparing = useMemo(
    () => filteredOrders.filter((o) => o.status === "Preparing"),
    [filteredOrders]
  );
  const columnReady = useMemo(
    () => filteredOrders.filter((o) => o.status === "Ready"),
    [filteredOrders]
  );
  const columnCompleted = useMemo(
    () => filteredOrders.filter((o) => o.status === "Delivered"),
    [filteredOrders]
  );

  // KPI Metrics
  const activeCount = columnNewOrders.length + columnPreparing.length + columnReady.length;
  const delayedCount = orders.filter((o) => {
    if (o.status === "Delivered" || o.status === "Cancelled") return false;
    const { isDelayed } = getElapsed(o.created_at);
    return isDelayed;
  }).length;

  return (
    <div className="min-h-screen bg-[#1F241F] text-[#F3F4F1] flex flex-col select-none font-sans antialiased overflow-x-hidden">
      {/* KDS TOP COMMAND DECK (HIGH VISIBILITY FOR KITCHEN MONITORS - HERO THEME MATCH) */}
      <header className="sticky top-0 z-40 bg-[#171B17] border-b border-sand/20 px-4 sm:px-6 py-3.5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Station Identity & Live Connection Status */}
          <div className="flex items-center gap-3.5 flex-wrap">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-gold to-[#8B733E] flex items-center justify-center text-[#161D18] shadow-md shadow-gold/20">
              <ChefHat size={22} className="stroke-[2.2]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Nimza KDS</span>
                  <span className="text-xs font-mono font-normal text-gold uppercase tracking-widest px-2 py-0.5 rounded-md bg-gold/15 border border-gold/30">
                    Pass Command
                  </span>
                </h1>

                {/* Pulsing Realtime Indicator */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-bold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="hidden sm:inline">Supabase Realtime</span>
                </span>
              </div>

              {/* Digital Kitchen Clock */}
              <p className="text-xs font-mono text-sand/70 mt-0.5 flex items-center gap-2">
                <Clock size={12} className="text-gold" />
                <span className="font-semibold text-white">
                  {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
                <span>•</span>
                <span>{now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</span>
              </p>
            </div>
          </div>

          {/* Center: Stage Counters KPI Bar */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {/* Active Tickets */}
            <div className="px-3.5 py-1.5 rounded-xl bg-[#1C251F] border border-[#2D3C31] text-center min-w-[75px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sand/60 block">
                Active
              </span>
              <span className="font-serif text-lg font-bold text-white">{activeCount}</span>
            </div>

            {/* 1. New Orders */}
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-center min-w-[75px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                1. New
              </span>
              <span className="font-serif text-lg font-bold text-amber-300">
                {columnNewOrders.length}
              </span>
            </div>

            {/* 2. Preparing */}
            <div className="px-3.5 py-1.5 rounded-xl bg-orange-950/40 border border-orange-500/30 text-center min-w-[75px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block">
                2. Cooking
              </span>
              <span className="font-serif text-lg font-bold text-orange-300">
                {columnPreparing.length}
              </span>
            </div>

            {/* 3. Ready */}
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center min-w-[75px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                3. Ready
              </span>
              <span className="font-serif text-lg font-bold text-emerald-300">
                {columnReady.length}
              </span>
            </div>

            {/* Delayed Counter */}
            {delayedCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterDelayedOnly(!filterDelayedOnly)}
                className={`px-3.5 py-1.5 rounded-xl border text-center transition-all animate-pulse ${
                  filterDelayedOnly
                    ? "bg-rose-600 text-white border-rose-400 ring-2 ring-rose-400"
                    : "bg-rose-950/60 border-rose-500/50 text-rose-300 hover:bg-rose-900/60"
                }`}
                title="Filter to delayed orders only (>15 min)"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider block flex items-center justify-center gap-1">
                  <AlertTriangle size={10} />
                  <span>Delayed</span>
                </span>
                <span className="font-serif text-lg font-bold">{delayedCount}</span>
              </button>
            )}
          </div>

          {/* Right: Search, Sound, Fullscreen & Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-end lg:self-auto">
            {/* Search Box */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sand/50 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Table # or Ticket..."
                className="w-32 sm:w-44 pl-8 pr-7 py-1.5 rounded-xl bg-[#1C251F] border border-[#2D3C31] text-xs text-white placeholder-sand/40 outline-none focus:border-gold transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sand/50 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className={`grid h-9 w-9 place-items-center rounded-xl border transition-all ${
                soundEnabled
                  ? "bg-gold/15 border-gold/40 text-gold hover:bg-gold/25"
                  : "bg-[#1C251F] border-[#2D3C31] text-sand/40 hover:text-sand"
              }`}
              title={soundEnabled ? "Audio alerts enabled (Click to mute)" : "Audio alerts muted (Click to enable)"}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="grid h-9 w-9 place-items-center rounded-xl bg-[#1C251F] border border-[#2D3C31] text-sand hover:text-gold hover:border-gold/40 transition-all"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Mode"}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            {/* Refresh Pass */}
            <button
              type="button"
              onClick={loadOrders}
              disabled={isRefreshing}
              className="grid h-9 w-9 place-items-center rounded-xl bg-[#1C251F] border border-[#2D3C31] text-sand hover:text-gold hover:border-gold/40 transition-all"
              title="Refresh tickets"
            >
              <RefreshCw size={15} className={isRefreshing ? "animate-spin text-gold" : ""} />
            </button>

            {/* Spawn Test Ticket Button */}
            <button
              type="button"
              onClick={handleSpawnTestOrder}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-all"
              title="Spawn a realistic test order with customizations"
            >
              <PlusCircle size={14} />
              <span className="hidden sm:inline">Test Ticket</span>
            </button>

            {/* Exit to Admin or Home */}
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-xl bg-[#1C251F] border border-[#2D3C31] text-sand hover:text-white text-xs font-semibold transition-all flex items-center gap-1"
              title="Return to Admin Panel"
            >
              <ShieldCheck size={14} className="text-gold" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>

        {/* Filter Alert Banner (If Delayed Only active) */}
        {filterDelayedOnly && (
          <div className="mt-2.5 p-2 rounded-xl bg-rose-950/80 border border-rose-500 text-xs text-rose-200 flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <AlertTriangle size={14} className="text-rose-400" />
              Showing only DELAYED tickets needing immediate attention (&gt;15 min).
            </span>
            <button
              type="button"
              onClick={() => setFilterDelayedOnly(false)}
              className="font-bold underline text-white hover:text-rose-300 ml-4"
            >
              Show All Orders
            </button>
          </div>
        )}
      </header>

      {/* 4 ORGANIZED WORKFLOW COLUMNS (KANBAN GRID OPTIMIZED FOR LARGE SCREENS & TABLETS) */}
      <main className="flex-1 p-3 sm:p-5 overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 min-w-[320px] items-start">
          {/* ================= COLUMN 1: NEW ORDERS ================= */}
          <section className="bg-[#151C17] rounded-3xl border-2 border-amber-500/40 shadow-xl flex flex-col max-h-[calc(100vh-140px)] overflow-hidden">
            {/* Column Header */}
            <div className="p-4 bg-gradient-to-r from-amber-950/60 to-[#19221B] border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/40">
                  1
                </span>
                <div>
                  <h2 className="font-serif text-lg font-bold text-amber-200 leading-tight">
                    New Orders
                  </h2>
                  <span className="text-[10px] font-mono text-sand/60">
                    Awaiting Kitchen Acceptance
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-[#151C17] text-xs font-black">
                  {columnNewOrders.length}
                </span>
                {columnNewOrders.length > 1 && (
                  <button
                    type="button"
                    onClick={handleAcceptAllPending}
                    className="px-2 py-0.5 rounded-lg bg-amber-500/30 hover:bg-amber-500 hover:text-black text-amber-200 text-[10px] font-bold uppercase transition-all"
                    title="Accept all new tickets"
                  >
                    Accept All
                  </button>
                )}
              </div>
            </div>

            {/* Column Cards Container */}
            <div className="p-3 space-y-3.5 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-amber-900">
              {columnNewOrders.length === 0 ? (
                <div className="py-16 text-center text-sand/40 p-4">
                  <CheckCircle2 size={32} className="mx-auto mb-2 text-amber-500/40" />
                  <p className="text-sm font-serif font-bold text-sand/60">Queue Clear</p>
                  <p className="text-xs mt-1">No incoming tickets waiting</p>
                </div>
              ) : (
                columnNewOrders.map((order) => (
                  <KitchenOrderCard
                    key={order.id}
                    order={order}
                    now={now}
                    checkedItems={checkedItems}
                    onToggleCheck={toggleItemChecked}
                    getElapsed={getElapsed}
                    getPriorityInfo={getPriorityInfo}
                    primaryAction={{
                      label: "Accept & Cook",
                      icon: Flame,
                      color: "bg-amber-500 hover:bg-amber-400 text-black",
                      onClick: () => updateOrderStatus(order.id, "Preparing"),
                    }}
                    onStatusChange={(status) => updateOrderStatus(order.id, status)}
                  />
                ))
              )}
            </div>
          </section>

          {/* ================= COLUMN 2: PREPARING ================= */}
          <section className="bg-[#151C17] rounded-3xl border-2 border-orange-500/40 shadow-xl flex flex-col max-h-[calc(100vh-140px)] overflow-hidden">
            {/* Column Header */}
            <div className="p-4 bg-gradient-to-r from-orange-950/60 to-[#19221B] border-b border-orange-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-500/20 text-orange-300 font-mono font-bold text-xs border border-orange-500/40">
                  2
                </span>
                <div>
                  <h2 className="font-serif text-lg font-bold text-orange-200 leading-tight">
                    Preparing
                  </h2>
                  <span className="text-[10px] font-mono text-sand/60">
                    Over Flame &amp; Plating
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-orange-500 text-white text-xs font-black">
                {columnPreparing.length}
              </span>
            </div>

            {/* Column Cards Container */}
            <div className="p-3 space-y-3.5 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-orange-900">
              {columnPreparing.length === 0 ? (
                <div className="py-16 text-center text-sand/40 p-4">
                  <Flame size={32} className="mx-auto mb-2 text-orange-500/40" />
                  <p className="text-sm font-serif font-bold text-sand/60">Stoves Standing By</p>
                  <p className="text-xs mt-1">Accept new tickets to begin prep</p>
                </div>
              ) : (
                columnPreparing.map((order) => (
                  <KitchenOrderCard
                    key={order.id}
                    order={order}
                    now={now}
                    checkedItems={checkedItems}
                    onToggleCheck={toggleItemChecked}
                    getElapsed={getElapsed}
                    getPriorityInfo={getPriorityInfo}
                    primaryAction={{
                      label: "Plated & Ready",
                      icon: Utensils,
                      color: "bg-orange-500 hover:bg-orange-400 text-white font-black",
                      onClick: () => updateOrderStatus(order.id, "Ready"),
                    }}
                    secondaryAction={{
                      label: "Back to New",
                      icon: RotateCcw,
                      onClick: () => updateOrderStatus(order.id, "Pending"),
                    }}
                    onStatusChange={(status) => updateOrderStatus(order.id, status)}
                  />
                ))
              )}
            </div>
          </section>

          {/* ================= COLUMN 3: READY ================= */}
          <section className="bg-[#151C17] rounded-3xl border-2 border-emerald-500/40 shadow-xl flex flex-col max-h-[calc(100vh-140px)] overflow-hidden">
            {/* Column Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-950/60 to-[#19221B] border-b border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/40">
                  3
                </span>
                <div>
                  <h2 className="font-serif text-lg font-bold text-emerald-200 leading-tight">
                    Ready on Pass
                  </h2>
                  <span className="text-[10px] font-mono text-sand/60">
                    Awaiting Table Runner
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-[#151C17] text-xs font-black">
                {columnReady.length}
              </span>
            </div>

            {/* Column Cards Container */}
            <div className="p-3 space-y-3.5 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-emerald-900">
              {columnReady.length === 0 ? (
                <div className="py-16 text-center text-sand/40 p-4">
                  <Utensils size={32} className="mx-auto mb-2 text-emerald-500/40" />
                  <p className="text-sm font-serif font-bold text-sand/60">Pass Clear</p>
                  <p className="text-xs mt-1">No finished plates waiting</p>
                </div>
              ) : (
                columnReady.map((order) => (
                  <KitchenOrderCard
                    key={order.id}
                    order={order}
                    now={now}
                    checkedItems={checkedItems}
                    onToggleCheck={toggleItemChecked}
                    getElapsed={getElapsed}
                    getPriorityInfo={getPriorityInfo}
                    primaryAction={{
                      label: "Served to Table",
                      icon: CheckCircle2,
                      color: "bg-emerald-500 hover:bg-emerald-400 text-black font-black",
                      onClick: () => updateOrderStatus(order.id, "Delivered"),
                    }}
                    secondaryAction={{
                      label: "Back to Prep",
                      icon: RotateCcw,
                      onClick: () => updateOrderStatus(order.id, "Preparing"),
                    }}
                    onStatusChange={(status) => updateOrderStatus(order.id, status)}
                  />
                ))
              )}
            </div>
          </section>

          {/* ================= COLUMN 4: COMPLETED ================= */}
          <section className="bg-[#151C17] rounded-3xl border-2 border-[#2C382F] shadow-xl flex flex-col max-h-[calc(100vh-140px)] overflow-hidden">
            {/* Column Header */}
            <div className="p-4 bg-gradient-to-r from-black/50 to-[#19221B] border-b border-[#2C382F] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-sand/15 text-sand font-mono font-bold text-xs border border-sand/30">
                  4
                </span>
                <div>
                  <h2 className="font-serif text-lg font-bold text-sand/90 leading-tight">
                    Completed
                  </h2>
                  <span className="text-[10px] font-mono text-sand/60">
                    Served &amp; Fulfilled
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-[#2C382F] text-sand text-xs font-bold">
                {columnCompleted.length}
              </span>
            </div>

            {/* Column Cards Container */}
            <div className="p-3 space-y-3.5 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-zinc-800 opacity-90">
              {columnCompleted.length === 0 ? (
                <div className="py-16 text-center text-sand/40 p-4">
                  <CheckCircle2 size={32} className="mx-auto mb-2 text-sand/30" />
                  <p className="text-sm font-serif font-bold text-sand/60">No Completed</p>
                  <p className="text-xs mt-1">Fulfilled orders will appear here</p>
                </div>
              ) : (
                columnCompleted.map((order) => (
                  <KitchenOrderCard
                    key={order.id}
                    order={order}
                    now={now}
                    isCompleted
                    checkedItems={checkedItems}
                    onToggleCheck={toggleItemChecked}
                    getElapsed={getElapsed}
                    getPriorityInfo={getPriorityInfo}
                    secondaryAction={{
                      label: "Recall to Ready",
                      icon: RotateCcw,
                      onClick: () => updateOrderStatus(order.id, "Ready"),
                    }}
                    onStatusChange={(status) => updateOrderStatus(order.id, status)}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// ====================================================================================
// HIGH-VISIBILITY KITCHEN ORDER TICKET CARD (HIGH CONTRAST FOR COMMERCIAL KDS SCREENS)
// ====================================================================================

interface KitchenOrderCardProps {
  order: KitchenOrder;
  now: Date;
  isCompleted?: boolean;
  checkedItems: Record<string, boolean>;
  onToggleCheck: (orderId: number, itemIndex: number) => void;
  getElapsed: (createdAt: string) => {
    minutes: number;
    seconds: number;
    formatted: string;
    isDelayed: boolean;
    isWarning: boolean;
  };
  getPriorityInfo: (order: KitchenOrder, isDelayed: boolean) => {
    isVip: boolean;
    hasAllergy: boolean;
    isDelayed: boolean;
  };
  primaryAction?: {
    label: string;
    icon: any;
    color: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    icon: any;
    onClick: () => void;
  };
  onStatusChange: (status: any) => void;
}

function KitchenOrderCard({
  order,
  now,
  isCompleted = false,
  checkedItems,
  onToggleCheck,
  getElapsed,
  getPriorityInfo,
  primaryAction,
  secondaryAction,
  onStatusChange,
}: KitchenOrderCardProps) {
  const { minutes, formatted, isDelayed, isWarning } = getElapsed(order.created_at);
  const { isVip, hasAllergy } = getPriorityInfo(order, isDelayed);

  // Border styling dynamically changes if delayed or warning
  const cardBorderClass = isCompleted
    ? "border-[#2A372E] bg-[#1A221C]"
    : isDelayed
    ? "border-rose-500 bg-[#201518] shadow-lg shadow-rose-950/40 ring-1 ring-rose-500 animate-pulse"
    : isWarning
    ? "border-amber-400 bg-[#1D1E17] shadow-md shadow-amber-950/20"
    : order.status === "Preparing"
    ? "border-orange-500/60 bg-[#1B221D]"
    : order.status === "Ready"
    ? "border-emerald-500/60 bg-[#1B231E]"
    : "border-amber-500/40 bg-[#1B231D]";

  const timerColorClass = isCompleted
    ? "bg-black/40 text-sand/60 border-sand/20"
    : isDelayed
    ? "bg-rose-600 text-white font-black animate-bounce"
    : isWarning
    ? "bg-amber-500 text-black font-bold"
    : "bg-black/50 text-emerald-400 font-mono border-emerald-500/30";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`rounded-2xl border-2 p-3.5 transition-all text-white flex flex-col justify-between ${cardBorderClass}`}
    >
      <div>
        {/* TOP TICKET HEADER: ID, TABLE & LIVE PREP TIMER */}
        <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm sm:text-base font-black text-gold tracking-tight">
                #{order.id}
              </span>

              {/* Table Badge */}
              <span className="px-2.5 py-0.5 rounded-lg bg-white/10 font-bold text-xs sm:text-sm text-white border border-white/15">
                {typeof order.table_no === "number"
                  ? `Table ${order.table_no}`
                  : order.table_no || "Takeaway"}
              </span>
            </div>

            {/* Placed At Time */}
            <span className="text-[10px] text-sand/50 font-mono block mt-0.5">
              In:{" "}
              {new Date(order.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* Preparation Duration Live Ticker */}
          <div className="flex flex-col items-end">
            <span
              className={`px-2.5 py-1 rounded-xl text-xs sm:text-sm font-mono tracking-wider border shadow-sm flex items-center gap-1 ${timerColorClass}`}
            >
              <Clock size={12} />
              <span>{isCompleted ? "Served" : formatted}</span>
            </span>

            {/* Delayed Warning Pill */}
            {isDelayed && !isCompleted && (
              <span className="mt-1 text-[9px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-0.5">
                <AlertTriangle size={10} />
                <span>DELAYED &gt;15M</span>
              </span>
            )}
          </div>
        </div>

        {/* PRIORITY & SPECIAL BADGES ROW */}
        {(isVip || hasAllergy || isDelayed) && (
          <div className="flex flex-wrap gap-1.5 pt-2 pb-1">
            {isVip && (
              <span className="px-2 py-0.5 rounded-md bg-gold/20 text-gold border border-gold/40 text-[10px] font-bold flex items-center gap-1 uppercase tracking-wide">
                <Star size={10} fill="currentColor" />
                <span>VIP Table</span>
              </span>
            )}

            {hasAllergy && (
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/50 text-[10px] font-bold flex items-center gap-1 uppercase tracking-wide">
                <AlertTriangle size={10} />
                <span>Allergy Alert</span>
              </span>
            )}
          </div>
        )}

        {/* ORDERED DISHES LIST (WITH INTERACTIVE CHEF CHECK-OFF) */}
        <div className="py-2.5 space-y-2 border-b border-white/10">
          {order.order_items && order.order_items.length > 0 ? (
            order.order_items.map((item, idx) => {
              const itemKey = `${order.id}-${idx}`;
              const isChecked = Boolean(checkedItems[itemKey]);

              return (
                <div
                  key={idx}
                  onClick={() => onToggleCheck(order.id, idx)}
                  className={`p-2 rounded-xl transition-all cursor-pointer border ${
                    isChecked
                      ? "bg-black/20 border-white/5 opacity-50 line-through"
                      : "bg-white/5 hover:bg-white/10 border-white/10"
                  }`}
                  title="Click to mark item plated / cooked"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      {/* Checkbox */}
                      <span
                        className={`mt-0.5 grid h-4 w-4 place-items-center rounded border shrink-0 transition-colors ${
                          isChecked
                            ? "bg-emerald-500 border-emerald-400 text-black"
                            : "border-sand/40 bg-black/40 text-transparent"
                        }`}
                      >
                        <Check size={11} className="stroke-[3]" />
                      </span>

                      {/* Quantity & Item Name */}
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-white leading-snug">
                          <strong className="text-gold font-extrabold mr-1 text-sm sm:text-base">
                            {item.quantity}×
                          </strong>
                          {item.menu_items?.name || "Kitchen Course"}
                        </span>

                        {/* Customization Details Badges */}
                        {(item.customizations || item.customization) && (
                          <div className="mt-1 text-[11px] font-mono text-amber-200 bg-amber-950/60 border border-amber-500/30 rounded-lg px-2 py-0.5 leading-relaxed">
                            {item.customizations ||
                              (typeof item.customization === "string"
                                ? item.customization
                                : [
                                    item.customization?.portion?.label,
                                    item.customization?.spiceLevel
                                      ? `Spice: ${item.customization.spiceLevel}`
                                      : "",
                                    item.customization?.toppings?.length
                                      ? `Add: ${item.customization.toppings
                                          .map((t: any) => t.name)
                                          .join(", ")}`
                                      : "",
                                  ]
                                    .filter(Boolean)
                                    .join(" • "))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-sand/60 italic p-1">Chef Tasting Degustation</p>
          )}

          {/* Chef Special Notes Callout */}
          {order.notes && (
            <div className="p-2.5 rounded-xl bg-amber-950/70 border border-amber-400/50 text-[11px] text-amber-100 flex items-start gap-1.5">
              <span className="text-amber-400 font-bold shrink-0">Note:</span>
              <span className="font-sans leading-snug">{order.notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* TICKET FOOTER: TOTAL, STAGE ADVANCE BUTTON & RECALL */}
      <div className="pt-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-sand/60 font-mono">
          <span>${Number(order.total || 0).toFixed(2)}</span>
          <span className="capitalize text-sand/75">
            {order.payment_status || "Pending"}
          </span>
        </div>

        {/* PRIMARY TOUCH ACTION BUTTON */}
        {primaryAction && (
          <button
            type="button"
            onClick={primaryAction.onClick}
            className={`w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider font-extrabold shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 ${primaryAction.color}`}
          >
            {primaryAction.icon && <primaryAction.icon size={16} />}
            <span>{primaryAction.label}</span>
          </button>
        )}

        {/* SECONDARY / RECALL BUTTON */}
        {secondaryAction && (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className="w-full py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-sand/70 hover:text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
          >
            {secondaryAction.icon && <secondaryAction.icon size={12} />}
            <span>{secondaryAction.label}</span>
          </button>
        )}

        {/* FAST DIRECT STAGE SELECTOR DROPDOWN */}
        <div className="pt-1 flex items-center justify-between gap-2 text-[10px] text-sand/50">
          <span>Jump:</span>
          <select
            value={order.status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="bg-black/50 border border-white/15 rounded-lg px-2 py-1 text-[11px] text-sand outline-none focus:border-gold"
          >
            <option value="Pending">1. New (Pending)</option>
            <option value="Preparing">2. Preparing</option>
            <option value="Ready">3. Ready on Pass</option>
            <option value="Delivered">4. Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
}
