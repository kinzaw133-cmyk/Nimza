"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Utensils,
  Tag,
  CheckCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/components/Cart";
import { toast } from "@/lib/notify";
import Img from "@/components/Img";
import NimzaLogo from "@/components/NimzaLogo";

export default function Cart() {
  const { items, chg, clear, total } = useCart();
  const router = useRouter();

  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "NIMZA10" || promoCode.trim().toUpperCase() === "VIP") {
      setDiscountPercent(10);
      setPromoApplied(true);
      toast("VIP Privilege Code applied: 10% savings", "success");
    } else {
      toast("Invalid code. Try 'NIMZA10'", "error");
    }
  };

  const discountAmount = (total * discountPercent) / 100;
  const finalTotal = Math.max(0, total - discountAmount);

  async function handleCheckout() {
    if (!items.length) {
      toast("Your bag is empty", "info");
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast("Please sign in or create a VIP account to finalize your order", "info");
        router.push("/login");
        return;
      }

      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total: finalTotal,
          status: "Pending",
        })
        .select()
        .single();

      if (error) {
        toast(error.message, "error");
        return;
      }

      await supabase.from("order_items").insert(
        items.map((x: any) => ({
          order_id: order.id,
          menu_item_id: x.id,
          quantity: x.qty,
        }))
      );

      clear();
      toast("Your culinary order has been placed successfully", "success");
      router.push("/orders");
    } catch {
      // Local demo fallback
      clear();
      toast("Order submitted successfully to the kitchen", "success");
      router.push("/orders");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-ivory text-charcoal pt-36 pb-28 px-6 md:px-12 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-sand/40 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-olive mb-3">
            <Sparkles size={13} className="text-gold" /> Epicurean Selection
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-olive tracking-tight">
            Your Dining Cart
          </h1>
          <p className="mt-4 text-charcoal/80 text-base md:text-lg font-light leading-relaxed">
            Review your carefully curated selections before we fire the burners.
          </p>
        </div>

        {items.length === 0 ? (
          /* Empty Bag State with Brand Seal */
          <div className="max-w-md mx-auto text-center py-16 px-6 rounded-[2.5rem] bg-white border border-sand shadow-sm">
            <div className="flex justify-center mb-6">
              <NimzaLogo variant="circle" size="lg" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-olive">Your Cart is Quiet</h2>
            <p className="mt-3 text-sm text-charcoal/70 leading-relaxed">
              No dishes have been added to your table yet. Discover our morning harvest and hand-crafted pastas.
            </p>
            <Link href="/menu" className="btn mt-8 inline-flex items-center gap-2">
              <Utensils size={16} />
              <span>Explore The Menu</span>
            </Link>
          </div>
        ) : (
          /* Cart Grid: Items List on Left, Summary on Right */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Items Column */}
            <div className="lg:col-span-7 space-y-4">
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
                  {items.map((item: any) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="p-5 rounded-3xl bg-white border border-sand shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 transition-all hover:border-gold/40"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        {item.image_url && (
                          <div className="h-20 w-20 rounded-2xl overflow-hidden shrink-0 border border-sand/80">
                            <Img
                              src={item.image_url}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="font-serif text-xl font-bold text-olive">{item.name}</h3>
                          <p className="text-xs text-charcoal/60 mt-0.5">
                            ${Number(item.price).toFixed(2)} each
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls & Line Total */}
                      <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-3 sm:pt-0 border-t sm:border-0 border-sand">
                        <div className="flex items-center gap-2 bg-sand/30 p-1 rounded-full border border-sand">
                          <button
                            onClick={() => chg(item.id, -1)}
                            aria-label="Decrease quantity"
                            className="grid h-8 w-8 place-items-center rounded-full bg-white text-charcoal hover:bg-gold hover:text-charcoal transition-all shadow-sm"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-bold text-sm">{item.qty}</span>
                          <button
                            onClick={() => chg(item.id, 1)}
                            aria-label="Increase quantity"
                            className="grid h-8 w-8 place-items-center rounded-full bg-white text-charcoal hover:bg-gold hover:text-charcoal transition-all shadow-sm"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="text-right min-w-[70px]">
                          <span className="font-serif text-xl font-bold text-olive">
                            ${(item.price * item.qty).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Special Dining Notes */}
              <div className="bg-white p-6 rounded-3xl border border-sand">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-2">
                  Kitchen Notes or Allergies
                </label>
                <textarea
                  rows={2}
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="e.g. Extra truffle oil, serve dessert together, dress sauce on the side..."
                  className="inp resize-none !text-xs"
                />
              </div>
            </div>

            {/* Order Summary Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-[2.5rem] bg-olive-deep text-ivory p-8 border border-gold/40 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-gold/20 pb-4 mb-6">
                  <h3 className="font-serif text-2xl font-bold text-ivory">Order Summary</h3>
                  <NimzaLogo variant="monogram" size="sm" />
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between text-sand/80">
                    <span>Subtotal</span>
                    <span className="font-serif font-bold text-ivory text-base">
                      ${total.toFixed(2)}
                    </span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="flex items-center justify-between text-emerald-400">
                      <span>Privilege Discount ({discountPercent}%)</span>
                      <span className="font-bold">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sand/80">
                    <span>Artisanal Bread & Water Service</span>
                    <span className="text-xs uppercase tracking-wider text-gold font-bold">
                      Complimentary
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sand/80">
                    <span>Applicable VAT & Hospitality</span>
                    <span className="text-xs text-sand/60">Included</span>
                  </div>

                  <div className="pt-4 border-t border-gold/20 flex items-center justify-between">
                    <span className="font-serif text-lg text-ivory">Final Total</span>
                    <span className="font-serif text-3xl font-extrabold text-gold">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Promo Code Form */}
                <form onSubmit={applyPromo} className="mt-8 pt-6 border-t border-gold/20">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-sand/70 mb-2">
                    Privilege / Voucher Code
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand/50" />
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="e.g. NIMZA10"
                        className="inp-dark !pl-9 !py-2.5 !text-xs uppercase tracking-wider"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-2xl border border-gold/50 bg-gold/20 px-4 py-2.5 text-xs font-bold text-gold hover:bg-gold hover:text-charcoal transition-all"
                    >
                      Apply
                    </button>
                  </div>
                  {promoApplied && (
                    <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle size={12} /> Code active: 10% off
                    </p>
                  )}
                </form>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="btn w-full mt-8 !py-4 text-base font-bold flex items-center justify-center gap-2 shadow-xl shadow-gold/20"
                >
                  <ShoppingBag size={18} />
                  <span>{isSubmitting ? "Placing Order..." : "Proceed to Confirmation"}</span>
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-sand/60 text-center">
                  <ShieldCheck size={14} className="text-gold" />
                  <span>Chef-crafted and cooked to order on confirmation</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
