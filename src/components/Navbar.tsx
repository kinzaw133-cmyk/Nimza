"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Menu,
  X,
  User,
  LogOut,
  Sparkles,
  PhoneCall,
  Clock,
  CreditCard,
  ShieldCheck,
  ChevronDown,
  CalendarCheck,
  Flame,
  ChefHat,
  Users,
  Star,
  Home,
  UtensilsCrossed,
  Utensils,
  Camera,
  Heart,
  Crown,
  MapPin,
  Tag,
  HelpCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { useCart } from "./Cart";
import { useWishlist } from "./Wishlist";
import { toast } from "@/lib/notify";
import NimzaLogo from "./NimzaLogo";
import NotificationCenter from "./NotificationCenter";

// ONLY the 5 primary links as requested, now with elegant Lucide icons
const NAV_LINKS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Menu", href: "/menu", icon: UtensilsCrossed },
  { label: "About", href: "/about", icon: Sparkles },
  { label: "Gallery", href: "/gallery", icon: Camera },
  { label: "Reservations", href: "/reservations", icon: CalendarCheck },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, role, isAdmin, isChef } = useAuth();
  const { count } = useCart();
  const { count: favoritesCount } = useWishlist();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userDropdownOpen]);

  const handleReplaySplash = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("nimza_splash_seen");
      window.location.reload();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast("Logged out securely", "info");
    setUserDropdownOpen(false);
    window.location.href = "/";
  };

  // Do not render public consumer navbar on dedicated admin panel & kitchen display (KDS) pages
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/chef")) {
    return null;
  }

  const isHome = pathname === "/";
  const headerBg = scrolled
    ? "bg-[#FAFAF8]/95 backdrop-blur-md shadow-sm border-b border-sand/70 py-3"
    : "bg-[#FAFAF8]/90 backdrop-blur-md border-b border-sand/40 py-3.5";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${headerBg}`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-10">
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center gap-2 focus:outline-none">
            <div className="relative rounded-xl bg-white p-1 border border-sand/80 shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:border-gold">
              <NimzaLogo variant="header" size="sm" />
            </div>
          </Link>

          {/* Desktop Primary Navigation Links: ONLY [Home, Menu, About, Gallery, Reservations] with Lucide Icons */}
          <ul className="hidden lg:flex items-center gap-7 text-sm font-medium tracking-wide">
            {NAV_LINKS.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <li key={href} className="relative">
                  <Link
                    href={href}
                    prefetch={true}
                    className={`transition-colors duration-300 py-1.5 inline-flex items-center gap-1.5 ${
                      isActive
                        ? "text-gold font-bold"
                        : "text-charcoal/80 hover:text-charcoal font-medium hover:text-gold"
                    }`}
                  >
                    <Icon
                      size={15}
                      className={`transition-transform duration-200 ${
                        isActive ? "text-gold scale-105" : "text-charcoal/50 group-hover:text-gold"
                      }`}
                    />
                    <span>{label}</span>
                  </Link>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gold"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </li>
              );
            })}
          </ul>

          {/* Clean Right Toolbar: Favorites, Notifications, Cart & VIP Admin Access */}
          <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
            {/* Real-time Notifications Bell */}
            <NotificationCenter />

            {/* Wishlist / Favorites Button */}
            <Link
              href="/favorites"
              aria-label={`Favorites with ${favoritesCount} saved dishes`}
              className="relative grid h-10 w-10 place-items-center rounded-full border border-sand bg-white text-charcoal hover:border-rose-400 hover:text-rose-600 shadow-sm transition-all duration-300 group"
              title="Saved Favorites"
            >
              <Heart
                size={18}
                className={
                  favoritesCount > 0
                    ? "fill-rose-500 text-rose-500 transition-transform group-hover:scale-110"
                    : "text-charcoal/70 transition-transform group-hover:scale-110 group-hover:text-rose-500"
                }
              />
              {favoritesCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white shadow"
                >
                  {favoritesCount}
                </motion.span>
              )}
            </Link>

            {/* Shopping Cart Button */}
            <Link
              href="/cart"
              aria-label={`Cart with ${count} items`}
              className="relative grid h-10 w-10 place-items-center rounded-full border border-sand bg-white text-charcoal hover:border-gold hover:text-gold shadow-sm transition-all duration-300"
            >
              <ShoppingBag size={18} />
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-gold text-[10px] font-extrabold text-charcoal shadow"
                >
                  {count}
                </motion.span>
              )}
            </Link>

            {/* Dedicated Admin Panel Access (Replaces Concierge) */}
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold border border-gold/60 bg-gold/15 text-charcoal hover:bg-gold hover:text-charcoal shadow-2xs hover:shadow-sm transition-all duration-300"
              title="Open Separate Admin Panel"
            >
              <ShieldCheck size={15} className="text-gold" />
              <span className="font-sans">Admin Panel</span>
            </Link>

            {/* Account / User Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-label="Account Menu"
                className="grid h-10 w-10 place-items-center rounded-full border border-sand bg-white text-charcoal hover:border-gold hover:text-gold shadow-xs transition-all duration-300"
              >
                <User size={16} className={user ? "text-gold" : "text-charcoal/70"} />
              </button>

              {/* Floating Dropdown Card */}
              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-64 rounded-3xl bg-white border border-sand shadow-2xl p-4 text-charcoal z-50"
                  >
                    <div className="pb-3 mb-2 border-b border-sand/60">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gold">
                        Guest Account
                      </span>
                      <p className="font-serif font-bold text-sm text-olive mt-0.5 truncate">
                        {user ? user.email : "Dining Guest"}
                      </p>
                    </div>

                    <div className="space-y-1 text-xs">
                      <Link
                        href="/favorites"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center justify-between rounded-2xl px-3 py-2 text-charcoal hover:bg-sand/30 hover:text-olive transition-colors font-medium"
                      >
                        <div className="flex items-center gap-2.5">
                          <Heart size={15} className="text-rose-500 fill-rose-500/20" />
                          <span>Saved Favorites</span>
                        </div>
                        {favoritesCount > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                            {favoritesCount}
                          </span>
                        )}
                      </Link>

                      <Link
                        href="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-charcoal hover:bg-sand/30 hover:text-olive transition-colors font-medium"
                      >
                        <Clock size={15} className="text-gold" />
                        <span>Order History & Status</span>
                      </Link>

                      <Link
                        href="/rewards"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-charcoal hover:bg-sand/30 hover:text-olive transition-colors font-medium"
                      >
                        <Crown size={15} className="text-gold" />
                        <span>VIP Loyalty Rewards</span>
                      </Link>

                      <Link
                        href="/offers"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-charcoal hover:bg-sand/30 hover:text-olive transition-colors font-medium"
                      >
                        <Tag size={15} className="text-gold" />
                        <span>Special Tasting Offers</span>
                      </Link>

                      <Link
                        href="/branches"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-charcoal hover:bg-sand/30 hover:text-olive transition-colors font-medium"
                      >
                        <MapPin size={15} className="text-gold" />
                        <span>Our Branches & Locations</span>
                      </Link>

                      <Link
                        href="/support"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-charcoal hover:bg-sand/30 hover:text-olive transition-colors font-medium"
                      >
                        <HelpCircle size={15} className="text-gold" />
                        <span>Customer Support & FAQ</span>
                      </Link>

                      <Link
                        href="/contact"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-charcoal hover:bg-sand/30 hover:text-olive transition-colors font-medium"
                      >
                        <PhoneCall size={15} className="text-gold" />
                        <span>Contact & Inquiries</span>
                      </Link>

                      <Link
                        href="/payment-methods"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-charcoal hover:bg-sand/30 hover:text-olive transition-colors font-medium"
                      >
                        <CreditCard size={15} className="text-gold" />
                        <span>Payment Methods</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleReplaySplash();
                        }}
                        className="w-full flex items-center gap-2.5 rounded-2xl px-3 py-2 text-charcoal hover:bg-sand/30 hover:text-olive transition-colors font-medium text-left"
                      >
                        <Sparkles size={15} className="text-gold" />
                        <span>Replay Brand Splash</span>
                      </button>
                    </div>

                    <div className="pt-3 mt-2 border-t border-sand/60">
                      {user ? (
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center justify-center gap-2 rounded-2xl py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      ) : (
                        <Link
                          href="/login"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-olive text-gold py-2 text-xs font-bold uppercase tracking-wider hover:bg-olive-deep transition-colors shadow-sm"
                        >
                          <User size={14} />
                          <span>VIP Sign In</span>
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Menu"
              className="lg:hidden grid h-10 w-10 place-items-center rounded-full border border-sand bg-white text-charcoal shadow-sm hover:border-gold transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Fullscreen Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed inset-0 z-40 flex flex-col bg-olive-deep text-ivory pt-24 px-6 pb-8 lg:hidden overflow-y-auto"
          >
            {/* Top Seal */}
            <div className="flex justify-center mb-6">
              <NimzaLogo variant="circle" size="md" />
            </div>

            {/* Primary 5 Links */}
            <div className="flex flex-col gap-2 my-auto">
              {NAV_LINKS.map(({ label, href, icon: Icon }, idx) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    href={href}
                    prefetch={true}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3.5 py-3 px-4 rounded-2xl text-xl font-serif tracking-wide transition-all ${
                      pathname === href
                        ? "bg-gold font-bold text-charcoal shadow-md"
                        : "text-ivory hover:bg-olive hover:text-gold"
                    }`}
                  >
                    <Icon size={20} className={pathname === href ? "text-charcoal" : "text-gold"} />
                    <span>{label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Secondary Services in Mobile Drawer */}
            <div className="pt-6 border-t border-gold/20 flex flex-col gap-2.5">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  href="/favorites"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl border border-rose-400/40 bg-rose-950/40 px-3 py-2.5 text-center text-rose-200 font-medium hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-1.5"
                >
                  <Heart size={13} className="text-rose-400 fill-rose-400/30" />
                  <span>Favorites {favoritesCount > 0 ? `(${favoritesCount})` : ""}</span>
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl border border-gold/30 bg-olive-muted/60 px-3 py-2.5 text-center text-sand font-medium hover:bg-gold hover:text-charcoal transition-all flex items-center justify-center gap-1.5"
                >
                  <Clock size={13} className="text-gold" />
                  <span>Order History</span>
                </Link>
                <Link
                  href="/rewards"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl border border-gold/40 bg-gold/15 px-3 py-2.5 text-center text-gold font-bold hover:bg-gold hover:text-charcoal transition-all flex items-center justify-center gap-1.5"
                >
                  <Crown size={13} className="text-gold" />
                  <span>VIP Rewards</span>
                </Link>
                <Link
                  href="/offers"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl border border-gold/30 bg-olive-muted/60 px-3 py-2.5 text-center text-sand font-medium hover:bg-gold hover:text-charcoal transition-all flex items-center justify-center gap-1.5"
                >
                  <Tag size={13} className="text-gold" />
                  <span>Special Offers</span>
                </Link>
                <Link
                  href="/branches"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl border border-gold/30 bg-olive-muted/60 px-3 py-2.5 text-center text-sand font-medium hover:bg-gold hover:text-charcoal transition-all flex items-center justify-center gap-1.5"
                >
                  <MapPin size={13} className="text-gold" />
                  <span>Branches</span>
                </Link>
                <Link
                  href="/support"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl border border-gold/30 bg-olive-muted/60 px-3 py-2.5 text-center text-sand font-medium hover:bg-gold hover:text-charcoal transition-all flex items-center justify-center gap-1.5"
                >
                  <HelpCircle size={13} className="text-gold" />
                  <span>Support & FAQ</span>
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl border border-gold/30 bg-olive-muted/60 px-3 py-2.5 text-center text-sand font-medium hover:bg-gold hover:text-charcoal transition-all flex items-center justify-center gap-1.5"
                >
                  <PhoneCall size={13} className="text-gold" />
                  <span>Contact</span>
                </Link>
                <Link
                  href="/payment-methods"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl border border-gold/30 bg-olive-muted/60 px-3 py-2.5 text-center text-sand font-medium hover:bg-gold hover:text-charcoal transition-all flex items-center justify-center gap-1.5"
                >
                  <CreditCard size={13} className="text-gold" />
                  <span>Payments</span>
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl border border-gold/60 bg-gold/20 px-3 py-2.5 text-center text-gold font-bold hover:bg-gold hover:text-charcoal transition-all flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck size={13} className="text-gold" />
                  <span>Admin Panel</span>
                </Link>
                {isChef && (
                  <Link
                    href="/chef"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl border border-orange-400 bg-orange-950/60 px-3 py-2.5 text-center text-orange-300 font-bold hover:bg-orange-600 hover:text-white transition-all flex items-center justify-center gap-1.5"
                  >
                    <ChefHat size={13} />
                    <span>Chef Pass</span>
                  </Link>
                )}
              </div>

              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleReplaySplash();
                }}
                className="btn-o w-full !text-xs !py-2.5 mt-2"
              >
                <Sparkles size={14} className="text-gold" />
                <span>Replay Brand Splash</span>
              </button>

              <div className="mt-3 flex items-center justify-between text-xs text-sand/60">
                <span className="flex items-center gap-1.5">
                  <PhoneCall size={12} /> +92 300 0000000
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} /> Open Daily 12:00
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
