"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Crown,
  Sparkles,
  Gift,
  ArrowRight,
  CheckCircle2,
  Clock,
  ChevronRight,
  Copy,
  Check,
  TrendingUp,
  ShieldCheck,
  Coins,
  Receipt,
  Utensils,
  History,
  Info,
} from "lucide-react";
import {
  LoyaltyProfile,
  RedeemablePerk,
  LOYALTY_TIERS,
  REDEEMABLE_PERKS,
  getStoredLoyaltyProfile,
  redeemLoyaltyPerk,
} from "@/lib/loyalty/loyaltyTypes";
import { useAuth } from "@/lib/useAuth";
import { toast } from "@/lib/notify";
import NimzaLogo from "@/components/NimzaLogo";

export default function LoyaltyRewardsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<LoyaltyProfile>(getStoredLoyaltyProfile());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedPerkForModal, setSelectedPerkForModal] = useState<RedeemablePerk | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setProfile(getStoredLoyaltyProfile());
    };
    window.addEventListener("nimza_loyalty_updated", handleUpdate);
    return () => window.removeEventListener("nimza_loyalty_updated", handleUpdate);
  }, []);

  const currentTierInfo = LOYALTY_TIERS[profile.currentTier] || LOYALTY_TIERS.Bronze;
  const progressPercent = Math.min(
    100,
    Math.round(
      profile.currentTier === "Platinum"
        ? 100
        : (profile.totalPointsEarned /
            (profile.currentTier === "Gold"
              ? LOYALTY_TIERS.Platinum.minPoints
              : profile.currentTier === "Silver"
              ? LOYALTY_TIERS.Gold.minPoints
              : LOYALTY_TIERS.Silver.minPoints)) *
            100
    )
  );

  const handleRedeem = (perk: RedeemablePerk) => {
    if (profile.availablePoints < perk.pointsCost) {
      toast(
        `Insufficient points. You need ${perk.pointsCost - profile.availablePoints} more points to unlock this reward.`,
        "error"
      );
      return;
    }

    const success = redeemLoyaltyPerk(perk);
    if (success) {
      toast(`Successfully redeemed "${perk.title}"! Code: ${perk.code}`, "success");
      setSelectedPerkForModal(perk);
    }
  };

  const copyToClipboard = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedCode(text);
      toast(`Voucher code "${text}" copied! Apply it in your cart.`, "info");
      setTimeout(() => setCopiedCode(null), 3000);
    } catch {}
  };

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-charcoal pt-36 pb-28 px-5 md:px-12 selection:bg-gold/20 overflow-x-hidden">
      <div className="mx-auto max-w-6xl">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 mb-8 border-b border-sand">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#1F241F] shadow-sm mb-3">
              <Crown size={13} className="text-gold" />
              <span>Gastronomy Privileges &amp; VIP Club</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-[#1F241F] tracking-tight">
              Loyalty Rewards
            </h1>
            <p className="text-sm md:text-base text-charcoal/70 mt-2 max-w-2xl font-light leading-relaxed">
              Earn culinary dining points with every course. Unlock distinguished tier privileges, complimentary sommelier selections, and cash dining vouchers.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/menu"
              className="btn !bg-gold hover:!bg-gold-light !text-charcoal !py-2.5 !px-5 text-xs font-bold uppercase tracking-wider rounded-full shadow-xs flex items-center gap-1.5"
            >
              <Utensils size={14} />
              <span>Dine &amp; Earn</span>
            </Link>
            <NimzaLogo variant="badge" size="sm" />
          </div>
        </div>

        {/* HERO STATUS CARD: Active Tier & Points Balance */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          {/* Main VIP Pass Card */}
          <div className="lg:col-span-8 rounded-[2.5rem] bg-gradient-to-br from-[#1F241F] via-[#2A302A] to-[#141714] text-sand p-8 sm:p-10 border border-gold/40 shadow-xl relative overflow-hidden">
            {/* Background luxury watermark */}
            <div className="absolute right-[-30px] bottom-[-30px] opacity-10 pointer-events-none">
              <Crown size={220} className="text-gold" />
            </div>

            <div className="relative z-10 flex flex-col justify-between h-full gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-gold font-bold">
                      VIP Gastronomy Ledger
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">
                    {user?.user_metadata?.full_name || "Distinguished Patron"}
                  </h2>
                  <p className="text-xs text-sand/60 font-mono mt-0.5">
                    Member ID: NZ-{(user?.id || "78491").slice(0, 8).toUpperCase()}
                  </p>
                </div>

                {/* Tier Badge */}
                <div
                  className={`px-4 py-2 rounded-2xl border ${currentTierInfo.badgeBorder} ${currentTierInfo.badgeBg} flex items-center gap-2.5 shadow-md`}
                >
                  <Award size={20} className="text-[#8C6D2D]" />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider font-bold block text-charcoal/60">
                      Active Status
                    </span>
                    <span className="font-serif font-bold text-base text-[#1F241F]">
                      {currentTierInfo.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar towards Next Tier */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sand/80 font-medium">
                    {profile.currentTier === "Platinum"
                      ? "Highest Distinction Achieved"
                      : `Progress to ${
                          profile.currentTier === "Gold"
                            ? "Platinum Ambassador"
                            : profile.currentTier === "Silver"
                            ? "Gold Epicure"
                            : "Silver Connoisseur"
                        }`}
                  </span>
                  <span className="font-mono text-gold font-bold">
                    {profile.currentTier === "Platinum"
                      ? "100% Complete"
                      : `${profile.nextTierPointsNeeded} points needed`}
                  </span>
                </div>

                <div className="relative h-2.5 w-full rounded-full bg-black/40 overflow-hidden border border-white/10">
                  <motion.div
                    className="absolute top-0 bottom-0 left-0 rounded-full bg-gradient-to-r from-amber-400 via-gold to-amber-200"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-sand/50 font-mono">
                  <span>Current: {profile.totalPointsEarned} pts</span>
                  <span>Earning Rate: {currentTierInfo.multiplier}x multiplier</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Balance Metrics */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4">
            {/* Available Points */}
            <div className="p-6 rounded-[2rem] bg-white border-2 border-sand shadow-sm flex flex-col justify-between flex-1">
              <div className="flex items-center justify-between text-charcoal/60 text-xs">
                <span className="font-bold uppercase tracking-wider">Available VIP Points</span>
                <Coins size={18} className="text-gold" />
              </div>
              <div className="my-2">
                <span className="font-serif text-4xl sm:text-5xl font-bold text-olive">
                  {profile.availablePoints}
                </span>
                <span className="text-xs text-charcoal/60 ml-2 font-medium">
                  pts (~${(profile.availablePoints * 0.1).toFixed(1)} USD)
                </span>
              </div>
              <p className="text-[11px] text-charcoal/50">
                Redeemable instantly for dining credits or gourmet dishes.
              </p>
            </div>

            {/* Lifetime Earned & Redeemed */}
            <div className="p-6 rounded-[2rem] bg-white border-2 border-sand shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 block">
                  Lifetime Earned
                </span>
                <span className="font-serif text-xl font-bold text-charcoal">
                  {profile.totalPointsEarned} pts
                </span>
              </div>
              <div className="h-8 w-[1px] bg-sand" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 block">
                  Total Redeemed
                </span>
                <span className="font-serif text-xl font-bold text-charcoal">
                  {profile.redeemedPoints} pts
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: THE 4 VIP TIERS & BENEFITS */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#1F241F]">
                Membership Tiers &amp; Privileges
              </h3>
              <p className="text-xs text-charcoal/60 mt-0.5">
                Every dining ticket accumulates points based on your active status tier.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(LOYALTY_TIERS) as Array<keyof typeof LOYALTY_TIERS>).map((key) => {
              const tier = LOYALTY_TIERS[key];
              const isCurrent = profile.currentTier === key;

              return (
                <div
                  key={key}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                    isCurrent
                      ? "bg-white border-gold shadow-md ring-2 ring-gold/30 scale-[1.02]"
                      : "bg-white/80 border-sand text-charcoal/70"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-sand">
                      <span className="font-serif font-bold text-lg text-[#1F241F] flex items-center gap-1.5">
                        <Award size={16} style={{ color: tier.color }} />
                        {tier.label}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-gold text-charcoal">
                          Current
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <span className="text-[11px] font-mono text-charcoal/60 block">Threshold</span>
                      <p className="font-bold text-xs text-olive">
                        {tier.minPoints === 0 ? "Entry upon signup" : `${tier.minPoints}+ Points`}
                      </p>
                      <span className="text-[11px] font-mono text-gold-dark font-bold">
                        {tier.multiplier}x point earnings
                      </span>
                    </div>

                    <ul className="space-y-2 text-xs">
                      {tier.perks.map((perk, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 size={13} className="text-gold shrink-0 mt-0.5" />
                          <span className="text-charcoal/80 leading-snug">{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: REDEEMABLE PERKS & DINING VOUCHERS */}
        <div className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#1F241F]">
                Redeem Culinary Rewards
              </h3>
              <p className="text-xs text-charcoal/60 mt-0.5">
                Exchange your available VIP points for dining certificates, signature desserts, and master experiences.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-olive bg-sand/30 px-3 py-1 rounded-full border border-sand">
              Available: {profile.availablePoints} pts
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REDEEMABLE_PERKS.map((perk) => {
              const canAfford = profile.availablePoints >= perk.pointsCost;

              return (
                <div
                  key={perk.id}
                  className="rounded-3xl bg-white border-2 border-sand p-5 shadow-xs hover:border-gold/50 transition-all flex flex-col justify-between group overflow-hidden"
                >
                  <div>
                    <div className="relative h-44 rounded-2xl overflow-hidden mb-4 bg-sand/20">
                      <img
                        src={perk.image_url}
                        alt={perk.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#1F241F]/80 text-gold border border-gold/40 backdrop-blur-xs">
                        {perk.category}
                      </span>
                      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-gold text-[#1F241F] font-bold text-xs shadow-md">
                        {perk.pointsCost} Points
                      </div>
                    </div>

                    <h4 className="font-serif text-lg font-bold text-[#1F241F]">{perk.title}</h4>
                    <p className="text-xs text-charcoal/65 mt-1.5 leading-relaxed font-light">
                      {perk.description}
                    </p>
                  </div>

                  <div className="pt-5 mt-4 border-t border-sand flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-emerald-800 font-bold">
                      Worth ${perk.cashEquivalentUsd.toFixed(2)} USD
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRedeem(perk)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        canAfford
                          ? "bg-gold hover:bg-gold-light text-[#1F241F] shadow-xs active:scale-95"
                          : "bg-sand/40 text-charcoal/40 cursor-not-allowed"
                      }`}
                    >
                      <Gift size={13} />
                      <span>{canAfford ? "Redeem" : "Locked"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: POINTS TRANSACTION HISTORY */}
        <div className="rounded-[2.5rem] bg-white border-2 border-sand p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-sand">
            <h3 className="font-serif text-xl font-bold text-[#1F241F] flex items-center gap-2">
              <History size={18} className="text-gold" />
              <span>Points Activity Ledger</span>
            </h3>
            <span className="text-xs text-charcoal/50 font-mono">
              {profile.transactions.length} recorded events
            </span>
          </div>

          <div className="space-y-3">
            {profile.transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-2xl bg-sand/15 border border-sand/50 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-8 w-8 rounded-full place-items-center text-xs font-bold shrink-0 ${
                      tx.type === "earned"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {tx.type === "earned" ? "+" : "-"}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1F241F]">{tx.description}</p>
                    <span className="text-[10px] text-charcoal/50">
                      {new Date(tx.date).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <span
                  className={`font-mono font-bold text-sm ${
                    tx.type === "earned" ? "text-emerald-700" : "text-amber-800"
                  }`}
                >
                  {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: PROMO VOUCHER REVEAL UPON REDEMPTION */}
      <AnimatePresence>
        {selectedPerkForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPerkForModal(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-gold shadow-2xl text-charcoal z-10 text-center"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-gold/20 text-[#8C6D2D] grid place-items-center mb-4">
                <Gift size={28} />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-widest text-gold block">
                Reward Unlocked
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1F241F] mt-1">
                {selectedPerkForModal.title}
              </h3>
              <p className="text-xs text-charcoal/65 mt-2">
                Use this voucher code at checkout to claim your culinary perk:
              </p>

              {/* Code Box */}
              <div className="my-5 p-4 rounded-2xl bg-sand/30 border border-sand flex items-center justify-between">
                <span className="font-mono text-lg font-black text-olive tracking-widest">
                  {selectedPerkForModal.code}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(selectedPerkForModal.code)}
                  className="px-3 py-1.5 rounded-full bg-gold hover:bg-gold-light text-[#1F241F] text-xs font-bold transition-all flex items-center gap-1"
                >
                  {copiedCode === selectedPerkForModal.code ? (
                    <>
                      <Check size={12} /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Copy
                    </>
                  )}
                </button>
              </div>

              <div className="flex gap-2">
                <Link
                  href="/cart"
                  onClick={() => setSelectedPerkForModal(null)}
                  className="flex-1 py-2.5 rounded-full bg-gold hover:bg-gold-light text-[#1F241F] text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Apply in Cart
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedPerkForModal(null)}
                  className="px-5 py-2.5 rounded-full border border-sand hover:bg-sand/30 text-xs font-semibold text-charcoal transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
