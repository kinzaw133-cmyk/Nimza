"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  Instagram,
  Facebook,
  Youtube,
  Sparkles,
} from "lucide-react";
import { toast } from "@/lib/notify";

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");

  // Do not render public consumer footer on dedicated admin panel & kitchen display (KDS) pages
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/chef")) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast("Please enter a valid email address", "error");
      return;
    }
    toast("Thank you for subscribing! Check your inbox for exclusive tasting offers.", "success");
    setEmail("");
  };

  const handleReplaySplash = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("nimza_splash_seen");
      window.location.reload();
    }
  };

  return (
    <footer className="relative bg-[#FAF9F5] text-charcoal border-t border-sand/70 pt-16 pb-10 px-6 md:px-12 lg:px-16 overflow-hidden select-none">
      {/* Decorative veggie & culinary accents */}
      {/* Bottom-left: Tomatoes with basil */}
      <img
        src="/images/footer-tomato.png"
        alt=""
        aria-hidden="true"
        className="absolute -left-4 sm:-left-2 bottom-0 w-24 sm:w-36 opacity-80 pointer-events-none select-none z-0"
        draggable={false}
      />
      {/* Top-left: Floating basil leaf */}
      <img
        src="/images/footer-leaf-tl.png"
        alt=""
        aria-hidden="true"
        className="absolute left-10 sm:left-20 top-4 sm:top-8 w-10 sm:w-16 opacity-60 pointer-events-none select-none z-0 -rotate-12 hidden sm:block"
        draggable={false}
      />
      {/* Right side: Green herb leaves */}
      <img
        src="/images/footer-leaf-r.png"
        alt=""
        aria-hidden="true"
        className="absolute -right-3 sm:-right-1 top-16 sm:top-20 w-16 sm:w-24 opacity-70 pointer-events-none select-none z-0 hidden sm:block"
        draggable={false}
      />
      {/* Top-right: Plate accent */}
      <img
        src="/images/footer-plate-top.png"
        alt=""
        aria-hidden="true"
        className="absolute right-8 sm:right-16 -top-6 sm:-top-8 w-32 sm:w-48 opacity-50 pointer-events-none select-none z-0 hidden sm:block"
        draggable={false}
      />

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Main 4-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14">
          {/* Column 1: Brand & Logo Pill (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-start pr-0 lg:pr-6">
            {/* White Rounded Square Logo Card */}
            <Link href="/" className="inline-block group mb-4">
              <div className="w-24 h-24 rounded-2xl bg-white border border-sand/80 shadow-xs flex items-center justify-center p-2 transition-transform duration-300 group-hover:scale-105 group-hover:border-gold/50">
                <img
                  src="/logo-footer.jpg"
                  alt="Nimza Restaurant"
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed max-w-xs mb-5 font-sans">
              Fine dining, patience, and unhurried hospitality.
            </p>

            {/* Social Media Circular Buttons */}
            <div className="flex items-center gap-2.5">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-[#EFECE4] hover:bg-gold hover:text-white text-charcoal/80 flex items-center justify-center transition-all duration-200 shadow-2xs"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-[#EFECE4] hover:bg-gold hover:text-white text-charcoal/80 flex items-center justify-center transition-all duration-200 shadow-2xs"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full bg-[#EFECE4] hover:bg-gold hover:text-white text-charcoal/80 flex items-center justify-center transition-all duration-200 shadow-2xs"
              >
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links (2.5 cols) */}
          <div className="lg:col-span-2.5 lg:border-r border-sand/60 pr-0 lg:pr-6">
            <h4 className="font-serif font-bold text-lg md:text-xl text-[#9E2A2B] mb-5 tracking-tight">
              Quick Links
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-charcoal/75">
              <li>
                <Link href="/menu" className="hover:text-[#9E2A2B] transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#9E2A2B] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[#9E2A2B] transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/reservations" className="hover:text-[#9E2A2B] transition-colors">
                  Reservations
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact (2.5 cols) */}
          <div className="lg:col-span-3 lg:border-r border-sand/60 pr-0 lg:pr-6">
            <h4 className="font-serif font-bold text-lg md:text-xl text-[#9E2A2B] mb-5 tracking-tight">
              Contact
            </h4>
            <ul className="space-y-3.5 text-xs sm:text-sm text-charcoal/75">
              <li className="flex items-center gap-2.5">
                <MapPin size={16} className="text-charcoal/60 shrink-0" />
                <span>12 Garden Road, Luxury District</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-charcoal/60 shrink-0" />
                <a href="tel:+923000000000" className="hover:text-[#9E2A2B] transition-colors">
                  +92 300 0000000
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-charcoal/60 shrink-0" />
                <a href="mailto:concierge@nimza.example" className="hover:text-[#9E2A2B] transition-colors">
                  concierge@nimza.example
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter (3 cols) */}
          <div className="lg:col-span-2.5">
            <h4 className="font-serif font-bold text-lg md:text-xl text-[#9E2A2B] mb-2 tracking-tight">
              Newsletter
            </h4>
            <p className="text-xs sm:text-sm text-charcoal/70 mb-4 font-sans">
              Get exclusive updates &amp; offers.
            </p>

            <form onSubmit={handleSubscribe} className="relative">
              <div className="relative flex items-center rounded-full bg-white border border-sand/90 shadow-xs p-1 pl-4 focus-within:border-gold transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="bg-transparent text-xs text-charcoal placeholder:text-charcoal/40 outline-none w-full pr-2"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="w-8 h-8 rounded-full bg-[#B99A5B] hover:bg-[#A38547] text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-2xs"
                >
                  <Send size={13} className="translate-x-[1px]" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Legal & Attribution Bar */}
        <div className="pt-6 border-t border-sand/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] sm:text-xs text-charcoal/60">
          <p>© 2026 Nimza Restaurant &amp; Lounge. All rights reserved.</p>

          <div className="flex items-center gap-3">
            <Link href="/privacy" className="hover:text-charcoal transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-charcoal transition-colors">
              Terms &amp; Conditions
            </Link>
            <span>•</span>
            <button
              onClick={handleReplaySplash}
              className="hover:text-gold transition-colors flex items-center gap-1 font-semibold"
            >
              <Sparkles size={11} className="text-gold" />
              <span>Replay Splash</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
