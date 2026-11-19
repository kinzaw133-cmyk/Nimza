"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
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
  Plus,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  Radio,
  Eye,
  X,
  Compass,
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { toast } from "@/lib/notify";
import {
  DeliveryOrder,
  CourierPersonnel,
  DeliveryStatus,
  getStoredDeliveryOrders,
  saveStoredDeliveryOrders,
  getStoredDeliveryCouriers,
  saveStoredDeliveryCouriers,
  DEFAULT_DELIVERY_ORDERS,
  DEFAULT_COURIERS,
} from "@/lib/delivery/deliveryTypes";
import LiveDeliveryMap from "@/components/LiveDeliveryMap";

export default function AdminDeliveryPage() {
  const { user, isAdmin } = useAuth();

  const [orders, setOrders] = useState<DeliveryOrder[]>(DEFAULT_DELIVERY_ORDERS);
  const [couriers, setCouriers] = useState<CourierPersonnel[]>(DEFAULT_COURIERS);
  const [activeTab, setActiveTab] = useState<"active" | "fleet" | "radar" | "history">("active");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Assign Courier Modal State
  const [assigningOrder, setAssigningOrder] = useState<DeliveryOrder | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  // Live Map Modal / Drawer State
  const [trackingOrder, setTrackingOrder] = useState<DeliveryOrder | null>(null);

  // Add Driver Modal State
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [newDriverName, setNewDriverName] = useState("");
  const [newDriverPhone, setNewDriverPhone] = useState("");
  const [newDriverVehicle, setNewDriverVehicle] = useState<"Motorcycle" | "Electric Scooter" | "Bicycle" | "Car">("Motorcycle");
  const [newDriverPlate, setNewDriverPlate] = useState("");

  // Load from LocalStorage on mount & listen to real-time events
  useEffect(() => {
    const loadData = () => {
      setOrders(getStoredDeliveryOrders());
      setCouriers(getStoredDeliveryCouriers());
    };

    loadData();

    window.addEventListener("nimza_delivery_orders_updated", loadData);
    window.addEventListener("nimza_delivery_couriers_updated", loadData);
    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("nimza_delivery_orders_updated", loadData);
      window.removeEventListener("nimza_delivery_couriers_updated", loadData);
      window.removeEventListener("storage", loadData);
    };
  }, []);

  // Compute KPIs
  const activeOrders = useMemo(() => {
    return orders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled");
  }, [orders]);

  const completedOrders = useMemo(() => {
    return orders.filter((o) => o.status === "Delivered");
  }, [orders]);

  const availableDrivers = useMemo(() => {
    return couriers.filter((c) => c.status === "Available");
  }, [couriers]);

  const onDeliveryDrivers = useMemo(() => {
    return couriers.filter((c) => c.status === "On Delivery");
  }, [couriers]);

  // Handle Assigning Courier to Order
  const handleConfirmAssignment = () => {
    if (!assigningOrder || !selectedDriverId) {
      toast("Please select an available delivery driver", "error");
      return;
    }

    const driver = couriers.find((c) => c.id === selectedDriverId);
    if (!driver) return;

    const updatedOrders = orders.map((o) => {
      if (o.id === assigningOrder.id) {
        return {
          ...o,
          status: "Assigned" as DeliveryStatus,
          driver_id: driver.id,
          driver_name: driver.name,
          driver_phone: driver.phone,
          driver_vehicle: `${driver.vehicle_type} (${driver.vehicle_plate})`,
          driver_avatar: driver.avatar,
          assigned_at: new Date().toISOString(),
          eta_minutes: Math.max(15, o.eta_minutes || 20),
        };
      }
      return o;
    });

    // Update driver status to 'On Delivery'
    const updatedCouriers = couriers.map((c) => {
      if (c.id === driver.id) {
        return { ...c, status: "On Delivery" as const };
      }
      return c;
    });

    setOrders(updatedOrders);
    setCouriers(updatedCouriers);
    saveStoredDeliveryOrders(updatedOrders);
    saveStoredDeliveryCouriers(updatedCouriers);

    toast(`Assigned Order #${assigningOrder.id} to ${driver.name}`, "success");
    setAssigningOrder(null);
    setSelectedDriverId("");
  };

  // Quick Status Transition for Admin
  const handleUpdateOrderStatus = (orderId: number, nextStatus: DeliveryStatus) => {
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

    setOrders(updated);
    saveStoredDeliveryOrders(updated);
    toast(`Order #${orderId} marked as ${nextStatus}`, "info");
  };

  // Update Driver Progress on Map
  const handleLiveProgressUpdate = (newPercent: number) => {
    if (!trackingOrder) return;
    const updated = orders.map((o) => {
      if (o.id === trackingOrder.id) {
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
    setTrackingOrder({
      ...trackingOrder,
      progress_percent: newPercent,
      status: newPercent >= 100 ? "Delivered" : trackingOrder.status,
    });
  };

  // Add Driver
  const handleAddDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName.trim()) return;

    const newDriver: CourierPersonnel = {
      id: `driver-${Date.now()}`,
      name: newDriverName.trim(),
      phone: newDriverPhone.trim() || "+1 (555) 000-0000",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80",
      vehicle_type: newDriverVehicle,
      vehicle_plate: newDriverPlate.trim() || "NZ-777-X",
      status: "Available",
      rating: 5.0,
      total_deliveries: 0,
      current_lat: 45.4642,
      current_lng: 9.1900,
      is_active: true,
    };

    const updated = [newDriver, ...couriers];
    setCouriers(updated);
    saveStoredDeliveryCouriers(updated);

    toast(`Registered courier ${newDriver.name} to delivery fleet`, "success");
    setIsAddDriverOpen(false);
    setNewDriverName("");
    setNewDriverPhone("");
    setNewDriverPlate("");
  };

  // Toggle Driver Status
  const handleToggleDriverDuty = (driverId: string) => {
    const updated = couriers.map((c) => {
      if (c.id === driverId) {
        const next =
          c.status === "Available"
            ? "On Break"
            : c.status === "On Break"
            ? "Off Duty"
            : "Available";
        return { ...c, status: next as any };
      }
      return c;
    });
    setCouriers(updated);
    saveStoredDeliveryCouriers(updated);
    toast("Driver duty status updated", "info");
  };

  // Filtered Active Orders
  const filteredActiveOrders = useMemo(() => {
    return activeOrders.filter((o) => {
      const matchStatus = statusFilter === "All" || o.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        String(o.id).includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.delivery_address.toLowerCase().includes(q) ||
        (o.driver_name && o.driver_name.toLowerCase().includes(q));
      return matchStatus && matchQuery;
    });
  }, [activeOrders, statusFilter, searchQuery]);

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div className="p-8 rounded-[2.5rem] bg-white border border-sand shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sand bg-sand/30 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-charcoal mb-3">
            <Truck size={14} className="text-gold" />
            <span>Logistics &amp; Fleet Command</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-olive">
            Delivery Management System
          </h1>
          <p className="text-xs md:text-sm text-charcoal/70 mt-1 max-w-2xl leading-relaxed">
            Assign orders to couriers, monitor doorstep deliveries, and track live GPS coordinates on our interactive city radar with zero external API dependencies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/driver"
            className="px-4 py-2.5 rounded-full border border-sand bg-white hover:bg-sand/30 text-xs font-bold text-charcoal shadow-xs transition-all flex items-center gap-2"
            title="Open Dedicated Delivery Driver View"
          >
            <Bike size={15} className="text-gold" />
            <span>Driver Portal →</span>
          </Link>

          <button
            onClick={() => setIsAddDriverOpen(true)}
            className="px-5 py-2.5 rounded-full bg-olive text-gold hover:bg-charcoal text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Plus size={15} />
            <span>+ Add Courier</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-sand shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60">
            Active Deliveries
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-serif text-3xl font-bold text-olive">
              {activeOrders.length}
            </span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              In Transit
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            Available Couriers
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-serif text-3xl font-bold text-emerald-900">
              {availableDrivers.length} / {couriers.length}
            </span>
            <span className="text-xs font-bold text-emerald-700">Ready to Dispatch</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gold/15 border border-gold/40 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal">
            Completed Today
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-serif text-3xl font-bold text-[#1F241F]">
              {completedOrders.length}
            </span>
            <span className="text-xs font-bold text-gold">100% On Time</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-sand shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60">
            Fleet Radar Status
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-serif text-lg font-bold text-emerald-800 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry
            </span>
            <span className="text-[11px] text-charcoal/60 font-mono">Zero External API</span>
          </div>
        </div>
      </div>

      {/* PRIMARY VIEW TABS */}
      <div className="flex items-center justify-between border-b border-sand pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "active"
                ? "bg-[#1F241F] text-gold shadow-sm"
                : "bg-white border border-sand text-charcoal/70 hover:text-charcoal"
            }`}
          >
            <Truck size={14} />
            <span>Active Dispatch Queue ({activeOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("fleet")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "fleet"
                ? "bg-[#1F241F] text-gold shadow-sm"
                : "bg-white border border-sand text-charcoal/70 hover:text-charcoal"
            }`}
          >
            <Users size={14} />
            <span>Couriers Fleet ({couriers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("radar")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "radar"
                ? "bg-[#1F241F] text-gold shadow-sm"
                : "bg-white border border-sand text-charcoal/70 hover:text-charcoal"
            }`}
          >
            <Radio size={14} />
            <span>City Radar Map</span>
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
            <span>Delivery History ({completedOrders.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ACTIVE DISPATCH QUEUE */}
      {activeTab === "active" && (
        <div className="space-y-6">
          {/* Filter Ribbon */}
          <div className="p-4 rounded-2xl bg-white border border-sand flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-charcoal/60 mr-2 shrink-0">Status:</span>
              {["All", "Pending", "Assigned", "Picked Up", "On the Way"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    statusFilter === st
                      ? "bg-olive text-gold shadow-xs"
                      : "bg-sand/30 text-charcoal/80 hover:bg-sand/60"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-charcoal/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order #, address, driver..."
                className="w-full pl-9 pr-3 py-1.5 rounded-full bg-sand/20 border border-sand text-xs text-charcoal focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          {/* Active Orders List */}
          {filteredActiveOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-sand">
              <Truck size={36} className="mx-auto text-gold mb-3 opacity-60" />
              <h3 className="font-serif text-lg font-bold text-olive">No active delivery orders</h3>
              <p className="text-xs text-charcoal/60 mt-1">
                New delivery orders placed by diners will appear in this dispatch queue.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredActiveOrders.map((order) => {
                const isAssigned = !!order.driver_id;

                return (
                  <div
                    key={order.id}
                    className="p-6 rounded-3xl bg-white border border-sand shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between pb-3 border-b border-sand">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-gold bg-charcoal px-2.5 py-0.5 rounded-full">
                              Order #{order.id}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                order.status === "On the Way"
                                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                                  : order.status === "Picked Up"
                                  ? "bg-blue-100 text-blue-900 border border-blue-300"
                                  : order.status === "Assigned"
                                  ? "bg-purple-100 text-purple-900 border border-purple-300"
                                  : "bg-rose-100 text-rose-900 border border-rose-300 animate-pulse"
                              }`}
                            >
                              {order.status === "Pending" ? "Unassigned" : order.status}
                            </span>
                          </div>
                          <h4 className="font-serif text-lg font-bold text-olive mt-1.5">
                            {order.customer_name}
                          </h4>
                        </div>

                        <div className="text-right">
                          <span className="font-serif text-lg font-bold text-olive block">
                            ${order.total.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-charcoal/60 font-semibold">
                            {order.payment_method}
                          </span>
                        </div>
                      </div>

                      {/* Customer Delivery Address */}
                      <div className="my-3 p-3.5 rounded-2xl bg-[#FAFAF8] border border-sand/70 space-y-1.5">
                        <div className="flex items-start gap-2 text-xs">
                          <MapPin size={14} className="text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-charcoal block">{order.delivery_address}</span>
                            <span className="text-[11px] text-charcoal/60">{order.city_district}</span>
                          </div>
                        </div>

                        {order.delivery_notes && (
                          <p className="text-[11px] text-charcoal/70 italic pt-1 border-t border-sand/60">
                            Note: &ldquo;{order.delivery_notes}&rdquo;
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-charcoal/60 pt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Phone size={11} className="text-gold" /> {order.customer_phone}
                          </span>
                          <span>ETA: <strong>{order.eta_minutes} mins</strong></span>
                        </div>
                      </div>

                      {/* Ordered Dishes Brief */}
                      <div className="text-xs text-charcoal/70 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-charcoal/50">Items:</span>
                        <p className="line-clamp-2">
                          {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                        </p>
                      </div>

                      {/* Assigned Driver Card or Unassigned Callout */}
                      <div className="mt-4 pt-3 border-t border-sand flex items-center justify-between">
                        {isAssigned ? (
                          <div className="flex items-center gap-2.5">
                            <img
                              src={order.driver_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"}
                              alt={order.driver_name || "Driver"}
                              className="h-9 w-9 rounded-full object-cover border border-gold"
                            />
                            <div>
                              <span className="font-bold text-xs text-charcoal block">
                                {order.driver_name}
                              </span>
                              <span className="text-[10px] text-charcoal/60">
                                {order.driver_vehicle}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-rose-700 font-bold">
                            <AlertCircle size={15} />
                            <span>Needs Courier Assignment</span>
                          </div>
                        )}

                        {/* Assign / Reassign Button */}
                        <button
                          onClick={() => {
                            setAssigningOrder(order);
                            setSelectedDriverId(order.driver_id || "");
                          }}
                          className="px-3 py-1.5 rounded-full border border-sand bg-sand/30 hover:bg-gold hover:text-charcoal text-xs font-bold text-charcoal transition-all"
                        >
                          {isAssigned ? "Reassign" : "Assign Driver"}
                        </button>
                      </div>
                    </div>

                    {/* Footer Actions: Live Map Tracker & Status Advance */}
                    <div className="pt-2 border-t border-sand flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => setTrackingOrder(order)}
                        className="px-3.5 py-1.5 rounded-xl bg-charcoal text-gold hover:bg-black text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <Radio size={12} className="text-gold animate-pulse" />
                        <span>Live Vector Radar</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {order.status === "Assigned" && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, "Picked Up")}
                            className="px-3 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 text-xs font-bold transition-colors"
                          >
                            Mark Picked Up
                          </button>
                        )}

                        {order.status === "Picked Up" && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, "On the Way")}
                            className="px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors"
                          >
                            Mark On The Way
                          </button>
                        )}

                        {order.status === "On the Way" && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, "Delivered")}
                            className="px-3 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-colors"
                          >
                            Mark Delivered ✓
                          </button>
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

      {/* TAB 2: COURIERS FLEET */}
      {activeTab === "fleet" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {couriers.map((courier) => (
              <div
                key={courier.id}
                className="p-5 rounded-3xl bg-white border border-sand shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <img
                      src={courier.avatar}
                      alt={courier.name}
                      className="h-14 w-14 rounded-2xl object-cover border-2 border-gold shadow-xs"
                    />
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        courier.status === "Available"
                          ? "bg-emerald-100 text-emerald-800"
                          : courier.status === "On Delivery"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-sand/60 text-charcoal/60"
                      }`}
                    >
                      {courier.status}
                    </span>
                  </div>

                  <h4 className="font-serif text-base font-bold text-olive">{courier.name}</h4>
                  <p className="text-xs font-bold text-charcoal/70 mt-0.5 flex items-center gap-1">
                    <Bike size={12} className="text-gold" /> {courier.vehicle_type}
                  </p>
                  <p className="text-[11px] font-mono text-charcoal/50 mt-0.5">
                    Plate: {courier.vehicle_plate}
                  </p>

                  <div className="mt-3 p-2.5 rounded-xl bg-sand/20 text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1 font-bold text-olive">
                      <Star size={12} className="fill-gold text-gold" /> {courier.rating.toFixed(1)}
                    </span>
                    <span className="text-[11px] text-charcoal/60 font-medium">
                      {courier.total_deliveries} Drops
                    </span>
                  </div>

                  <p className="text-[11px] text-charcoal/60 mt-2 flex items-center gap-1 font-mono">
                    <Phone size={11} className="text-gold" /> {courier.phone}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-sand/60">
                  <button
                    onClick={() => handleToggleDriverDuty(courier.id)}
                    className="w-full py-1.5 rounded-xl border border-sand hover:bg-sand/30 text-xs font-bold text-charcoal transition-colors"
                  >
                    Toggle Duty ↻
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MASTER CITY RADAR MAP */}
      {activeTab === "radar" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-charcoal text-sand border border-gold/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio size={16} className="text-gold animate-pulse" />
              <span className="font-serif text-base font-bold text-white">
                Master Fleet Vector Radar (Live Telemetry)
              </span>
            </div>
            <span className="text-xs font-mono text-gold">Zero External API Required</span>
          </div>

          {activeOrders.length > 0 ? (
            <LiveDeliveryMap
              order={activeOrders[0]}
              onUpdateProgress={handleLiveProgressUpdate}
            />
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-sand">
              <Compass size={36} className="mx-auto text-gold mb-3" />
              <p className="font-serif text-base font-bold text-olive">
                No orders currently in transit to track.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: COMPLETED DELIVERY HISTORY */}
      {activeTab === "history" && (
        <div className="bg-white rounded-3xl border border-sand p-6 shadow-sm overflow-hidden">
          <h3 className="font-serif text-xl font-bold text-olive mb-4">
            Completed Delivery Ledger ({completedOrders.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#FAFAF8] text-charcoal/60 uppercase font-bold text-[10px] tracking-wider border-b border-sand">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Delivery Address</th>
                  <th className="py-3 px-4">Courier</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Completed Time</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/50">
                {completedOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-sand/15 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-olive">#{o.id}</td>
                    <td className="py-3 px-4 font-semibold text-charcoal">{o.customer_name}</td>
                    <td className="py-3 px-4 text-charcoal/70 max-w-xs truncate">{o.delivery_address}</td>
                    <td className="py-3 px-4 font-medium text-olive">{o.driver_name || "Staff Courier"}</td>
                    <td className="py-3 px-4 font-mono font-bold text-charcoal">${o.total.toFixed(2)}</td>
                    <td className="py-3 px-4 text-charcoal/60">
                      {o.delivered_at
                        ? new Date(o.delivered_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "Earlier Today"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Delivered ✓
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ASSIGN COURIER MODAL */}
      <AnimatePresence>
        {assigningOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl border border-sand shadow-2xl p-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-sand mb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-olive">
                    Assign Courier to Order #{assigningOrder.id}
                  </h3>
                  <p className="text-xs text-charcoal/60 mt-0.5">
                    {assigningOrder.customer_name} • {assigningOrder.city_district}
                  </p>
                </div>
                <button
                  onClick={() => setAssigningOrder(null)}
                  className="p-1 rounded-full hover:bg-sand/30 text-charcoal"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-charcoal/70 block">
                  Select Delivery Courier:
                </span>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {couriers.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedDriverId(c.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedDriverId === c.id
                          ? "border-gold bg-gold/15 shadow-xs"
                          : "border-sand hover:border-gold/50 bg-[#FAFAF8]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="h-10 w-10 rounded-full object-cover border border-sand"
                        />
                        <div>
                          <span className="font-bold text-xs text-charcoal block">{c.name}</span>
                          <span className="text-[11px] text-charcoal/60">
                            {c.vehicle_type} ({c.vehicle_plate})
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            c.status === "Available"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-sand/70 text-charcoal/70"
                          }`}
                        >
                          {c.status}
                        </span>
                        <span className="text-[10px] text-gold font-bold block mt-0.5">
                          ★ {c.rating}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-sand flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssigningOrder(null)}
                  className="px-4 py-2 rounded-full border border-sand text-xs font-bold text-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAssignment}
                  disabled={!selectedDriverId}
                  className="px-5 py-2 rounded-full bg-olive text-gold hover:bg-charcoal disabled:opacity-40 text-xs font-bold shadow-md"
                >
                  Confirm Assignment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIVE MAP TRACKING MODAL */}
      <AnimatePresence>
        {trackingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl border border-sand shadow-2xl p-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-sand mb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-olive">
                    Live Telemetry • Order #{trackingOrder.id}
                  </h3>
                  <p className="text-xs text-charcoal/60">
                    Delivering to {trackingOrder.customer_name} ({trackingOrder.delivery_address})
                  </p>
                </div>
                <button
                  onClick={() => setTrackingOrder(null)}
                  className="p-1.5 rounded-full hover:bg-sand/30 text-charcoal"
                >
                  <X size={18} />
                </button>
              </div>

              <LiveDeliveryMap
                order={trackingOrder}
                isDriverView={true}
                onUpdateProgress={handleLiveProgressUpdate}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD NEW COURIER MODAL */}
      <AnimatePresence>
        {isAddDriverOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl border border-sand shadow-2xl p-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-sand mb-4">
                <div className="flex items-center gap-2">
                  <Plus size={16} className="text-gold" />
                  <h3 className="font-serif text-lg font-bold text-olive">Add Delivery Courier</h3>
                </div>
                <button
                  onClick={() => setIsAddDriverOpen(false)}
                  className="p-1 rounded-full hover:bg-sand/30 text-charcoal"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddDriverSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                    Courier Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newDriverName}
                    onChange={(e) => setNewDriverName(e.target.value)}
                    placeholder="e.g. Matteo Ferrari"
                    className="inp text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                    Mobile Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={newDriverPhone}
                    onChange={(e) => setNewDriverPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="inp text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={newDriverVehicle}
                    onChange={(e) => setNewDriverVehicle(e.target.value as any)}
                    className="inp text-xs font-semibold cursor-pointer"
                  >
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Electric Scooter">Electric Scooter</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Car">Car</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                    License Plate / Vehicle ID
                  </label>
                  <input
                    type="text"
                    required
                    value={newDriverPlate}
                    onChange={(e) => setNewDriverPlate(e.target.value)}
                    placeholder="e.g. NZ-550-M"
                    className="inp text-sm uppercase font-mono font-bold"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddDriverOpen(false)}
                    className="px-4 py-2 rounded-full border border-sand text-xs font-bold text-charcoal"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-olive text-gold hover:bg-charcoal text-xs font-bold shadow-md"
                  >
                    Register Courier
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
