"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Tag,
  Clock,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  CalendarCheck,
  Check,
  Copy,
  Flame,
  Award,
  Utensils,
  Percent,
} from "lucide-react";
import { useCart } from "@/components/Cart";
import { toast } from "@/lib/notify";
import NimzaLogo from "@/components/NimzaLogo";

interface SpecialOffer {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  originalPrice: number;
  offerPrice: number;
  savingsPercent: number;
  validUntil: string;
  code: string;
  image_url: string;
  courses: string[];
  dishesToCart: Array<{
    id: number;
    name: string;
    price: number;
    image_url: string;
  }>;
}

const SPECIAL_OFFERS: SpecialOffer[] = [
  {
    id: "offer-1",
    badge: "Chef's Signature • 25% Savings",
    title: "5-Course Grand Gastronomy Degustation",
    subtitle: "The ultimate culinary showcase by Chef Elias",
    description:
      "Includes Wood-Fired Bruschetta al Tartufo, Handcrafted Truffle Tagliatelle, Prime Dry-Aged Ribeye, Garden Harvest salad, and Artisanal Tiramisu.",
    originalPrice: 115.0,
    offerPrice: 86.25,
    savingsPercent: 25,
    validUntil: "Ends Sunday 11:00 PM",
    code: "TASTE20",
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=700&q=80",
    courses: [
      "Amuse-Bouche: Truffle Brioche Crostini",
      "Primo: Truffle Tagliatelle al Burro",
      "Secondo: Prime Ribeye 45-Day Dry-Aged",
      "Contorno: Garden Harvest Herb Salad",
      "Dolce: Artisanal Truffle Tiramisu",
    ],
    dishesToCart: [
      { id: 1, name: "Truffle Tagliatelle", price: 18.0, image_url: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=600&q=80" },
      { id: 4, name: "Prime Ribeye 45-Day", price: 46.0, image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80" },
      { id: 8, name: "Tiramisu al Mascarpone", price: 9.0, image_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80" },
    ],
  },
  {
    id: "offer-2",
    badge: "Romantic Sunset • $25 OFF",
    title: "Candlelight Seafood & Salmon Duet",
    subtitle: "Designed for intimate couples tasting",
    description:
      "Pan-Seared Herb Salmon accompanied by Mediterranean roasted vegetables, chilled citrus appetitivo, and dark chocolate molten torta.",
    originalPrice: 78.0,
    offerPrice: 58.5,
    savingsPercent: 25,
    validUntil: "Daily from 6:00 PM - 9:00 PM",
    code: "VIP25OFF",
    image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=700&q=80",
    courses: [
      "Antipasto: Wild Salmon Carpaccio",
      "Plat Principal: Pan-Seared Herb Salmon",
      "Accompaniment: Charred Asparagus & Fennel",
      "Dessert: Torta al Cioccolato Fondente",
    ],
    dishesToCart: [
      { id: 3, name: "Pan-Seared Salmon", price: 22.0, image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80" },
      { id: 6, name: "Garden Harvest Bowl", price: 11.0, image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80" },
      { id: 8, name: "Tiramisu al Mascarpone", price: 9.0, image_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80" },
    ],
  },
  {
    id: "offer-3",
    badge: "Midweek Executive • $15 OFF",
    title: "Executive Degustation Business Lunch",
    subtitle: "Speed, prestige, and Michelin-inspired flavor",
    description:
      "Enjoy a prompt 45-minute dining course selection ideal for client lunches. Includes handcrafted pasta course, seasonal protein, and espresso.",
    originalPrice: 48.0,
    offerPrice: 38.4,
    savingsPercent: 20,
    validUntil: "Monday to Thursday (12 PM - 3 PM)",
    code: "CHEFSPECIAL",
    image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&q=80",
    courses: [
      "Primo: Quick-Tossed Truffle Tagliatelle",
      "Contorno: Heritage Greens & Olive Emulsion",
      "Beverage: Single-Origin Italian Espresso",
    ],
    dishesToCart: [
      { id: 1, name: "Truffle Tagliatelle", price: 18.0, image_url: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=600&q=80" },
      { id: 6, name: "Garden Harvest Bowl", price: 11.0, image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80" },
    ],
  },
];

export default function SpecialOffersPage() {
  const { add } = useCart();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast(`Voucher code "${code}" copied! Apply it in your cart.`, "info");
      setTimeout(() => setCopiedCode(null), 3000);
    } catch {}
  };

  const handleAddBundleToCart = (offer: SpecialOffer) => {
    offer.dishesToCart.forEach((d) => {
      add(d, undefined, 1);
    });
    toast(`Added "${offer.title}" courses to your cart! Apply code "${offer.code}" at checkout.`, "success");
  };

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-charcoal pt-36 pb-28 px-5 md:px-12 selection:bg-gold/20 overflow-x-hidden">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 mb-10 border-b border-sand">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#1F241F] shadow-sm mb-3">
              <Tag size={13} className="text-gold" />
              <span>Limited Degustation Experiences</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-[#1F241F] tracking-tight">
              Special Offers
            </h1>
            <p className="text-sm md:text-base text-charcoal/70 mt-2 max-w-2xl font-light leading-relaxed">
              Chef Elias curates seasonal tasting bundles, couples flights, and midday executive menus at privileged rates.
            </p>
          </div>

          <NimzaLogo variant="badge" size="sm" />
        </div>

        {/* OFFERS SHOWCASE */}
        <div className="space-y-12">
          {SPECIAL_OFFERS.map((offer, idx) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-[2.5rem] bg-white border-2 border-sand p-6 sm:p-8 md:p-10 shadow-sm hover:border-gold/50 transition-all overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Food Photography with Badge Overlay */}
                <div className="lg:col-span-5 relative h-72 sm:h-80 rounded-3xl overflow-hidden bg-sand/20 shadow-md group">
                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#1F241F]/80 backdrop-blur-xs text-gold border border-gold/40 text-[11px] font-bold uppercase tracking-wider">
                    {offer.badge}
                  </div>
                  <div className="absolute bottom-4 right-4 px-3 py-1 rounded-xl bg-gold text-charcoal text-xs font-black shadow-md">
                    Save {offer.savingsPercent}%
                  </div>
                </div>

                {/* Right: Details, Courses & CTAs */}
                <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal/50 font-bold block">
                      {offer.subtitle}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F241F] mt-1">
                      {offer.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-charcoal/70 mt-2 leading-relaxed font-light">
                      {offer.description}
                    </p>
                  </div>

                  {/* Course Breakdown */}
                  <div className="p-4 rounded-2xl bg-sand/20 border border-sand/60 space-y-1.5 text-xs">
                    <span className="font-serif font-bold text-olive block mb-2">
                      Tasting Course Selection:
                    </span>
                    {offer.courses.map((course, cIdx) => (
                      <div key={cIdx} className="flex items-center gap-2 text-charcoal/80">
                        <Flame size={12} className="text-gold shrink-0" />
                        <span className="font-medium">{course}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price Bar & Promo Code */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="flex items-baseline gap-2.5">
                      <span className="font-serif text-3xl font-bold text-olive">
                        ${offer.offerPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-charcoal/40 line-through">
                        ${offer.originalPrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-charcoal/50 font-mono">
                        (₨ {Math.round(offer.offerPrice * 280).toLocaleString()} PKR)
                      </span>
                    </div>

                    {/* Voucher Claim Box */}
                    <button
                      type="button"
                      onClick={() => handleCopy(offer.code)}
                      className="px-3.5 py-1.5 rounded-full bg-sand/30 hover:bg-gold/20 border border-sand hover:border-gold text-xs font-mono font-bold text-olive transition-colors flex items-center gap-1.5"
                      title="Copy promo code"
                    >
                      <span>Voucher: {offer.code}</span>
                      {copiedCode === offer.code ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-2 border-t border-sand">
                    <button
                      type="button"
                      onClick={() => handleAddBundleToCart(offer)}
                      className="flex-1 min-w-[200px] py-3 rounded-full bg-gold hover:bg-gold-light text-[#1F241F] font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={14} />
                      <span>Order Tasting Bundle</span>
                    </button>

                    <Link
                      href="/reservations"
                      className="btn-o !py-3 !px-5 text-xs uppercase tracking-wider font-bold rounded-full flex items-center justify-center gap-1.5"
                    >
                      <CalendarCheck size={14} />
                      <span>Book Tasting Table</span>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
