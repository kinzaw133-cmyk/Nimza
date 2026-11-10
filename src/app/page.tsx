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
} from "lucide-react";
import HeroSlider from "@/components/HeroSlider";
import Img from "@/components/Img";
import SplashScreen from "@/components/SplashScreen";
import LogoShowcase from "@/components/LogoShowcase";
import NimzaLogo, { BotanicalLeafSvg } from "@/components/NimzaLogo";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/components/Cart";
import { toast } from "@/lib/notify";

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

const TESTIMONIALS = [
  {
    quote: "A sublime convergence of Mediterranean warmth and Budapest precision. Every plate is poetry.",
    author: "Gourmet International Review",
    rating: 5,
  },
  {
    quote: "The Truffle Tagliatelle alone is worth crossing oceans for. Nimza has created something timeless.",
    author: "Michelin Guide Inspector Note",
    rating: 5,
  },
  {
    quote: "Flawless hospitality, hypnotic ambiance, and flavours that linger like gentle music.",
    author: "Culinary Traveler Magazine",
    rating: 5,
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
  const [featured, setFeatured] = useState<any[]>(FALLBACK_SIGNATURES);

  useEffect(() => {
    const fetchFeatured = async () => {
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
  }, []);

  const handleQuickAdd = (item: any) => {
    add(item);
    toast(`Added "${item.name}" to your cart`, "success");
  };

  return (
    <>
      {/* Animated Brand Splash Screen on Initial Load */}
      <SplashScreen />

      <main className="bg-ivory text-charcoal overflow-hidden">
        {/* Cinematic Hero Slider */}
        <HeroSlider />

        {/* Brand Accolades Ribbon */}
        <section className="bg-olive-deep text-ivory py-8 px-6 border-b border-gold/30">
          <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-6">
            {METRICS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3.5 justify-center text-center sm:text-left">
                <div className="p-2.5 rounded-full bg-gold/15 border border-gold/30 text-gold shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-sans tracking-widest text-sand/70 uppercase">{label}</p>
                  <p className="font-serif text-lg md:text-xl font-bold text-ivory">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Our Culinary Philosophy Section */}
        <section className="mx-auto max-w-7xl items-center gap-16 px-6 py-28 md:px-12 grid md:grid-cols-2">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-sand/40 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-olive mb-4">
              <Sparkles size={13} className="text-gold" /> Botanical Elegance
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-olive leading-tight font-bold">
              We cook with patience, serve without noise.
            </h2>
            <p className="mt-6 text-charcoal/80 text-lg leading-relaxed font-light">
              At Nimza, gastronomy is an act of quiet reverence. We select morning-harvested produce from artisan growers, age our heritage cuts in-house, and cook over cherrywood flame.
            </p>
            <p className="mt-4 text-charcoal/70 text-base leading-relaxed">
              Every plate is a small argument that simple things, prepared with absolute sincerity, are more than enough.
            </p>

            <div className="mt-8 pt-8 border-t border-sand flex items-center gap-6">
              <div className="flex -space-x-3">
                <div className="w-12 h-12 rounded-full border-2 border-ivory overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&q=80" alt="Chef" className="w-full h-full object-cover" />
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-ivory bg-olive flex items-center justify-center text-gold font-serif font-bold text-lg">
                  N
                </div>
              </div>
              <div>
                <p className="font-serif text-lg font-bold text-olive">Chef Elias Varga</p>
                <p className="text-xs text-charcoal/60 uppercase tracking-widest">Executive Chef & Founder</p>
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
              <div className="absolute -bottom-6 -left-6 rounded-full p-2 bg-ivory shadow-xl border border-gold/40">
                <NimzaLogo variant="circle" size="md" />
              </div>
            </div>
          </Reveal>
        </section>

        {/* Signature Collection Section */}
        <section className="bg-olive py-28 px-6 md:px-12 relative overflow-hidden text-ivory">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gold/10 blur-[100px] pointer-events-none" />

          <div className="mx-auto max-w-7xl">
            <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">
                  Curated Epicurean Journey
                </span>
                <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-ivory font-bold mt-2">
                  Signature Collection
                </h2>
              </div>
              <Link href="/menu" className="btn flex items-center gap-2 self-start md:self-auto">
                <span>View Full Menu</span>
                <ArrowRight size={16} />
              </Link>
            </Reveal>

            {/* Dish Cards Grid */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((item, idx) => (
                <Reveal key={item.id} delay={idx * 0.15}>
                  <div
                    className={`group relative overflow-hidden bg-ivory text-charcoal transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/30 ${
                      idx === 1 ? "rounded-[2.5rem] lg:-mt-6 border-2 border-gold/40" : "rounded-3xl"
                    }`}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <Img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {item.badge && (
                        <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1 text-xs font-bold text-olive shadow">
                          <Star size={12} />
                          {item.badge}
                        </span>
                      )}
                      <div className="absolute bottom-3 right-3 rounded-full bg-olive-deep/80 backdrop-blur-md px-3.5 py-1 text-sm font-serif font-bold text-gold">
                        ${Number(item.price).toFixed(2)}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-serif text-2xl font-bold text-olive group-hover:text-gold transition-colors">
                        {item.name}
                      </h3>
                      <p className="mt-2 text-sm text-charcoal/70 line-clamp-2 leading-relaxed font-light">
                        {item.description}
                      </p>

                      <div className="mt-6 pt-4 border-t border-sand flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-charcoal/50">
                          Fresh to Order
                        </span>
                        <button
                          onClick={() => handleQuickAdd(item)}
                          className="btn-d !py-2 !px-4 text-xs flex items-center gap-1.5"
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
              <Link href="/about" className="btn-d !bg-sand !text-olive hover:!bg-sand-dark">
                Read Our Story
              </Link>
            </div>
          </Reveal>
        </section>

        {/* Critic Reviews / Testimonials */}
        <section className="bg-sand/30 py-24 px-6 md:px-12 border-t border-gold/20">
          <div className="mx-auto max-w-6xl">
            <Reveal className="text-center mb-16">
              <span className="text-xs uppercase tracking-[0.3em] text-gold font-bold">
                Guest Impressions
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-olive font-bold mt-2">
                Praised by Critics and Connoisseurs
              </h2>
            </Reveal>

            <div className="grid gap-8 md:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={i} delay={i * 0.15}>
                  <div className="rounded-3xl bg-white p-8 shadow-sm border border-sand hover:border-gold/50 transition-all flex flex-col justify-between h-full">
                    <div>
                      <div className="flex gap-1 text-gold mb-4">
                        {Array.from({ length: t.rating }).map((_, idx) => (
                          <Star key={idx} size={16} fill="#B99A5B" />
                        ))}
                      </div>
                      <p className="font-serif text-lg text-charcoal/90 italic leading-relaxed">
                        "{t.quote}"
                      </p>
                    </div>
                    <p className="mt-6 pt-4 border-t border-sand text-xs font-bold uppercase tracking-wider text-olive">
                      {t.author}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* VIP Dining Invitation Banner */}
        <section className="py-20 px-6 md:px-12 bg-olive-deep text-ivory relative overflow-hidden">
          <div className="mx-auto max-w-5xl rounded-[3rem] border border-gold/40 p-10 md:p-16 text-center glass-dark relative">
            <div className="mx-auto w-16 h-16 text-gold mb-6">
              <BotanicalLeafSvg className="w-full h-full" />
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-ivory">
              An Evening of Rare Hospitality
            </h2>
            <p className="mt-4 text-sand/80 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
              Whether celebrating a milestone or seeking an unhurried dinner with loved ones, your table at Nimza awaits.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/reservations" className="btn !py-4 !px-8 text-sm">
                Reserve Your Table Now
              </Link>
              <Link href="/contact" className="btn-o !py-4 !px-8 text-sm">
                Private Dining Inquiries
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
