"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Award,
  Wine,
  UtensilsCrossed,
  Clock,
  HeartHandshake,
  Star,
  Plus,
  CalendarCheck,
  PhoneCall,
  ChefHat,
  Heart,
} from "lucide-react";
import HeroSlider from "@/components/HeroSlider";
import Img from "@/components/Img";
import SplashScreen from "@/components/SplashScreen";
import LogoShowcase from "@/components/LogoShowcase";
import NimzaLogo, { BotanicalLeafSvg } from "@/components/NimzaLogo";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useCart } from "@/components/Cart";
import { useWishlist } from "@/components/Wishlist";
import { toast } from "@/lib/notify";
import { preloadImages } from "@/lib/imageCache";

// Fallback signature items if Supabase is initializing or empty
const FALLBACK_SIGNATURES = [
  {
    id: 1,
    name: "Truffle Tagliatelle",
    description: "Hand-cut pasta, Umbrian black truffle cream, 36-month Parmigiano-Reggiano.",
    price: 18.0,
    image_url: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80",
    badge: "Top pick",
    category: "Mains",
  },
  {
    id: 2,
    name: "Grilled Ribeye Special",
    description: "300g heritage dry-aged ribeye, confit garlic butter, smoked heirloom carrots.",
    price: 29.0,
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    badge: "Chef selection",
    category: "Mains",
  },
  {
    id: 3,
    name: "Molten Valrhona Chocolate",
    description: "Warm dark chocolate sphere, vanilla bean cream, gold dust crisp.",
    price: 10.0,
    image_url: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80",
    badge: "Signature dessert",
    category: "Desserts",
  },
];

const METRICS = [
  { icon: Award, label: "Accreditation", value: "3 Michelin Stars" },
  { icon: Wine, label: "Wine Cellar", value: "120+ Grand Crus" },
  { icon: UtensilsCrossed, label: "Philosophy", value: "100% Farm to Table" },
  { icon: Clock, label: "Preparation", value: "Slow Cooked Patience" },
];

const DEFAULT_GUEST_REVIEWS = [
  {
    id: 1,
    author: "Sarah Johnson",
    role_or_tag: "Anniversary Dinner",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    rating: 5.0,
    quote: "The truffle pasta was absolutely divine! The ambiance was perfect for our anniversary dinner. We'll definitely be back.",
    is_featured: true,
  },
  {
    id: 2,
    author: "Mike Chen",
    role_or_tag: "Food Blogger",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    rating: 5.0,
    quote: "As a food blogger, I've dined at hundreds of restaurants. Savory Delights stands out for its innovative flavors and impeccable service.",
    is_featured: true,
  },
  {
    id: 3,
    author: "Emma Davis",
    role_or_tag: "Corporate Event",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    rating: 4.5,
    quote: "We hosted our company holiday party here and everything was perfect. The staff went above and beyond to make our event special.",
    is_featured: true,
  },
];

const Reveal = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-70px" }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function Home() {
  const { add } = useCart();
  const { isFavorite, toggleFavorite } = useWishlist();
  const [featured, setFeatured] = useState<any[]>(FALLBACK_SIGNATURES);
  const [reviewsList, setReviewsList] = useState<any[]>(DEFAULT_GUEST_REVIEWS);

  useEffect(() => {
    preloadImages(
      [
        ...FALLBACK_SIGNATURES.map((s) => s.image_url),
        ...DEFAULT_GUEST_REVIEWS.map((r) => r.avatar_url),
      ],
      800
    );

    const fetchFeatured = async () => {
      if (!isSupabaseConfigured) return;
      try {
        const { data } = await supabase
          .from("menu_items")
          .select("*")
          .order("id")
          .limit(3);
        if (data && data.length > 0) {
          setFeatured(data);
        }
      } catch {
        // Fallback remains active
      }
    };
    fetchFeatured();

    const fetchReviews = async () => {
      if (!isSupabaseConfigured) return;
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .eq("status", "Approved")
          .eq("is_featured", true)
          .order("id", { ascending: true })
          .limit(6);
        if (!error && data && data.length > 0) {
          setReviewsList(data);
          return;
        }
      } catch {
        // Fallback to localStorage
      }

      try {
        const saved = localStorage.getItem("nimza_admin_reviews");
        if (saved) {
          const parsed = JSON.parse(saved);
          const filtered = parsed.filter((r: any) => r.is_featured && r.status === "Approved");
          if (filtered.length > 0) {
            setReviewsList(filtered);
            return;
          }
        }
      } catch {
        // Keep default guest reviews
      }
    };

    fetchReviews();

    const handleReviewsUpdate = () => fetchReviews();
    window.addEventListener("nimza_reviews_updated", handleReviewsUpdate);
    return () => window.removeEventListener("nimza_reviews_updated", handleReviewsUpdate);
  }, []);

  const handleQuickAdd = (item: any) => {
    add(item);
    toast(`Added "${item.name}" to your cart`, "success");
  };

  return (
    <>
      {/* Animated Brand Splash Screen on Initial Load */}
      <SplashScreen />

      <main className="bg-[#FAFAF8] text-charcoal overflow-hidden">
        {/* Cinematic Hero Slider */}
        <HeroSlider />

        {/* Brand Accolades Ribbon */}
        <section className="bg-[#1F241F] text-ivory py-9 px-6 border-y border-sand/30 shadow-inner">
          <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-6">
            {METRICS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 justify-center text-center sm:text-left">
                <div className="p-3 rounded-2xl bg-gold/15 border border-gold/30 text-gold shrink-0">
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-sans tracking-[0.25em] text-sand/70 uppercase font-semibold">{label}</p>
                  <p className="font-serif text-lg md:text-xl font-bold text-ivory mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Our Culinary Philosophy Section */}
        <section className="mx-auto max-w-7xl items-center gap-16 px-6 py-28 md:px-12 grid md:grid-cols-2">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-sand/30 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-charcoal/80 mb-4">
              <Sparkles size={13} className="text-gold" /> Botanical Elegance
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-charcoal leading-tight font-bold">
              We cook with patience, serve without noise.
            </h2>
            <p className="mt-6 text-charcoal/80 text-lg leading-relaxed font-light">
              At Nimza, gastronomy is an act of quiet reverence. We select morning-harvested produce from artisan growers, age our heritage cuts in-house, and cook over cherrywood flame.
            </p>
            <p className="mt-4 text-charcoal/70 text-base leading-relaxed">
              Every plate is a small argument that simple things, prepared with absolute sincerity, are more than enough.
            </p>

            <div className="mt-8 pt-8 border-t border-sand/60 flex items-center gap-6">
              <div className="flex -space-x-3">
                <div className="w-12 h-12 rounded-full border-2 border-white shadow overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&q=80" alt="Chef" className="w-full h-full object-cover" />
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-white bg-[#1F241F] flex items-center justify-center text-gold font-serif font-bold text-lg shadow">
                  N
                </div>
              </div>
              <div>
                <p className="font-serif text-lg font-bold text-charcoal">Chef Elias Varga</p>
                <p className="text-xs text-charcoal/60 uppercase tracking-widest font-medium">Executive Chef & Founder</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="relative">
            <div className="relative mx-auto max-w-md">
              {/* Arched Architectural Dining Room Image */}
              <div className="relative overflow-hidden rounded-t-[14rem] rounded-b-3xl border-4 border-gold/30 shadow-2xl">
                <Img
                  src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1000&q=80"
                  alt="Nimza Dining Room Interior"
                  className="h-[520px] w-full object-cover transition duration-700 hover:scale-105"
                />
              </div>

              {/* Floating Decorative Brand Seal */}
              <div className="absolute -bottom-6 -left-6 rounded-full p-1 bg-transparent drop-shadow-xl">
                <NimzaLogo variant="circle" size="md" />
              </div>
            </div>
          </Reveal>
        </section>

        {/* Signature Collection Section (Matched with Hero Section Style) */}
        <section className="bg-[#FAFAF8] py-28 px-6 md:px-12 relative overflow-hidden text-charcoal border-t border-sand/40">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gold/10 blur-[100px] pointer-events-none" />

          <div className="mx-auto max-w-7xl">
            <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-sand/30 px-3.5 py-1 text-xs font-semibold tracking-widest text-charcoal/70 uppercase mb-2">
                  <Sparkles size={13} className="text-gold" />
                  <span>Curated Epicurean Journey</span>
                </div>
                <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-charcoal font-bold mt-2">
                  Signature Collection
                </h2>
              </div>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 rounded-full bg-[#1F241F] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-black transition-all shadow-md self-start md:self-auto"
              >
                <span>View Full Menu</span>
                <ArrowRight size={15} />
              </Link>
            </Reveal>

            {/* Dish Cards Grid */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((item, idx) => (
                <Reveal key={item.id} delay={idx * 0.15}>
                  <div
                    className={`group relative overflow-hidden bg-white text-charcoal transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border border-sand/80 ${
                      idx === 1 ? "rounded-[2.5rem] lg:-mt-6 border-2 border-gold/50 shadow-xl" : "rounded-3xl shadow-md"
                    }`}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <Img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {item.badge && (
                        <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1 text-xs font-bold text-charcoal shadow">
                          <Star size={12} fill="currentColor" />
                          {item.badge}
                        </span>
                      )}

                      {/* Heart-Shaped Favorite Toggle */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(item);
                        }}
                        aria-label={
                          isFavorite(item.id)
                            ? `Remove ${item.name} from favorites`
                            : `Add ${item.name} to favorites`
                        }
                        className="absolute top-3 right-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/95 backdrop-blur-md shadow-md border border-sand/80 hover:scale-110 active:scale-90 transition-all duration-200"
                        title={isFavorite(item.id) ? "In your favorites (click to remove)" : "Save to favorites"}
                      >
                        <Heart
                          size={16}
                          className={`transition-all duration-300 ${
                            isFavorite(item.id)
                              ? "fill-rose-500 text-rose-500 scale-110"
                              : "text-charcoal/50 hover:text-rose-500"
                          }`}
                        />
                      </button>

                      <div className="absolute bottom-3 right-3 rounded-full bg-[#1F241F]/90 backdrop-blur-md px-3.5 py-1 text-sm font-serif font-bold text-gold border border-gold/30">
                        ${Number(item.price).toFixed(2)}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-2xl font-bold text-charcoal group-hover:text-gold transition-colors">
                          {item.name}
                        </h3>
                        <span className="text-[11px] font-semibold text-charcoal/50 uppercase tracking-wider">
                          {item.category || "Signature"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-charcoal/70 line-clamp-2 leading-relaxed font-light">
                        {item.description}
                      </p>

                      <div className="mt-6 pt-4 border-t border-sand/60 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-charcoal/50">
                          <Clock size={12} className="text-gold" />
                          <span>Fresh To Order</span>
                        </span>
                        <button
                          onClick={() => handleQuickAdd(item)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-gold hover:bg-gold-light text-charcoal font-bold text-xs uppercase px-4 py-2 shadow-sm transition-all hover:scale-105 active:scale-95"
                        >
                          <Plus size={14} />
                          <span>Add to Order</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Logo & Brand Variants Showcase */}
        <LogoShowcase />

        {/* Meet the Chef Section */}
        <section className="mx-auto max-w-7xl items-center gap-16 px-6 py-28 md:px-12 grid md:grid-cols-2">
          <Reveal className="order-2 md:order-1">
            <div className="relative">
              <Img
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1000&q=80"
                alt="Chef Elias Varga"
                className="h-[500px] w-full rounded-3xl object-cover shadow-2xl border border-gold/30"
              />
              <div className="absolute -bottom-6 -right-6 p-4 rounded-2xl bg-olive-deep text-ivory border border-gold/40 shadow-xl max-w-xs">
                <p className="text-xs uppercase tracking-widest text-gold font-bold">Accolade</p>
                <p className="font-serif text-base font-bold mt-1">Master of Central European & French Gastronomy</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="order-1 md:order-2">
            <span className="text-xs uppercase tracking-[0.3em] text-gold font-bold">
              Culinary Architect
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-olive font-bold mt-2">
              Meet Chef Elias Varga
            </h2>
            <p className="mt-6 text-charcoal/80 text-lg leading-relaxed font-light">
              Trained across Budapest, Lyon, and Milan, Chef Elias founded Nimza with a steadfast commitment to culinary authenticity.
            </p>
            <p className="mt-4 text-charcoal/70 text-base leading-relaxed">
              "We never hold a pasta dish under heat lamps. When an order fires, the dough is dropped into simmering water, hand-tossed with truffle emulsion, and plated within ninety seconds."
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/reservations" className="btn flex items-center gap-2">
                <span>Reserve a Table</span>
                <ArrowRight size={16} />
              </Link>
              <Link href="/about" className="btn-o !py-3.5 !px-7 text-xs font-bold uppercase tracking-wider">
                Read Our Story
              </Link>
            </div>
          </Reveal>
        </section>

        {/* Customer Experiences / Testimonials with Top-Down Table BG & Glassmorphism */}
        <section className="relative py-28 px-6 md:px-12 border-t border-sand overflow-hidden bg-[#FAF9F5]">
          {/* Top-down wooden dining table background photography */}
          <div 
            className="absolute inset-0 pointer-events-none bg-cover bg-center opacity-30 mix-blend-multiply scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1920&q=85')`,
            }}
          />
          {/* Soft ambient lighting overlay for high legibility */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#FAF9F5]/65 via-[#FAF9F5]/50 to-[#FAF9F5]/70 backdrop-blur-[0.5px]" />

          <div className="relative mx-auto max-w-6xl z-10">
            <Reveal className="text-center mb-16">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-[#8C6D2D] border border-gold/40 text-xs font-semibold tracking-wide shadow-xs mb-3">
                Customer Experiences
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1F241F] font-bold mt-1 tracking-tight">
                What Our <span className="text-[#B99A5B]">Guests</span> Say
              </h2>
              <p className="mt-3 text-sm sm:text-base text-charcoal/75 max-w-xl mx-auto font-sans">
                Don't just take our word for it - hear from our satisfied diners.
              </p>
            </Reveal>

            {/* Glassmorphic Cards Grid */}
            <div className="grid gap-6 md:grid-cols-3">
              {reviewsList.slice(0, 3).map((t, i) => (
                <Reveal key={t.id || i} delay={i * 0.15}>
                  <div className="rounded-2xl sm:rounded-3xl bg-white/75 backdrop-blur-md border border-white/80 shadow-lg hover:shadow-2xl hover:bg-white/85 transition-all duration-300 p-7 sm:p-8 flex flex-col justify-between h-full relative overflow-hidden group before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white before:to-transparent">
                    <div>
                      {/* Top row: Stars on left, rating number on right */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-1 text-[#F5A623]">
                          {Array.from({ length: 5 }).map((_, idx) => {
                            const starRating = Number(t.rating || 5);
                            const isFull = idx + 1 <= Math.floor(starRating);
                            const isHalf = !isFull && idx < starRating;
                            return (
                              <Star
                                key={idx}
                                size={16}
                                className={
                                  isFull
                                    ? "fill-[#F5A623] text-[#F5A623]"
                                    : isHalf
                                    ? "fill-[#F5A623]/60 text-[#F5A623]"
                                    : "fill-sand/40 text-sand/60"
                                }
                              />
                            );
                          })}
                        </div>
                        <span className="text-xs font-semibold text-charcoal/60 tracking-wider">
                          {Number(t.rating || 5).toFixed(1)}
                        </span>
                      </div>

                      {/* Quote */}
                      <p className="text-charcoal/85 italic text-sm sm:text-[15px] leading-relaxed font-serif">
                        "{t.quote}"
                      </p>
                    </div>

                    {/* Guest identity footer */}
                    <div className="mt-6 pt-5 border-t border-sand/50 flex items-center gap-3.5">
                      <img
                        src={t.avatar_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"}
                        alt={t.author}
                        className="w-11 h-11 rounded-full object-cover border border-white/90 shadow-xs shrink-0"
                      />
                      <div>
                        <p className="text-sm font-bold text-[#1F241F] leading-tight">
                          {t.author}
                        </p>
                        <p className="text-xs text-charcoal/60 font-sans mt-0.5">
                          {t.role_or_tag || "Dining Guest"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* VIP Dining Invitation Banner (Harmonized Light Luxury Palette) */}
        <section className="py-20 px-6 md:px-12 bg-[#FAF9F5] text-charcoal relative overflow-hidden border-t border-sand/70">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-gold/10 blur-[130px] pointer-events-none" />

          <div className="mx-auto max-w-5xl rounded-[3rem] border border-sand/80 p-10 sm:p-14 md:p-16 text-center bg-white/95 backdrop-blur-md relative shadow-lg">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 text-gold mb-5">
              <BotanicalLeafSvg className="w-full h-full" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F5EDE0] text-[#8C6D2D] border border-[#E8DAC2] text-xs font-semibold tracking-wide shadow-xs mb-3">
              VIP Dining &amp; Hospitality
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1F241F] tracking-tight">
              An Evening of <span className="text-[#B99A5B]">Rare Hospitality</span>
            </h2>

            <p className="mt-4 text-charcoal/75 max-w-xl mx-auto text-base sm:text-lg leading-relaxed font-sans font-light">
              Whether celebrating a milestone or seeking an unhurried dinner with loved ones, your table at Nimza awaits.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/reservations"
                className="btn !bg-[#B99A5B] hover:!bg-[#A6884A] !text-[#1F241F] hover:!text-white !py-4 !px-8 text-sm font-bold tracking-wider flex items-center gap-2 shadow-md hover:shadow-gold/30 transition-all rounded-full"
              >
                <CalendarCheck size={18} />
                <span>Reserve Your Table Now</span>
              </Link>

              <Link
                href="/contact"
                className="btn-o !border-sand !bg-white hover:!bg-sand/30 hover:!border-gold !text-[#1F241F] !py-4 !px-8 text-sm font-semibold tracking-wider flex items-center gap-2 shadow-xs transition-all rounded-full"
              >
                <PhoneCall size={18} className="text-gold" />
                <span>Private Dining Inquiries</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
