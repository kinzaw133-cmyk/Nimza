"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  Download,
  Printer,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Search,
  Filter,
  Sparkles,
  MapPin,
  Users,
  Eye,
  RefreshCw,
  X,
  FileText,
  Wifi,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { toast } from "@/lib/notify";
import QRCodeSvg, { downloadQRCodePng } from "@/components/QRCodeSvg";
import NimzaLogo from "@/components/NimzaLogo";

interface TableQRItem {
  no: number;
  section: string;
  seats: number;
  status: "Available" | "Occupied" | "Reserved";
  wifiCode?: string;
  notes?: string;
}

const DEFAULT_TABLES: TableQRItem[] = [
  { no: 1, section: "Window Terrace", seats: 2, status: "Occupied" },
  { no: 2, section: "Window Terrace", seats: 2, status: "Reserved" },
  { no: 3, section: "Window Terrace", seats: 4, status: "Occupied" },
  { no: 4, section: "Grand Dining Hall", seats: 4, status: "Available" },
  { no: 5, section: "Grand Dining Hall", seats: 6, status: "Available" },
  { no: 6, section: "Grand Dining Hall", seats: 6, status: "Reserved" },
  { no: 7, section: "Garden Veranda", seats: 4, status: "Available" },
  { no: 8, section: "Garden Veranda", seats: 6, status: "Available" },
  { no: 9, section: "Private Wine Vault", seats: 6, status: "Reserved" },
  { no: 10, section: "Private Wine Vault", seats: 8, status: "Available" },
  { no: 11, section: "Chef's Counter VIP", seats: 4, status: "Occupied" },
  { no: 12, section: "Royal Salon", seats: 12, status: "Reserved" },
];

export default function AdminQRCodesPage() {
  const { user, isAdmin } = useAuth();
  const [tables, setTables] = useState<TableQRItem[]>(DEFAULT_TABLES);
  const [activeSection, setActiveSection] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedTable, setCopiedTable] = useState<number | null>(null);

  // Standee Modal State
  const [selectedTableForStandee, setSelectedTableForStandee] = useState<TableQRItem | null>(null);
  const [isBatchPrintOpen, setIsBatchPrintOpen] = useState(false);

  // Add Table Modal State
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [newTableNo, setNewTableNo] = useState<number>(13);
  const [newTableSection, setNewTableSection] = useState("Window Terrace");
  const [newTableSeats, setNewTableSeats] = useState(4);

  const [baseUrl, setBaseUrl] = useState("");

  // Determine current origin on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
      try {
        const stored = localStorage.getItem("nimza_qr_tables");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTables(parsed);
            setNewTableNo(Math.max(...parsed.map((t: TableQRItem) => t.no)) + 1);
          }
        }
      } catch {}
    }
  }, []);

  const getQRUrl = (tableNo: number) => {
    const origin = baseUrl || "http://localhost:3000";
    return `${origin}/qr-menu?table=${tableNo}`;
  };

  const handleCopyLink = (tableNo: number) => {
    const url = getQRUrl(tableNo);
    navigator.clipboard.writeText(url);
    setCopiedTable(tableNo);
    toast(`Copied Table #${tableNo} QR URL to clipboard`, "info");
    setTimeout(() => setCopiedTable(null), 2500);
  };

  const handleDownloadPNG = (table: TableQRItem) => {
    const url = getQRUrl(table.no);
    downloadQRCodePng(
      url,
      `nimza-table-${table.no}-qr.png`,
      `Table #${table.no}`,
      table.section
    );
    toast(`Downloaded Table #${table.no} High-Res QR Code`, "success");
  };

  const handleDownloadSVG = (table: TableQRItem) => {
    const svgElem = document.getElementById(`qr-svg-table-${table.no}`);
    if (!svgElem) {
      handleDownloadPNG(table);
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svgElem);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nimza-table-${table.no}-qr.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast(`Downloaded Table #${table.no} Vector SVG`, "success");
  };

  const handlePrintStandee = (table: TableQRItem) => {
    setSelectedTableForStandee(table);
  };

  const executePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleAddTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tables.some((t) => t.no === newTableNo)) {
      toast(`Table #${newTableNo} already exists`, "error");
      return;
    }

    const newTable: TableQRItem = {
      no: newTableNo,
      section: newTableSection,
      seats: newTableSeats,
      status: "Available",
    };

    const updated = [...tables, newTable].sort((a, b) => a.no - b.no);
    setTables(updated);
    try {
      localStorage.setItem("nimza_qr_tables", JSON.stringify(updated));
    } catch {}

    toast(`Table #${newTableNo} created with QR digital menu link`, "success");
    setIsAddTableOpen(false);
    setNewTableNo(newTableNo + 1);
  };

  const sectionsList = useMemo(() => {
    const set = new Set<string>();
    tables.forEach((t) => set.add(t.section));
    return ["All", ...Array.from(set)];
  }, [tables]);

  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchSec = activeSection === "All" || t.section === activeSection;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        String(t.no).includes(q) ||
        t.section.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q);
      return matchSec && matchSearch;
    });
  }, [tables, activeSection, searchQuery]);

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div className="p-8 rounded-[2.5rem] bg-white border border-sand shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sand bg-sand/30 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-charcoal mb-3">
            <QrCode size={14} className="text-gold" />
            <span>Digital Menu Infrastructure</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-olive">
            Table QR Code Management
          </h1>
          <p className="text-xs md:text-sm text-charcoal/70 mt-1 max-w-2xl leading-relaxed">
            Generate, customize, and print unique table QR codes. When scanned by guests, each QR code automatically identifies their table, displays live availability, and routes orders directly to the Kitchen Display System (KDS).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setIsBatchPrintOpen(true)}
            className="px-4 py-2.5 rounded-full border border-sand bg-white hover:bg-sand/30 text-xs font-bold text-charcoal shadow-xs transition-all flex items-center gap-2"
          >
            <Printer size={15} className="text-gold" />
            <span>Print All Standees</span>
          </button>

          <button
            onClick={() => setIsAddTableOpen(true)}
            className="px-5 py-2.5 rounded-full bg-olive text-gold hover:bg-charcoal text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Plus size={15} />
            <span>+ Add Table QR</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
        <div className="p-5 rounded-2xl bg-white border border-sand shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60">
            Total QR Tables
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-serif text-3xl font-bold text-olive">{tables.length}</span>
            <span className="text-xs font-bold text-charcoal/60">Ready to Scan</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            Dining Sections
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-serif text-3xl font-bold text-emerald-900">
              {sectionsList.length - 1} Zones
            </span>
            <span className="text-xs font-bold text-emerald-700">Terrace &amp; Salon</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gold/15 border border-gold/40 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal">
            Target Endpoint
          </span>
          <div className="flex items-baseline justify-between mt-2 truncate">
            <span className="font-mono text-sm font-bold text-olive">/qr-menu?table=X</span>
            <span className="text-xs font-bold text-gold">Mobile View</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-sand shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60">
            KDS Synchronization
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-serif text-xl font-bold text-emerald-800 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" /> Live Auto-Sync
            </span>
            <span className="text-[11px] text-charcoal/60 font-semibold">Table Attached</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-2xl bg-white border border-sand flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-charcoal/60 mr-2 shrink-0">Section:</span>
          {sectionsList.map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeSection === sec
                  ? "bg-olive text-gold shadow-xs"
                  : "bg-sand/30 text-charcoal/80 hover:bg-sand/60"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-charcoal/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by table # or section..."
            className="w-full pl-9 pr-3 py-1.5 rounded-full bg-sand/20 border border-sand text-xs text-charcoal focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:hidden">
        {filteredTables.map((table) => {
          const targetUrl = getQRUrl(table.no);
          const isCopied = copiedTable === table.no;

          return (
            <div
              key={table.no}
              className="p-6 rounded-3xl bg-white border border-sand shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-sand">
                  <div>
                    <span className="font-serif text-2xl font-bold text-olive">
                      Table #{table.no}
                    </span>
                    <p className="text-xs font-bold text-charcoal/70 mt-0.5">{table.section}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        table.status === "Available"
                          ? "bg-emerald-100 text-emerald-800"
                          : table.status === "Occupied"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {table.status}
                    </span>
                    <span className="block text-[10px] text-charcoal/50 mt-1 font-semibold">
                      {table.seats} Diners
                    </span>
                  </div>
                </div>

                {/* QR Code Presentation */}
                <div className="my-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-[#FAFAF8] border border-sand/60">
                  <QRCodeSvg
                    id={`qr-svg-table-${table.no}`}
                    value={targetUrl}
                    size={160}
                    className="shadow-sm"
                  />
                  <p className="text-[10px] text-charcoal/60 mt-3 font-mono truncate max-w-full text-center">
                    {targetUrl}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-sand">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDownloadPNG(table)}
                    className="py-2 px-3 rounded-xl border border-sand bg-sand/20 hover:bg-sand/50 text-xs font-bold text-charcoal transition-all flex items-center justify-center gap-1.5"
                    title="Download 800x800 PNG"
                  >
                    <Download size={13} className="text-gold" />
                    <span>Download PNG</span>
                  </button>

                  <button
                    onClick={() => handlePrintStandee(table)}
                    className="py-2 px-3 rounded-xl bg-olive text-gold hover:bg-charcoal text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
                    title="Print table standee / tent card"
                  >
                    <Printer size={13} />
                    <span>Print Standee</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => handleCopyLink(table.no)}
                    className="py-1.5 px-3 rounded-xl border border-sand/60 hover:border-gold text-[11px] font-semibold text-charcoal/80 transition-colors flex items-center justify-center gap-1"
                  >
                    {isCopied ? (
                      <>
                        <Check size={12} className="text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/qr-menu?table=${table.no}`}
                    target="_blank"
                    className="py-1.5 px-3 rounded-xl border border-sand/60 hover:border-gold text-[11px] font-semibold text-charcoal/80 transition-colors flex items-center justify-center gap-1"
                  >
                    <ExternalLink size={12} />
                    <span>Test Scanned</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SINGLE TABLE STANDEE MODAL */}
      <AnimatePresence>
        {selectedTableForStandee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white print:static">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-3xl border border-sand shadow-2xl p-6 sm:p-8 print:border-none print:shadow-none print:p-0"
            >
              {/* Modal Toolbar (hidden during print) */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-sand print:hidden">
                <div className="flex items-center gap-2">
                  <Printer size={16} className="text-gold" />
                  <span className="font-serif text-lg font-bold text-olive">
                    Print Standee Card • Table #{selectedTableForStandee.no}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedTableForStandee(null)}
                  className="p-1.5 rounded-full hover:bg-sand/30 text-charcoal transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Printable Standee Template */}
              <div className="standee-card border-4 border-gold/40 rounded-3xl p-8 bg-gradient-to-b from-white to-[#FAFAF8] text-center shadow-lg print:border-4 print:shadow-none print:rounded-3xl">
                {/* Logo & Brand */}
                <div className="flex justify-center mb-3">
                  <NimzaLogo variant="circle" size="md" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-gold font-bold block">
                  Fine Dining &amp; Gastronomy
                </span>
                <h2 className="font-serif text-3xl font-bold text-[#1F241F] mt-1">
                  Table #{selectedTableForStandee.no}
                </h2>
                <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-sand/40 text-olive mt-1">
                  {selectedTableForStandee.section}
                </span>

                {/* Central QR Code */}
                <div className="my-6 flex justify-center">
                  <QRCodeSvg
                    value={getQRUrl(selectedTableForStandee.no)}
                    size={220}
                    className="border-2 border-gold/30 shadow-md p-4"
                  />
                </div>

                {/* Instructions */}
                <div className="space-y-1.5 max-w-xs mx-auto">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#1F241F]">
                    <Smartphone size={14} className="text-gold" />
                    <span>Scan with Smartphone Camera</span>
                  </div>
                  <p className="text-[11px] text-charcoal/70 leading-relaxed">
                    Explore our daily harvest menu, customize portions and spice, and send orders directly to the kitchen brigade.
                  </p>
                </div>

                {/* Wi-Fi Details */}
                <div className="mt-6 pt-4 border-t border-sand/70 flex items-center justify-center gap-4 text-[11px] text-charcoal/60">
                  <span className="flex items-center gap-1">
                    <Wifi size={12} className="text-gold" /> Wi-Fi: <strong>Nimza-Guest</strong>
                  </span>
                  <span>Pass: <strong>truffle2024</strong></span>
                </div>
              </div>

              {/* Action Buttons in Modal (hidden during print) */}
              <div className="mt-6 flex items-center justify-end gap-3 print:hidden">
                <button
                  onClick={() => setSelectedTableForStandee(null)}
                  className="px-4 py-2 rounded-full border border-sand text-xs font-bold text-charcoal hover:bg-sand/30 transition-colors"
                >
                  Close Preview
                </button>
                <button
                  onClick={executePrint}
                  className="px-5 py-2 rounded-full bg-olive text-gold hover:bg-charcoal text-xs font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <Printer size={15} />
                  <span>Print Standee Card</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BATCH PRINT ALL STANDEES MODAL */}
      <AnimatePresence>
        {isBatchPrintOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white print:static">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl border border-sand shadow-2xl p-6 sm:p-8 print:max-h-none print:overflow-visible print:border-none print:shadow-none print:p-0"
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-sand print:hidden">
                <div className="flex items-center gap-2">
                  <Printer size={18} className="text-gold" />
                  <h3 className="font-serif text-xl font-bold text-olive">
                    Batch Print Table Standees ({tables.length} Tables)
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={executePrint}
                    className="px-5 py-2 rounded-full bg-olive text-gold hover:bg-charcoal text-xs font-bold shadow-md transition-all flex items-center gap-2"
                  >
                    <Printer size={15} />
                    <span>Print All Sheets</span>
                  </button>
                  <button
                    onClick={() => setIsBatchPrintOpen(false)}
                    className="p-1.5 rounded-full hover:bg-sand/30 text-charcoal transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Grid of Standees for Printing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-2 print:gap-8">
                {tables.map((table) => (
                  <div
                    key={table.no}
                    className="border-2 border-gold/40 rounded-3xl p-6 bg-white text-center shadow-xs page-break-inside-avoid print:shadow-none"
                  >
                    <div className="flex justify-center mb-2">
                      <NimzaLogo variant="circle" size="sm" />
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-gold font-bold block">
                      Fine Dining
                    </span>
                    <h4 className="font-serif text-2xl font-bold text-[#1F241F]">
                      Table #{table.no}
                    </h4>
                    <span className="text-[11px] text-olive font-semibold">{table.section}</span>

                    <div className="my-4 flex justify-center">
                      <QRCodeSvg
                        value={getQRUrl(table.no)}
                        size={170}
                        className="border border-sand p-2 shadow-xs"
                      />
                    </div>

                    <p className="text-[10px] text-charcoal/70 leading-relaxed max-w-xs mx-auto">
                      Scan with your phone to browse our digital menu, customize courses, and place orders.
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD NEW TABLE MODAL */}
      <AnimatePresence>
        {isAddTableOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl border border-sand shadow-2xl p-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-sand mb-4">
                <div className="flex items-center gap-2">
                  <Plus size={16} className="text-gold" />
                  <h3 className="font-serif text-lg font-bold text-olive">Add New QR Table</h3>
                </div>
                <button
                  onClick={() => setIsAddTableOpen(false)}
                  className="p-1 rounded-full hover:bg-sand/30 text-charcoal"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddTableSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                    Table Number
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newTableNo}
                    onChange={(e) => setNewTableNo(Number(e.target.value))}
                    required
                    className="inp text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                    Dining Section
                  </label>
                  <select
                    value={newTableSection}
                    onChange={(e) => setNewTableSection(e.target.value)}
                    className="inp text-xs font-semibold cursor-pointer"
                  >
                    <option value="Window Terrace">Window Terrace</option>
                    <option value="Grand Dining Hall">Grand Dining Hall</option>
                    <option value="Garden Veranda">Garden Veranda</option>
                    <option value="Private Wine Vault">Private Wine Vault</option>
                    <option value="Chef's Counter VIP">Chef's Counter VIP</option>
                    <option value="Royal Salon">Royal Salon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                    Seat Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={newTableSeats}
                    onChange={(e) => setNewTableSeats(Number(e.target.value))}
                    required
                    className="inp text-sm font-semibold"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddTableOpen(false)}
                    className="px-4 py-2 rounded-full border border-sand text-xs font-bold text-charcoal"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-olive text-gold hover:bg-charcoal text-xs font-bold shadow-md"
                  >
                    Generate &amp; Save Table
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
