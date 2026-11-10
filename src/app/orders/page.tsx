"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { toast } from "@/lib/notify";
import NimzaLogo from "@/components/NimzaLogo";

const STAGES = [
  {
    key: "Pending",
    label: "Order Received",
    subtitle: "Ticket Queued",
    desc: "Your order has been transmitted to our kitchen pass.",
    icon: Clock,
    color: "text-amber-600 bg-amber-50 border-amber-300",
  },
  {
    key: "Preparing",
    label: "Over Flame",
    subtitle: "Wood-Fire Cooking",
    desc: "Chef Elias & brigade are hand-rolling dough and grilling cuts.",
    icon: Flame,
    color: "text-orange-600 bg-orange-50 border-orange-300",
  },
  {
    key: "Ready",
    label: "Plated & Ready",
    subtitle: "Marble Pass",
    desc: "Resting, dressed with finishing oils, ready for floor service.",
    icon: ChefHat,
    color: "text-emerald-700 bg-emerald-50 border-emerald-300",
  },
  {
    key: "Delivered",
    label: "Served at Table",
    subtitle: "Enjoy Your Meal",
    desc: "Delivered to your dining table. Bon appétit!",
    icon: CheckCircle2,
    color: "text-olive bg-sand/40 border-gold/40",
  },
];

const DEMO_ORDERS = [
  {
    id: 1042,
    created_at: new Date().toISOString(),
    status: "Preparing",
    total: 47.0,
    order_items: [
      { quantity: 1, menu_items: { name: "Truffle Tagliatelle", price: 18.0 } },
      { quantity: 1, menu_items: { name: "Grilled Ribeye Prime", price: 29.0 } },
    ],
  },
];

export default function Orders() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>(DEMO_ORDERS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadOrders = async () => {
    setIsRefreshing(true);
    try {
      let query = supabase
        .from("orders")
        .select("*,order_items(quantity,menu_items(name,price))")
        .order("created_at", { ascending: false });

      if (user) {
        query = query.eq("user_id", user.id);
      }

      const { data } = await query;
      if (data && data.length > 0) {
        setOrders(data);
      }
    } catch {
      // Keep demo orders active for preview
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (loading) return;

    loadOrders();

    // Supabase Realtime channel subscription for instant status updates
    const channel = supabase
      .channel("customer-orders-live")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        (payload: any) => {
          toast(`Order #${payload.new.id} status updated to: ${payload.new.status}`, "info");
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loading]);

  return (
    <main className="min-h-screen bg-ivory text-charcoal pt-36 pb-28 px-6 md:px-12 overflow-hidden">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-10 border-b border-sand">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-sand/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-olive mb-2">
              <Sparkles size={12} className="text-gold" /> Realtime Kitchen Pass
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-olive">
              Order Status & Progression
            </h1>
            <p className="text-sm text-charcoal/70 mt-1">
              Live updates via Supabase Realtime. Follow your plates from flame to table.
            </p>
          </div>

          <button
            onClick={loadOrders}
            className="btn-d !py-2.5 !px-4 text-xs flex items-center gap-2 self-start sm:self-auto shadow"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            <span>Refresh Status</span>
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-8">
          {orders.map((order) => {
            const currentStageIdx = STAGES.findIndex((s) => s.key === order.status);
            const activeIdx = currentStageIdx >= 0 ? currentStageIdx : 1;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-sand shadow-sm hover:border-gold/40 transition-all"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sand">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-2xl md:text-3xl font-bold text-olive">
                        Order #{order.id}
                      </h3>
                      <span className="rounded-full bg-gold/20 border border-gold/40 px-3.5 py-1 text-xs font-bold text-gold-dark uppercase tracking-wider">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal/60 mt-1">
                      Recorded on {new Date(order.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-charcoal/60 uppercase tracking-widest font-bold">Total Amount</span>
                    <p className="font-serif text-3xl font-bold text-olive">
                      ${Number(order.total).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* 4-Stage Animated Visual Stepper */}
                <div className="py-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {STAGES.map((stage, idx) => {
                      const Icon = stage.icon;
                      const isComplete = idx <= activeIdx;
                      const isCurrent = idx === activeIdx;

                      return (
                        <div
                          key={stage.key}
                          className={`p-4 rounded-2xl border transition-all ${
                            isCurrent
                              ? "bg-olive text-gold border-gold ring-2 ring-gold/40 shadow-lg scale-105"
                              : isComplete
                              ? "bg-sand/30 border-sand text-olive"
                              : "bg-white border-sand/50 text-charcoal/40"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Icon
                              size={20}
                              className={isCurrent ? "text-gold animate-bounce" : isComplete ? "text-gold-dark" : "text-charcoal/30"}
                            />
                            <span className="text-[10px] font-mono font-bold">0{idx + 1}</span>
                          </div>
                          <p className={`font-serif text-sm font-bold ${isCurrent ? "text-ivory" : ""}`}>
                            {stage.label}
                          </p>
                          <p className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${isCurrent ? "text-gold" : "text-charcoal/50"}`}>
                            {stage.subtitle}
                          </p>
                          <p className={`text-[11px] mt-1.5 line-clamp-2 ${isCurrent ? "text-sand/80" : "text-charcoal/60"}`}>
                            {stage.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items Summary Table */}
                <div className="pt-6 border-t border-sand">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-3">
                    Dishes in this Order
                  </h4>
                  <div className="space-y-2">
                    {order.order_items?.map((item: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 text-sm text-charcoal/90 border-b border-sand/40 last:border-0"
                      >
                        <span className="font-medium">
                          <strong className="text-gold font-bold mr-2">{item.quantity}×</strong>
                          {item.menu_items?.name || "Artisanal Selection"}
                        </span>
                        <span className="font-serif font-bold text-olive">
                          ${((item.menu_items?.price || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Action */}
        <div className="mt-12 text-center">
          <Link href="/menu" className="btn inline-flex items-center gap-2">
            <ShoppingBag size={16} />
            <span>Order Another Dish</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
