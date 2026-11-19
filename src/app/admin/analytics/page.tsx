"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Calendar,
  Clock,
  Printer,
  Download,
  Filter,
  BarChart3,
  PieChart,
  ArrowUpRight,
  Flame,
  Award,
  Truck,
  Utensils,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import NimzaLogo from "@/components/NimzaLogo";

// Realistic baseline analytics data
interface DailyTrend {
  day: string;
  revenue: number;
  orders: number;
}

const TREND_DATA_7D: DailyTrend[] = [
  { day: "Mon", revenue: 2150, orders: 38 },
  { day: "Tue", revenue: 2480, orders: 42 },
  { day: "Wed", revenue: 2890, orders: 49 },
  { day: "Thu", revenue: 3420, orders: 58 },
  { day: "Fri", revenue: 4890, orders: 76 },
  { day: "Sat", revenue: 5640, orders: 89 },
  { day: "Sun", revenue: 4980, orders: 74 },
];

const TREND_DATA_30D: DailyTrend[] = [
  { day: "Week 1", revenue: 19450, orders: 320 },
  { day: "Week 2", revenue: 22100, orders: 365 },
  { day: "Week 3", revenue: 24800, orders: 410 },
  { day: "Week 4", revenue: 26450, orders: 426 },
];

const CATEGORY_SALES = [
  { category: "Prime Meats & Steaks", revenue: 9840, share: 36, color: "#D4AF37" },
  { category: "Artisanal Handmade Pasta", revenue: 7280, share: 27, color: "#8C6D2D" },
  { category: "Mediterranean Seafood", revenue: 4320, share: 16, color: "#1F241F" },
  { category: "Sommelier Wine & Cellar", revenue: 3250, share: 12, color: "#B8860B" },
  { category: "Tasting Desserts & Digestifs", revenue: 2460, share: 9, color: "#E5C158" },
];

const HOURLY_DISTRIBUTION = [
  { hour: "12 PM", percent: 45, label: "Lunch Rush" },
  { hour: "1 PM", percent: 75, label: "Peak Lunch" },
  { hour: "2 PM", percent: 50, label: "Afternoon" },
  { hour: "3 PM", percent: 20, label: "Quiet" },
  { hour: "4 PM", percent: 15, label: "Prep" },
  { hour: "5 PM", percent: 35, label: "Aperitivo" },
  { hour: "6 PM", percent: 65, label: "Early Dinner" },
  { hour: "7 PM", percent: 92, label: "Dinner Rush" },
  { hour: "8 PM", percent: 100, label: "Max Capacity" },
  { hour: "9 PM", percent: 85, label: "Late Dining" },
  { hour: "10 PM", percent: 40, label: "Dessert & Wine" },
];

const TOP_DISHES = [
  { name: "Prime Ribeye 45-Day Dry-Aged", category: "Meats", unitsSold: 142, revenue: 6532, growth: "+18%" },
  { name: "Truffle Tagliatelle al Burro", category: "Pasta", unitsSold: 218, revenue: 3924, growth: "+24%" },
  { name: "Pan-Seared Herb Salmon", category: "Seafood", unitsSold: 124, revenue: 2728, growth: "+12%" },
  { name: "Wood-Fired Margherita D.O.P.", category: "Pizza", unitsSold: 165, revenue: 2475, growth: "+8%" },
  { name: "Artisanal Truffle Tiramisu", category: "Dessert", unitsSold: 198, revenue: 1782, growth: "+31%" },
  { name: "Garden Harvest Truffle Bowl", category: "Salad", unitsSold: 89, revenue: 979, growth: "+5%" },
];

export default function SalesAnalyticsPage() {
  const [timeframe, setTimeframe] = useState<"7d" | "30d">("7d");

  const trendData = timeframe === "7d" ? TREND_DATA_7D : TREND_DATA_30D;
  const totalRevenue = useMemo(
    () => trendData.reduce((acc, curr) => acc + curr.revenue, 0),
    [trendData]
  );
  const totalOrders = useMemo(
    () => trendData.reduce((acc, curr) => acc + curr.orders, 0),
    [trendData]
  );
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00";
  const maxBarRevenue = Math.max(...trendData.map((d) => d.revenue));

  return (
    <div className="space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sand">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-charcoal shadow-2xs mb-2">
            <BarChart3 size={12} className="text-gold" />
            <span>Executive Gastronomy Intelligence</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F241F]">
            Sales Analytics &amp; Revenue Reports
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/60 mt-1">
            Real-time revenue metrics, dish profit performance, dining volume patterns, and sales breakdown.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Timeframe Filter */}
          <div className="inline-flex p-1 rounded-full bg-sand/30 border border-sand text-xs font-bold">
            <button
              onClick={() => setTimeframe("7d")}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                timeframe === "7d" ? "bg-white text-charcoal shadow-xs" : "text-charcoal/60"
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeframe("30d")}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                timeframe === "30d" ? "bg-white text-charcoal shadow-xs" : "text-charcoal/60"
              }`}
            >
              Last 30 Days
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="btn-o !py-2 !px-4 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-2xs"
          >
            <Printer size={13} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 4 TOP LEVEL FINANCIAL KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-6 rounded-3xl bg-white border border-sand shadow-xs">
          <div className="flex items-center justify-between text-xs text-charcoal/60 mb-2">
            <span className="font-bold uppercase tracking-wider">Gross Revenue</span>
            <DollarSign size={16} className="text-gold" />
          </div>
          <p className="font-serif text-3xl sm:text-4xl font-bold text-olive">
            ${totalRevenue.toLocaleString()}
          </p>
          <div className="flex items-center justify-between text-xs mt-2 text-charcoal/50">
            <span>₨ {(totalRevenue * 280).toLocaleString()} PKR</span>
            <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp size={11} /> +18.4%
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-3xl bg-white border border-sand shadow-xs">
          <div className="flex items-center justify-between text-xs text-charcoal/60 mb-2">
            <span className="font-bold uppercase tracking-wider">Orders Fulfilled</span>
            <ShoppingBag size={16} className="text-gold" />
          </div>
          <p className="font-serif text-3xl sm:text-4xl font-bold text-[#1F241F]">
            {totalOrders.toLocaleString()}
          </p>
          <div className="flex items-center justify-between text-xs mt-2 text-charcoal/50">
            <span>Avg {Math.round(totalOrders / trendData.length)} / day</span>
            <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp size={11} /> +12.1%
            </span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="p-6 rounded-3xl bg-white border border-sand shadow-xs">
          <div className="flex items-center justify-between text-xs text-charcoal/60 mb-2">
            <span className="font-bold uppercase tracking-wider">Avg Order Value (AOV)</span>
            <Sparkles size={16} className="text-gold" />
          </div>
          <p className="font-serif text-3xl sm:text-4xl font-bold text-[#1F241F]">
            ${avgOrderValue}
          </p>
          <div className="flex items-center justify-between text-xs mt-2 text-charcoal/50">
            <span>₨ {Math.round(Number(avgOrderValue) * 280)} PKR</span>
            <span className="text-emerald-700 font-bold">+5.3% vs avg</span>
          </div>
        </div>

        {/* Dining vs Delivery Split */}
        <div className="p-6 rounded-3xl bg-white border border-sand shadow-xs">
          <div className="flex items-center justify-between text-xs text-charcoal/60 mb-2">
            <span className="font-bold uppercase tracking-wider">Fulfillment Mix</span>
            <Truck size={16} className="text-gold" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-olive">68%</span>
            <span className="text-xs text-charcoal/60">Dine-In</span>
            <span className="font-serif text-2xl font-bold text-gold ml-2">32%</span>
            <span className="text-xs text-charcoal/60">Delivery</span>
          </div>
          <div className="w-full h-2 rounded-full bg-sand/40 overflow-hidden mt-3 flex">
            <div className="bg-olive h-full" style={{ width: "68%" }} />
            <div className="bg-gold h-full" style={{ width: "32%" }} />
          </div>
        </div>
      </div>

      {/* SECTION 2: INTERACTIVE SVG REVENUE TREND CHART */}
      <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white border-2 border-sand shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-sand">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1F241F]">
              Revenue Trajectory ({timeframe === "7d" ? "Past 7 Days" : "Past 30 Days"})
            </h3>
            <p className="text-xs text-charcoal/60 mt-0.5">
              Daily revenue breakdown in USD with volume tracking bars.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-olive bg-sand/30 px-3 py-1 rounded-full border border-sand">
            Peak Day: ${maxBarRevenue.toLocaleString()}
          </span>
        </div>

        {/* Pure React / SVG Bar Chart */}
        <div className="relative pt-6">
          <div className="grid grid-cols-7 gap-3 sm:gap-6 items-end h-56 sm:h-64 border-b border-sand/80 pb-2">
            {trendData.map((item, idx) => {
              const heightPct = Math.round((item.revenue / maxBarRevenue) * 100);

              return (
                <div key={idx} className="flex flex-col items-center justify-end h-full group">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-bold text-charcoal bg-sand/40 px-2 py-0.5 rounded-md mb-2 shadow-2xs">
                    ${item.revenue.toLocaleString()}
                  </span>

                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.08 }}
                    className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-olive via-gold to-gold-light group-hover:brightness-110 shadow-sm relative"
                  />

                  <span className="text-xs font-bold text-charcoal/70 mt-3 font-mono">
                    {item.day}
                  </span>
                  <span className="text-[10px] text-charcoal/40 font-mono">
                    {item.orders} tix
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 3: CATEGORY SPLIT & HOURLY HEATMAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Contribution */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-[2.5rem] bg-white border border-sand shadow-sm space-y-5">
          <div className="pb-3 border-b border-sand">
            <h3 className="font-serif text-xl font-bold text-[#1F241F]">
              Sales by Gastronomy Category
            </h3>
            <p className="text-xs text-charcoal/60 mt-0.5">
              Revenue distribution across core culinary sections.
            </p>
          </div>

          <div className="space-y-4">
            {CATEGORY_SALES.map((cat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-charcoal">
                  <span>{cat.category}</span>
                  <span className="font-mono text-olive font-bold">
                    ${cat.revenue.toLocaleString()} ({cat.share}%)
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-sand/30 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${cat.share}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Dining Rush Heatmap */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-[2.5rem] bg-white border border-sand shadow-sm space-y-5">
          <div className="pb-3 border-b border-sand flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#1F241F]">
                Peak Dining Hours
              </h3>
              <p className="text-xs text-charcoal/60 mt-0.5">
                Hourly traffic density based on completed kitchen tickets.
              </p>
            </div>
            <Clock size={16} className="text-gold" />
          </div>

          <div className="grid grid-cols-11 gap-1.5 items-end h-40 pt-4">
            {HOURLY_DISTRIBUTION.map((slot, i) => (
              <div key={i} className="flex flex-col items-center justify-end h-full group" title={`${slot.hour}: ${slot.label}`}>
                <div
                  className="w-full rounded-t-md transition-all group-hover:scale-105"
                  style={{
                    height: `${slot.percent}%`,
                    backgroundColor: slot.percent > 70 ? "#8C6D2D" : slot.percent > 40 ? "#D4AF37" : "#E5E1D8",
                  }}
                />
                <span className="text-[9px] font-mono text-charcoal/60 mt-1 truncate">
                  {slot.hour.replace(" ", "")}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 text-[11px] text-charcoal/50 border-t border-sand">
            <span>Primary Peak: <strong>8:00 PM (100% Brigade Load)</strong></span>
            <span>Lunch Peak: <strong>1:00 PM (75% Load)</strong></span>
          </div>
        </div>
      </div>

      {/* SECTION 4: TOP 6 GROSSING SIGNATURE DISHES */}
      <div className="rounded-[2.5rem] bg-white border-2 border-sand p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-sand">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1F241F]">
              Top Revenue-Generating Dishes
            </h3>
            <p className="text-xs text-charcoal/60 mt-0.5">
              Ranked by aggregate ticket revenue and sales growth rate.
            </p>
          </div>
          <Award size={20} className="text-gold" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-sand text-charcoal/50 uppercase font-mono tracking-wider">
                <th className="py-3 px-3">Rank &amp; Dish</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Units Sold</th>
                <th className="py-3 px-3 text-right">Total Revenue</th>
                <th className="py-3 px-3 text-right">Momentum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/40">
              {TOP_DISHES.map((dish, idx) => (
                <tr key={idx} className="hover:bg-sand/15 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-xs text-gold">#{idx + 1}</span>
                      <span className="font-serif font-bold text-sm text-[#1F241F]">{dish.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-sand/30 text-[10px] font-semibold text-charcoal/70">
                      {dish.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-charcoal/80">
                    {dish.unitsSold} plates
                  </td>
                  <td className="py-3.5 px-3 text-right font-serif font-bold text-sm text-olive">
                    ${dish.revenue.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="inline-flex items-center gap-0.5 font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {dish.growth}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
