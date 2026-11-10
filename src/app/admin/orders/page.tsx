"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  CalendarCheck,
  ShoppingBag,
  Sparkles,
  User,
  Phone,
  RefreshCw,
  Flame,
  ChefHat,
  Check,
  AlertCircle,
  Filter,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { toast } from "@/lib/notify";
import NimzaLogo from "@/components/NimzaLogo";

const STATUS_CONFIG: Record<string, { label: string; color: string; next?: string }> = {
  Pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-900 border-amber-300",
    next: "Preparing",
  },
  Preparing: {
    label: "Preparing",
    color: "bg-orange-100 text-orange-900 border-orange-300",
    next: "Ready",
  },
  Ready: {
    label: "Ready",
    color: "bg-emerald-100 text-emerald-900 border-emerald-300",
    next: "Delivered",
  },
  Delivered: {
    label: "Delivered",
    color: "bg-olive-deep text-sand border-gold/40",
    next: undefined,
  },
};

export default function AdminOrders() {
  const { role, loading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "reservations">("orders");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const loadData = async () => {
    try {
      const ordersRes = await supabase
        .from("orders")
        .select("*,order_items(quantity,menu_items(name,price))")
        .order("id", { ascending: false });

      const resRes = await supabase
        .from("reservations")
        .select("*")
        .order("reserved_at", { ascending: true });

      setOrders(ordersRes.data || []);
      setReservations(resRes.data || []);
    } catch {
      // Local fallback
    }
  };

  useEffect(() => {
    if (loading) return;
    if (role !== "admin") {
      toast("Admin privileges required", "error");
      router.push("/");
      return;
    }

    loadData();

    // Supabase Realtime channel for live order updates
    const ordersChannel = supabase
      .channel("all-orders-admin")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload: any) => {
        toast(`New Order #${payload.new.id} received!`, "info");
        loadData();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, () => {
        loadData();
      })
      .subscribe();

    // Supabase Realtime channel for live table bookings
    const resChannel = supabase
      .channel("all-reservations-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, () => {
        toast("New table reservation received", "success");
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(resChannel);
    };
  }, [role, loading]);

  async function handleUpdateStatus(orderId: number, newStatus: string) {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (error) {
      toast(error.message, "error");
    } else {
      toast(`Order #${orderId} marked as "${newStatus}"`, "success");
      loadData();
    }
  }

  const filteredOrders = statusFilter === "All"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const preparingCount = orders.filter((o) => o.status === "Preparing").length;
  const readyCount = orders.filter((o) => o.status === "Ready").length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;

  return (
    <main className="min-h-screen bg-ivory text-charcoal pt-36 pb-28 px-6 md:px-12 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-10 border-b border-sand">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-sand/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-olive mb-2">
              <Sparkles size={12} className="text-gold" /> Realtime Command Center
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-olive">
              Kitchen Pass & Table Service
            </h1>
            <p className="text-sm text-charcoal/70 mt-1">
              Live updates via Supabase Realtime. Monitor tickets, advance kitchen statuses, and seat reservation guests.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={loadData}
              className="btn-d !py-2.5 !px-4 text-xs flex items-center gap-2 shadow"
            >
              <RefreshCw size={14} />
              <span>Refresh Desk</span>
            </button>
            <NimzaLogo variant="badge" size="sm" />
          </div>
        </div>

        {/* Live Metrics Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">1. Pending Orders</span>
            <p className="font-serif text-3xl font-bold text-amber-950 mt-1">{pendingCount}</p>
          </div>
          <div className="p-5 rounded-3xl bg-orange-50 border border-orange-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800">2. Over Flame</span>
            <p className="font-serif text-3xl font-bold text-orange-950 mt-1">{preparingCount}</p>
          </div>
          <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">3. Plated & Ready</span>
            <p className="font-serif text-3xl font-bold text-emerald-950 mt-1">{readyCount}</p>
          </div>
          <div className="p-5 rounded-3xl bg-olive-deep text-ivory border border-gold/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sand/80">4. Delivered</span>
            <p className="font-serif text-3xl font-bold text-gold mt-1">{deliveredCount}</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === "orders"
                  ? "bg-olive text-gold shadow-md shadow-olive/30"
                  : "bg-white border border-sand text-charcoal hover:border-gold/50"
              }`}
            >
              <ShoppingBag size={14} />
              <span>Orders Queue ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("reservations")}
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === "reservations"
                  ? "bg-olive text-gold shadow-md shadow-olive/30"
                  : "bg-white border border-sand text-charcoal hover:border-gold/50"
              }`}
            >
              <CalendarCheck size={14} />
              <span>Table Bookings ({reservations.length})</span>
            </button>
          </div>

          {activeTab === "orders" && (
            <div className="flex flex-wrap items-center gap-1.5">
              {["All", "Pending", "Preparing", "Ready", "Delivered"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition-all ${
                    statusFilter === st
                      ? "bg-gold text-charcoal font-bold border-gold shadow-sm"
                      : "bg-white border-sand text-charcoal/70 hover:border-gold"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Orders Queue Section */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-[2.5rem] border border-sand">
                <p className="font-serif text-2xl text-charcoal/70">No orders match the selected filter.</p>
                <p className="text-xs text-charcoal/50 mt-1">Incoming customer orders appear here in real time.</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;

                return (
                  <div
                    key={order.id}
                    className="p-6 md:p-8 rounded-[2rem] bg-white border border-sand shadow-sm hover:border-gold/50 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                  >
                    {/* Left: Order Info */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-serif text-2xl font-bold text-olive">
                          Order #{order.id}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold border uppercase tracking-wider ${config.color}`}
                        >
                          {order.status}
                        </span>
                        <span className="font-serif text-xl font-bold text-gold-dark">
                          ${Number(order.total).toFixed(2)}
                        </span>
                        <span className="text-xs text-charcoal/50">
                          {new Date(order.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </div>

                      {/* Items List */}
                      <p className="text-sm text-charcoal/80 font-medium">
                        {order.order_items?.map((item: any, i: number) => (
                          <span key={i} className="inline-block mr-3">
                            <strong className="text-gold font-bold">{item.quantity}×</strong>{" "}
                            {item.menu_items?.name || "Dish"}
                          </span>
                        ))}
                      </p>
                    </div>

                    {/* Right: Quick Action Progression Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {order.status !== "Pending" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "Pending")}
                          className="px-3 py-2 rounded-xl text-xs font-semibold border border-sand bg-sand/30 hover:bg-amber-100 transition-all"
                        >
                          Revert to Pending
                        </button>
                      )}

                      {order.status !== "Preparing" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "Preparing")}
                          className="px-3 py-2 rounded-xl text-xs font-semibold border border-orange-300 bg-orange-50 text-orange-950 hover:bg-orange-100 transition-all flex items-center gap-1"
                        >
                          <Flame size={13} />
                          <span>Preparing</span>
                        </button>
                      )}

                      {order.status !== "Ready" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "Ready")}
                          className="px-3 py-2 rounded-xl text-xs font-semibold border border-emerald-300 bg-emerald-50 text-emerald-950 hover:bg-emerald-100 transition-all flex items-center gap-1"
                        >
                          <ChefHat size={13} />
                          <span>Mark Ready</span>
                        </button>
                      )}

                      {order.status !== "Delivered" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "Delivered")}
                          className="px-4 py-2 rounded-xl text-xs font-bold border border-gold bg-olive text-gold hover:bg-olive-dark transition-all flex items-center gap-1.5 shadow"
                        >
                          <CheckCircle2 size={14} />
                          <span>Mark Delivered</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Reservations Desk Section */}
        {activeTab === "reservations" && (
          <div className="space-y-4">
            {reservations.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-[2.5rem] border border-sand">
                <p className="font-serif text-2xl text-charcoal/70">No table reservations logged yet.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {reservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-6 rounded-3xl bg-white border border-sand shadow-sm hover:border-gold/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-sand mb-4">
                        <span className="font-serif text-xl font-bold text-olive">
                          Table {res.table_no || 1}
                        </span>
                        <span className="rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-0.5 text-xs font-bold">
                          Confirmed
                        </span>
                      </div>

                      <h4 className="font-serif text-lg font-bold text-charcoal">{res.name}</h4>
                      <p className="text-xs text-charcoal/70 mt-1 flex items-center gap-1">
                        <Phone size={12} className="text-gold" />
                        <span>{res.phone}</span>
                      </p>

                      <div className="mt-4 pt-4 border-t border-sand/60 space-y-1.5 text-xs text-charcoal/80">
                        <p className="flex items-center justify-between">
                          <span className="text-charcoal/50">Party Size:</span>
                          <strong className="text-olive">{res.guests} Guests</strong>
                        </p>
                        <p className="flex items-center justify-between">
                          <span className="text-charcoal/50">Date & Time:</span>
                          <strong className="text-gold-dark">
                            {new Date(res.reserved_at).toLocaleDateString()} at{" "}
                            {new Date(res.reserved_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </strong>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
