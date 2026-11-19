"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Ticket,
  Calendar,
  Percent,
  DollarSign,
  X,
} from "lucide-react";
import {
  CouponItem,
  getStoredCoupons,
  saveStoredCoupons,
} from "@/lib/coupons/couponData";
import { toast } from "@/lib/notify";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New coupon form state
  const [newCode, setNewCode] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDiscountType, setNewDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [newDiscountValue, setNewDiscountValue] = useState(15);
  const [newMinSpend, setNewMinSpend] = useState(40);
  const [newDescription, setNewDescription] = useState("");
  const [newExpiry, setNewExpiry] = useState("Dec 31, 2027");

  useEffect(() => {
    setCoupons(getStoredCoupons());
    const handleUpdate = () => setCoupons(getStoredCoupons());
    window.addEventListener("nimza_coupons_updated", handleUpdate);
    return () => window.removeEventListener("nimza_coupons_updated", handleUpdate);
  }, []);

  const handleToggleActive = (code: string) => {
    const updated = coupons.map((c) =>
      c.code === code ? { ...c, isActive: !c.isActive } : c
    );
    setCoupons(updated);
    saveStoredCoupons(updated);
    toast("Coupon status toggled", "info");
  };

  const handleDelete = (code: string) => {
    if (confirm(`Are you sure you want to delete coupon ${code}?`)) {
      const updated = coupons.filter((c) => c.code !== code);
      setCoupons(updated);
      saveStoredCoupons(updated);
      toast(`Deleted coupon ${code}`, "success");
    }
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newTitle.trim()) {
      toast("Please provide both code and title", "error");
      return;
    }

    const cleanCode = newCode.trim().toUpperCase().replace(/\s+/g, "");
    if (coupons.some((c) => c.code === cleanCode)) {
      toast(`Coupon ${cleanCode} already exists`, "error");
      return;
    }

    const created: CouponItem = {
      code: cleanCode,
      title: newTitle.trim(),
      discountType: newDiscountType,
      discountValue: Number(newDiscountValue),
      minSpendUsd: Number(newMinSpend),
      description: newDescription.trim() || `${newDiscountValue}${newDiscountType === "percentage" ? "%" : "$"} discount voucher.`,
      badge: newDiscountType === "percentage" ? `${newDiscountValue}% OFF` : `$${newDiscountValue} OFF`,
      expiryDate: newExpiry.trim() || "Active",
      isActive: true,
    };

    const updated = [created, ...coupons];
    setCoupons(updated);
    saveStoredCoupons(updated);
    toast(`Created new coupon ${cleanCode}!`, "success");

    // Reset & close
    setNewCode("");
    setNewTitle("");
    setNewDescription("");
    setIsModalOpen(false);
  };

  const copyCode = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast(`Copied ${code}`, "info");
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {}
  };

  const filtered = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sand">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-charcoal shadow-2xs mb-2">
            <Ticket size={12} className="text-gold" />
            <span>Promotional Vouchers &amp; Incentives</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#1F241F]">
            Coupon Management
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/60 mt-1">
            Create, configure, and monitor promo discount codes redeemable by customers in the checkout cart.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn !bg-gold hover:!bg-gold-light !text-charcoal !py-2.5 !px-5 text-xs font-bold uppercase tracking-wider rounded-full shadow-xs flex items-center gap-2 shrink-0"
        >
          <Plus size={15} />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-sand">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coupon code or name..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-sand/20 border border-sand text-xs text-charcoal placeholder-charcoal/40 outline-none focus:border-gold"
          />
        </div>
        <span className="text-xs text-charcoal/50 font-mono">
          {filtered.length} coupons configured
        </span>
      </div>

      {/* COUPONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.code}
            className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between ${
              item.isActive
                ? "bg-white border-sand hover:border-gold/60 shadow-xs"
                : "bg-sand/20 border-dashed border-sand/70 opacity-60"
            }`}
          >
            <div>
              <div className="flex items-start justify-between pb-3 mb-3 border-b border-sand">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-gold block">
                    {item.discountType === "percentage" ? "Percentage Discount" : "Fixed Deduction"}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#1F241F] mt-0.5">
                    {item.title}
                  </h3>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                    item.isActive
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-rose-100 text-rose-800 border border-rose-300"
                  }`}
                >
                  {item.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>

              {/* Code Box */}
              <div className="p-3 rounded-2xl bg-sand/30 border border-sand flex items-center justify-between mb-4">
                <span className="font-mono text-base font-black text-olive tracking-wider">
                  {item.code}
                </span>
                <button
                  type="button"
                  onClick={() => copyCode(item.code)}
                  className="p-1.5 rounded-lg hover:bg-gold/20 text-charcoal/60 hover:text-gold transition-colors"
                  title="Copy code"
                >
                  {copiedCode === item.code ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

              <p className="text-xs text-charcoal/70 mb-4">{item.description}</p>

              <div className="space-y-1.5 text-xs text-charcoal/60 font-mono">
                <div className="flex justify-between">
                  <span>Discount Value:</span>
                  <strong className="text-olive">
                    {item.discountType === "percentage"
                      ? `${item.discountValue}%`
                      : `$${item.discountValue.toFixed(2)}`}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Minimum Spend:</span>
                  <span>{item.minSpendUsd === 0 ? "No Minimum" : `$${item.minSpendUsd}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expiry Window:</span>
                  <span>{item.expiryDate}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 mt-4 border-t border-sand flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleToggleActive(item.code)}
                className={`text-xs font-bold underline ${
                  item.isActive ? "text-amber-800 hover:text-amber-900" : "text-emerald-700 hover:text-emerald-800"
                }`}
              >
                {item.isActive ? "Deactivate" : "Activate"}
              </button>

              <button
                type="button"
                onClick={() => handleDelete(item.code)}
                className="p-2 rounded-lg hover:bg-rose-50 text-rose-600 hover:text-rose-700 transition-colors"
                title="Delete coupon"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-gold shadow-2xl text-charcoal z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-sand">
                <h3 className="font-serif text-2xl font-bold text-[#1F241F]">
                  Create Promotional Coupon
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full hover:bg-sand/40 text-charcoal"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-4 mt-5 text-xs">
                <div>
                  <label className="font-bold text-charcoal/80 block mb-1">Coupon Code</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="e.g. SUMMER25"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand font-mono uppercase font-bold text-sm focus:border-gold outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-charcoal/80 block mb-1">Display Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. 25% Summer Degustation Offer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand focus:border-gold outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-charcoal/80 block mb-1">Type</label>
                    <select
                      value={newDiscountType}
                      onChange={(e) => setNewDiscountType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand focus:border-gold outline-none bg-white font-medium"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Cash Amount ($)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-charcoal/80 block mb-1">Discount Value</label>
                    <input
                      type="number"
                      min={1}
                      value={newDiscountValue}
                      onChange={(e) => setNewDiscountValue(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand focus:border-gold outline-none font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-charcoal/80 block mb-1">Min Spend ($ USD)</label>
                    <input
                      type="number"
                      min={0}
                      value={newMinSpend}
                      onChange={(e) => setNewMinSpend(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand focus:border-gold outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-charcoal/80 block mb-1">Expiry Description</label>
                    <input
                      type="text"
                      value={newExpiry}
                      onChange={(e) => setNewExpiry(e.target.value)}
                      placeholder="e.g. Dec 31, 2027"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand focus:border-gold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-charcoal/80 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Brief description of terms or qualifying courses..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand focus:border-gold outline-none resize-none"
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-full bg-gold hover:bg-gold-light text-[#1F241F] font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                  >
                    Publish Coupon
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3 rounded-full border border-sand text-charcoal hover:bg-sand/30 font-medium"
                  >
                    Cancel
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
