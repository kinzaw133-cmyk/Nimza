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
  Crown,
  Wine,
} from "lucide-react";

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
  { category: "Prime Meats & Steaks", revenue: 9840, share: 36, color: "#B99A5B", bgClass: "bg-[#B99A5B]" },
  { category: "Artisanal Handmade Pasta", revenue: 7280, share: 27, color: "#8C6D2D", bgClass: "bg-[#8C6D2D]" },
  { category: "Mediterranean Seafood", revenue: 4320, share: 16, color: "#2A5A44", bgClass: "bg-[#2A5A44]" },
  { category: "Sommelier Wine & Cellar", revenue: 3250, share: 12, color: "#9A5830", bgClass: "bg-[#9A5830]" },
  { category: "Tasting Desserts & Digestifs", revenue: 2460, share: 9, color: "#D8B467", bgClass: "bg-[#D8B467]" },
];

const HOURLY_DISTRIBUTION = [
  { hour: "12 PM", percent: 45, label: "Lunch Rush" },
  { hour: "1 PM", percent: 75, label: "Peak Lunch" },
  { hour: "2 PM", percent: 50, label: "Afternoon" },
  { hour: "3 PM", percent: 20, label: "Quiet Hours" },
  { hour: "4 PM", percent: 15, label: "Mise en Place" },
  { hour: "5 PM", percent: 35, label: "Aperitivo Ritual" },
  { hour: "6 PM", percent: 65, label: "Early Dinner" },
  { hour: "7 PM", percent: 92, label: "Dinner Rush" },
  { hour: "8 PM", percent: 100, label: "Peak Brigade Capacity" },
  { hour: "9 PM", percent: 85, label: "Late Night Dining" },
  { hour: "10 PM", percent: 40, label: "Digestifs & Dessert" },
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
    <div className="space-y-8 pb-12">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sand">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-charcoal shadow-2xs mb-2">
            <BarChart3 size={13} className="text-gold" />
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
                timeframe === "7d"
                  ? "bg-[#1F241F] text-gold shadow-xs"
                  : "text-charcoal/70 hover:text-[#1F241F]"
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeframe("30d")}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                timeframe === "30d"
                  ? "bg-[#1F241F] text-gold shadow-xs"
                  : "text-charcoal/70 hover:text-[#1F241F]"
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
        <div className="p-6 rounded-3xl bg-white border border-sand/80 shadow-xs hover:border-gold/50 transition-all">
          <div className="flex items-center justify-between text-xs text-charcoal/60 mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px]">Gross Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-[#8C6D2D]">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="font-serif text-3xl sm:text-4xl font-bold text-[#1F241F]">
            ${totalRevenue.toLocaleString()}
          </p>
          <div className="flex items-center justify-between text-xs mt-2.5 text-charcoal/60 font-mono">
            <span>₨ {(totalRevenue * 280).toLocaleString()} PKR</span>
            <span className="inline-flex items-center gap-0.5 text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
              <TrendingUp size={11} /> +18.4%
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-3xl bg-white border border-sand/80 shadow-xs hover:border-gold/50 transition-all">
          <div className="flex items-center justify-between text-xs text-charcoal/60 mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px]">Orders Fulfilled</span>
            <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-[#8C6D2D]">
              <ShoppingBag size={16} />
            </div>
          </div>
          <p className="font-serif text-3xl sm:text-4xl font-bold text-[#1F241F]">
            {totalOrders.toLocaleString()}
          </p>
          <div className="flex items-center justify-between text-xs mt-2.5 text-charcoal/60 font-mono">
            <span>Avg {Math.round(totalOrders / trendData.length)} / day</span>
            <span className="inline-flex items-center gap-0.5 text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
              <TrendingUp size={11} /> +12.1%
            </span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="p-6 rounded-3xl bg-white border border-sand/80 shadow-xs hover:border-gold/50 transition-all">
          <div className="flex items-center justify-between text-xs text-charcoal/60 mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px]">Avg Order Value (AOV)</span>
            <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-[#8C6D2D]">
              <Sparkles size={16} />
            </div>
          </div>
          <p className="font-serif text-3xl sm:text-4xl font-bold text-[#1F241F]">
            ${avgOrderValue}
          </p>
          <div className="flex items-center justify-between text-xs mt-2.5 text-charcoal/60 font-mono">
            <span>₨ {Math.round(Number(avgOrderValue) * 280)} PKR</span>
            <span className="inline-flex items-center gap-0.5 text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
              +5.3% vs avg
            </span>
          </div>
        </div>

        {/* Dining vs Delivery Split */}
        <div className="p-6 rounded-3xl bg-white border border-sand/80 shadow-xs hover:border-gold/50 transition-all">
          <div className="flex items-center justify-between text-xs text-charcoal/60 mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px]">Fulfillment Mix</span>
            <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-[#8C6D2D]">
              <Truck size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-[#1F241F]">68%</span>
            <span className="text-xs text-charcoal/60">Dine-In</span>
            <span className="font-serif text-2xl font-bold text-[#8C6D2D] ml-2">32%</span>
            <span className="text-xs text-charcoal/60">Delivery</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-sand/40 overflow-hidden mt-3 flex">
            <div className="bg-[#1F241F] h-full" style={{ width: "68%" }} />
            <div className="bg-gold h-full" style={{ width: "32%" }} />
          </div>
        </div>
      </div>

      {/* SECTION 2: LUXURY REVENUE TRAJECTORY BAR CHART (MATCHED WITH HERO PALETTE) */}
      <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white border-2 border-sand shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sand">
          <div>
            <div className="inline-flex items-center gap-1.5 text-gold text-xs font-bold uppercase tracking-widest mb-1">
              <Sparkles size={13} />
              <span>Gastronomy Financial Flow</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1F241F]">
              Revenue Trajectory ({timeframe === "7d" ? "Past 7 Days" : "Past 30 Days"})
            </h3>
            <p className="text-xs text-charcoal/60 mt-0.5">
              Daily revenue breakdown in USD with customer volume tracking bars.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#8C6D2D] bg-gold/15 px-3 py-1.5 rounded-full border border-gold/40">
              Peak Day: ${maxBarRevenue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Clean Luxury Gold Bar Chart */}
        <div className="relative pt-10 px-2 sm:px-6">
          <div className="grid grid-cols-7 gap-3 sm:gap-6 items-end h-64 sm:h-72 border-b border-sand/80 pb-3">
            {trendData.map((item, idx) => {
              const heightPct = Math.round((item.revenue / maxBarRevenue) * 100);
              const isPeak = item.revenue === maxBarRevenue;

              return (
                <div key={idx} className="flex flex-col items-center justify-end h-full group relative">
                  {/* Revenue tag above bar (always clear & never cut off) */}
                  <div className="mb-2 text-center transition-transform group-hover:-translate-y-1">
                    <span
                      className={`inline-block text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border transition-all ${
                        isPeak
                          ? "bg-[#1F241F] text-gold border-[#1F241F] shadow-xs"
                          : "bg-sand/30 text-charcoal/80 border-sand/70 group-hover:bg-gold/20 group-hover:text-[#8C6D2D] group-hover:border-gold/50"
                      }`}
                    >
                      ${item.revenue.toLocaleString()}
                    </span>
                  </div>

                  {/* Luminous Gastronomy Gold Bar matching Hero Section */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.7, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className={`w-full max-w-[52px] rounded-t-2xl transition-all relative shadow-sm ${
                      isPeak
                        ? "bg-gradient-to-t from-[#B99A5B] via-[#C8A86B] to-[#F3DE9A] border-t-2 border-white ring-2 ring-gold/40 shadow-gold/20"
                        : "bg-gradient-to-t from-[#B99A5B]/80 via-[#C8A86B]/90 to-[#E5C578] hover:from-[#B99A5B] hover:to-[#F3DE9A] hover:scale-102"
                    }`}
                  >
                    {/* Subtle Top Gold Highlight */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-white/40 rounded-t-2xl" />
                  </motion.div>

                  {/* Day Label */}
                  <span className="text-xs font-bold text-charcoal mt-3 font-mono">
                    {item.day}
                  </span>
                  {/* Orders Ticket Count */}
                  <span className="text-[10px] text-charcoal/50 font-mono mt-0.5">
                    {item.orders} tix
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bottom Footnote Indicator */}
          <div className="flex items-center justify-between pt-3 text-[11px] text-charcoal/60">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#B99A5B]" />
              <span>Standard Daily Revenue Volume</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#1F241F] border border-gold" />
              <span className="font-bold text-[#1F241F]">Highest Grossing Period (Saturday Rush)</span>
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: CATEGORY SPLIT & HOURLY HEATMAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Contribution (Harmonized Culinary Palette) */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-[2.5rem] bg-white border border-sand shadow-sm space-y-5">
          <div className="pb-3 border-b border-sand">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-[#1F241F]">
                Sales by Gastronomy Category
              </h3>
              <Utensils size={17} className="text-gold" />
            </div>
            <p className="text-xs text-charcoal/60 mt-0.5">
              Revenue distribution across core culinary sections.
            </p>
          </div>

          <div className="space-y-4">
            {CATEGORY_SALES.map((cat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-charcoal">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.category}</span>
                  </div>
                  <span className="font-mono text-[#1F241F] font-bold">
                    ${cat.revenue.toLocaleString()} <span className="text-charcoal/50 font-normal">({cat.share}%)</span>
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-sand/30 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.share}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-sand flex items-center justify-between text-[11px] text-charcoal/60">
            <span>Leading Course: <strong>Prime Meats &amp; Steaks (36%)</strong></span>
            <span>Secondary: <strong>Handmade Pasta (27%)</strong></span>
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
            <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-[#8C6D2D]">
              <Clock size={16} />
            </div>
          </div>

          {/* Clean Gold-Scale Hourly Bars */}
          <div className="grid grid-cols-11 gap-1.5 items-end h-44 pt-6 px-1">
            {HOURLY_DISTRIBUTION.map((slot, i) => {
              const isPeak = slot.percent >= 90;
              const isBusy = slot.percent >= 60 && slot.percent < 90;
              const isModerate = slot.percent >= 30 && slot.percent < 60;

              return (
                <div
                  key={i}
                  className="flex flex-col items-center justify-end h-full group relative cursor-default"
                  title={`${slot.hour}: ${slot.label} (${slot.percent}% load)`}
                >
                  {/* Tooltip on hover */}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 text-[9px] font-mono font-bold text-white bg-[#1F241F] px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap z-10 pointer-events-none">
                    {slot.percent}%
                  </span>

                  <div
                    className={`w-full rounded-t-lg transition-all group-hover:brightness-110 ${
                      isPeak
                        ? "bg-[#8C6D2D] shadow-xs"
                        : isBusy
                        ? "bg-[#B99A5B]"
                        : isModerate
                        ? "bg-[#D4B574]/80"
                        : "bg-[#E5E0D8]"
                    }`}
                    style={{
                      height: `${slot.percent}%`,
                    }}
                  />
                  <span className="text-[9px] font-mono text-charcoal/60 mt-2 truncate">
                    {slot.hour.replace(" ", "")}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 text-[11px] text-charcoal/60 border-t border-sand">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#8C6D2D]" />
              <span>Dinner Peak: <strong>8:00 PM (100% Brigade)</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#B99A5B]" />
              <span>Lunch Peak: <strong>1:00 PM (75% Load)</strong></span>
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 4: TOP 6 GROSSING SIGNATURE DISHES */}
      <div className="rounded-[2.5rem] bg-white border-2 border-sand p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-sand">
          <div>
            <div className="inline-flex items-center gap-1.5 text-gold text-xs font-bold uppercase tracking-widest mb-1">
              <Award size={13} />
              <span>Culinary Highlights</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1F241F]">
              Top Revenue-Generating Dishes
            </h3>
            <p className="text-xs text-charcoal/60 mt-0.5">
              Ranked by aggregate ticket revenue and sales growth rate.
            </p>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-gold/15 border border-gold/40 flex items-center justify-center text-[#8C6D2D]">
            <Crown size={18} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-sand text-charcoal/50 uppercase font-mono tracking-wider text-[10px]">
                <th className="py-3 px-3">Rank &amp; Dish</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Units Sold</th>
                <th className="py-3 px-3 text-right">Total Revenue</th>
                <th className="py-3 px-3 text-right">Growth Momentum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/40">
              {TOP_DISHES.map((dish, idx) => (
                <tr key={idx} className="hover:bg-sand/15 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
                          idx === 0
                            ? "bg-gold text-[#1F241F]"
                            : idx === 1
                            ? "bg-sand text-charcoal"
                            : "bg-sand/40 text-charcoal/70"
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <span className="font-serif font-bold text-sm text-[#1F241F]">{dish.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-sand/30 border border-sand/70 text-[10px] font-semibold text-charcoal/80">
                      {dish.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-charcoal/80">
                    {dish.unitsSold} plates
                  </td>
                  <td className="py-3.5 px-3 text-right font-serif font-bold text-sm text-[#1F241F]">
                    ${dish.revenue.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="inline-flex items-center gap-0.5 font-bold font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px]">
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
