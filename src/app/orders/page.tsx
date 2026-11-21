"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ChefHat,
  BellRing,
  CheckCircle2,
  PackageCheck,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Flame,
  Check,
  RefreshCw,
  Play,
  CreditCard,
  Banknote,
  Smartphone,
  Landmark,
  Search,
  Filter,
  RotateCcw,
  Receipt,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Printer,
  Calendar,
  AlertCircle,
  Copy,
  Utensils,
  LogIn,
  Truck,
  MapPin,
  Navigation,
  Phone,
  Compass,
  Star,
  Users,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { useCart } from "@/components/Cart";
import { toast } from "@/lib/notify";
import NimzaLogo from "@/components/NimzaLogo";
import Img from "@/components/Img";
import LiveDeliveryMap from "@/components/LiveDeliveryMap";
import ReviewModal from "@/components/ReviewModal";
import {
  getStoredDeliveryOrders,
  DeliveryOrder,
  NIMZA_KITCHEN_COORDS,
} from "@/lib/delivery/deliveryTypes";

// Web Audio API chime when order status updates
const playChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {}
};

const STAGES = [
  {
    key: "Pending",
    label: "Pending",
    subtitle: "Order Received & Ticket Queued",
    desc: "Your order has been recorded and ticket queued on the kitchen pass.",
    icon: Clock,
    border: "border-amber-400",
    badge: "bg-amber-100 text-amber-900 border-amber-300",
    glow: "shadow-amber-100",
  },
  {
    key: "Preparing",
    label: "Preparing",
    subtitle: "Over Flame & Wood-Fire Cooking",
    desc: "Chef Elias & brigade are cooking your dishes over open flame and rolling fresh pasta.",
    icon: Flame,
    border: "border-orange-400",
    badge: "bg-orange-100 text-orange-900 border-orange-300",
    glow: "shadow-orange-100",
  },
  {
    key: "Ready",
    label: "Ready",
    subtitle: "Plated on Marble Pass & Ready to Serve",
    desc: "Your plates are dressed with finishing oils, quality checked, and resting on the hot pass.",
    icon: ChefHat,
    border: "border-emerald-400",
    badge: "bg-emerald-100 text-emerald-900 border-emerald-300",
    glow: "shadow-emerald-100",
  },
  {
    key: "Delivered",
    label: "Delivered",
    subtitle: "Served at Table",
    desc: "Dishes have been delivered to your table by our floor captain. Enjoy your meal!",
    icon: CheckCircle2,
    border: "border-gold",
    badge: "bg-olive text-gold border-gold/40",
    glow: "shadow-gold/20",
  },
];

const ITEMS_PER_PAGE = 5;

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const { add } = useCart();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<any | null>(null);
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([]);
  const [trackingModalOrder, setTrackingModalOrder] = useState<DeliveryOrder | null>(null);
  const [reviewModalOrder, setReviewModalOrder] = useState<any | null>(null);

  // Sync delivery orders from storage
  const syncDeliveryOrders = useCallback(() => {
    const list = getStoredDeliveryOrders();
    setDeliveryOrders(list);
    // Keep tracking modal in sync if open
    setTrackingModalOrder((current) => {
      if (!current) return null;
      const updated = list.find((d) => d.id === current.id);
      return updated || current;
    });
  }, []);

  // Load customer orders from Supabase (strictly filtered by user_id) + local session cache
  const loadOrders = useCallback(async () => {
    setIsRefreshing(true);
    try {
      let dbOrders: any[] = [];
      if (user?.id && isSupabaseConfigured) {
        // Customer sees strictly their own orders
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
              menu_item_id,
              menu_items (
                id,
                name,
                price,
                image_url,
                description
              )
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        dbOrders = res.data || [];
      }

      // Load locally placed orders belonging strictly to this user/session
      let localOrders: any[] = [];
      try {
        const raw = JSON.parse(localStorage.getItem("nimza_placed_orders") || "[]");
        localOrders = raw.filter((o: any) => {
          if (user?.id) return o.user_id === user.id;
          return !o.user_id; // Anonymous guest session orders before sign in
        });
      } catch {}

      const mergedMap = new Map<number, any>();
      localOrders.forEach((o) => mergedMap.set(o.id, o));
      dbOrders.forEach((o) => mergedMap.set(o.id, o));

      const finalOrders = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );

      setOrders(finalOrders);
    } catch {
      // Fallback
    } finally {
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    loadOrders();
    syncDeliveryOrders();

    // 1. Supabase Realtime Listener on 'orders' table if configured
    let channel: any = null;
    if (isSupabaseConfigured) {
      channel = supabase
        .channel("customer-orders-history-tracker")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
          },
          (payload: any) => {
            if (payload.eventType === "UPDATE") {
              const updatedId = payload.new.id;
              const newStatus = payload.new.status;

              // Sound chime
              playChime();
              toast(`🛎️ Order #${updatedId} is now ${newStatus}!`, "info");

              setOrders((prev) =>
                prev.map((o) => (o.id === updatedId ? { ...o, status: newStatus } : o))
              );

              // Update modal if currently opened
              setSelectedOrderForModal((curr: any) => {
                if (curr && curr.id === updatedId) {
                  return { ...curr, status: newStatus };
                }
                return curr;
              });

              // Update localStorage
              try {
                const stored = JSON.parse(localStorage.getItem("nimza_placed_orders") || "[]");
                const updated = stored.map((o: any) =>
                  o.id === updatedId ? { ...o, status: newStatus } : o
                );
                localStorage.setItem("nimza_placed_orders", JSON.stringify(updated));
              } catch {}
            } else if (payload.eventType === "INSERT") {
              loadOrders();
            }
          }
        )
        .subscribe();
    }

    // 2. Custom storage & window event listener for cross-tab sync
    const handleStorageUpdate = () => {
      loadOrders();
      syncDeliveryOrders();
    };
    window.addEventListener("nimza_order_updated", handleStorageUpdate);
    window.addEventListener("nimza_order_created", handleStorageUpdate);
    window.addEventListener("nimza_delivery_orders_updated", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      if (channel) supabase.removeChannel(channel);
      window.removeEventListener("nimza_order_updated", handleStorageUpdate);
      window.removeEventListener("nimza_order_created", handleStorageUpdate);
      window.removeEventListener("nimza_delivery_orders_updated", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, [user, authLoading, loadOrders, syncDeliveryOrders]);

  // Simulation handler to test the 4 stages live (Pending -> Preparing -> Ready -> Delivered)
  const advanceStage = async (orderId: number, currentStatus: string) => {
    const stageFlow = ["Pending", "Preparing", "Ready", "Delivered"];
    const currentIdx = stageFlow.indexOf(currentStatus);
    const nextStatus = stageFlow[(currentIdx + 1) % stageFlow.length];

    playChime();
    toast(`Status advancing to: "${nextStatus}"...`, "info");

    // 1. Update Supabase
    try {
      await supabase.from("orders").update({ status: nextStatus }).eq("id", orderId);
    } catch {}

    // 2. Update local state
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );

    // 3. Update localStorage and broadcast
    try {
      const stored = JSON.parse(localStorage.getItem("nimza_placed_orders") || "[]");
      const updated = stored.map((o: any) =>
        o.id === orderId ? { ...o, status: nextStatus } : o
      );
      localStorage.setItem("nimza_placed_orders", JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent("nimza_order_updated", {
          detail: { id: orderId, status: nextStatus },
        })
      );
    } catch {}
  };

  // 1-Click Reorder feature: adds previous items to the cart
  const handleReorder = (order: any) => {
    if (!order.order_items || order.order_items.length === 0) {
      toast("No dishes found to reorder", "info");
      return;
    }

    let addedCount = 0;
    order.order_items.forEach((item: any) => {
      const dish = {
        id: item.menu_items?.id || item.menu_item_id || item.id || 1,
        name: item.menu_items?.name || item.name || "Artisanal Dish",
        price: Number(item.menu_items?.price || item.price || 0),
        image_url: item.menu_items?.image_url || item.image_url,
        description: item.menu_items?.description || item.description,
      };

      add(dish, item.customization, item.quantity || 1);
      addedCount += item.quantity || 1;
    });

    playChime();
    toast(
      `Reordered ${addedCount} dish${addedCount > 1 ? "es" : ""} from Order #${order.id}!`,
      "success"
    );
  };

  // Filtered and searched orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Status Filter
      if (statusFilter !== "All") {
        if (statusFilter === "Active") {
          if (["Delivered", "Cancelled"].includes(order.status)) return false;
        } else if (statusFilter === "Completed") {
          if (order.status !== "Delivered") return false;
        } else if (order.status?.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      // 2. Search Query (by order number, table, notes, or dish name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = String(order.id).includes(q);
        const matchesTable = String(order.table_no || "").toLowerCase().includes(q);
        const matchesNotes = (order.notes || "").toLowerCase().includes(q);
        const matchesDish = (order.order_items || []).some((it: any) =>
          (it.menu_items?.name || it.name || "").toLowerCase().includes(q)
        );

        if (!matchesId && !matchesTable && !matchesNotes && !matchesDish) {
          return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  // Reset to page 1 on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  // Counts for status pills
  const counts = useMemo(() => {
    const total = orders.length;
    const active = orders.filter((o) => ["Pending", "Preparing", "Ready"].includes(o.status)).length;
    const completed = orders.filter((o) => o.status === "Delivered").length;
    const cancelled = orders.filter((o) => o.status === "Cancelled").length;
    return { total, active, completed, cancelled };
  }, [orders]);

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-charcoal pt-36 pb-28 px-5 md:px-12 selection:bg-gold/20 overflow-x-hidden">
      <div className="mx-auto max-w-5xl">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 mb-8 border-b border-sand">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#1F241F] shadow-sm mb-3">
              <Sparkles size={12} className="text-gold" />
              <span>Gastronomy Ledger &amp; Live Tracking</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-[#1F241F] tracking-tight">
              Order History
            </h1>
            <p className="text-sm md:text-base text-charcoal/70 mt-2 max-w-xl font-light leading-relaxed">
              Track live kitchen preparation, review past culinary dining tickets, print detailed receipts, or reorder favorite tasting dishes.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadOrders}
              disabled={isRefreshing}
              className="btn-d !py-2.5 !px-4 text-xs flex items-center gap-2 shadow-xs rounded-full"
              title="Refresh order history"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin text-gold" : "text-gold"} />
              <span>Refresh Ledger</span>
            </button>
            <NimzaLogo variant="badge" size="sm" />
          </div>
        </div>

        {/* GUEST NOTICE BANNER (IF UNREGISTERED / NOT LOGGED IN) */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 sm:p-5 rounded-3xl bg-amber-50 border border-amber-200/90 text-amber-950 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-amber-200/80 text-amber-900 shrink-0">
                <LogIn size={16} />
              </div>
              <p>
                <strong>Browsing as dining guest:</strong> Showing orders placed during this active session. Sign in to your VIP account to access your permanent order history from any device.
              </p>
            </div>
            <Link
              href="/login"
              className="shrink-0 rounded-full bg-[#1F241F] hover:bg-gold hover:text-[#1F241F] text-white px-4 py-2 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
            >
              Sign In Now
            </Link>
          </motion.div>
        )}

        {/* SEARCH & STATUS FILTER CONTROLS */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-sand shadow-xs mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { key: "All", label: "All Orders", count: counts.total },
              { key: "Active", label: "Active Tracking", count: counts.active },
              { key: "Completed", label: "Completed", count: counts.completed },
              { key: "Cancelled", label: "Cancelled", count: counts.cancelled },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  statusFilter === key
                    ? "bg-[#1F241F] text-gold shadow-sm"
                    : "bg-sand/30 text-charcoal/70 hover:bg-sand hover:text-charcoal"
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    statusFilter === key
                      ? "bg-gold text-charcoal font-black"
                      : "bg-white/80 text-charcoal/60"
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order # or Dish..."
              className="w-full pl-9 pr-8 py-2 rounded-full bg-sand/20 border border-sand text-xs text-charcoal placeholder-charcoal/45 outline-none focus:border-gold focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* ORDERS LIST */}
        {orders.length === 0 ? (
          /* Empty State for New Customers */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-12 sm:p-16 text-center border border-sand shadow-sm max-w-xl mx-auto"
          >
            <div className="mx-auto w-20 h-20 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center mb-6 shadow-xs">
              <ShoppingBag size={36} className="text-[#8C6D2D]" />
            </div>
            <h3 className="font-serif text-3xl font-bold text-[#1F241F]">No Orders Found</h3>
            <p className="text-sm md:text-base text-charcoal/65 mt-3 leading-relaxed font-light">
              {user
                ? "You haven't placed any culinary orders under this account yet. Discover our harvest and fine dining rituals."
                : "No orders found in this session. Sign in to view your account order records or explore our menu."}
            </p>
            <div className="pt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/menu"
                className="btn !bg-gold hover:!bg-gold-light !text-[#1F241F] !py-3 !px-7 text-xs uppercase tracking-wider font-bold rounded-full shadow-md transition-all hover:scale-105"
              >
                <Utensils size={14} className="mr-1.5" />
                <span>Explore The Menu</span>
              </Link>
              {!user && (
                <Link
                  href="/login"
                  className="btn-o !border-sand !bg-white hover:!bg-sand/30 hover:!border-gold !text-[#1F241F] !py-3 !px-7 text-xs uppercase tracking-wider font-bold rounded-full transition-all"
                >
                  <span>Sign In to Account</span>
                </Link>
              )}
            </div>
          </motion.div>
        ) : filteredOrders.length === 0 ? (
          /* Empty Search / Filter Results State */
          <div className="bg-white rounded-3xl p-10 text-center border border-sand text-charcoal/70">
            <Filter size={32} className="mx-auto text-gold mb-3 opacity-60" />
            <h4 className="font-serif text-xl font-bold text-[#1F241F]">
              No Orders Match Your Filter
            </h4>
            <p className="text-xs text-charcoal/60 mt-1 max-w-md mx-auto">
              No orders found matching status &ldquo;{statusFilter}&rdquo;
              {searchQuery ? ` and search &ldquo;${searchQuery}&rdquo;` : ""}.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("All");
                setSearchQuery("");
              }}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-sand bg-sand/30 text-xs font-bold text-charcoal hover:bg-gold hover:text-charcoal transition-all"
            >
              <RotateCcw size={13} />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          /* Paginated Orders Display */
          <div className="space-y-8">
            <AnimatePresence>
              {paginatedOrders.map((order) => {
                const currentStageIdx = STAGES.findIndex((s) => s.key === order.status);
                const activeIdx = currentStageIdx >= 0 ? currentStageIdx : 0;
                const activeStageInfo = STAGES[activeIdx] || STAGES[0];
                const isDelivered = order.status === "Delivered";
                const isCancelled = order.status === "Cancelled";
                const isActive = !isDelivered && !isCancelled;

                // Match with Delivery Dispatch System
                const matchingDelivery =
                  deliveryOrders.find((d) => d.id === order.id || d.id === Number(order.id)) ||
                  (order.order_type === "delivery"
                    ? ({
                        id: order.id,
                        status: (order.delivery_status || order.status || "Pending") as any,
                        customer_name: user?.user_metadata?.full_name || "Valued Patron",
                        customer_phone: order.delivery_phone || "+1 (555) 000-0000",
                        delivery_address: order.delivery_address || "Customer Residence",
                        city_district: "Gastronomy District",
                        items: [],
                        total: Number(order.total || 0),
                        payment_method: order.payment_method || "Paid",
                        payment_status: "Paid",
                        driver_lat: 45.4685,
                        driver_lng: 9.1975,
                        dest_lat: 45.474,
                        dest_lng: 9.206,
                        progress_percent: 50,
                        distance_km: 1.8,
                        eta_minutes: 10,
                        created_at: order.created_at,
                        driver_name: "Marco Rossi",
                        driver_phone: "+1 (555) 382-9102",
                        driver_vehicle: "Motorcycle (NZ-482-B)",
                      } as DeliveryOrder)
                    : null);

                const isDeliveryOrder = Boolean(
                  matchingDelivery || order.order_type === "delivery" || order.delivery_address
                );

                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="bg-white rounded-[2.5rem] p-6 sm:p-8 md:p-10 border-2 border-sand shadow-sm hover:border-gold/50 transition-all relative overflow-hidden"
                  >
                    {/* TOP HEADER: Order ID, Table # / Delivery, Status Badges, Total & Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sand">
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                          <h3 className="font-serif text-2xl md:text-3xl font-bold text-olive flex items-center gap-2">
                            <span>Order #{order.id}</span>
                          </h3>

                          {/* Seating or Delivery Badge */}
                          {isDeliveryOrder ? (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 flex items-center gap-1.5 shadow-2xs">
                              <Truck size={12} className="text-amber-700" />
                              <span>Doorstep Delivery</span>
                            </span>
                          ) : order.table_no ? (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sand/50 border border-sand text-charcoal/80">
                              Table #{order.table_no}
                            </span>
                          ) : null}

                          {/* Status Badge */}
                          <span
                            className={`rounded-full px-3 py-0.5 text-xs font-bold border uppercase tracking-wider flex items-center gap-1.5 ${
                              isCancelled
                                ? "bg-rose-100 text-rose-900 border-rose-300"
                                : isDelivered
                                ? "bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold"
                                : activeStageInfo.badge
                            }`}
                          >
                            {isActive && <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />}
                            <span>{order.status}</span>
                          </span>

                          {/* Payment Status Badge */}
                          {order.payment_status === "Paid" || order.payment_method?.includes("Card") ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                              <CheckCircle2 size={11} className="text-emerald-700" />
                              <span>Paid</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-full">
                              <Clock size={11} className="text-amber-700" />
                              <span>{isDeliveryOrder ? "Pay on Delivery" : "Pay at Table"}</span>
                            </span>
                          )}

                          {/* Payment Method Badge */}
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sand/30 border border-sand text-charcoal/80">
                            {order.payment_method?.includes("Card") ? (
                              <CreditCard size={12} className="text-gold" />
                            ) : order.payment_method?.includes("Wallet") ? (
                              <Smartphone size={12} className="text-gold" />
                            ) : order.payment_method?.includes("Wire") || order.payment_method?.includes("Corporate") ? (
                              <Landmark size={12} className="text-gold" />
                            ) : (
                              <Banknote size={12} className="text-gold" />
                            )}
                            <span>{order.payment_method || "Cash Payment"}</span>
                          </span>
                        </div>

                        {/* Delivery Address if present */}
                        {(order.delivery_address || matchingDelivery?.delivery_address) && (
                          <p className="text-xs text-charcoal/80 mt-2 flex items-center gap-1.5 font-medium">
                            <MapPin size={13} className="text-gold shrink-0" />
                            <span>
                              Delivery Destination:{" "}
                              <strong className="text-olive">
                                {order.delivery_address || matchingDelivery?.delivery_address}
                              </strong>
                            </span>
                          </p>
                        )}

                        {/* Order Placed Timestamp */}
                        <p className="text-xs text-charcoal/60 mt-1.5 flex items-center gap-1.5">
                          <Calendar size={13} className="text-gold" />
                          <span>
                            Placed on{" "}
                            {new Date(order.created_at).toLocaleString([], {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                        </p>
                      </div>

                      {/* Total Bill Box */}
                      <div className="text-left sm:text-right">
                        <span className="text-[11px] text-charcoal/60 uppercase tracking-widest font-bold">
                          Total Bill
                        </span>
                        <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1F241F]">
                          ${Number(order.total || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-charcoal/50 font-medium">
                          (Rs. {Math.round(Number(order.total || 0) * 280).toLocaleString()} PKR)
                        </p>
                        {order.split_count && order.split_count > 1 && (
                          <div className="mt-1.5 flex items-center justify-start sm:justify-end">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold/15 text-[#8C6D2D] border border-gold/40">
                              <Users size={11} />
                              <span>Split: {order.split_count} Diners (Rs. {order.split_per_person_pkr?.toLocaleString()} / each)</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* STAGE VISUAL STEPPER (FOR ACTIVE ORDERS) OR FULFILLED NOTICE */}
                    {isCancelled ? (
                      <div className="my-6 p-5 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-950 flex items-center gap-3.5">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-200 text-rose-800 font-bold">
                          ✕
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-base text-rose-950">
                            Order Cancelled by Administration
                          </h4>
                          <p className="text-xs text-rose-800/90 mt-0.5">
                            This ticket was cancelled by management. Please consult your floor captain or reorder from our menu.
                          </p>
                        </div>
                      </div>
                    ) : isDelivered ? (
                      <div className="my-6 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-200 text-emerald-800">
                            <CheckCircle2 size={18} />
                          </div>
                          <div>
                            <span className="font-serif font-bold text-sm text-emerald-950">
                              Order Delivered &amp; Fulfilled
                            </span>
                            <p className="text-xs text-emerald-800/80">
                              Delivered to your dining table. Thank you for dining with Nimza!
                            </p>
                          </div>
                        </div>

                        <span className="hidden sm:inline-block text-xs font-mono font-bold text-emerald-700 bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200">
                          Completed Ticket
                        </span>
                      </div>
                    ) : (
                      /* 4-Stage Active Tracker */
                      <div className="py-6">
                        {/* Progress Line */}
                        <div className="relative mb-6 hidden md:block">
                          <div className="absolute top-1/2 left-8 right-8 h-1.5 -translate-y-1/2 rounded-full bg-sand/40" />
                          <motion.div
                            className="absolute top-1/2 left-8 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-500"
                            initial={false}
                            animate={{
                              width: `${(activeIdx / (STAGES.length - 1)) * 90}%`,
                            }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </div>

                        {/* 4 Stage Pills */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          {STAGES.map((stage, idx) => {
                            const Icon = stage.icon;
                            const isComplete = idx < activeIdx;
                            const isCurrent = idx === activeIdx;

                            return (
                              <div
                                key={stage.key}
                                className={`p-4 rounded-2xl border transition-all duration-300 ${
                                  isCurrent
                                    ? "bg-olive text-ivory border-gold ring-2 ring-gold/40 shadow-md scale-[1.02]"
                                    : isComplete
                                    ? "bg-sand/30 border-gold/40 text-olive"
                                    : "bg-white border-sand/60 text-charcoal/40"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div
                                    className={`p-1.5 rounded-lg ${
                                      isCurrent
                                        ? "bg-gold text-charcoal animate-pulse"
                                        : isComplete
                                        ? "bg-gold/20 text-gold-dark"
                                        : "bg-sand/30 text-charcoal/30"
                                    }`}
                                  >
                                    <Icon size={16} />
                                  </div>
                                  <span className="font-mono text-[10px] font-bold opacity-60">
                                    0{idx + 1}
                                  </span>
                                </div>

                                <p
                                  className={`font-serif text-sm font-bold ${
                                    isCurrent ? "text-gold" : "text-charcoal"
                                  }`}
                                >
                                  {stage.label}
                                </p>
                                <p
                                  className={`text-[9px] uppercase font-bold tracking-wider mt-0.5 ${
                                    isCurrent ? "text-sand" : "text-charcoal/50"
                                  }`}
                                >
                                  {stage.subtitle}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ASSIGNED COURIER BANNER FOR DELIVERY ORDERS */}
                    {isDeliveryOrder && matchingDelivery?.driver_name && (
                      <div className="my-5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3.5">
                          <div className="relative h-11 w-11 rounded-full overflow-hidden border-2 border-gold/80 shrink-0 bg-white shadow-xs">
                            <img
                              src={
                                matchingDelivery.driver_avatar ||
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
                              }
                              alt={matchingDelivery.driver_name}
                              className="h-full w-full object-cover"
                            />
                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-serif font-bold text-sm text-[#1F241F]">
                                Assigned Courier: {matchingDelivery.driver_name}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                                {matchingDelivery.driver_vehicle || "Motorcycle"}
                              </span>
                            </div>
                            <p className="text-xs text-charcoal/70 mt-0.5">
                              Telemetry: <strong className="text-olive capitalize">{matchingDelivery.status}</strong>
                              {matchingDelivery.eta_minutes > 0
                                ? ` • ETA: ~${matchingDelivery.eta_minutes} mins`
                                : ""}
                              {matchingDelivery.distance_km > 0
                                ? ` (${matchingDelivery.distance_km} km remaining)`
                                : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                          {matchingDelivery.driver_phone && (
                            <a
                              href={`tel:${matchingDelivery.driver_phone}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-sand bg-white hover:border-gold hover:text-gold text-charcoal text-xs font-bold shadow-2xs transition-colors"
                            >
                              <Phone size={12} className="text-gold" />
                              <span>Call Driver</span>
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setTrackingModalOrder(matchingDelivery)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1F241F] text-gold hover:bg-gold hover:text-charcoal text-xs font-bold transition-all shadow-xs"
                          >
                            <Navigation size={12} className="text-gold" />
                            <span>Radar Map</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* DISHES LIST */}
                    <div className="pt-4 border-t border-sand/80">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal/60">
                          Dishes Ordered ({order.order_items?.reduce((s: number, i: any) => s + (i.quantity || 1), 0) || 0})
                        </h4>
                        <span className="text-xs text-charcoal/50">Itemized Breakdown</span>
                      </div>

                      <div className="space-y-2.5">
                        {order.order_items?.map((item: any, i: number) => {
                          const custText =
                            item.customizations ||
                            (item.customization
                              ? `${item.customization.portion?.label || ""}${
                                  item.customization.spiceLevel ? ` • ${item.customization.spiceLevel} Heat` : ""
                                }${
                                  item.customization.toppings?.length
                                    ? ` • +${item.customization.toppings.map((t: any) => t.name).join(", ")}`
                                    : ""
                                }`
                              : null);

                          return (
                            <div
                              key={i}
                              className="flex items-start justify-between py-2 text-sm text-charcoal/90 border-b border-sand/40 last:border-0"
                            >
                              <div className="flex items-start gap-3">
                                {item.menu_items?.image_url && (
                                  <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 border border-sand bg-sand/20">
                                    <Img
                                      src={item.menu_items.image_url}
                                      alt={item.menu_items?.name || "Dish"}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="flex flex-col">
                                  <span className="font-semibold text-charcoal">
                                    <strong className="text-gold font-bold mr-1.5">
                                      {item.quantity}×
                                    </strong>
                                    {item.menu_items?.name || item.name || "Artisanal Selection"}
                                  </span>
                                  {custText && (
                                    <span className="text-[11px] text-amber-900 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/60 font-sans italic mt-1 w-fit">
                                      ↳ {custText}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <span className="font-serif font-bold text-olive shrink-0 ml-3">
                                ${((Number(item.menu_items?.price || item.price || 0)) * (item.quantity || 1)).toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {order.notes && (
                        <p className="mt-3 text-xs text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200/80">
                          <strong>Kitchen Instructions:</strong> {order.notes}
                        </p>
                      )}
                    </div>

                    {/* CARD FOOTER ACTIONS: REORDER, VIEW SUMMARY & TEST ADVANCE */}
                    <div className="mt-6 pt-4 border-t border-sand/80 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {/* 1-Click Reorder Button */}
                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          className="rounded-full bg-gold hover:bg-gold-light text-[#1F241F] font-bold text-xs uppercase tracking-wider px-4 py-2 shadow-xs transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
                          title="Add all dishes from this order back to cart"
                        >
                          <RotateCcw size={13} />
                          <span>Reorder Dishes</span>
                        </button>

                        {/* View Detailed Summary / Receipt Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForModal(order)}
                          className="rounded-full border border-sand bg-white hover:border-gold hover:text-gold text-[#1F241F] font-semibold text-xs uppercase tracking-wider px-4 py-2 transition-all flex items-center gap-1.5"
                          title="Open itemized receipt and culinary summary"
                        >
                          <Receipt size={13} className="text-gold" />
                          <span>Order Summary</span>
                        </button>

                        {/* Leave Dining Review Button */}
                        <button
                          type="button"
                          onClick={() => setReviewModalOrder(order)}
                          className="rounded-full border border-sand bg-white hover:border-gold hover:text-gold text-[#1F241F] font-semibold text-xs uppercase tracking-wider px-3.5 py-2 transition-all flex items-center gap-1.5"
                          title="Share feedback & earn +25 VIP points"
                        >
                          <Star size={13} className="text-gold" />
                          <span>Review (+25 pts)</span>
                        </button>

                        {/* Track Courier Live Button (Zero External API Vector Radar) */}
                        {isDeliveryOrder && matchingDelivery && (
                          <button
                            type="button"
                            onClick={() => setTrackingModalOrder(matchingDelivery)}
                            className="rounded-full bg-[#1F241F] hover:bg-gold hover:text-[#1F241F] text-gold font-bold text-xs uppercase tracking-wider px-4 py-2 shadow-xs transition-all flex items-center gap-1.5 border border-gold/40 hover:scale-105 active:scale-95"
                            title="Open zero-API live vector radar map with courier telemetry"
                          >
                            <Navigation size={13} className="text-gold" />
                            <span>Track Courier Live 🛵</span>
                          </button>
                        )}
                      </div>

                      {/* Interactive Test Simulation Bar for Staff/Review */}
                      {isActive && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
                            Simulate:
                          </span>
                          <button
                            type="button"
                            onClick={() => advanceStage(order.id, order.status)}
                            className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs font-bold text-gold-dark hover:bg-gold hover:text-charcoal transition-all shadow-2xs"
                          >
                            <Play size={10} fill="currentColor" />
                            <span>Next Stage</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="bg-white p-4 rounded-2xl border border-sand shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal/70">
                <span>
                  Showing{" "}
                  <strong>
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}
                  </strong>{" "}
                  of <strong>{filteredOrders.length}</strong> orders
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="grid h-8 w-8 place-items-center rounded-full border border-sand bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-sand/30 transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 rounded-full text-xs font-bold transition-all ${
                          currentPage === pageNum
                            ? "bg-[#1F241F] text-gold shadow-xs"
                            : "bg-white border border-sand text-charcoal hover:border-gold"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="grid h-8 w-8 place-items-center rounded-full border border-sand bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-sand/30 transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BOTTOM CTA: BROWSE MORE DISHES */}
        <div className="mt-14 text-center">
          <Link
            href="/menu"
            className="btn !bg-[#1F241F] hover:!bg-gold hover:!text-[#1F241F] !text-white !py-3.5 !px-8 text-xs uppercase tracking-wider font-bold rounded-full inline-flex items-center gap-2 shadow-md transition-all hover:scale-105"
          >
            <ShoppingBag size={15} />
            <span>Order Another Dish</span>
          </Link>
        </div>
      </div>

      {/* DETAILED ORDER SUMMARY / RECEIPT MODAL */}
      <AnimatePresence>
        {selectedOrderForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrderForModal(null)}
              className="fixed inset-0 bg-black/65 backdrop-blur-xs"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] p-6 sm:p-8 md:p-10 border border-sand shadow-2xl text-charcoal z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-5 border-b border-sand">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gold/20 text-[#8C6D2D] grid place-items-center">
                    <Receipt size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gold block">
                      Official Gastronomy Receipt
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F241F]">
                      Order #{selectedOrderForModal.id}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrderForModal(null)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-sand/30 hover:bg-sand text-charcoal transition-colors"
                  aria-label="Close receipt"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Order Meta Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-sand text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-charcoal/50 block">Date</span>
                  <span className="font-medium text-charcoal">
                    {new Date(selectedOrderForModal.created_at).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-charcoal/50 block">Status</span>
                  <span className="font-bold text-olive capitalize">
                    {selectedOrderForModal.status}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-charcoal/50 block">Experience</span>
                  <span className="font-medium text-charcoal">
                    {selectedOrderForModal.delivery_address || selectedOrderForModal.order_type === "delivery"
                      ? "Doorstep Delivery"
                      : selectedOrderForModal.table_no
                      ? `Table #${selectedOrderForModal.table_no}`
                      : "Takeaway / Bar"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-charcoal/50 block">Payment</span>
                  <span className="font-bold text-emerald-800">
                    {selectedOrderForModal.payment_status || "Paid"}
                  </span>
                </div>
              </div>

              {/* Delivery Address Banner if delivery order */}
              {(selectedOrderForModal.delivery_address || selectedOrderForModal.order_type === "delivery") && (
                <div className="py-3 px-4 my-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={15} className="text-gold shrink-0" />
                    <span>
                      Delivery Destination:{" "}
                      <strong>
                        {selectedOrderForModal.delivery_address || "Customer Residence"}
                      </strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const match = deliveryOrders.find(
                        (d) => d.id === selectedOrderForModal.id || d.id === Number(selectedOrderForModal.id)
                      ) || {
                        id: selectedOrderForModal.id,
                        status: selectedOrderForModal.status,
                        customer_name: user?.user_metadata?.full_name || "Valued Patron",
                        customer_phone: selectedOrderForModal.delivery_phone || "+1 (555) 000-0000",
                        delivery_address: selectedOrderForModal.delivery_address || "Customer Residence",
                        city_district: "Gastronomy District",
                        items: [],
                        total: Number(selectedOrderForModal.total || 0),
                        payment_method: selectedOrderForModal.payment_method || "Paid",
                        payment_status: "Paid",
                        driver_lat: 45.4685,
                        driver_lng: 9.1975,
                        dest_lat: 45.474,
                        dest_lng: 9.206,
                        progress_percent: 50,
                        distance_km: 1.8,
                        eta_minutes: 10,
                        created_at: selectedOrderForModal.created_at,
                        driver_name: "Marco Rossi",
                        driver_phone: "+1 (555) 382-9102",
                        driver_vehicle: "Motorcycle (NZ-482-B)",
                      };
                      setTrackingModalOrder(match as any);
                      setSelectedOrderForModal(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F241F] text-gold hover:bg-gold hover:text-charcoal text-xs font-bold transition-all shadow-xs shrink-0"
                  >
                    <Navigation size={12} className="text-gold" />
                    <span>Live Radar</span>
                  </button>
                </div>
              )}

              {/* Itemized Receipt Table */}
              <div className="py-5 border-b border-sand">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-3">
                  Itemized Culinary Course Selection
                </h4>

                <div className="space-y-3">
                  {selectedOrderForModal.order_items?.map((item: any, idx: number) => {
                    const dishName = item.menu_items?.name || item.name || "Artisanal Selection";
                    const unitPrice = Number(item.menu_items?.price || item.price || 0);
                    const qty = item.quantity || 1;
                    const lineTotal = unitPrice * qty;

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-sand/20 border border-sand/60 flex items-start justify-between gap-3"
                      >
                        <div>
                          <span className="text-sm font-bold text-[#1F241F]">
                            <strong className="text-gold font-bold mr-1.5">{qty}×</strong>
                            {dishName}
                          </span>
                          {(item.customizations || item.customization) && (
                            <p className="text-[11px] text-amber-900 mt-1 font-mono">
                              ↳{" "}
                              {item.customizations ||
                                (typeof item.customization === "string"
                                  ? item.customization
                                  : `${item.customization.portion?.label || ""}${
                                      item.customization.spiceLevel
                                        ? ` • ${item.customization.spiceLevel}`
                                        : ""
                                    }`)}
                            </p>
                          )}
                        </div>
                        <span className="font-serif font-bold text-olive shrink-0">
                          ${lineTotal.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cost Summary Breakdown */}
              <div className="py-4 space-y-1.5 text-xs text-charcoal/70 border-b border-sand">
                <div className="flex justify-between">
                  <span>Subtotal Dishes</span>
                  <span className="font-mono">${Number(selectedOrderForModal.total || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service &amp; Kitchen Gratuity</span>
                  <span className="font-mono text-emerald-800">Included ($0.00)</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#1F241F] pt-2 border-t border-sand/60">
                  <span className="font-serif">Grand Total</span>
                  <div className="text-right">
                    <span className="font-serif text-xl font-bold text-olive">
                      ${Number(selectedOrderForModal.total || 0).toFixed(2)}
                    </span>
                    <span className="block text-[11px] font-normal text-charcoal/50">
                      Rs. {Math.round(Number(selectedOrderForModal.total || 0) * 280).toLocaleString()} PKR
                    </span>
                  </div>
                </div>
              </div>

              {/* Special Notes */}
              {selectedOrderForModal.notes && (
                <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <strong>Notes for Brigade:</strong> {selectedOrderForModal.notes}
                </div>
              )}

              {/* Modal Actions */}
              <div className="mt-6 pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto rounded-full border border-sand bg-white hover:bg-sand/30 text-charcoal text-xs font-bold uppercase tracking-wider px-4 py-2.5 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Printer size={14} />
                  <span>Print Receipt</span>
                </button>

                <div className="w-full sm:w-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleReorder(selectedOrderForModal);
                      setSelectedOrderForModal(null);
                    }}
                    className="flex-1 sm:flex-none rounded-full bg-gold hover:bg-gold-light text-[#1F241F] text-xs font-bold uppercase tracking-wider px-5 py-2.5 shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={14} />
                    <span>Reorder This Meal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedOrderForModal(null)}
                    className="flex-1 sm:flex-none rounded-full bg-[#1F241F] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ZERO-EXTERNAL-API LIVE COURIER RADAR TRACKING MODAL */}
      <AnimatePresence>
        {trackingModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTrackingModalOrder(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-4xl bg-charcoal rounded-[2.5rem] p-5 sm:p-8 border border-gold/40 shadow-2xl text-sand z-10 max-h-[92vh] overflow-y-auto flex flex-col gap-5"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-sand/20">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gold/20 text-gold grid place-items-center border border-gold/30 shrink-0">
                    <Navigation size={22} className="animate-spin" style={{ animationDuration: "12s" }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gold block">
                        Live Courier Telemetry • Zero External API
                      </span>
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                      Tracking Order #{trackingModalOrder.id}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Close telemetry modal"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Live Vector Radar Map */}
              <div className="w-full">
                <LiveDeliveryMap order={trackingModalOrder} />
              </div>

              {/* Delivery Metadata Footer */}
              <div className="p-4 rounded-2xl bg-black/40 border border-sand/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-sand/80">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gold shrink-0" />
                  <span>
                    Destination: <strong>{trackingModalOrder.delivery_address}</strong> ({trackingModalOrder.city_district})
                  </span>
                </div>
                {trackingModalOrder.driver_phone && (
                  <a
                    href={`tel:${trackingModalOrder.driver_phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/20 hover:bg-gold text-gold hover:text-charcoal border border-gold/40 font-bold transition-colors self-start sm:self-auto"
                  >
                    <Phone size={12} />
                    <span>Call Courier: {trackingModalOrder.driver_phone}</span>
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Customer Dining Review Modal */}
      <ReviewModal
        isOpen={Boolean(reviewModalOrder)}
        onClose={() => setReviewModalOrder(null)}
        orderId={reviewModalOrder?.id}
        dishName={reviewModalOrder?.order_items?.[0]?.menu_items?.name}
      />
    </main>
  );
}
