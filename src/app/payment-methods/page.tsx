"use client";

import React from "react";
import Link from "next/link";
import {
  CreditCard,
  Banknote,
  ShieldCheck,
  Sparkles,
  Check,
  ArrowRight,
  Clock,
} from "lucide-react";
import NimzaLogo from "@/components/NimzaLogo";

const METHODS = [
  {
    icon: CreditCard,
    title: "Credit & Debit Cards",
    subtitle: "Visa, Mastercard & Contactless",
    desc: "Available at table terminal or through online checkout with instant dummy simulation without charging real funds.",
    badge: "Dummy Payment Active",
  },
  {
    icon: Banknote,
    title: "Cash at Table",
    subtitle: "Local Currency & USD",
    desc: "Discreet table-side settlement presented in a handcrafted Italian leather folio with complimentary mints.",
    badge: "Table Settlement",
  },
];

export default function PaymentMethods() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] text-charcoal pt-36 pb-28 px-6 md:px-12 overflow-hidden">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1F241F] shadow-sm mb-4">
            <Sparkles size={14} className="text-gold" />
            <span>Dining Hospitality</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-[#1F241F] tracking-tight">
            Payment Options
          </h1>
          <p className="mt-3 text-charcoal/70 text-base font-light leading-relaxed">
            Minimal, clean, and transparent payment settlement designed for refined dining.
          </p>
        </div>

        {/* Simplified Clean Cards */}
        <div className="grid gap-6 sm:grid-cols-2 mb-12">
          {METHODS.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.title}
                className="p-8 rounded-[2rem] bg-white border border-sand shadow-sm hover:border-gold/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-sand/30 border border-sand text-[#1F241F] flex items-center justify-center">
                      <Icon size={22} />
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      {m.badge}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-[#1F241F]">{m.title}</h3>
                  <p className="text-xs font-semibold text-gold mt-1">{m.subtitle}</p>
                  <p className="text-charcoal/70 text-sm mt-3 leading-relaxed font-light">
                    {m.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Minimal Bottom Assurance & Call to Action */}
        <div className="rounded-3xl bg-white border border-sand p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sand/30 text-gold flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1F241F]">Zero Surcharges & Clear Receipts</p>
              <p className="text-xs text-charcoal/60">All prices include local taxes. Gratuity is entirely optional.</p>
            </div>
          </div>

          <Link
            href="/cart"
            className="btn !py-2.5 !px-5 text-xs font-bold uppercase tracking-wider shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  );
}
