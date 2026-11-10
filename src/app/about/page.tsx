"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Award, Clock, Heart, Shield, ArrowRight, Wine, ChefHat } from "lucide-react";
import Img from "@/components/Img";
import NimzaLogo, { BotanicalLeafSvg } from "@/components/NimzaLogo";

const PILLARS = [
  {
    icon: Shield,
    title: "Respect for the Soil",
    desc: "We work directly with twelve family-owned biodynamic farms. Our menu changes not by month, but by morning harvest.",
  },
  {
    icon: Clock,
    title: "Unhurried Patience",
    desc: "Broths simmer for 36 hours. Tagliatelle is extruded minutes before boiling. True gastronomy cannot be accelerated.",
  },
  {
    icon: Heart,
    title: "Quiet Hospitality",
    desc: "Service that anticipates without intrusion. We create an ambiance where conversation and flavours take center stage.",
  },
  {
    icon: Wine,
    title: "Living Cellar",
    desc: "Curated by Master Sommelier Clara Dupont, housing 120+ rare organic vintages and natural Central European wines.",
  },
];

const MILESTONES = [
  { year: "2018", title: "The Budapest Hearth", desc: "Chef Elias begins an intimate 12-seat wood-fire pop-up in Budapest's historic Jewish quarter." },
  { year: "2021", title: "Arrival in the Capital", desc: "Nimza opens its flagship dining hall, blending classical French techniques with Hungarian soul." },
  { year: "2023", title: "Organic Farm Partnership", desc: "100% of vegetables, eggs, and herbs are dedicated exclusively to our private garden estate." },
  { year: "2024", title: "Michelin Standard Selection", desc: "Recognized as a leading luxury dining destination for modern Central European gastronomy." },
];

const BRIGADE = [
  {
    name: "Elias Varga",
    role: "Founder & Executive Chef",
    bio: "Former Sous Chef at 3-star L'Arpège in Paris and Onyx in Budapest. Obsessed with heritage grains and wood smoke.",
    img: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&q=80",
  },
  {
    name: "Clara Dupont",
    role: "Head Sommelier & Cellar Master",
    bio: "Certified Court of Master Sommeliers. Curates rare bio-dynamic selections across Tokaj, Burgundy, and Piedmont.",
    img: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=600&q=80",
  },
  {
    name: "Matteo Bellini",
    role: "Master Pastry Chef",
    bio: "Milan-trained virtuoso specializing in layered Valrhona chocolates, citrus foam, and delicate regional brioches.",
    img: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=600&q=80",
  },
];

export default function About() {
  return (
    <main className="min-h-screen bg-ivory text-charcoal pt-36 pb-28 px-6 md:px-12 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Editorial Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-sand/40 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-olive mb-4">
            <Sparkles size={13} className="text-gold" /> Our Story & Heritage
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-olive tracking-tight">
            A Table Built on Patience
          </h1>
          <p className="mt-6 text-charcoal/80 text-lg md:text-xl font-light leading-relaxed">
            Nimza was born from a singular belief: in an age of hurried dining, genuine luxury is the luxury of time, craft, and honest ingredients.
          </p>
        </div>

        {/* Feature Hero Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-28">
          <div className="lg:col-span-7 relative">
            <div className="relative overflow-hidden rounded-[3rem] border border-gold/30 shadow-2xl">
              <Img
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1400&q=80"
                alt="Nimza Dining Hall"
                className="h-[520px] w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 p-4 rounded-2xl bg-olive-deep text-ivory border border-gold/40 shadow-xl max-w-xs hidden sm:block">
              <p className="text-xs uppercase tracking-widest text-gold font-bold">Ambiance</p>
              <p className="font-serif text-sm font-semibold mt-1">Warm Italian lighting, linen drapery, and acoustic calm.</p>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] text-gold font-bold">The Inception</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-olive">
              Where Fire Meets Quiet Craft
            </h2>
            <p className="text-charcoal/80 leading-relaxed font-light">
              Named after the spirit of shared celebration, Nimza combines the rich, paprika-scented wood fires of Central Europe with the delicate precision of French classical cooking.
            </p>
            <p className="text-charcoal/80 leading-relaxed font-light">
              We never use microwaves, frozen bases, or artificial stabilizers. If a wild herb isn't fresh in the morning market, it is not on the dinner plate.
            </p>

            <div className="pt-4 flex items-center gap-4">
              <Link href="/reservations" className="btn flex items-center gap-2">
                <span>Experience Our Table</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* The 4 Pillars of Craft */}
        <div className="py-20 border-t border-sand mb-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-gold font-bold">Guiding Philosophy</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-olive mt-2">
              The Four Pillars of Nimza
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-8 rounded-3xl bg-sand/30 border border-sand hover:border-gold/60 transition-all hover:-translate-y-1.5 shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/30 text-gold flex items-center justify-center mb-6">
                  <Icon size={24} />
                </div>
                <h3 className="font-serif text-xl font-bold text-olive mb-2">{title}</h3>
                <p className="text-charcoal/70 text-sm leading-relaxed font-light">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones Timeline */}
        <div className="bg-olive rounded-[3rem] p-10 md:p-16 text-ivory mb-28 border border-gold/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gold/10 blur-[120px] pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-16 relative z-10">
            <span className="text-xs uppercase tracking-[0.3em] text-gold font-bold">Chronology</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-ivory mt-2">
              Our Journey Through Time
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
            {MILESTONES.map((m, idx) => (
              <div key={m.year} className="relative p-6 rounded-2xl bg-olive-deep/70 border border-gold/20">
                <span className="font-serif text-4xl font-bold text-gold">{m.year}</span>
                <h4 className="font-serif text-lg font-bold text-ivory mt-2">{m.title}</h4>
                <p className="text-xs text-sand/80 mt-2 leading-relaxed font-light">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* The Master Brigade */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-gold font-bold">The Artisans</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-olive mt-2">
              The Master Brigade
            </h2>
            <p className="mt-3 text-charcoal/70 text-base">Meet the visionaries orchestrating your dining experience.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {BRIGADE.map((chef) => (
              <div
                key={chef.name}
                className="group rounded-3xl bg-white overflow-hidden shadow-sm border border-sand hover:border-gold/50 transition-all hover:-translate-y-1.5"
              >
                <div className="h-72 overflow-hidden relative">
                  <Img
                    src={chef.img}
                    alt={chef.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 text-ivory">
                    <p className="text-xs uppercase tracking-wider text-gold font-bold">{chef.role}</p>
                    <h3 className="font-serif text-2xl font-bold">{chef.name}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-charcoal/80 leading-relaxed font-light">{chef.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
