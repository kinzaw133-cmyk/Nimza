"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Sparkles,
  Plus,
  Search,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  Award,
  Users,
  ShieldCheck,
  X,
  MessageSquare,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { toast } from "@/lib/notify";
import NimzaLogo from "@/components/NimzaLogo";

export interface ReviewItem {
  id: number;
  author: string;
  role_or_tag: string;
  avatar_url: string;
  rating: number;
  quote: string;
  is_featured: boolean;
  status: "Approved" | "Pending" | "Hidden";
  created_at?: string;
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: 1,
    author: "Sarah Johnson",
    role_or_tag: "Anniversary Dinner",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    rating: 5.0,
    quote: "The truffle pasta was absolutely divine! The ambiance was perfect for our anniversary dinner. We'll definitely be back.",
    is_featured: true,
    status: "Approved",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 2,
    author: "Mike Chen",
    role_or_tag: "Food Blogger",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    rating: 5.0,
    quote: "As a food blogger, I've dined at hundreds of restaurants. Savory Delights stands out for its innovative flavors and impeccable service.",
    is_featured: true,
    status: "Approved",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 3,
    author: "Emma Davis",
    role_or_tag: "Corporate Event",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    rating: 4.5,
    quote: "We hosted our company holiday party here and everything was perfect. The staff went above and beyond to make our event special.",
    is_featured: true,
    status: "Approved",
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 4,
    author: "Lord Sterling",
    role_or_tag: "Wine Vault Connoisseur",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    rating: 5.0,
    quote: "The dry-aged ribeye paired with their sommelier's Tokaj vintage selection was an unhurried, masterclass experience.",
    is_featured: true,
    status: "Approved",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 5,
    author: "Elena Rostova",
    role_or_tag: "Private Dining Guest",
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
    rating: 4.8,
    quote: "Pure culinary artistry. From the warm bread service to the Valrhona chocolate sphere, exceptional hospitality throughout.",
    is_featured: false,
    status: "Approved",
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

const AVATAR_PRESETS = [
  { name: "Sarah", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80" },
  { name: "Mike", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" },
  { name: "Emma", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80" },
  { name: "Sterling", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80" },
  { name: "Elena", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80" },
];

export default function CustomerReviewsAdminPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<string>("All");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ReviewItem | null>(null);
  const [formData, setFormData] = useState({
    author: "",
    role_or_tag: "Dining Guest",
    avatar_url: AVATAR_PRESETS[0].url,
    rating: 5.0,
    quote: "",
    is_featured: true,
    status: "Approved" as "Approved" | "Pending" | "Hidden",
  });

  const loadReviews = async () => {
    setIsRefreshing(true);
    try {
      let dbReviews: ReviewItem[] = [];
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .order("id", { ascending: false });

        if (data && data.length > 0) {
          dbReviews = data as ReviewItem[];
        }
      } catch {}

      let localReviews: ReviewItem[] = [];
      try {
        localReviews = JSON.parse(localStorage.getItem("nimza_admin_reviews") || "[]");
      } catch {}

      if (dbReviews.length === 0 && localReviews.length === 0) {
        setReviews(DEFAULT_REVIEWS);
        localStorage.setItem("nimza_admin_reviews", JSON.stringify(DEFAULT_REVIEWS));
      } else {
        const map = new Map<number, ReviewItem>();
        DEFAULT_REVIEWS.forEach((r) => map.set(r.id, r));
        localReviews.forEach((r) => map.set(r.id, r));
        dbReviews.forEach((r) => map.set(r.id, r));
        setReviews(Array.from(map.values()).sort((a, b) => b.id - a.id));
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const saveToStorageAndSync = (updated: ReviewItem[]) => {
    setReviews(updated);
    try {
      localStorage.setItem("nimza_admin_reviews", JSON.stringify(updated));
      window.dispatchEvent(new Event("nimza_reviews_updated"));
    } catch {}
  };

  // Toggle Featured Status
  const handleToggleFeatured = async (id: number) => {
    const item = reviews.find((r) => r.id === id);
    if (!item) return;
    const newFeatured = !item.is_featured;

    try {
      await supabase.from("reviews").update({ is_featured: newFeatured }).eq("id", id);
    } catch {}

    const updated = reviews.map((r) => (r.id === id ? { ...r, is_featured: newFeatured } : r));
    saveToStorageAndSync(updated);
    toast(newFeatured ? "Marked as Featured on Website" : "Removed from Featured list", "success");
  };

  // Change Review Status (Approved, Pending, Hidden)
  const handleChangeStatus = async (id: number, status: "Approved" | "Pending" | "Hidden") => {
    try {
      await supabase.from("reviews").update({ status }).eq("id", id);
    } catch {}

    const updated = reviews.map((r) => (r.id === id ? { ...r, status } : r));
    saveToStorageAndSync(updated);
    toast(`Review marked as ${status}`, "info");
  };

  // Delete Review
  const handleDeleteReview = async (id: number, author: string) => {
    if (!window.confirm(`Delete review from "${author}"?`)) return;

    try {
      await supabase.from("reviews").delete().eq("id", id);
    } catch {}

    const updated = reviews.filter((r) => r.id !== id);
    saveToStorageAndSync(updated);
    toast(`Review from "${author}" deleted`, "info");
  };

  // Open Modal to Add
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      author: "",
      role_or_tag: "Dining Guest",
      avatar_url: AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)].url,
      rating: 5.0,
      quote: "",
      is_featured: true,
      status: "Approved",
    });
    setModalOpen(true);
  };

  // Open Modal to Edit
  const handleOpenEdit = (item: ReviewItem) => {
    setEditingItem(item);
    setFormData({
      author: item.author,
      role_or_tag: item.role_or_tag || "Dining Guest",
      avatar_url: item.avatar_url || AVATAR_PRESETS[0].url,
      rating: Number(item.rating) || 5.0,
      quote: item.quote,
      is_featured: item.is_featured,
      status: item.status,
    });
    setModalOpen(true);
  };

  // Submit Modal
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.author.trim() || !formData.quote.trim()) {
      toast("Please provide guest name and testimonial quote", "error");
      return;
    }

    if (editingItem) {
      // Update
      const updatedRecord: ReviewItem = {
        ...editingItem,
        author: formData.author.trim(),
        role_or_tag: formData.role_or_tag.trim(),
        avatar_url: formData.avatar_url,
        rating: Number(formData.rating),
        quote: formData.quote.trim(),
        is_featured: formData.is_featured,
        status: formData.status,
      };

      try {
        await supabase.from("reviews").update(updatedRecord).eq("id", editingItem.id);
      } catch {}

      const updated = reviews.map((r) => (r.id === editingItem.id ? updatedRecord : r));
      saveToStorageAndSync(updated);
      toast("Review updated successfully", "success");
    } else {
      // Create
      const newId = Date.now();
      const newRecord: ReviewItem = {
        id: newId,
        author: formData.author.trim(),
        role_or_tag: formData.role_or_tag.trim(),
        avatar_url: formData.avatar_url,
        rating: Number(formData.rating),
        quote: formData.quote.trim(),
        is_featured: formData.is_featured,
        status: formData.status,
        created_at: new Date().toISOString(),
      };

      try {
        const res = await supabase.from("reviews").insert([newRecord]).select().single();
        if (res.data?.id) newRecord.id = res.data.id;
      } catch {}

      const updated = [newRecord, ...reviews];
      saveToStorageAndSync(updated);
      toast("New customer review added!", "success");
    }

    setModalOpen(false);
  };

  // Filtered reviews
  const filtered = reviews.filter((r) => {
    const matchSearch =
      r.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.role_or_tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.quote.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    if (filterTag === "Featured") return r.is_featured;
    if (filterTag === "5 Stars") return Number(r.rating) === 5.0;
    if (filterTag === "Approved") return r.status === "Approved";
    if (filterTag === "Pending") return r.status === "Pending";
    if (filterTag === "Hidden") return r.status === "Hidden";

    return true;
  });

  // KPI Calculations
  const totalReviews = reviews.length;
  const avgRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviews.length).toFixed(1)
    : "5.0";
  const featuredCount = reviews.filter((r) => r.is_featured && r.status === "Approved").length;
  const fiveStarCount = reviews.filter((r) => Number(r.rating) === 5.0).length;

  return (
    <div className="text-charcoal p-5 sm:p-8 lg:p-10 selection:bg-gold/20">
      <div className="mx-auto max-w-7xl">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Link
            href="/admin"
            className="rounded-full bg-white border border-sand px-4 py-1.5 text-xs font-bold text-olive hover:border-gold hover:text-gold transition-all shadow-sm"
          >
            ← Executive Dashboard
          </Link>
          <Link
            href="/admin/menu"
            className="rounded-full bg-white border border-sand px-4 py-1.5 text-xs font-bold text-olive hover:border-gold hover:text-gold transition-all shadow-sm"
          >
            Menu Studio
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-full bg-white border border-sand px-4 py-1.5 text-xs font-bold text-olive hover:border-gold hover:text-gold transition-all shadow-sm"
          >
            Kitchen Pass
          </Link>
          <Link
            href="/admin/tables"
            className="rounded-full bg-white border border-sand px-4 py-1.5 text-xs font-bold text-olive hover:border-gold hover:text-gold transition-all shadow-sm"
          >
            Table Floor & Waitlist
          </Link>
          <Link
            href="/admin/users"
            className="rounded-full bg-white border border-sand px-4 py-1.5 text-xs font-bold text-olive hover:border-gold hover:text-gold transition-all shadow-sm"
          >
            Users & Roles
          </Link>
          <span className="rounded-full bg-olive text-gold px-4 py-1.5 text-xs font-bold shadow-sm">
            Customer Reviews
          </span>
        </div>

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-10 border-b border-sand">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-sand/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-olive mb-2">
              <Star size={13} className="text-gold fill-gold" />
              <span>Guest Experiences & Testimonials</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#1F241F]">
              Customer Reviews Studio
            </h1>
            <p className="text-sm text-charcoal/70 mt-1">
              Curate and moderate what guests say. Pin featured 5-star impressions directly onto the website.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-charcoal hover:bg-gold-light transition-all shadow-md hover:scale-105"
            >
              <Plus size={16} />
              <span>Add Review</span>
            </button>

            <button
              onClick={loadReviews}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-4 py-2.5 text-xs font-semibold text-charcoal hover:border-gold transition-all shadow-sm"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="p-5 rounded-3xl bg-white border border-sand shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60">Total Reviews</span>
            <p className="font-serif text-3xl font-bold text-[#1F241F] mt-1">{totalReviews}</p>
            <p className="text-[11px] text-charcoal/50 mt-1">Verified Diners</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-sand shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60">Average Rating</span>
            <div className="flex items-center gap-2 mt-1">
              <p className="font-serif text-3xl font-bold text-[#1F241F]">{avgRating}</p>
              <div className="flex text-gold">
                <Star size={18} fill="#B99A5B" />
              </div>
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">Michelin Standard</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-sand shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60">5-Star Testimonials</span>
            <p className="font-serif text-3xl font-bold text-gold-dark mt-1">{fiveStarCount}</p>
            <p className="text-[11px] text-charcoal/50 mt-1">
              {totalReviews > 0 ? `${Math.round((fiveStarCount / totalReviews) * 100)}% of all reviews` : "100%"}
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-[#1F241F] text-ivory border border-gold/40 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gold">Featured on Website</span>
            <p className="font-serif text-3xl font-bold text-gold mt-1">{featuredCount}</p>
            <p className="text-[11px] text-sand/70 mt-1">Active on Home Showcase</p>
          </div>
        </div>

        {/* LIVE WEBSITE PREVIEW SECTION (Matches Uploaded Reference Design) */}
        <div className="mb-12 rounded-[2.5rem] bg-white border border-sand p-8 md:p-10 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-sand">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gold/20 text-gold flex items-center justify-center">
                <Eye size={18} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1F241F]">
                  Live Website Showcase Preview
                </h3>
                <p className="text-xs text-charcoal/60">
                  This exact presentation renders in the "Customer Experiences" section of the website.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowLivePreview(!showLivePreview)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-sand hover:border-gold transition-colors text-charcoal/70"
            >
              {showLivePreview ? "Hide Preview" : "Show Preview"}
            </button>
          </div>

          {showLivePreview && (
            <div className="relative rounded-[2rem] p-8 md:p-12 border border-sand/80 shadow-inner overflow-hidden bg-[#FAF9F5]">
              {/* Background table image */}
              <div 
                className="absolute inset-0 pointer-events-none bg-cover bg-center opacity-30 mix-blend-multiply"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1920&q=85')`,
                }}
              />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#FAF9F5]/70 via-[#FAF9F5]/60 to-[#FAF9F5]/75 backdrop-blur-[0.5px]" />

              <div className="relative z-10">
                {/* Reference Header */}
                <div className="text-center max-w-xl mx-auto mb-10">
                  <span className="inline-block rounded-full bg-white/80 backdrop-blur-md text-[#8C6D2D] px-4 py-1 text-xs font-bold uppercase tracking-widest border border-gold/40 shadow-xs mb-3">
                    Customer Experiences
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1F241F]">
                    What Our <span className="text-[#B99A5B]">Guests</span> Say
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-charcoal/70 font-light">
                    Don't just take our word for it - hear from our satisfied diners.
                  </p>
                </div>

                {/* 3 Reference Style Glassmorphic Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                  {reviews
                    .filter((r) => r.is_featured && r.status === "Approved")
                    .slice(0, 3)
                    .map((t) => (
                      <div
                        key={t.id}
                        className="rounded-3xl bg-white/75 backdrop-blur-md p-7 shadow-lg border border-white/80 hover:shadow-2xl transition-all flex flex-col justify-between relative overflow-hidden"
                      >
                        <div>
                          {/* Rating row with stars and numeric float */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex gap-1 text-[#F5A623]">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Star
                                  key={idx}
                                  size={15}
                                  className={idx < Math.floor(t.rating) ? "fill-[#F5A623] text-[#F5A623]" : "fill-sand/40 text-sand/60"}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-semibold text-charcoal/60 tracking-wider">
                              {Number(t.rating).toFixed(1)}
                            </span>
                          </div>

                          {/* Quote */}
                          <p className="font-serif text-sm sm:text-base text-charcoal/90 italic leading-relaxed">
                            "{t.quote}"
                          </p>
                        </div>

                        {/* User Identity footer */}
                        <div className="mt-6 pt-4 border-t border-sand/40 flex items-center gap-3">
                          <img
                            src={t.avatar_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"}
                            alt={t.author}
                            className="w-10 h-10 rounded-full object-cover border border-white/80 shadow-xs"
                          />
                          <div>
                            <p className="font-bold text-xs sm:text-sm text-[#1F241F]">{t.author}</p>
                            <p className="text-[11px] text-charcoal/60 mt-0.5">{t.role_or_tag || "Dining Guest"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Toolbar: Search & Filter Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {["All", "Featured", "5 Stars", "Approved", "Pending", "Hidden"].map((tag) => {
              const isSelected = filterTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                    isSelected
                      ? "bg-[#1F241F] text-gold shadow-sm"
                      : "bg-white border border-sand text-charcoal/70 hover:border-gold hover:text-charcoal"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviewer or quote..."
              className="w-full rounded-full border border-sand bg-white pl-9 pr-4 py-2.5 text-xs text-charcoal outline-none focus:border-gold shadow-sm"
            />
          </div>
        </div>

        {/* REVIEWS GRID / TABLE */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`rounded-3xl bg-white border p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                item.is_featured ? "border-gold/60 ring-1 ring-gold/30" : "border-sand"
              }`}
            >
              <div>
                {/* Card Top: Badges & Featured Toggle */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        item.status === "Approved"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : item.status === "Pending"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {item.status}
                    </span>

                    {item.is_featured && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/15 text-gold-dark border border-gold/30 flex items-center gap-1">
                        <Star size={10} fill="#B99A5B" /> Featured
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleFeatured(item.id)}
                    title={item.is_featured ? "Remove from website showcase" : "Feature on website showcase"}
                    className={`grid h-8 w-8 place-items-center rounded-full border transition-all ${
                      item.is_featured
                        ? "bg-gold text-charcoal border-gold shadow-sm"
                        : "bg-sand/20 text-charcoal/40 border-sand hover:text-gold hover:border-gold"
                    }`}
                  >
                    <Star size={14} fill={item.is_featured ? "#1F241F" : "none"} />
                  </button>
                </div>

                {/* Rating Stars & Float */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-gold">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < Math.floor(item.rating) ? "#B99A5B" : "none"}
                        className={i < Math.ceil(item.rating) ? "text-gold" : "text-sand"}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-charcoal/70">
                    {Number(item.rating).toFixed(1)}
                  </span>
                </div>

                {/* Quote Text */}
                <p className="font-serif text-sm text-charcoal/90 italic leading-relaxed line-clamp-3">
                  "{item.quote}"
                </p>
              </div>

              {/* Card Bottom: Author Info and Action Buttons */}
              <div className="mt-6 pt-4 border-t border-sand flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={item.avatar_url || AVATAR_PRESETS[0].url}
                    alt={item.author}
                    className="w-9 h-9 rounded-full object-cover border border-sand"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#1F241F]">{item.author}</p>
                    <p className="text-[10px] text-charcoal/60">{item.role_or_tag}</p>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-xl border border-sand text-charcoal/60 hover:text-gold hover:border-gold transition-colors"
                    title="Edit Review"
                  >
                    <Edit3 size={13} />
                  </button>

                  <button
                    onClick={() =>
                      handleChangeStatus(
                        item.id,
                        item.status === "Approved" ? "Hidden" : "Approved"
                      )
                    }
                    className="p-1.5 rounded-xl border border-sand text-charcoal/60 hover:text-olive hover:border-olive transition-colors"
                    title={item.status === "Approved" ? "Hide review" : "Approve review"}
                  >
                    {item.status === "Approved" ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>

                  <button
                    onClick={() => handleDeleteReview(item.id, item.author)}
                    className="p-1.5 rounded-xl border border-sand text-charcoal/60 hover:text-rose-600 hover:border-rose-400 transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-sand mt-6">
            <MessageSquare size={36} className="mx-auto text-gold mb-3 opacity-60" />
            <p className="font-serif text-xl font-bold text-[#1F241F]">No Reviews Match Your Filter</p>
            <p className="text-xs text-charcoal/60 mt-1">Try resetting the search query or category pills.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterTag("All");
              }}
              className="btn !py-2 !px-5 text-xs mt-4"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ADD / EDIT REVIEW MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-7 sm:p-9 max-w-lg w-full border border-sand shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-sand mb-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gold">
                    {editingItem ? "Edit Experience" : "New Experience"}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#1F241F]">
                    {editingItem ? "Edit Guest Review" : "Add Customer Review"}
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-sand/30 text-charcoal hover:bg-gold transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
                {/* Author Name & Occasion */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                      Guest Name *
                    </label>
                    <input
                      required
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="e.g. Sarah Johnson"
                      className="inp !text-xs !py-2.5"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                      Occasion / Role
                    </label>
                    <input
                      value={formData.role_or_tag}
                      onChange={(e) => setFormData({ ...formData, role_or_tag: e.target.value })}
                      placeholder="e.g. Anniversary Dinner, Food Blogger"
                      className="inp !text-xs !py-2.5"
                    />
                  </div>
                </div>

                {/* Rating Selector */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                    Rating ({formData.rating.toFixed(1)} Stars)
                  </label>
                  <div className="flex items-center gap-2 bg-[#FAFAF8] p-2.5 rounded-2xl border border-sand">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="text-gold hover:scale-110 transition-transform"
                      >
                        <Star
                          size={22}
                          fill={star <= formData.rating ? "#B99A5B" : "none"}
                          className={star <= formData.rating ? "text-gold" : "text-sand"}
                        />
                      </button>
                    ))}
                    <div className="ml-auto flex gap-1">
                      {[4.5, 4.8, 5.0].map((preset) => (
                        <button
                          type="button"
                          key={preset}
                          onClick={() => setFormData({ ...formData, rating: preset })}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                            formData.rating === preset
                              ? "bg-gold text-charcoal border-gold"
                              : "bg-white border-sand text-charcoal/70"
                          }`}
                        >
                          {preset}★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Avatar Presets */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                    Guest Avatar Photography
                  </label>
                  <div className="flex items-center gap-2">
                    {AVATAR_PRESETS.map((p) => (
                      <button
                        type="button"
                        key={p.name}
                        onClick={() => setFormData({ ...formData, avatar_url: p.url })}
                        className={`relative rounded-full p-0.5 transition-all ${
                          formData.avatar_url === p.url ? "ring-2 ring-gold scale-105" : "opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={p.url} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                      </button>
                    ))}
                    <input
                      type="text"
                      value={formData.avatar_url}
                      onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                      placeholder="Custom Image URL..."
                      className="inp !py-1.5 !text-[11px] ml-2 flex-1"
                    />
                  </div>
                </div>

                {/* Quote Text */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                    Testimonial Quote *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.quote}
                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                    placeholder="Enter what the guest shared about food, ambiance, or service..."
                    className="inp resize-none !text-xs"
                  />
                </div>

                {/* Featured and Status Toggles */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#FAFAF8] border border-sand">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="h-4 w-4 rounded accent-[#B99A5B] cursor-pointer"
                    />
                    <label htmlFor="is_featured" className="text-xs font-bold text-[#1F241F] cursor-pointer">
                      Feature on Homepage
                    </label>
                  </div>

                  <div>
                    <select
                      value={formData.status}
                      onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                      className="inp cursor-pointer !py-3 !text-xs font-semibold"
                    >
                      <option value="Approved">Status: Approved</option>
                      <option value="Pending">Status: Pending Review</option>
                      <option value="Hidden">Status: Hidden</option>
                    </select>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-3 rounded-full border border-sand text-charcoal font-bold hover:bg-sand/30 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-full bg-gold text-charcoal font-bold hover:bg-gold-light transition-all shadow-md"
                  >
                    {editingItem ? "Save Changes" : "Create Review"}
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
