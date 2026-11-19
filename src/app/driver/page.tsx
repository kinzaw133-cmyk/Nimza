"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bike,
  Truck,
  Car,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Radio,
  Navigation,
  Compass,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Star,
  Users,
  ExternalLink,
  Zap,
  ShoppingBag,
  Check,
  RefreshCw,
} from "lucide-react";
import { useAuth, clearSession } from "@/lib/useAuth";
import { toast } from "@/lib/notify";
import {
  DeliveryOrder,
  CourierPersonnel,
  DeliveryStatus,
  getStoredDeliveryOrders,
  saveStoredDeliveryOrders,
  getStoredDeliveryCouriers,
  saveStoredDeliveryCouriers,
  DEFAULT_COURIERS,
  DEFAULT_DELIVERY_ORDERS,
} from "@/lib/delivery/deliveryTypes";
import LiveDeliveryMap from "@/components/LiveDeliveryMap";
import NimzaLogo from "@/components/NimzaLogo";

export default function DeliveryDriverPortal() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  const [couriers, setCouriers] = useState<CourierPersonnel[]>(DEFAULT_COURIERS);
  const [orders, setOrders] = useState<DeliveryOrder[]>(DEFAULT_DELIVERY_ORDERS);

  // Active Driver Selection (Role-Based Assignment Context)
  const [activeDriverId, setActiveDriverId] = useState<string>("driver-1"); // Default to Marco Rossi
  const [activeTab, setActiveTab] = useState<"assigned" | "history" | "map">("assigned");
  const [selectedMapOrder, setSelectedMapOrder] = useState<DeliveryOrder | null>(null);

  // HTML5 Native Geolocation Watching
  const [isGpsBroadcasting, setIsGpsBroadcasting] = useState(false);
  const [gpsWatchId, setGpsWatchId] = useState<number | null>(null);

  // Load from local storage
  useEffect(() => {
    const load = () => {
      setCouriers(getStoredDeliveryCouriers());
      setOrders(getStoredDeliveryOrders());
    };
    load();

    window.addEventListener("nimza_delivery_orders_updated", load);
    window.addEventListener("nimza_delivery_couriers_updated", load);
    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener("nimza_delivery_orders_updated", load);
      window.removeEventListener("nimza_delivery_couriers_updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const currentDriver = useMemo(() => {
    return couriers.find((c) => c.id === activeDriverId) || couriers[0];
  }, [couriers, activeDriverId]);

  // STRICT ROLE-BASED FILTER: Only orders assigned to THIS courier!
  const myAssignedOrders = useMemo(() => {
    return orders.filter(
      (o) => o.driver_id === currentDriver.id && o.status !== "Delivered" && o.status !== "Cancelled"
    );
  }, [orders, currentDriver.id]);

  const myCompletedOrders = useMemo(() => {
    return orders.filter(
      (o) => o.driver_id === currentDriver.id && o.status === "Delivered"
    );
  }, [orders, currentDriver.id]);

  // Advance Order Status Workflow
  const handleUpdateDeliveryStatus = (orderId: number, nextStatus: DeliveryStatus) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        const changes: Partial<DeliveryOrder> = { status: nextStatus };
        if (nextStatus === "Picked Up") {
          changes.picked_up_at = new Date().toISOString();
          changes.progress_percent = 25;
        } else if (nextStatus === "On the Way") {
          changes.progress_percent = 60;
        } else if (nextStatus === "Delivered") {
          changes.delivered_at = new Date().toISOString();
          changes.progress_percent = 100;
          changes.eta_minutes = 0;
          changes.distance_km = 0;
        }
        return { ...o, ...changes };
      }
      return o;
    });

    // Update driver duty status if all delivered
    const remainingForDriver = updated.filter(
      (o) => o.driver_id === currentDriver.id && o.status !== "Delivered"
    );

    const updatedCouriers = couriers.map((c) => {
      if (c.id === currentDriver.id) {
        const newStatus =
          remainingForDriver.length === 0 ? ("Available" as const) : ("On Delivery" as const);
        const newTotal = nextStatus === "Delivered" ? c.total_deliveries + 1 : c.total_deliveries;
        return { ...c, status: newStatus, total_deliveries: newTotal };
      }
      return c;
    });

    setOrders(updated);
    setCouriers(updatedCouriers);
    saveStoredDeliveryOrders(updated);
    saveStoredDeliveryCouriers(updatedCouriers);

    toast(`Order #${orderId} advanced to ${nextStatus}`, "success");
  };

  // Stepper to advance transit simulation on map
  const handleAdvanceRouteProgress = (orderId: number, newPercent: number) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        const isNowDelivered = newPercent >= 100;
        return {
          ...o,
          progress_percent: newPercent,
          status: isNowDelivered ? ("Delivered" as const) : o.status,
          delivered_at: isNowDelivered ? new Date().toISOString() : o.delivered_at,
        };
      }
      return o;
    });

    setOrders(updated);
    saveStoredDeliveryOrders(updated);

    if (selectedMapOrder && selectedMapOrder.id === orderId) {
      setSelectedMapOrder({
        ...selectedMapOrder,
        progress_percent: newPercent,
        status: newPercent >= 100 ? "Delivered" : selectedMapOrder.status,
      });
    }
  };

  // Native HTML5 Geolocation Broadcasting
  const toggleGpsBroadcast = () => {
    if (isGpsBroadcasting) {
      if (gpsWatchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(gpsWatchId);
      }
      setIsGpsBroadcasting(false);
      setGpsWatchId(null);
      toast("GPS location broadcast paused", "info");
    } else {
      if (!("geolocation" in navigator)) {
        toast("Geolocation is not supported by your browser", "error");
        return;
      }

      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const speed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 32;

          // Update current driver coordinates
          const updatedCouriers = couriers.map((c) => {
            if (c.id === currentDriver.id) {
              return { ...c, current_lat: lat, current_lng: lng };
            }
            return c;
          });
          setCouriers(updatedCouriers);
          saveStoredDeliveryCouriers(updatedCouriers);

          // Update all active deliveries for this driver
          const updatedOrders = orders.map((o) => {
            if (o.driver_id === currentDriver.id && o.status === "On the Way") {
              return { ...o, driver_lat: lat, driver_lng: lng, speed_kmh: speed };
            }
            return o;
          });
          setOrders(updatedOrders);
          saveStoredDeliveryOrders(updatedOrders);
        },
        (err) => {
          toast(`GPS error: ${err.message}. Using simulated route.`, "info");
          setIsGpsBroadcasting(false);
        },
        { enableHighAccuracy: true, maximumAge: 5000 }
      );

      setGpsWatchId(id);
      setIsGpsBroadcasting(true);
      toast("Broadcasting live device GPS to customer radar", "success");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1F241F] pt-24 pb-28 px-4 sm:px-6 max-w-4xl mx-auto font-sans">
      {/* Top Driver Bar */}
      <div className="p-5 rounded-3xl bg-charcoal text-sand border-2 border-gold/70 shadow-xl mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative h-13 w-13 rounded-2xl overflow-hidden border-2 border-gold shadow-md bg-white">
              <img
                src={currentDriver.avatar}
                alt={currentDriver.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border border-charcoal" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-bold text-white tracking-wide">
                  {currentDriver.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-gold/20 text-gold border border-gold/30">
                  {currentDriver.status}
                </span>
              </div>
              <p className="text-xs text-sand/70 font-sans flex items-center gap-1.5 mt-0.5">
                <Bike size={13} className="text-gold" />
                <span>{currentDriver.vehicle_type} ({currentDriver.vehicle_plate})</span>
                <span>• ★ {currentDriver.rating} ({currentDriver.total_deliveries} drops)</span>
              </p>
            </div>
          </div>

          {/* GPS Broadcast & Driver Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleGpsBroadcast}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm ${
                isGpsBroadcasting
                  ? "bg-emerald-600 text-white border-emerald-400 animate-pulse"
                  : "bg-white/10 text-sand border-sand/20 hover:border-gold hover:text-white"
              }`}
              title="Share live device GPS with customer radar"
            >
              <Radio size={14} className={isGpsBroadcasting ? "text-white" : "text-gold"} />
              <span>{isGpsBroadcasting ? "Broadcasting GPS" : "Share Live GPS"}</span>
            </button>

            {/* Quick Driver Profile Switcher (For Evaluation & Role Testing) */}
            <select
              value={activeDriverId}
              onChange={(e) => setActiveDriverId(e.target.value)}
              className="px-3 py-2 rounded-2xl bg-black/60 border border-gold/40 text-gold text-xs font-semibold focus:outline-none cursor-pointer"
              title="Switch Courier Context (Role Verification)"
            >
              {couriers.map((c) => (
                <option key={c.id} value={c.id} className="bg-charcoal text-white">
                  Driver: {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-sand pb-4 mb-6">
        <button
          onClick={() => setActiveTab("assigned")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "assigned"
              ? "bg-[#1F241F] text-gold shadow-sm"
              : "bg-white border border-sand text-charcoal/70 hover:text-charcoal"
          }`}
        >
          <Truck size={14} />
          <span>My Assigned Drops ({myAssignedOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "history"
              ? "bg-[#1F241F] text-gold shadow-sm"
              : "bg-white border border-sand text-charcoal/70 hover:text-charcoal"
          }`}
        >
          <CheckCircle2 size={14} />
          <span>My Delivered History ({myCompletedOrders.length})</span>
        </button>
      </div>

      {/* TAB 1: MY ASSIGNED DELIVERIES */}
      {activeTab === "assigned" && (
        <div className="space-y-6">
          {myAssignedOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-sand shadow-sm">
              <CheckCircle2 size={40} className="mx-auto text-emerald-600 mb-3" />
              <h3 className="font-serif text-xl font-bold text-olive">All Deliveries Completed!</h3>
              <p className="text-xs text-charcoal/60 mt-1 max-w-sm mx-auto">
                You have no active orders queued right now. Stay tuned as new orders are assigned by the kitchen brigade.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {myAssignedOrders.map((order) => {
                const isPickedUp = order.status === "Picked Up";
                const isOnTheWay = order.status === "On the Way";

                return (
                  <div
                    key={order.id}
                    className="p-6 rounded-3xl bg-white border border-sand shadow-md space-y-5"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between pb-3 border-b border-sand">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-charcoal text-gold px-2.5 py-0.5 rounded-full">
                            Drop #{order.id}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              isOnTheWay
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : isPickedUp
                                ? "bg-blue-100 text-blue-900 border border-blue-300"
                                : "bg-purple-100 text-purple-900 border border-purple-300"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-olive mt-1.5">
                          {order.customer_name}
                        </h3>
                      </div>

                      <div className="text-right">
                        <span className="font-serif text-xl font-bold text-olive block">
                          ${order.total.toFixed(2)}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {order.payment_method}
                        </span>
                      </div>
                    </div>

                    {/* Customer Destination Box */}
                    <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-sand space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <MapPin size={18} className="text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-sm text-charcoal block">
                              {order.delivery_address}
                            </span>
                            <span className="text-xs text-charcoal/60">{order.city_district}</span>
                          </div>
                        </div>

                        <a
                          href={`tel:${order.customer_phone}`}
                          className="px-3 py-1.5 rounded-xl bg-gold text-charcoal hover:bg-gold-light text-xs font-bold shadow-xs flex items-center gap-1.5 shrink-0"
                          title="Call Customer"
                        >
                          <Phone size={13} />
                          <span>Call</span>
                        </a>
                      </div>

                      {order.delivery_notes && (
                        <div className="p-2.5 rounded-xl bg-white border border-sand/70 text-xs text-charcoal/80">
                          <strong>Delivery Note:</strong> &ldquo;{order.delivery_notes}&rdquo;
                        </div>
                      )}
                    </div>

                    {/* Order Dish Contents Checklist */}
                    <div className="space-y-1.5 text-xs text-charcoal/80">
                      <span className="text-[10px] uppercase font-bold text-charcoal/50 block">
                        Dish Checklist:
                      </span>
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-xl bg-sand/20 flex items-center justify-between"
                        >
                          <span>
                            <strong>{item.quantity}×</strong> {item.name}
                          </span>
                          {item.customizations && (
                            <span className="text-[11px] text-charcoal/60 truncate max-w-xs">
                              {item.customizations}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Live Vector Radar Map (Inline Driver View) */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-charcoal/70 flex items-center gap-1">
                          <Navigation size={13} className="text-gold" />
                          <span>Turn-by-Turn City Route</span>
                        </span>
                        <span className="text-xs font-mono text-gold font-bold">
                          {order.distance_km} km • ETA ~{order.eta_minutes} mins
                        </span>
                      </div>
                      <LiveDeliveryMap
                        order={order}
                        isDriverView={true}
                        onUpdateProgress={(p) => handleAdvanceRouteProgress(order.id, p)}
                      />
                    </div>

                    {/* Step-by-Step Delivery Action Buttons */}
                    <div className="pt-4 border-t border-sand grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Step 1: Picked Up */}
                      <button
                        onClick={() => handleUpdateDeliveryStatus(order.id, "Picked Up")}
                        disabled={order.status === "Picked Up" || order.status === "On the Way"}
                        className={`py-3 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                          order.status === "Assigned"
                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md animate-pulse"
                            : "bg-sand/30 text-charcoal/40 border border-sand cursor-not-allowed"
                        }`}
                      >
                        <Check size={14} />
                        <span>1. Picked Up</span>
                      </button>

                      {/* Step 2: On The Way */}
                      <button
                        onClick={() => handleUpdateDeliveryStatus(order.id, "On the Way")}
                        disabled={order.status === "On the Way" || order.status === "Assigned"}
                        className={`py-3 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                          order.status === "Picked Up"
                            ? "bg-amber-600 text-white hover:bg-amber-700 shadow-md animate-pulse"
                            : "bg-sand/30 text-charcoal/40 border border-sand cursor-not-allowed"
                        }`}
                      >
                        <Navigation size={14} />
                        <span>2. On the Way</span>
                      </button>

                      {/* Step 3: Delivered */}
                      <button
                        onClick={() => handleUpdateDeliveryStatus(order.id, "Delivered")}
                        disabled={order.status === "Assigned"}
                        className={`py-3 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                          order.status === "On the Way"
                            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md animate-pulse"
                            : "bg-sand/30 text-charcoal/40 border border-sand cursor-not-allowed"
                        }`}
                      >
                        <CheckCircle2 size={14} />
                        <span>3. Mark Delivered ✓</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY DELIVERED HISTORY */}
      {activeTab === "history" && (
        <div className="bg-white rounded-3xl border border-sand p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-xl font-bold text-olive">
            Delivered Ledger for {currentDriver.name} ({myCompletedOrders.length})
          </h3>

          {myCompletedOrders.length === 0 ? (
            <p className="text-xs text-charcoal/60 py-6 text-center">
              No completed orders logged for this session yet.
            </p>
          ) : (
            <div className="divide-y divide-sand/60">
              {myCompletedOrders.map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-olive">#{o.id}</span>
                    <span className="font-bold text-charcoal ml-2">{o.customer_name}</span>
                    <p className="text-[11px] text-charcoal/60 truncate max-w-sm mt-0.5">
                      {o.delivery_address}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-charcoal block">${o.total.toFixed(2)}</span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Completed ✓
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
