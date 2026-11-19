"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building,
  ChefHat,
  Users,
  Clock,
  Phone,
  Mail,
  Edit3,
  X,
  Search,
} from "lucide-react";
import {
  BranchLocation,
  getStoredBranches,
  saveStoredBranches,
} from "@/lib/branches/branchData";
import { toast } from "@/lib/notify";

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<BranchLocation[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New branch form state
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [address, setAddress] = useState("");
  const [cityDistrict, setCityDistrict] = useState("");
  const [phone, setPhone] = useState("");
  const [headChef, setHeadChef] = useState("");
  const [tableCount, setTableCount] = useState(16);
  const [seatingCapacity, setSeatingCapacity] = useState(64);
  const [operatingHours, setOperatingHours] = useState("12:00 PM – 11:30 PM Daily");

  useEffect(() => {
    setBranches(getStoredBranches());
    const handleUpdate = () => setBranches(getStoredBranches());
    window.addEventListener("nimza_branches_updated", handleUpdate);
    return () => window.removeEventListener("nimza_branches_updated", handleUpdate);
  }, []);

  const handleStatusChange = (branchId: string, newStatus: BranchLocation["status"]) => {
    const updated = branches.map((b) =>
      b.id === branchId ? { ...b, status: newStatus } : b
    );
    setBranches(updated);
    saveStoredBranches(updated);
    toast("Branch operational status updated", "info");
  };

  const handleDelete = (branchId: string, branchName: string) => {
    if (confirm(`Are you sure you want to remove branch "${branchName}"?`)) {
      const updated = branches.filter((b) => b.id !== branchId);
      setBranches(updated);
      saveStoredBranches(updated);
      toast(`Removed branch "${branchName}"`, "success");
    }
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      toast("Please provide both branch name and address", "error");
      return;
    }

    const newBranch: BranchLocation = {
      id: `branch-${Date.now()}`,
      name: name.trim(),
      tagline: tagline.trim() || "Artisanal culinary destination",
      address: address.trim(),
      cityDistrict: cityDistrict.trim() || "Metropolitan District",
      phone: phone.trim() || "+1 (555) 000-0000",
      email: `${name.toLowerCase().replace(/\s+/g, "")}@nimza.example`,
      headChef: headChef.trim() || "Chef Elias Brigade",
      sommelier: "Sommelier Matteo",
      tableCount: Number(tableCount),
      seatingCapacity: Number(seatingCapacity),
      operatingHours: operatingHours.trim(),
      status: "Open",
      image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
      features: ["Private Dining Room", "Sommelier Service", "Valet Parking"],
      coordinates: { lat: 45.464, lng: 9.19 },
    };

    const updated = [...branches, newBranch];
    setBranches(updated);
    saveStoredBranches(updated);
    toast(`Branch "${name}" added successfully!`, "success");

    // Reset & close
    setName("");
    setTagline("");
    setAddress("");
    setIsModalOpen(false);
  };

  const filtered = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.cityDistrict.toLowerCase().includes(search.toLowerCase()) ||
      b.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sand">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-charcoal shadow-2xs mb-2">
            <Building size={12} className="text-gold" />
            <span>Multi-Unit Operations</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#1F241F]">
            Branch &amp; Location Management
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/60 mt-1">
            Configure restaurant branches, operational statuses, table capacities, and brigade leadership.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn !bg-gold hover:!bg-gold-light !text-charcoal !py-2.5 !px-5 text-xs font-bold uppercase tracking-wider rounded-full shadow-xs flex items-center gap-2 shrink-0"
        >
          <Plus size={15} />
          <span>Add New Branch</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-sand">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search branch name, district or address..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-sand/20 border border-sand text-xs text-charcoal placeholder-charcoal/40 outline-none focus:border-gold"
          />
        </div>
        <span className="text-xs text-charcoal/50 font-mono">
          {filtered.length} locations operational
        </span>
      </div>

      {/* BRANCHES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((branch) => (
          <div
            key={branch.id}
            className="p-6 rounded-3xl bg-white border-2 border-sand hover:border-gold/60 transition-all flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="relative h-44 rounded-2xl overflow-hidden mb-4 bg-sand/20">
                <img
                  src={branch.image_url}
                  alt={branch.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#1F241F]/80 text-gold border border-gold/40 backdrop-blur-xs">
                  {branch.cityDistrict}
                </div>
              </div>

              <h3 className="font-serif text-xl font-bold text-[#1F241F]">{branch.name}</h3>
              <p className="text-xs text-charcoal/60 mt-1 italic font-light">
                &ldquo;{branch.tagline}&rdquo;
              </p>

              <div className="space-y-2 text-xs text-charcoal/80 my-4 font-mono">
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-gold shrink-0" />
                  <span className="truncate">{branch.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-gold shrink-0" />
                  <span>{branch.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={13} className="text-gold shrink-0" />
                  <span>{branch.tableCount} Tables ({branch.seatingCapacity} Seats)</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat size={13} className="text-gold shrink-0" />
                  <span className="truncate">{branch.headChef}</span>
                </div>
              </div>

              {/* Status Switcher Dropdown */}
              <div className="pt-3 border-t border-sand">
                <label className="block text-[10px] uppercase font-bold text-charcoal/60 mb-1">
                  Operational Status:
                </label>
                <select
                  value={branch.status}
                  onChange={(e) => handleStatusChange(branch.id, e.target.value as any)}
                  className={`w-full px-3 py-1.5 rounded-xl border text-xs font-bold font-mono outline-none ${
                    branch.status === "Open"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : branch.status === "Near Capacity"
                      ? "bg-amber-50 text-amber-900 border-amber-300"
                      : branch.status === "Private Buyout"
                      ? "bg-purple-50 text-purple-900 border-purple-300"
                      : "bg-rose-50 text-rose-800 border-rose-300"
                  }`}
                >
                  <option value="Open">Open for Service</option>
                  <option value="Near Capacity">Near Capacity</option>
                  <option value="Private Buyout">Private Gala Buyout</option>
                  <option value="Closed">Closed for Prep</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 mt-4 border-t border-sand flex items-center justify-between">
              <Link
                href="/branches"
                className="text-xs font-bold text-olive hover:text-gold transition-colors underline"
              >
                View Public Page →
              </Link>

              <button
                type="button"
                onClick={() => handleDelete(branch.id, branch.name)}
                className="p-2 rounded-lg hover:bg-rose-50 text-rose-600 hover:text-rose-700 transition-colors"
                title="Remove branch"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-gold shadow-2xl text-charcoal z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-sand">
                <h3 className="font-serif text-2xl font-bold text-[#1F241F]">
                  Register Restaurant Branch
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full hover:bg-sand/40 text-charcoal"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateBranch} className="space-y-4 mt-5 text-xs">
                <div>
                  <label className="font-bold text-charcoal/80 block mb-1">Branch Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Nimza Grand Marina"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-charcoal/80 block mb-1">Ambiance Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Coastal sea terrace & crudo raw bar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand focus:border-gold outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-charcoal/80 block mb-1">City District</label>
                    <input
                      type="text"
                      value={cityDistrict}
                      onChange={(e) => setCityDistrict(e.target.value)}
                      placeholder="e.g. Marina Promenade"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand focus:border-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-charcoal/80 block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand focus:border-gold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-charcoal/80 block mb-1">Physical Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Pier 7, The Grand Promenade"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand focus:border-gold outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-charcoal/80 block mb-1">Table Count</label>
                    <input
                      type="number"
                      min={1}
                      value={tableCount}
                      onChange={(e) => setTableCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand focus:border-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-charcoal/80 block mb-1">Seating Capacity</label>
                    <input
                      type="number"
                      min={1}
                      value={seatingCapacity}
                      onChange={(e) => setSeatingCapacity(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand focus:border-gold outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-full bg-gold hover:bg-gold-light text-[#1F241F] font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                  >
                    Register Branch
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3 rounded-full border border-sand text-charcoal hover:bg-sand/30 font-medium"
                  >
                    Cancel
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
