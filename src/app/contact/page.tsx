"use client";

import React, { useState } from "react";
import {
  MapPin,
  Clock,
  Mail,
  Phone,
  Sparkles,
  Send,
  Car,
  Wine,
  CalendarCheck,
  CheckCircle,
} from "lucide-react";
import { toast } from "@/lib/notify";
import NimzaLogo, { BotanicalLeafSvg } from "@/components/NimzaLogo";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Table Reservation Inquiry",
    message: "",
  });
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast("Please provide your name and email", "error");
      return;
    }
    setIsSent(true);
    toast("Thank you. Our Head Concierge will reply within 2 business hours.", "success");
    setForm({
      name: "",
      email: "",
      phone: "",
      subject: "Table Reservation Inquiry",
      message: "",
    });
    setTimeout(() => setIsSent(false), 5000);
  };

  return (
    <main className="min-h-screen bg-ivory text-charcoal pt-36 pb-28 px-6 md:px-12 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-sand/40 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-olive mb-3">
            <Sparkles size={13} className="text-gold" /> Dedicated Concierge
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-olive tracking-tight">
            Connect With Us
          </h1>
          <p className="mt-4 text-charcoal/80 text-base md:text-lg font-light leading-relaxed">
            For private event buyouts, sommelier consultations, or tailored dining requests, our team is at your disposal.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Contact Details Cards & Ambiance Notes */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-[2.5rem] bg-olive-deep text-ivory p-8 md:p-10 border border-gold/30 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-gold/20">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gold font-bold">
                    Direct Concierge
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-ivory mt-0.5">Nimza Gastronomy</h3>
                </div>
                <NimzaLogo variant="monogram" size="sm" />
              </div>

              <div className="space-y-6 text-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 text-gold flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-ivory text-base">Location</p>
                    <p className="text-sand/80 mt-0.5 leading-relaxed">
                      12 Garden Road, Luxury District, Capital Enclave
                    </p>
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-2 text-xs text-gold font-bold underline hover:text-gold-light"
                    >
                      Open in Google Maps →
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 text-gold flex items-center justify-center shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-ivory text-base">Sitting Hours</p>
                    <p className="text-sand/80 mt-0.5">
                      <strong>Lunch Sitting:</strong> 12:00 – 16:00<br />
                      <strong>Dinner Sitting:</strong> 18:30 – 23:30<br />
                      <span className="text-xs text-sand/60">Open Tuesday through Sunday</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 text-gold flex items-center justify-center shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-ivory text-base">Telephone</p>
                    <p className="text-sand/80 mt-0.5">+92 300 0000000</p>
                    <p className="text-xs text-sand/60">Priority Desk: Mon–Sun 10:00 – 22:00</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 text-gold flex items-center justify-center shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-ivory text-base">Electronic Mail</p>
                    <p className="text-sand/80 mt-0.5">concierge@nimza.example</p>
                  </div>
                </div>
              </div>

              {/* Valet Notice */}
              <div className="mt-8 pt-6 border-t border-gold/20 flex items-center gap-3 text-xs text-sand/80">
                <Car size={18} className="text-gold shrink-0" />
                <span>Complimentary white-glove valet parking available at our main entrance.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Inquiry Form */}
          <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-[2.5rem] border border-sand shadow-sm">
            <h2 className="font-serif text-3xl font-bold text-olive mb-2">Send an Inquiry</h2>
            <p className="text-sm text-charcoal/70 mb-8 font-light">
              We respond to all requests within 2 business hours with full menu and seating details.
            </p>

            {isSent ? (
              <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-center">
                <CheckCircle size={36} className="text-emerald-700 mx-auto mb-3" />
                <h3 className="font-serif text-2xl font-bold text-emerald-900">Message Received</h3>
                <p className="text-sm text-emerald-800 mt-2">
                  Our head concierge will contact you shortly. Thank you for connecting with Nimza.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-2">
                      Full Name *
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Eleanor Vance"
                      className="inp"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-2">
                      Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="eleanor@example.com"
                      className="inp"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+92 300 0000000"
                      className="inp"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-2">
                      Subject
                    </label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="inp cursor-pointer"
                    >
                      <option value="Table Reservation Inquiry">Table Reservation Inquiry</option>
                      <option value="Private Dining & Buyout">Private Dining & Buyout</option>
                      <option value="Wine Cellar Consultation">Wine Cellar Consultation</option>
                      <option value="Press & Media Relations">Press & Media Relations</option>
                      <option value="Feedback & Accolades">Feedback & Accolades</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-2">
                    Your Message or Special Request *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about your planned celebration, guest preferences, or date..."
                    className="inp resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="btn w-full !py-4 text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-gold/20"
                >
                  <Send size={16} />
                  <span>Send Message to Concierge</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
