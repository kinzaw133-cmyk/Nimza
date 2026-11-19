"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Sparkles,
  X,
  MessageSquare,
  CheckCircle2,
  Crown,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { toast } from "@/lib/notify";
import { awardLoyaltyPoints } from "@/lib/loyalty/loyaltyTypes";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: number;
  dishName?: string;
}

const TAG_OPTIONS = [
  "Anniversary Dinner",
  "Tasting Degustation",
  "Romantic Date",
  "Executive Lunch",
  "Doorstep Delivery",
  "Family Gathering",
];

export default function ReviewModal({
  isOpen,
  onClose,
  orderId,
  dishName,
}: ReviewModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(5);
  const [authorName, setAuthorName] = useState(user?.user_metadata?.full_name || "");
  const [tag, setTag] = useState(dishName ? `Loved the ${dishName}` : "Tasting Degustation");
  const [quote, setQuote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !quote.trim()) {
      toast("Please share your name and review feedback", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const newReview = {
        id: Date.now(),
        author: authorName.trim(),
        role_or_tag: tag,
        avatar_url: `https://images.unsplash.com/photo-${1500000000000 + (Date.now() % 1000000)}?w=200&q=80`,
        rating,
        quote: quote.trim(),
        is_featured: rating >= 4.5,
        status: "Approved",
        created_at: new Date().toISOString(),
      };

      // 1. Try insert Supabase
      try {
        await supabase.from("reviews").insert([
          {
            author: newReview.author,
            role_or_tag: newReview.role_or_tag,
            avatar_url: newReview.avatar_url,
            rating: newReview.rating,
            quote: newReview.quote,
            is_featured: newReview.is_featured,
            status: "Approved",
          },
        ]);
      } catch {}

      // 2. Save in localStorage
      try {
        const stored = JSON.parse(localStorage.getItem("nimza_reviews") || "[]");
        localStorage.setItem("nimza_reviews", JSON.stringify([newReview, ...stored]));
        window.dispatchEvent(new CustomEvent("nimza_review_created", { detail: newReview }));
      } catch {}

      // 3. Award 25 VIP Points bonus for reviewing
      let bonusAwarded = 0;
      try {
        bonusAwarded = awardLoyaltyPoints(25, orderId);
      } catch {}

      toast(
        `Thank you for your review! +25 VIP Loyalty Points awarded to your profile!`,
        "success"
      );

      onClose();
    } catch {
      toast("Error submitting review. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-xs"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-gold shadow-2xl text-charcoal z-10"
      >
        <div className="flex items-center justify-between pb-4 border-b border-sand">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gold/20 text-[#8C6D2D]">
              <Star size={18} fill="currentColor" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#1F241F]">
                Leave Dining Review
              </h3>
              <p className="text-[11px] text-charcoal/60">
                {dishName ? `Reviewing: ${dishName}` : "Share your fine dining impressions"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-sand/30"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5 text-xs">
          {/* 5-Star Interactive Rating Selector */}
          <div>
            <label className="font-bold text-charcoal/80 block mb-1.5 text-center">
              Your Culinary Rating
            </label>
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const filled = starVal <= (hoverRating || rating);
                return (
                  <button
                    key={starVal}
                    type="button"
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(rating)}
                    onClick={() => setRating(starVal)}
                    className="p-1 transition-transform hover:scale-125"
                  >
                    <Star
                      size={28}
                      className={filled ? "text-gold fill-gold" : "text-sand"}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-center text-[11px] font-mono font-bold text-olive">
              {rating === 5
                ? "5.0 - Sublime & Impeccable"
                : rating === 4
                ? "4.0 - Exceptional Experience"
                : rating === 3
                ? "3.0 - Satisfactory"
                : `${rating}.0 - Needs Refinement`}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-charcoal/80 block mb-1">Your Name</label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-charcoal/80 block mb-1">Occasion / Course</label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand focus:border-gold outline-none bg-white font-medium"
              >
                {TAG_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-charcoal/80 block mb-1">
              Your Culinary Impressions &amp; Tasting Notes
            </label>
            <textarea
              rows={3}
              required
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Describe the aroma, texture, seasoning, or wine pairing experience..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-sand focus:border-gold outline-none resize-none"
            />
          </div>

          {/* VIP Points Bonus Callout */}
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2">
            <Crown size={15} className="text-gold shrink-0" />
            <span className="text-[11px] font-medium">
              Earn <strong>+25 VIP Loyalty Points</strong> immediately upon publishing this review!
            </span>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-full bg-gold hover:bg-gold-light text-[#1F241F] font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <MessageSquare size={14} />
              <span>Publish Review</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-full border border-sand text-charcoal hover:bg-sand/30 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
