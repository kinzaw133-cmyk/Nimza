"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  MessageSquare,
  Send,
  Sparkles,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  CheckCircle2,
  FileText,
  User,
  ShieldCheck,
  Bot,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "@/lib/notify";
import NimzaLogo from "@/components/NimzaLogo";

interface SupportMessage {
  id: string;
  sender: "user" | "concierge";
  text: string;
  time: string;
}

const FAQS = [
  {
    category: "Dining & Dress Code",
    question: "What is Nimza's recommended attire and dining policy?",
    answer:
      "We recommend Smart Casual to Elegant Evening attire. We politely discourage athletic sportswear or beachwear in our main dining salon and private cellar vault.",
  },
  {
    category: "Allergies & Dietary",
    question: "How do you handle severe allergies and gluten-free diets?",
    answer:
      "All dietary requirements are taken with utmost rigor. Our brigade operates dedicated gluten-sensitive prep zones and can customize any artisanal pasta or course upon notice.",
  },
  {
    category: "Corkage & Sommelier",
    question: "May I bring my own vintage wine to the restaurant?",
    answer:
      "Yes, we welcome rare vintage personal bottles. Our corkage fee is $35 per 750ml bottle (maximum two bottles per party), which includes decanting and Riedel crystal service.",
  },
  {
    category: "Valet & Parking",
    question: "Is valet parking available on site?",
    answer:
      "Complimentary white-glove valet parking is provided at our main entrance portico for all dining and reservation guests.",
  },
  {
    category: "Private Events & Buyouts",
    question: "Can I host a corporate gala or private wedding dinner?",
    answer:
      "Our Heritage Wine Vault accommodates up to 24 seated guests, while full salon buyouts cater to 120 guests with bespoke 7-course tasting menus by Chef Elias.",
  },
];

const BOT_KNOWLEDGE: Record<string, string> = {
  order:
    "You can track live kitchen progress and courier transit under 'Order History' (/orders). If your order is on the road, tap 'Live Radar Map' to view the courier.",
  reserve:
    "Table reservations can be booked online under our Reservations page (/reservations). For parties of 8+, our concierge coordinates custom seating.",
  menu:
    "Our seasonal degustation and à la carte menu can be viewed under /menu. You can customize portions, spice levels, and artisan toppings for every dish.",
  delivery:
    "Our dedicated courier fleet delivers in temperature-insulated packaging within a 15km metropolitan radius. Track live telemetry without third-party delays.",
  corkage:
    "Our wine corkage fee is $35 per 750ml bottle, accompanied by sommelier decanting and crystal glassware.",
  parking:
    "Complimentary valet service is available at the front portico for all lunch and evening dining guests.",
};

export default function CustomerSupportPage() {
  const [messages, setMessages] = useState<SupportMessage[]>([
    {
      id: "msg-1",
      sender: "concierge",
      text: "Greetings. I am your Nimza Concierge Assistant. How may I assist your dining experience or reservation today?",
      time: "Just now",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [ticketCreated, setTicketCreated] = useState<string | null>(null);

  // Ticket form state
  const [ticketName, setTicketName] = useState("");
  const [ticketEmail, setTicketEmail] = useState("");
  const [ticketSubject, setTicketSubject] = useState("Order Assistance");
  const [ticketDetails, setTicketDetails] = useState("");

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: SupportMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    // Simulate instant intelligent concierge reply
    setTimeout(() => {
      let reply =
        "Thank you for your inquiry. Our Head Concierge has received your note and will review it promptly. For urgent table adjustments, you may also call our direct private line.";
      const lower = text.toLowerCase();

      for (const [key, value] of Object.entries(BOT_KNOWLEDGE)) {
        if (lower.includes(key)) {
          reply = value;
          break;
        }
      }

      const botMsg: SupportMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "concierge",
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketName || !ticketEmail || !ticketDetails) {
      toast("Please complete all ticket fields", "error");
      return;
    }

    const ticketId = `NZ-SPT-${Math.floor(1000 + Math.random() * 9000)}`;
    setTicketCreated(ticketId);
    toast(`Support Ticket #${ticketId} created successfully!`, "success");
    setTicketDetails("");
  };

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-charcoal pt-36 pb-28 px-5 md:px-12 selection:bg-gold/20 overflow-x-hidden">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 mb-8 border-b border-sand">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#1F241F] shadow-sm mb-3">
              <Sparkles size={13} className="text-gold" />
              <span>Gastronomy Concierge &amp; Helpdesk</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-[#1F241F] tracking-tight">
              Customer Support
            </h1>
            <p className="text-sm md:text-base text-charcoal/70 mt-2 max-w-2xl font-light leading-relaxed">
              Live automated concierge assistance, instant dining answers, order resolution, and dedicated VIP support tickets.
            </p>
          </div>

          <NimzaLogo variant="badge" size="sm" />
        </div>

        {/* 2-COLUMN MAIN LAYOUT: Interactive Concierge Chat + FAQs & Tickets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Left Column: Interactive Live Concierge Chat Widget */}
          <div className="lg:col-span-6 rounded-[2.5rem] bg-white border-2 border-sand shadow-sm overflow-hidden flex flex-col h-[620px]">
            {/* Chat Header */}
            <div className="p-5 border-b border-sand bg-[#1F241F] text-sand flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-full overflow-hidden border border-gold/70 bg-white/10 grid place-items-center">
                  <Bot size={22} className="text-gold" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-charcoal" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-white text-base">
                    Nimza Live Concierge
                  </h4>
                  <span className="text-[10px] text-gold/80 font-mono">
                    Instant AI Dining Specialist • Online
                  </span>
                </div>
              </div>

              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-sand border border-white/10">
                24/7 Desk
              </span>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="p-3 bg-sand/15 border-b border-sand/50 overflow-x-auto scrollbar-none flex items-center gap-2 text-xs">
              <span className="text-[10px] text-charcoal/50 font-mono shrink-0">Ask:</span>
              {[
                "Where is my order?",
                "Private event bookings",
                "Wine corkage policy",
                "Valet parking",
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip)}
                  className="px-2.5 py-1 rounded-full bg-white border border-sand hover:border-gold hover:text-gold text-[11px] font-medium transition-colors shrink-0 shadow-2xs"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-sand text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-gold text-charcoal font-medium rounded-tr-xs"
                        : "bg-sand/20 text-[#1F241F] border border-sand/60 rounded-tl-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-charcoal/40 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3.5 border-t border-sand bg-[#FAFAF8] flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask our concierge about reservations, dishes, orders..."
                className="flex-1 px-4 py-2.5 rounded-full border border-sand bg-white text-xs outline-none focus:border-gold"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-full bg-gold hover:bg-gold-light text-[#1F241F] disabled:opacity-40 transition-all shrink-0 shadow-2xs font-bold"
              >
                <Send size={15} />
              </button>
            </form>
          </div>

          {/* Right Column: FAQ Knowledge Base & Formal Ticket System */}
          <div className="lg:col-span-6 space-y-8">
            {/* FAQ Accordion */}
            <div className="rounded-[2.5rem] bg-white border-2 border-sand p-6 sm:p-8 shadow-xs">
              <div className="pb-4 mb-4 border-b border-sand">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold block">
                  Knowledge Base
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1F241F]">
                  Frequently Asked Questions
                </h3>
              </div>

              <div className="space-y-3">
                {FAQS.map((faq, idx) => {
                  const isOpen = expandedFaq === idx;

                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-sand/70 bg-sand/15 overflow-hidden transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaq(isOpen ? null : idx)}
                        className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs font-bold text-[#1F241F]"
                      >
                        <span>{faq.question}</span>
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 text-xs text-charcoal/70 leading-relaxed border-t border-sand/40 pt-2 font-light">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Formal Support Ticket Creation */}
            <div className="rounded-[2.5rem] bg-white border-2 border-sand p-6 sm:p-8 shadow-xs">
              <div className="pb-4 mb-4 border-b border-sand">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold block">
                  Direct Escalation
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1F241F]">
                  Submit Concierge Support Ticket
                </h3>
                <p className="text-xs text-charcoal/60 mt-0.5">
                  For event contracts, bespoke tasting adjustments, or billing inquiries.
                </p>
              </div>

              {ticketCreated ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-200 text-emerald-800 grid place-items-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="font-serif text-xl font-bold text-emerald-950">
                    Ticket Logged: {ticketCreated}
                  </h4>
                  <p className="text-xs text-emerald-800 max-w-sm mx-auto">
                    Our Floor Director &amp; Head Sommelier will review your request and reply to your email within two business hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setTicketCreated(null)}
                    className="mt-2 text-xs font-bold text-emerald-900 underline"
                  >
                    Submit another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-charcoal/80 block mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={ticketName}
                        onChange={(e) => setTicketName(e.target.value)}
                        placeholder="Lord Julian Sterling"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-sand focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-charcoal/80 block mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={ticketEmail}
                        onChange={(e) => setTicketEmail(e.target.value)}
                        placeholder="julian@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-sand focus:border-gold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-charcoal/80 block mb-1">Inquiry Topic</label>
                    <select
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand focus:border-gold outline-none bg-white font-medium"
                    >
                      <option value="Order Assistance">Order Assistance &amp; Delivery</option>
                      <option value="Private Dining">Private Dining Room Buyout</option>
                      <option value="Sommelier Consultation">Wine Cellar &amp; Pairing Consultation</option>
                      <option value="Dietary Guidance">Bespoke Allergy &amp; Degustation Plan</option>
                      <option value="Billing & Corporate">Corporate Expense &amp; Invoice Settlement</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-charcoal/80 block mb-1">Details &amp; Notes</label>
                    <textarea
                      rows={3}
                      required
                      value={ticketDetails}
                      onChange={(e) => setTicketDetails(e.target.value)}
                      placeholder="Please share specific requirements or ticket numbers..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand focus:border-gold outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-full bg-gold hover:bg-gold-light text-[#1F241F] font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
                  >
                    Submit Formal Ticket
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
