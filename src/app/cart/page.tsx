"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  Sparkles,
  Utensils,
  CreditCard,
  Banknote,
  Check,
  CheckCircle2,
  RefreshCw,
  Tag,
  ShieldCheck,
  ArrowRight,
  Pencil,
  SlidersHorizontal,
  Flame,
  Leaf,
  QrCode,
  Truck,
  MapPin,
  Home,
  Phone,
  Ticket,
  Crown,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart, FoodCustomization } from "@/components/Cart";
import { toast } from "@/lib/notify";
import Img from "@/components/Img";
import NimzaLogo from "@/components/NimzaLogo";
import FoodCustomizationModal from "@/components/FoodCustomizationModal";
import {
  getStoredDeliveryOrders,
  saveStoredDeliveryOrders,
  DeliveryOrder,
} from "@/lib/delivery/deliveryTypes";
import {
  validateCoupon,
  getStoredCoupons,
  CouponItem,
} from "@/lib/coupons/couponData";
import { awardLoyaltyPoints } from "@/lib/loyalty/loyaltyTypes";

const PAYMENT_OPTIONS = [
  {
    id: "card",
    title: "Credit & Debit Cards",
    icon: CreditCard,
    isDummy: true,
  },
  {
    id: "cash",
    title: "Cash at Table",
    icon: Banknote,
    isDummy: false,
  },
];

export default function Cart() {
  const { items, chg, remove, clear, total, updateCustomization } = useCart();
  const router = useRouter();

  const [selectedPayment, setSelectedPayment] = useState<string>("card");
  const [orderType, setOrderType] = useState<"dine_in" | "delivery">("dine_in");
  const [tableNumber, setTableNumber] = useState(3);
  const [isQrTableActive, setIsQrTableActive] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("Penthouse 4B, 742 Evergreen Promenade");
  const [deliveryCity, setDeliveryCity] = useState("Embassy Gardens & Diplomatic Quarter");
  const [deliveryCustomerName, setDeliveryCustomerName] = useState("Lord Sterling");
  const [customerPhone, setCustomerPhone] = useState("+1 (555) 892-4100");
  const [deliveryNote, setDeliveryNote] = useState("");

  // Detect table from QR code scan or session
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const tableFromUrl = urlParams.get("table");
    const tableFromStorage = localStorage.getItem("nimza_active_table");

    const activeNum = tableFromUrl || tableFromStorage;
    if (activeNum && !isNaN(Number(activeNum))) {
      const num = Number(activeNum);
      setTableNumber(num);
      setIsQrTableActive(true);
      try {
        localStorage.setItem("nimza_active_table", String(num));
      } catch {}
    }
  }, []);
  const [promoCode, setPromoCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponItem | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [isCouponsDrawerOpen, setIsCouponsDrawerOpen] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<CouponItem[]>([]);

  useEffect(() => {
    setAvailableCoupons(getStoredCoupons().filter((c) => c.isActive));
  }, []);

  const handleApplyCouponCode = (code: string) => {
    if (!code.trim()) {
      toast("Please enter a voucher code", "error");
      return;
    }
    const result = validateCoupon(code, total);
    if (result.valid) {
      setAppliedCoupon(result.coupon || null);
      setDiscountAmount(result.discountAmount);
      setPromoApplied(true);
      setPromoCode(code.toUpperCase());
      toast(result.message, "success");
      setIsCouponsDrawerOpen(false);
    } else {
      toast(result.message, "error");
    }
  };

  const applyPromo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    handleApplyCouponCode(promoCode);
  };

  const finalTotal = Math.max(0, total - discountAmount);
  const totalPkr = Math.round(finalTotal * 280);

  // Edit Customization Modal State
  const [editingCartItem, setEditingCartItem] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const formatCustomizationSummary = (c?: FoodCustomization) => {
    if (!c) return "";
    const parts: string[] = [];
    if (c.portion?.label && c.portion.label !== "Chef's Standard") {
      parts.push(`Portion: ${c.portion.label}`);
    }
    if (c.spiceLevel) {
      parts.push(`Spice: ${c.spiceLevel}`);
    }
    if (c.toppings && c.toppings.length > 0) {
      parts.push(`Add-ons: ${c.toppings.map((t) => t.name).join(", ")}`);
    }
    if (c.specialInstructions) {
      parts.push(`Note: "${c.specialInstructions}"`);
    }
    return parts.join(" | ");
  };

  const handleStartEditCustomization = (item: any) => {
    setEditingCartItem(item);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedCustomization = (newCustomization: FoodCustomization) => {
    if (!editingCartItem) return;
    const cartItemId = editingCartItem.cartItemId || String(editingCartItem.id);
    updateCustomization(cartItemId, newCustomization);
    setIsEditModalOpen(false);
    setEditingCartItem(null);
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    orderId: number;
    amountPkr: number;
    amountUsd: string;
    method: string;
    status: string;
    pointsEarned?: number;
  } | null>(null);

  const isCard = selectedPayment === "card";

  // Handles both dummy card payment and cash settlement
  async function handleCheckout() {
    if (!items.length) {
      toast("Your cart is empty", "info");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. If Credit & Debit Cards, simulate a realistic network processing delay (dummy payment)
      if (isCard) {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      }

      // 2. Fetch authenticated user (if signed in)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const paymentMethodTitle = isCard
        ? "Credit & Debit Cards"
        : orderType === "delivery"
        ? "Pay on Delivery"
        : "Cash at Table";
      const paymentStatusValue = isCard
        ? "Paid"
        : orderType === "delivery"
        ? "Pay on Delivery"
        : "Pay at Table";

      const orderPayload: any = {
        total: Number(finalTotal.toFixed(2)),
        status: "Pending", // Kitchen queue initial stage
        payment_method: paymentMethodTitle,
        payment_status: paymentStatusValue,
        table_no: orderType === "dine_in" ? tableNumber : null,
        order_type: orderType,
        delivery_address: orderType === "delivery" ? deliveryAddress : null,
        delivery_phone: orderType === "delivery" ? customerPhone : null,
        notes: deliveryNote,
      };

      if (user?.id) {
        orderPayload.user_id = user.id;
      }

      let generatedOrderId = Math.floor(1000 + Math.random() * 9000);

      // 3. Save order into Supabase
      try {
        const res = await supabase.from("orders").insert(orderPayload).select().single();
        if (res.data?.id) generatedOrderId = res.data.id;
      } catch (e) {
        // Fallback if payment_status column does not exist on remote DB
        delete orderPayload.payment_status;
        try {
          const res = await supabase.from("orders").insert(orderPayload).select().single();
          if (res.data?.id) generatedOrderId = res.data.id;
        } catch {}
      }

      // 4. Save order items into Supabase
      try {
        const orderItemsRows = items.map((x: any) => ({
          order_id: generatedOrderId,
          menu_item_id: x.id,
          quantity: x.qty,
          customizations: formatCustomizationSummary(x.customization),
        }));
        await supabase.from("order_items").insert(orderItemsRows);
      } catch {}

      // 5. Store in localStorage for instant live synchronization
      const newOrderRecord = {
        id: generatedOrderId,
        created_at: new Date().toISOString(),
        status: "Pending",
        total: Number(finalTotal.toFixed(2)),
        table_no: orderType === "dine_in" ? tableNumber : null,
        order_type: orderType,
        delivery_address: orderType === "delivery" ? deliveryAddress : null,
        delivery_phone: orderType === "delivery" ? customerPhone : null,
        payment_method: paymentMethodTitle,
        payment_status: paymentStatusValue,
        notes: deliveryNote,
        order_items: items.map((x: any) => ({
          quantity: x.qty,
          customization: x.customization,
          customizations: formatCustomizationSummary(x.customization),
          menu_items: {
            name: x.name,
            price: x.price,
            image_url: x.image_url,
          },
        })),
      };

      try {
        const existing = JSON.parse(localStorage.getItem("nimza_placed_orders") || "[]");
        localStorage.setItem("nimza_placed_orders", JSON.stringify([newOrderRecord, ...existing]));
        window.dispatchEvent(new CustomEvent("nimza_order_created", { detail: newOrderRecord }));

        // If delivery order, also record in Delivery Management queue
        if (orderType === "delivery") {
          const newDeliveryRecord: DeliveryOrder = {
            id: generatedOrderId,
            created_at: new Date().toISOString(),
            customer_name: deliveryCustomerName || user?.user_metadata?.full_name || user?.email || "Guest Diner",
            customer_phone: customerPhone || "+1 (555) 000-0000",
            delivery_address: deliveryAddress || "Penthouse 4B, 742 Evergreen Promenade",
            city_district: deliveryCity || "Downtown Prestige District",
            delivery_notes: deliveryNote,
            items: items.map((x: any) => ({
              name: x.name,
              quantity: x.qty,
              price: Number(x.price),
              customizations: formatCustomizationSummary(x.customization),
            })),
            total: Number(finalTotal.toFixed(2)),
            payment_method: paymentMethodTitle,
            payment_status: isCard ? "Paid" : "Pay on Delivery",
            status: "Pending",
            driver_id: null,
            driver_lat: 45.4642,
            driver_lng: 9.1900,
            dest_lat: 45.4750,
            dest_lng: 9.2100,
            progress_percent: 0,
            distance_km: 2.4,
            eta_minutes: 25,
          };

          const existingDel = getStoredDeliveryOrders();
          saveStoredDeliveryOrders([newDeliveryRecord, ...existingDel]);
        }
      } catch {}

      // 6. Award Loyalty Points for Gastronomy VIP Club
      let pointsAwarded = 0;
      try {
        pointsAwarded = awardLoyaltyPoints(finalTotal, generatedOrderId);
      } catch {}

      // 7. Provide clear, elegant feedback
      setSuccessData({
        orderId: generatedOrderId,
        amountPkr: totalPkr,
        amountUsd: finalTotal.toFixed(2),
        method: paymentMethodTitle,
        status: paymentStatusValue,
        pointsEarned: pointsAwarded,
      });

      clear();

      if (isCard) {
        toast(`Payment Successful! You earned +${pointsAwarded} VIP Loyalty Points!`, "success");
        setShowSuccessModal(true);
      } else {
        toast(
          `Order #${generatedOrderId} placed! Earned +${pointsAwarded} VIP Points. Pay cash upon arrival.`,
          "success"
        );
        router.push("/orders");
      }
    } catch (err: any) {
      toast("Error placing order. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-charcoal pt-36 pb-28 px-6 md:px-12 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1F241F] shadow-sm mb-4">
            <Sparkles size={14} className="text-gold" />
            <span>Order & Payment</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-[#1F241F] tracking-tight">
            Checkout
          </h1>
          <p className="mt-4 text-charcoal/70 text-base md:text-lg font-light leading-relaxed">
            Review your dishes and select your payment method.
          </p>
        </div>

        {items.length === 0 ? (
          /* Empty Bag State */
          <div className="max-w-md mx-auto text-center py-16 px-6 rounded-[2.5rem] bg-white border border-sand shadow-sm">
            <div className="flex justify-center mb-6">
              <NimzaLogo variant="circle" size="lg" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#1F241F]">Your Cart is Quiet</h2>
            <p className="mt-3 text-sm text-charcoal/70 leading-relaxed">
              No dishes have been added yet. Discover our harvest and hand-crafted delicacies.
            </p>
            <Link href="/menu" className="btn mt-8 inline-flex items-center gap-2">
              <Utensils size={16} />
              <span>Explore The Menu</span>
            </Link>
          </div>
        ) : (
          /* Cart Grid: Items on Left, Clean Simplified Payment Card on Right */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Items List & Dining Details */}
            <div className="lg:col-span-7 space-y-6">
              {/* Selected Dishes List */}
              <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-sand shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-sand text-xs font-bold uppercase tracking-wider text-charcoal/60">
                  <span>Selected Dishes ({items.reduce((s: number, i: any) => s + i.qty, 0)})</span>
                  <button
                    onClick={clear}
                    className="text-rose-700 hover:text-rose-900 font-medium transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map((item: any) => {
                      const itemKey = item.cartItemId || item.id;
                      const cust = item.customization as FoodCustomization | undefined;

                      return (
                        <motion.div
                          key={itemKey}
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -30 }}
                          className="p-4 rounded-2xl bg-sand/20 border border-sand/80 flex flex-col justify-between gap-3 transition-all hover:border-gold/40"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              {item.image_url && (
                                <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0 border border-sand bg-white">
                                  <Img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <h3 className="font-serif text-lg font-bold text-[#1F241F]">
                                  {item.name}
                                </h3>
                                <p className="text-xs text-charcoal/60 mt-0.5">
                                  ${Number(item.price).toFixed(2)} each
                                </p>
                              </div>
                            </div>

                            {/* Quantity Controls & Line Total */}
                            <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-sand">
                              <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-sand shadow-sm">
                                <button
                                  type="button"
                                  onClick={() => chg(itemKey, -1)}
                                  aria-label="Decrease quantity"
                                  className="grid h-7 w-7 place-items-center rounded-full bg-sand/40 text-charcoal hover:bg-gold hover:text-charcoal transition-all"
                                >
                                  <Minus size={13} />
                                </button>
                                <span className="w-6 text-center font-bold text-xs">{item.qty}</span>
                                <button
                                  type="button"
                                  onClick={() => chg(itemKey, 1)}
                                  aria-label="Increase quantity"
                                  className="grid h-7 w-7 place-items-center rounded-full bg-sand/40 text-charcoal hover:bg-gold hover:text-charcoal transition-all"
                                >
                                  <Plus size={13} />
                                </button>
                              </div>

                              <div className="text-right min-w-[75px]">
                                <span className="font-serif text-lg font-bold text-[#1F241F]">
                                  ${(item.price * item.qty).toFixed(2)}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => remove(itemKey)}
                                aria-label="Remove item"
                                className="text-charcoal/40 hover:text-rose-600 transition-colors p-1"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          {/* Customization Details Breakdown & Edit Trigger */}
                          <div className="pt-2.5 mt-1 border-t border-sand/50 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Portion Size Badge */}
                              {cust?.portion && cust.portion.label !== "Chef's Standard" && (
                                <span className="rounded-full bg-white border border-sand px-2.5 py-0.5 font-medium text-olive">
                                  Portion: {cust.portion.label} ({cust.portion.priceDelta > 0 ? "+" : ""}${cust.portion.priceDelta.toFixed(2)})
                                </span>
                              )}

                              {/* Spice Level Badge */}
                              {cust?.spiceLevel && (
                                <span
                                  className={`rounded-full px-2.5 py-0.5 font-bold border ${
                                    cust.spiceLevel === "Hot"
                                      ? "bg-rose-50 border-rose-300 text-rose-800"
                                      : cust.spiceLevel === "Medium"
                                      ? "bg-amber-50 border-amber-300 text-amber-800"
                                      : "bg-emerald-50 border-emerald-300 text-emerald-800"
                                  }`}
                                >
                                  {cust.spiceLevel === "Hot" ? "🔥 Hot" : cust.spiceLevel === "Medium" ? "🌶️ Medium" : "🌿 Mild"}
                                </span>
                              )}

                              {/* Toppings / Add-ons Chips */}
                              {cust?.toppings && cust.toppings.length > 0 && (
                                <span className="rounded-full bg-gold/15 border border-gold/40 text-[#1F241F] px-2.5 py-0.5 font-medium">
                                  +{cust.toppings.map((t) => `${t.name} (+$${t.price.toFixed(2)})`).join(", ")}
                                </span>
                              )}

                              {/* Special Instructions Note */}
                              {cust?.specialInstructions && (
                                <span className="italic text-charcoal/70 bg-white/70 px-2 py-0.5 rounded-full border border-sand/60">
                                  &ldquo;{cust.specialInstructions}&rdquo;
                                </span>
                              )}
                            </div>

                            {/* Edit Customization Button */}
                            <button
                              type="button"
                              onClick={() => handleStartEditCustomization(item)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-olive hover:text-gold transition-colors py-0.5 px-2 rounded-full hover:bg-gold/15 border border-transparent hover:border-gold/40"
                              title="Modify portion, spice level, and toppings"
                            >
                              <Pencil size={11} className="text-gold" />
                              <span>Edit Customization</span>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Dining Destination: Table Service vs. Doorstep Delivery */}
              <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-sand space-y-5 shadow-sm">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-2">
                    Service Experience
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setOrderType("dine_in")}
                      className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        orderType === "dine_in"
                          ? "bg-charcoal text-gold border-gold shadow-sm"
                          : "bg-sand/20 border-sand text-charcoal/70 hover:bg-sand/40"
                      }`}
                    >
                      <Utensils size={15} />
                      <span>Dine-In Table</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderType("delivery")}
                      className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        orderType === "delivery"
                          ? "bg-charcoal text-gold border-gold shadow-sm"
                          : "bg-sand/20 border-sand text-charcoal/70 hover:bg-sand/40"
                      }`}
                    >
                      <Truck size={15} />
                      <span>Doorstep Delivery</span>
                    </button>
                  </div>
                </div>

                {orderType === "dine_in" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70">
                          Dining Table
                        </label>
                        {isQrTableActive && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full">
                            <QrCode size={11} className="text-emerald-600" /> QR Table Active
                          </span>
                        )}
                      </div>
                      <select
                        value={tableNumber}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setTableNumber(val);
                          try {
                            localStorage.setItem("nimza_active_table", String(val));
                          } catch {}
                        }}
                        className="inp cursor-pointer !text-xs font-semibold"
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Table #{i + 1} {i < 4 ? "(Dining Hall)" : i < 6 ? "(Chef's Counter)" : i < 8 ? "(Veranda)" : "(Wine Vault)"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70">
                          Privilege Voucher
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsCouponsDrawerOpen(true)}
                          className="text-[11px] text-gold font-bold underline hover:text-gold-dark flex items-center gap-1"
                        >
                          <Ticket size={12} />
                          <span>View Coupons ({availableCoupons.length})</span>
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="e.g. NIMZA10 or TASTE20"
                          className="inp !py-2.5 !text-xs uppercase tracking-wider"
                        />
                        <button
                          type="button"
                          onClick={applyPromo}
                          className="rounded-2xl border border-sand bg-sand/30 px-3.5 py-2 text-xs font-bold text-charcoal hover:bg-gold transition-all shrink-0"
                        >
                          Apply
                        </button>
                      </div>
                      {promoApplied && appliedCoupon && (
                        <span className="text-[11px] text-emerald-700 font-medium block mt-1">
                          ✓ Applied {appliedCoupon.title} (-${discountAmount.toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                          Recipient Name
                        </label>
                        <input
                          type="text"
                          value={deliveryCustomerName}
                          onChange={(e) => setDeliveryCustomerName(e.target.value)}
                          placeholder="e.g. Lord Sterling"
                          className="inp !text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                          Delivery Contact Phone
                        </label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="inp !text-xs font-semibold font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                        Street Address &amp; Suite / Penthouse
                      </label>
                      <div className="relative">
                        <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-600" />
                        <input
                          type="text"
                          required
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="e.g. Penthouse 4B, 742 Evergreen Promenade"
                          className="inp !pl-10 !text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                          City District / Enclave
                        </label>
                        <input
                          type="text"
                          value={deliveryCity}
                          onChange={(e) => setDeliveryCity(e.target.value)}
                          placeholder="e.g. Prestige Heights"
                          className="inp !text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70">
                            Privilege Voucher
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsCouponsDrawerOpen(true)}
                            className="text-[11px] text-gold font-bold underline hover:text-gold-dark flex items-center gap-1"
                          >
                            <Ticket size={12} />
                            <span>Coupons ({availableCoupons.length})</span>
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="e.g. NIMZA10 or TASTE20"
                            className="inp !py-2.5 !text-xs uppercase tracking-wider"
                          />
                          <button
                            type="button"
                            onClick={applyPromo}
                            className="rounded-2xl border border-sand bg-sand/30 px-3.5 py-2 text-xs font-bold text-charcoal hover:bg-gold transition-all shrink-0"
                          >
                            Apply
                          </button>
                        </div>
                        {promoApplied && appliedCoupon && (
                          <span className="text-[11px] text-emerald-700 font-medium block mt-1">
                            ✓ Applied {appliedCoupon.title} (-${discountAmount.toFixed(2)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Kitchen Notes or Allergies (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="e.g. Truffle dressing on the side, quiet window seating..."
                    className="inp resize-none !text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Clean, Minimal Payment Section (Matching User Reference Image) */}
            <div className="lg:col-span-5">
              <div className="rounded-[2.5rem] bg-white p-7 md:p-9 border border-sand shadow-sm space-y-6">
                {/* 1. Payment Method Header */}
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1F241F]">
                    Payment Method
                  </h3>
                </div>

                {/* 2. Simplified Clean Payment Options */}
                <div className="space-y-3">
                  {PAYMENT_OPTIONS.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedPayment === method.id;

                    return (
                      <button
                        type="button"
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                          isSelected
                            ? "border-sand bg-[#FAFAF8] shadow-sm"
                            : "border-sand/70 bg-white hover:border-sand"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={19} className="text-charcoal/80" />
                          <span className="font-medium text-sm text-[#1F241F]">
                            {method.title}
                          </span>
                        </div>

                        {isSelected && (
                          <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 text-xs font-semibold">
                            Selected
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* 3. Order Total (Matching Reference: "Order Total" + "Rs. 2,500") */}
                <div className="pt-4 border-t border-sand space-y-1">
                  <p className="text-xs font-semibold text-charcoal/60">
                    Order Total
                  </p>
                  <div className="flex items-baseline justify-between">
                    <p className="font-serif text-3xl font-extrabold text-[#1F241F]">
                      Rs. {totalPkr.toLocaleString()}
                    </p>
                    <span className="text-xs text-charcoal/50 font-medium">
                      (${finalTotal.toFixed(2)} USD)
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold pt-1">
                      <span>Coupon Discount ({appliedCoupon ? appliedCoupon.badge : "Voucher"}):</span>
                      <span>-${discountAmount.toFixed(2)} USD</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] text-amber-900 bg-amber-50/90 p-2.5 rounded-xl border border-amber-200 mt-2 font-medium">
                    <Crown size={14} className="text-gold shrink-0" />
                    <span>You will earn <strong>+{Math.round(finalTotal)} VIP Loyalty Points</strong> on this order!</span>
                  </div>
                </div>

                {/* 4. Pay Now Action Button (Dummy Payment Simulation) */}
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full rounded-2xl bg-sand/30 hover:bg-gold py-4 text-sm font-bold text-[#1F241F] transition-all flex items-center justify-center gap-2 shadow-sm border border-sand hover:border-gold active:scale-98 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw size={17} className="animate-spin text-charcoal" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <span>{isCard ? "Pay Now" : "Place Order (Cash at Table)"}</span>
                  )}
                </button>

                <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-charcoal/50 text-center">
                  <ShieldCheck size={13} className="text-gold" />
                  <span>
                    {isCard
                      ? "Dummy simulation: no real funds are charged"
                      : "Settlement handled discreetly at table"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Successful Confirmation Modal */}
      <AnimatePresence>
        {showSuccessModal && successData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full border border-sand shadow-2xl text-center space-y-5"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 size={36} strokeWidth={2.5} />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Payment Approved
                </span>
                <h3 className="font-serif text-3xl font-bold text-[#1F241F] mt-3">
                  Payment Successful
                </h3>
                <p className="text-xs text-charcoal/60 mt-1.5 leading-relaxed">
                  Your simulated card payment was authorized successfully. No real charge was made.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-sand text-left space-y-2 text-xs">
                <div className="flex justify-between text-charcoal/70">
                  <span>Order Number:</span>
                  <span className="font-bold text-[#1F241F]">#{successData.orderId}</span>
                </div>
                <div className="flex justify-between text-charcoal/70">
                  <span>Payment Method:</span>
                  <span className="font-bold text-[#1F241F]">{successData.method}</span>
                </div>
                <div className="flex justify-between text-charcoal/70">
                  <span>Payment Status:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Paid
                  </span>
                </div>
                <div className="flex justify-between border-t border-sand pt-2 font-serif text-base text-[#1F241F]">
                  <span>Amount:</span>
                  <span className="font-bold">Rs. {successData.amountPkr.toLocaleString()} (${successData.amountUsd})</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/orders"
                  className="btn w-full !py-3.5 text-xs uppercase tracking-wider font-bold shadow-md flex items-center justify-center gap-2"
                >
                  <span>View Order Status</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Customization Modal */}
      <FoodCustomizationModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCartItem(null);
        }}
        dish={editingCartItem}
        initialCustomization={editingCartItem?.customization}
        initialQty={editingCartItem?.qty || 1}
        mode="edit"
        onSave={handleSaveEditedCustomization}
      />

      {/* Available Vouchers & Coupons Modal Drawer */}
      <AnimatePresence>
        {isCouponsDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCouponsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-gold shadow-2xl text-charcoal z-10 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-sand">
                <div className="flex items-center gap-2.5">
                  <Ticket size={22} className="text-gold" />
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1F241F]">
                      Available Vouchers
                    </h3>
                    <p className="text-[11px] text-charcoal/60">
                      Tap apply on any active privilege voucher below
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCouponsDrawerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-sand/30 text-charcoal"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3.5 my-5">
                {availableCoupons.map((coupon) => (
                  <div
                    key={coupon.code}
                    className="p-4 rounded-2xl bg-sand/15 border border-sand hover:border-gold/60 transition-all flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-gold text-charcoal">
                          {coupon.code}
                        </span>
                        <span className="text-xs font-bold text-[#1F241F]">
                          {coupon.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-charcoal/70 mt-1">
                        {coupon.description}
                      </p>
                      <span className="text-[10px] text-charcoal/50 font-mono block mt-0.5">
                        {coupon.minSpendUsd > 0
                          ? `Min spend: $${coupon.minSpendUsd.toFixed(2)} USD`
                          : "No minimum spend required"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyCouponCode(coupon.code)}
                      className="px-3.5 py-1.5 rounded-full bg-olive text-gold hover:bg-gold hover:text-charcoal text-xs font-bold transition-all shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
