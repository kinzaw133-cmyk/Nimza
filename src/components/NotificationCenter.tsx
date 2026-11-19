"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Clock,
  Sparkles,
  Truck,
  ChefHat,
  CalendarCheck,
  Crown,
  X,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export type NotificationCategory = "order" | "delivery" | "kitchen" | "loyalty" | "reservation";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  timestamp: string;
  read: boolean;
  link?: string;
}

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    title: "Order #8492 On The Way",
    message: "Courier Marco Rossi is en route with your culinary dishes (ETA ~8 mins).",
    category: "delivery",
    timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
    read: false,
    link: "/orders",
  },
  {
    id: "notif-2",
    title: "VIP Loyalty Tier Unlocked",
    message: "Congratulations! You have reached Silver Connoisseur status with 1.25x point multiplier.",
    category: "loyalty",
    timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
    read: false,
    link: "/rewards",
  },
  {
    id: "notif-3",
    title: "Kitchen Preparation Started",
    message: "Chef Elias & brigade are fire-searing your Prime Ribeye cut on the wood grill pass.",
    category: "kitchen",
    timestamp: new Date(Date.now() - 75 * 60000).toISOString(),
    read: true,
    link: "/orders",
  },
  {
    id: "notif-4",
    title: "Table Reservation Confirmed",
    message: "Table #3 (Chef's Counter) is reserved for tonight at 8:00 PM for 2 guests.",
    category: "reservation",
    timestamp: new Date(Date.now() - 140 * 60000).toISOString(),
    read: true,
    link: "/reservations",
  },
];

export function getStoredNotifications(): AppNotification[] {
  if (typeof window === "undefined") return INITIAL_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem("nimza_notifications");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_NOTIFICATIONS;
}

export function saveStoredNotifications(notifs: AppNotification[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("nimza_notifications", JSON.stringify(notifs));
    window.dispatchEvent(new Event("nimza_notifications_updated"));
  } catch {}
}

export function dispatchAppNotification(
  title: string,
  message: string,
  category: NotificationCategory = "order",
  link?: string
) {
  const current = getStoredNotifications();
  const newNotif: AppNotification = {
    id: `notif-${Date.now()}`,
    title,
    message,
    category,
    timestamp: new Date().toISOString(),
    read: false,
    link,
  };
  saveStoredNotifications([newNotif, ...current]);
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(getStoredNotifications());
    const handleUpdate = () => setNotifications(getStoredNotifications());
    window.addEventListener("nimza_notifications_updated", handleUpdate);
    return () => window.removeEventListener("nimza_notifications_updated", handleUpdate);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const clearAll = () => {
    setNotifications([]);
    saveStoredNotifications([]);
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case "delivery":
        return <Truck size={14} className="text-blue-500" />;
      case "kitchen":
        return <ChefHat size={14} className="text-orange-500" />;
      case "loyalty":
        return <Crown size={14} className="text-amber-500" />;
      case "reservation":
        return <CalendarCheck size={14} className="text-emerald-500" />;
      default:
        return <Sparkles size={14} className="text-gold" />;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Bell Icon Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full hover:bg-sand/30 text-charcoal transition-colors border border-sand/60 bg-white/70 shadow-2xs"
        aria-label="Open notifications"
        title="Gastronomy Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-gold text-[#1F241F] text-[9px] font-black items-center justify-center border border-white">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl border border-sand shadow-2xl z-50 text-charcoal overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-sand flex items-center justify-between bg-[#FAFAF8]">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm text-[#1F241F]">
                  Notification Hub
                </span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold-dark text-[10px] font-bold font-mono">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="p-1 rounded-md text-[11px] text-charcoal/60 hover:text-charcoal hover:bg-sand/40 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck size={14} />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="p-1 rounded-md text-[11px] text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                    title="Clear all"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-sand/40">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-charcoal/50">
                  <Bell size={24} className="mx-auto mb-2 text-sand" />
                  <p className="text-xs font-semibold">No notifications right now</p>
                  <span className="text-[10px]">Updates on your orders and reservations will appear here.</span>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => markAsRead(item.id)}
                    className={`p-3.5 transition-colors flex items-start gap-3 text-xs hover:bg-sand/20 cursor-pointer ${
                      !item.read ? "bg-sand/10 font-medium" : "opacity-75"
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 rounded-xl bg-sand/30 shrink-0">
                      {getCategoryIcon(item.category)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="font-bold text-[#1F241F] text-xs truncate">
                          {item.title}
                        </h5>
                        <span className="text-[10px] text-charcoal/40 font-mono shrink-0">
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-charcoal/70 leading-relaxed mt-0.5">
                        {item.message}
                      </p>

                      {item.link && (
                        <Link
                          href={item.link}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-gold hover:underline mt-1.5"
                        >
                          <span>View Details</span>
                          <ChevronRight size={10} />
                        </Link>
                      )}
                    </div>

                    {!item.read && (
                      <span className="h-2 w-2 rounded-full bg-gold shrink-0 mt-1.5" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-sand bg-[#FAFAF8] text-center text-[10px] text-charcoal/50">
              <span>Real-time restaurant kitchen &amp; delivery updates</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
