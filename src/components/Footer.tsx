"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Mail,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
} from "lucide-react";
import { toast } from "@/lib/notify";
import NimzaLogo from "./NimzaLogo";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast("Please enter a valid email address", "error");
      return;
    }
    toast("Welcome to the Nimza Connoisseurs Club. Check your inbox soon.", "success");
    setEmail("");
  };

  const handleReplaySplash = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("nimza_splash_seen");
      window.location.reload();
    }
  };

  return (
    <footer className="relative bg-olive-deep text-ivory border-t-2 border-gold/40 pt-20 pb-12 px-6 md:px-12 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-gold/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 rounded-full bg-olive/30 blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Top Brand Banner */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-16 border-b border-gold/20 items-center">
          <div className="md:col-span-4 flex flex-col items-start">
            <Link href="/" className="inline-block group mb-4">
              <NimzaLogo variant="pebble" size="lg" />
            </Link>
            <p className="text-sand/80 text-sm max-w-sm leading-relaxed">
              Fine dining, patience, and unhurried hospitality. Cooked with seasonal produce over open flame.
            </p>
          </div>

          <div className="md:col-span-8 flex flex-wrap items-center justify-start md:justify-end gap-6 text-sand/80 text-xs uppercase tracking-widest">
            <div className="flex items-center gap-2 rounded-full border border-gold/30 bg-olive-muted/60 px-4 py-2">
              <Award size={16} className="text-gold" />
              <span>Michelin Standard Selection 2024</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-gold/30 bg-olive-muted/60 px-4 py-2">
              <ShieldCheck size={16} className="text-gold" />
              <span>100% Organic Farm-to-Table</span>
            </div>
            <button
              onClick={handleReplaySplash}
              className="flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-gold font-bold hover:bg-gold hover:text-charcoal transition-all"
            >
              <Sparkles size={14} />
              <span>Replay Logo Splash</span>
            </button>
          </div>
        </div>

        {/* Middle Navigation Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-16">
          {/* Col 1: Gastronomy & Menu */}
          <div>
            <h4 className="font-serif text-xl font-bold text-gold mb-5 flex items-center gap-2">
              <span>Gastronomy</span>
            </h4>
            <ul className="space-y-3 text-sm text-sand/80">
              <li>
                <Link href="/menu" className="hover:text-gold transition-colors">
                  Signature Menu & Tasting
                </Link>
              </li>
              <li>
                <Link href="/reservations" className="hover:text-gold transition-colors">
                  Table Reservations
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-gold transition-colors">
                  Atmosphere & Gallery
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-gold transition-colors">
                  Private Delivery & Cart
                </Link>
              </li>
              <li>
                <Link href="/payment-methods" className="hover:text-gold transition-colors">
                  Payment Methods & Invoicing
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Heritage & About */}
          <div>
            <h4 className="font-serif text-xl font-bold text-gold mb-5">
              Heritage
            </h4>
            <ul className="space-y-3 text-sm text-sand/80">
              <li>
                <Link href="/about" className="hover:text-gold transition-colors">
                  Our Culinary Philosophy
                </Link>
              </li>
              <li>
                <Link href="/about#chef" className="hover:text-gold transition-colors">
                  Chef Elias Varga
                </Link>
              </li>
              <li>
                <Link href="/about#pillars" className="hover:text-gold transition-colors">
                  The Four Pillars of Craft
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold transition-colors">
                  Private Events & Wine Cellar
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-gold transition-colors">
                  VIP Club Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours & Address */}
          <div>
            <h4 className="font-serif text-xl font-bold text-gold mb-5">
              Service Hours
            </h4>
            <div className="space-y-3 text-sm text-sand/80">
              <p className="flex items-start gap-2.5">
                <Clock size={16} className="text-gold shrink-0 mt-0.5" />
                <span>
                  <strong>Lunch Sitting:</strong> 12:00 – 16:00<br />
                  <strong>Dinner Sitting:</strong> 18:30 – 23:30
                </span>
              </p>
              <p className="flex items-start gap-2.5">
                <MapPin size={16} className="text-gold shrink-0 mt-0.5" />
                <span>12 Garden Road, Luxury District</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone size={16} className="text-gold shrink-0" />
                <span>+92 300 0000000 / Concierge</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail size={16} className="text-gold shrink-0" />
                <span>concierge@nimza.example</span>
              </p>
            </div>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 className="font-serif text-xl font-bold text-gold mb-5">
              Privilege Newsletter
            </h4>
            <p className="text-xs text-sand/80 mb-4 leading-relaxed">
              Receive seasonal menu previews, sommelier recommendations, and invitations to private tasting dinners.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="inp-dark !text-xs !py-3 w-full"
                required
              />
              <button
                type="submit"
                className="btn w-full !py-2.5 !text-xs !font-bold flex items-center justify-center gap-2"
              >
                <span>Subscribe to Privilege</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Socials */}
        <div className="pt-8 border-t border-gold/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-sand/60">
          <p>© {new Date().getFullYear()} Nimza Restaurant & Lounge. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="grid h-8 w-8 place-items-center rounded-full border border-gold/30 text-sand hover:bg-gold hover:text-charcoal transition-all"
            >
              <Instagram size={14} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="grid h-8 w-8 place-items-center rounded-full border border-gold/30 text-sand hover:bg-gold hover:text-charcoal transition-all"
            >
              <Facebook size={14} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
              className="grid h-8 w-8 place-items-center rounded-full border border-gold/30 text-sand hover:bg-gold hover:text-charcoal transition-all"
            >
              <Twitter size={14} />
            </a>
          </div>

          <p className="font-serif tracking-widest text-[11px] text-gold/80 uppercase">
            Pure Elegance • Budapest & Milan Tradition
          </p>
        </div>
      </div>
    </footer>
  );
}
