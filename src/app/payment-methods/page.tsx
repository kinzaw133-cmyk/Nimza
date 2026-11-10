"use client";

import React from "react";
import Link from "next/link";
import {
  CreditCard,
  Banknote,
  Smartphone,
  Landmark,
  ShieldCheck,
  Sparkles,
  Receipt,
  FileCheck2,
  Lock,
} from "lucide-react";
import NimzaLogo from "@/components/NimzaLogo";

const METHODS = [
  {
    icon: CreditCard,
    title: "Major Credit & Debit Cards",
    subtitle: "Visa, Mastercard, American Express, UnionPay",
    desc: "Accepted at all tables with wireless contactless EMV terminals. Dual-currency settlement available.",
    features: ["Contactless & Chip", "Apple & Google Pay supported", "Instant digital itemized receipts"],
  },
  {
    icon: Banknote,
    title: "Discreet Table Settlement",
    subtitle: "Cash & Concierge Presentation",
    desc: "Your bill is presented in a handcrafted Italian leather folio. Change is returned promptly with our signature mints.",
    features: ["Local currency (PKR) & USD accepted", "Discreet table-side host service", "Zero surcharge"],
  },
  {
    icon: Smartphone,
    title: "Mobile Wallets & Instant Pay",
    subtitle: "JazzCash, Easypaisa, Raast Instant Pay",
    desc: "QR code available upon request at your dining table for immediate, seamless mobile transfers.",
    features: ["Instant QR scan at table", "Direct Raast ID integration", "Zero delay confirmation"],
  },
  {
    icon: Landmark,
    title: "Corporate & Event Invoicing",
    subtitle: "Bank Wire & Private Banquet Accounts",
    desc: "Direct wire transfers for wedding receptions, corporate galas, and private dining buyouts.",
    features: ["Tax compliant official NTN invoice", "30-day corporate net terms on approval", "Dedicated accounts coordinator"],
  },
];

export default function PaymentMethods() {
  return (
    <main className="min-h-screen bg-ivory text-charcoal pt-36 pb-28 px-6 md:px-12 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-sand/40 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-olive mb-3">
            <Sparkles size={13} className="text-gold" /> Transparent Hospitality
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-olive tracking-tight">
            Payment Methods
          </h1>
          <p className="mt-4 text-charcoal/80 text-base md:text-lg font-light leading-relaxed">
            We provide graceful, frictionless payment options suited for our esteemed guests and international travelers.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 mb-20">
          {METHODS.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.title}
                className="group p-8 md:p-10 rounded-[2.5rem] bg-white border border-sand shadow-sm hover:border-gold/60 transition-all hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/30 text-gold flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon size={28} />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-olive">{m.title}</h3>
                  <p className="text-xs font-bold uppercase tracking-wider text-gold-dark mt-1">
                    {m.subtitle}
                  </p>
                  <p className="text-charcoal/80 text-sm mt-3 leading-relaxed font-light">
                    {m.desc}
                  </p>

                  <ul className="mt-6 space-y-2.5 pt-6 border-t border-sand">
                    {m.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-xs text-charcoal/70">
                        <FileCheck2 size={14} className="text-emerald-700 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Gratuity Banner */}
        <div className="rounded-[3rem] bg-olive-deep text-ivory p-10 md:p-14 border border-gold/40 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-4">
              <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-widest font-bold">
                <Lock size={15} />
                <span>Security & Fair Gratuity Assurance</span>
              </div>
              <h3 className="font-serif text-3xl font-bold text-ivory">
                Transparent Billing & Zero Hidden Surcharges
              </h3>
              <p className="text-sand/80 text-sm leading-relaxed font-light">
                All listed prices include local sales tax. Gratuity for our kitchen and floor staff is entirely at your discretion. Detailed tax-compliant invoices are provided immediately upon request.
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-olive-muted/60 border border-gold/20">
              <NimzaLogo variant="circle" size="md" />
              <p className="font-serif text-lg font-bold text-ivory mt-3">Nimza Concierge</p>
              <p className="text-xs text-sand/70 mt-0.5">Assistance with corporate billing</p>
              <Link href="/contact" className="btn-gold-outline !py-2 !px-4 !text-xs mt-4">
                Contact Concierge
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
