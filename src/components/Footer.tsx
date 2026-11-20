"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Sparkles,
  ShoppingBag,
  Navigation,
  Bike,
  Flame,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  QrCode,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Send,
} from "lucide-react";
import { toast } from "@/lib/notify";

export default function Footer() {
  const pathname = usePathname();
  const [newsletterEmail, setNewsletterEmail] = useState("");

  // Do not render consumer footer on dedicated admin management portal or kitchen KDS screen
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/chef")) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast("Please enter a valid email address", "error");
      return;
    }
    toast("Thank you for joining our VIP Gastronomy Circle. Check your inbox for your welcome privilege.", "success");
    setNewsletterEmail("");
  };

  const handleReplaySplash = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("nimza_splash_seen");
      window.location.reload();
    }
  };

  return (
    <footer className="w-full bg-[#FAF9F5] text-[#1F241F] select-none border-t border-sand/80 font-sans">
      {/* ========================================================================= */}
      {/* 1. 30-MINUTE FAST GOURMET DELIVERY & LIVE RADAR BANNER (HERO THEME MATCH) */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#0F2012] via-[#162A19] to-[#0D1C10] text-[#FAFAF8] py-10 sm:py-14 px-6 md:px-12 lg:px-16 border-b border-gold/40 shadow-xl">
        {/* Ambient Warm Luxury Radial Glow */}
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#C8322B]/12 blur-[140px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full bg-[#B99A5B]/15 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          {/* Banner Left Copy & CTA */}
          <div className="lg:col-span-7 space-y-4 text-left">
            {/* Top Subtitle Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C8322B]/20 border border-[#C8322B]/50 text-[#FF8A80] text-[11px] font-bold tracking-[0.25em] uppercase shadow-xs">
              <Flame size={13} className="text-[#FF5252] animate-pulse" />
              <span>Crispy, Every Bite Taste • Wood-Fire Hearth</span>
            </div>

            {/* Main Headline matching Hero Slider typography */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight uppercase">
              <span className="text-[#FAFAF8] block">30-45 Minutes Fast</span>
              <span className="text-[#B99A5B] block sm:inline drop-shadow-[0_2px_12px_rgba(185,154,91,0.35)]">
                Delivery Challenge
              </span>
            </h2>

            {/* Value Proposition */}
            <p className="text-xs sm:text-sm text-sand/85 max-w-xl font-light leading-relaxed">
              Experience Michelin-calibre cuisine hot at your doorstep. Every insulated order is tracked in realtime via our satellite courier radar with cold-chain and thermal precision.
            </p>

            {/* Action Buttons & Live Radar Trigger */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              {/* Button 1: Live Radar Tracking (Styled with Hero Red Accent #C8322B) */}
              <Link
                href="/orders"
                className="py-3 px-6 rounded-full bg-[#C8322B] hover:bg-[#A82822] text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-[#C8322B]/30 hover:shadow-xl hover:scale-105 flex items-center gap-2 group"
              >
                <Navigation size={14} className="group-hover:rotate-45 transition-transform" />
                <span>Track Live Delivery</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
              </Link>

              {/* Button 2: Order Gourmet Menu */}
              <Link
                href="/menu"
                className="py-3 px-6 rounded-full bg-white/10 hover:bg-white/20 text-[#FAFAF8] border border-white/25 hover:border-gold/60 font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 backdrop-blur-xs"
              >
                <ShoppingBag size={14} className="text-gold" />
                <span>Order Online Now</span>
              </Link>

              {/* Driver Access Shortcut */}
              <Link
                href="/driver"
                className="inline-flex items-center gap-1.5 text-[11px] font-mono text-sand/70 hover:text-gold transition-colors py-1.5 px-3 rounded-lg border border-white/15 hover:border-gold/50"
              >
                <Bike size={13} className="text-gold" />
                <span>Courier Portal →</span>
              </Link>
            </div>
          </div>

          {/* Banner Right 3D Delivery Scooter Illustration */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
            <div className="relative w-72 sm:w-80 md:w-96 max-w-full aspect-[4/3] flex items-center justify-center">
              {/* Backing Circular Glow */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-gold/30 via-[#C8322B]/20 to-transparent blur-2xl pointer-events-none" />

              {/* 3D Delivery Courier Graphic */}
              <img
                src="/images/luxury-delivery-courier.png"
                alt="Nimza Fast Delivery Courier on Scooter"
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] transition-transform duration-700 hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes("delivery-courier-scooter-clean.png")) {
                    target.src = "/images/delivery-courier-scooter-clean.png";
                  }
                }}
              />

              {/* Floating Speed & Status Tag */}
              <div className="absolute -bottom-2 sm:bottom-2 left-4 sm:left-6 px-3.5 py-1.5 rounded-2xl bg-[#141A14]/90 border border-gold/50 shadow-xl backdrop-blur-md flex items-center gap-2 z-20">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-mono font-bold tracking-wider text-gold uppercase">
                  Live Dispatch Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. FULL-WIDTH JUSTIFIED 5-COLUMN RESTAURANT NAVIGATION GRID              */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto pt-16 pb-12 px-6 md:px-10 lg:px-12">
        {/* Fixed 12-Column Grid with standard Tailwind spans (4 + 2 + 2 + 2 + 2 = 12 cols, 100% full width) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-sand/70 w-full items-start justify-between">
          
          {/* ------------------------------------------------------------- */}
          {/* COLUMN 1: Brand Logo, Bio, Contact Prompt & Socials (4 cols)   */}
          {/* ------------------------------------------------------------- */}
          <div className="lg:col-span-4 space-y-4 pr-0 lg:pr-4">
            {/* Transparent Brand Logo */}
            <Link
              href="/"
              className="inline-block group focus:outline-none transition-transform duration-300 hover:scale-105"
            >
              <img
                src="/logo.png"
                alt="Nimza Restaurant"
                className="h-16 w-auto object-contain bg-transparent"
              />
            </Link>

            {/* Justified / Balanced Bio Paragraph */}
            <p className="text-xs sm:text-[13px] text-charcoal/75 leading-relaxed font-sans max-w-sm text-justify text-pretty">
              We believe exceptional gastronomy and unhurried hospitality have the power to create lasting memories. Hand-crafted wood fire cuisine, black truffles, and living cellar vintages.
            </p>

            {/* Partnership / Inquiry Prompt */}
            <div className="pt-1">
              <span className="text-[11px] font-bold text-charcoal/80 block uppercase tracking-wider">
                Interested in private events or catering?
              </span>
              <a
                href="mailto:concierge@nimza.example"
                className="text-xs font-serif font-bold text-[#9E2A2B] hover:text-[#C8322B] transition-colors inline-block mt-0.5"
              >
                concierge@nimza.example
              </a>
            </div>

            {/* Social Media Circular Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white border border-sand hover:bg-[#9E2A2B] hover:text-white text-charcoal/80 flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-110"
              >
                <Facebook size={15} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="w-9 h-9 rounded-full bg-white border border-sand hover:bg-[#9E2A2B] hover:text-white text-charcoal/80 flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-110"
              >
                <Twitter size={15} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white border border-sand hover:bg-[#9E2A2B] hover:text-white text-charcoal/80 flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-110"
              >
                <Instagram size={15} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full bg-white border border-sand hover:bg-[#9E2A2B] hover:text-white text-charcoal/80 flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-110"
              >
                <Youtube size={15} />
              </a>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* COLUMN 2: Quick Links (2 cols)                                */}
          {/* ------------------------------------------------------------- */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-serif font-bold text-lg md:text-xl text-[#9E2A2B] tracking-tight border-b border-sand/60 pb-2 whitespace-nowrap">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-charcoal/75">
              <li>
                <Link href="/menu" className="hover:text-[#9E2A2B] transition-colors block py-0.5">
                  Signature Menu
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#9E2A2B] transition-colors block py-0.5">
                  About Heritage
                </Link>
              </li>
              <li>
                <Link href="/reservations" className="hover:text-[#9E2A2B] transition-colors block py-0.5">
                  Table Reservations
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[#9E2A2B] transition-colors block py-0.5">
                  Dining Gallery
                </Link>
              </li>
              <li>
                <Link href="/chef" className="hover:text-[#9E2A2B] transition-colors block py-0.5">
                  Chef Pass &amp; Kitchen
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-[#9E2A2B] transition-colors block py-0.5">
                  Special Tasting Offers
                </Link>
              </li>
              <li>
                <Link href="/qr-menu" className="hover:text-[#9E2A2B] transition-colors block py-0.5">
                  Table QR Menu
                </Link>
              </li>
            </ul>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* COLUMN 3: My Account & Live Tracking (2 cols)                 */}
          {/* ------------------------------------------------------------- */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-serif font-bold text-lg md:text-xl text-[#9E2A2B] tracking-tight border-b border-sand/60 pb-2 whitespace-nowrap">
              My Account
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-charcoal/75">
              <li>
                <Link href="/login" className="hover:text-[#9E2A2B] transition-colors block py-0.5">
                  VIP Profile
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-[#9E2A2B] transition-colors block py-0.5">
                  Order History
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-[#9E2A2B] transition-colors block py-0.5">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="hover:text-[#9E2A2B] font-bold text-[#C8322B] transition-colors inline-flex items-center gap-1.5 py-0.5"
                >
                  <Navigation size={12} className="animate-spin text-[#C8322B]" style={{ animationDuration: "4s" }} />
                  <span>Order Tracking</span>
                  <span className="text-[9px] bg-[#C8322B]/10 text-[#C8322B] px-1.5 py-0.2 rounded-full font-mono uppercase font-bold border border-[#C8322B]/25">
                    Live
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#9E2A2B] transition-colors block py-0.5">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="hover:text-[#9E2A2B] transition-colors block py-0.5">
                  Loyalty Points
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-[#9E2A2B] transition-colors block py-0.5">
                  Customer Concierge
                </Link>
              </li>
            </ul>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* COLUMN 4: Address & Operating Hours (2 cols)                  */}
          {/* ------------------------------------------------------------- */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-serif font-bold text-lg md:text-xl text-[#9E2A2B] tracking-tight border-b border-sand/60 pb-2 whitespace-nowrap">
              Address &amp; Hours
            </h4>

            {/* Address */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal/80 block">
                Address:
              </span>
              <p className="text-xs sm:text-[13px] text-charcoal/70 leading-relaxed font-sans">
                14 Andrássy Avenue, Historic District, Budapest
              </p>
            </div>

            {/* Operating Hours */}
            <div className="space-y-1 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal/80 block">
                Hours:
              </span>
              <p className="text-xs sm:text-[13px] text-charcoal/70 leading-relaxed font-sans">
                12:00pm – 11:30pm
                <br />
                <span className="text-[#9E2A2B] font-semibold">Tuesday To Sunday</span>
                <br />
                <span className="text-charcoal/50 text-[11px]">(Monday Hearth Rest)</span>
              </p>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* COLUMN 5: Digital App & 24/7 Concierge Support (2 cols)       */}
          {/* ------------------------------------------------------------- */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-serif font-bold text-lg md:text-xl text-[#9E2A2B] tracking-tight border-b border-sand/60 pb-2 whitespace-nowrap">
              Install App
            </h4>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-charcoal/60 block">
              From App Store or Google Play
            </span>

            {/* App Store & Google Play Badges */}
            <div className="space-y-2 pt-1">
              <a
                href="#app-store"
                onClick={(e) => {
                  e.preventDefault();
                  toast("Nimza iOS Sommelier App available in App Store", "info");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#1F241F] text-white hover:bg-black transition-transform hover:scale-[1.02] shadow-xs group"
              >
                <div className="w-5 h-5 flex items-center justify-center text-white shrink-0">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.93.04-2.03.63-2.67 1.38-.56.65-.99 1.71-.87 2.73 1.05.08 2.06-.52 2.62-1.24z" />
                  </svg>
                </div>
                <div className="text-left leading-tight truncate">
                  <span className="text-[9px] uppercase tracking-wider text-sand/70 block">Download on</span>
                  <span className="text-xs font-bold text-ivory block font-sans">App Store</span>
                </div>
              </a>

              <a
                href="#google-play"
                onClick={(e) => {
                  e.preventDefault();
                  toast("Nimza Android Sommelier App available in Google Play", "info");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#1F241F] text-white hover:bg-black transition-transform hover:scale-[1.02] shadow-xs group"
              >
                <div className="w-5 h-5 flex items-center justify-center text-white shrink-0">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a2.09 2.09 0 0 1-.22-.387V2.2c.068-.135.142-.266.219-.386zm11.238 11.241l2.488 2.488-12.01 6.842 9.522-9.33zm0-2.11L5.325 1.616l12.01 6.843-2.488 2.488zm1.06 1.055l3.87-2.206a1.5 1.5 0 0 1 0 2.612l-3.87 2.206V12z" />
                  </svg>
                </div>
                <div className="text-left leading-tight truncate">
                  <span className="text-[9px] uppercase tracking-wider text-sand/70 block">GET IT ON</span>
                  <span className="text-xs font-bold text-ivory block font-sans">Google Play</span>
                </div>
              </a>
            </div>

            {/* 24/7 Support Center Phone Banner */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#9E2A2B] block">
                24/7 Support Center
              </span>
              <a
                href="tel:+17189044450"
                className="whitespace-nowrap text-sm sm:text-base font-serif font-black text-[#1F241F] hover:text-[#9E2A2B] transition-colors inline-flex items-center gap-2 mt-1"
              >
                <Phone size={15} className="text-[#9E2A2B] shrink-0" />
                <span>+1 718-904-4450</span>
              </a>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. BOTTOM COPYRIGHT & PAYMENT METHODS BAR                                */}
        {/* ========================================================================= */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-charcoal/65">
          {/* Copyright notice with highlighted year */}
          <div className="flex items-center gap-1.5 text-center md:text-left">
            <span>© Copyright</span>
            <span className="font-bold text-[#9E2A2B]">2026</span>
            <span className="font-semibold text-[#1F241F]">Nimza Restaurant &amp; Lounge.</span>
            <span>All Rights Reserved.</span>
          </div>

          {/* Quick legal links & replay splash */}
          <div className="flex items-center gap-3.5 text-[11px] text-charcoal/60">
            <Link href="/privacy" className="hover:text-[#9E2A2B] transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#9E2A2B] transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <button
              onClick={handleReplaySplash}
              className="hover:text-[#9E2A2B] transition-colors inline-flex items-center gap-1 font-semibold text-charcoal/70"
            >
              <Sparkles size={11} className="text-gold" />
              <span>Replay Splash</span>
            </button>
          </div>

          {/* Payment Gateways (Visa, MC, Amex, Apple Pay, PayPal) */}
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded bg-white border border-sand/80 text-[10px] font-mono font-bold text-charcoal/80 shadow-2xs">
              VISA
            </span>
            <span className="px-2 py-0.5 rounded bg-white border border-sand/80 text-[10px] font-mono font-bold text-charcoal/80 shadow-2xs">
              MC
            </span>
            <span className="px-2 py-0.5 rounded bg-white border border-sand/80 text-[10px] font-mono font-bold text-charcoal/80 shadow-2xs">
              AMEX
            </span>
            <span className="px-2 py-0.5 rounded bg-white border border-sand/80 text-[10px] font-mono font-bold text-charcoal/80 shadow-2xs">
              APPLE PAY
            </span>
            <span className="px-2 py-0.5 rounded bg-white border border-sand/80 text-[10px] font-mono font-bold text-charcoal/80 shadow-2xs">
              PAYPAL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
