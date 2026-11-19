"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  X,
  Send,
  Check,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  ArrowRight,
  Search,
  Flame,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";
import { useSpeechRecognition } from "@/lib/voice/speechRecognition";
import {
  processVoiceCommand,
  ParsedVoiceCommand,
  DEFAULT_FALLBACK_CATALOG,
} from "@/lib/voice/commandProcessor";
import { useCart, FoodCustomization, PortionOption, ToppingOption } from "@/components/Cart";
import { supabase } from "@/lib/supabase";
import { toast } from "@/lib/notify";

export default function VoiceAssistant() {
  const router = useRouter();
  const pathname = usePathname();
  const { items: cartItems, add, remove, chg, clear, total: cartTotal, count: cartCount } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [menuCatalog, setMenuCatalog] = useState<any[]>(DEFAULT_FALLBACK_CATALOG);
  const [pendingCommand, setPendingCommand] = useState<ParsedVoiceCommand | null>(null);
  const [dialogueHistory, setDialogueHistory] = useState<
    Array<{ sender: "user" | "assistant"; text: string; time: string }>
  >([
    {
      sender: "assistant",
      text: "Greetings. I am your Nimza Voice Sommelier. You can speak to order dishes, customize portions and spice, check your cart total, or search our menu.",
      time: "Just now",
    },
  ]);
  const [searchMatches, setSearchMatches] = useState<any[]>([]);

  // Speech Recognition Hook
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
    speak,
    stopSpeaking,
    isSpeaking,
    soundEnabled,
    setSoundEnabled,
  } = useSpeechRecognition();

  const historyEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load latest menu catalog from Supabase or fallback
  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        const { data, error } = await supabase.from("menu_items").select("*").order("id");
        if (!error && data && data.length > 0 && isMounted) {
          setMenuCatalog(data);
        }
      } catch {
        // Fallback already preloaded
      }
    }
    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-scroll conversation history
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dialogueHistory, pendingCommand, searchMatches]);

  // Handle final speech transcript updates from speech recognition
  useEffect(() => {
    if (!transcript) return;

    // Process recognized speech command
    handleProcessText(transcript);
    resetTranscript();
  }, [transcript]);

  // Process text command (from voice or typed input)
  const handleProcessText = useCallback(
    (rawText: string) => {
      const trimmed = rawText.trim();
      if (!trimmed) return;

      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      // Add user dialogue entry
      setDialogueHistory((prev) => [...prev, { sender: "user", text: trimmed, time }]);

      // Check if user is confirming or canceling a pending action
      if (pendingCommand) {
        const lower = trimmed.toLowerCase();
        if (
          lower === "yes" ||
          lower.includes("confirm") ||
          lower.includes("yes please") ||
          lower.includes("add it") ||
          lower.includes("sure") ||
          lower.includes("ok") ||
          lower.includes("okay") ||
          lower.includes("proceed")
        ) {
          executePendingOrder(pendingCommand);
          return;
        } else if (
          lower === "no" ||
          lower.includes("cancel") ||
          lower.includes("nevermind") ||
          lower.includes("stop") ||
          lower.includes("discard")
        ) {
          const cancelMsg = "Order canceled. What else can I assist you with?";
          setDialogueHistory((prev) => [...prev, { sender: "assistant", text: cancelMsg, time }]);
          speak(cancelMsg);
          setPendingCommand(null);
          return;
        }
      }

      // Process through local command processor
      const parsed = processVoiceCommand(trimmed, menuCatalog, {
        items: cartItems,
        total: cartTotal,
        count: cartCount,
      });

      // Handle intents
      switch (parsed.intent) {
        case "ADD_TO_CART": {
          if (parsed.matchedItem && parsed.isActionable) {
            setPendingCommand(parsed);
            setSearchMatches([]);
            setDialogueHistory((prev) => [
              ...prev,
              { sender: "assistant", text: parsed.assistantMessage, time },
            ]);
            speak(parsed.assistantMessage);
          } else {
            setDialogueHistory((prev) => [
              ...prev,
              { sender: "assistant", text: parsed.assistantMessage, time },
            ]);
            speak(parsed.assistantMessage);
          }
          break;
        }

        case "CONFIRM": {
          if (pendingCommand) {
            executePendingOrder(pendingCommand);
          } else {
            const noPendingMsg = "There is no pending dish to confirm. What dish would you like to order?";
            setDialogueHistory((prev) => [
              ...prev,
              { sender: "assistant", text: noPendingMsg, time },
            ]);
            speak(noPendingMsg);
          }
          break;
        }

        case "CANCEL": {
          setPendingCommand(null);
          const cancelMsg = "Understood. The action has been canceled. How else can I assist you?";
          setDialogueHistory((prev) => [
            ...prev,
            { sender: "assistant", text: cancelMsg, time },
          ]);
          speak(cancelMsg);
          break;
        }

        case "VIEW_CART": {
          const viewMsg = `Opening your dining cart. You currently have ${cartCount} items totaling $${cartTotal.toFixed(
            2
          )}.`;
          setDialogueHistory((prev) => [...prev, { sender: "assistant", text: viewMsg, time }]);
          speak(viewMsg);
          router.push("/cart");
          break;
        }

        case "CART_TOTAL": {
          const totalMsg =
            cartCount === 0
              ? "Your cart is currently empty. Would you like to hear our chef's signature dishes?"
              : `Your cart contains ${cartCount} item${cartCount > 1 ? "s" : ""} totaling $${cartTotal.toFixed(
                  2
                )}.`;
          setDialogueHistory((prev) => [...prev, { sender: "assistant", text: totalMsg, time }]);
          speak(totalMsg);
          break;
        }

        case "CHECKOUT": {
          if (cartCount === 0) {
            const emptyMsg = "Your cart is empty. Please add items before proceeding to checkout.";
            setDialogueHistory((prev) => [
              ...prev,
              { sender: "assistant", text: emptyMsg, time },
            ]);
            speak(emptyMsg);
          } else {
            const proceedMsg = `Proceeding to checkout with ${cartCount} items. Subtotal is $${cartTotal.toFixed(
              2
            )}.`;
            setDialogueHistory((prev) => [
              ...prev,
              { sender: "assistant", text: proceedMsg, time },
            ]);
            speak(proceedMsg);
            router.push("/checkout");
          }
          break;
        }

        case "REMOVE_FROM_CART": {
          if (parsed.matchedItem) {
            // Find in current cart items
            const matchedCartItem = cartItems.find(
              (ci) => ci.name.toLowerCase() === parsed.matchedItem.name.toLowerCase()
            );
            if (matchedCartItem) {
              remove(matchedCartItem.cartItemId || matchedCartItem.id);
              const removeMsg = `Removed ${parsed.matchedItem.name} from your cart.`;
              setDialogueHistory((prev) => [
                ...prev,
                { sender: "assistant", text: removeMsg, time },
              ]);
              speak(removeMsg);
              toast(`Removed ${parsed.matchedItem.name} from cart`, "info");
            } else {
              const notFoundMsg = `${parsed.matchedItem.name} is not in your cart.`;
              setDialogueHistory((prev) => [
                ...prev,
                { sender: "assistant", text: notFoundMsg, time },
              ]);
              speak(notFoundMsg);
            }
          }
          break;
        }

        case "UPDATE_QUANTITY": {
          if (parsed.matchedItem && parsed.quantity) {
            const matchedCartItem = cartItems.find(
              (ci) => ci.name.toLowerCase() === parsed.matchedItem.name.toLowerCase()
            );
            if (matchedCartItem) {
              const delta = parsed.quantity - matchedCartItem.qty;
              chg(matchedCartItem.cartItemId || matchedCartItem.id, delta);
              const updateMsg = `Updated ${parsed.matchedItem.name} quantity to ${parsed.quantity}.`;
              setDialogueHistory((prev) => [
                ...prev,
                { sender: "assistant", text: updateMsg, time },
              ]);
              speak(updateMsg);
              toast(updateMsg, "info");
            } else {
              // Not in cart yet, suggest adding
              const addSuggest = `${parsed.matchedItem.name} is not in your cart yet. Would you like me to add ${parsed.quantity} of it?`;
              setPendingCommand({
                ...parsed,
                intent: "ADD_TO_CART",
              });
              setDialogueHistory((prev) => [
                ...prev,
                { sender: "assistant", text: addSuggest, time },
              ]);
              speak(addSuggest);
            }
          }
          break;
        }

        case "CLEAR_CART": {
          if (cartCount === 0) {
            const emptyMsg = "Your cart is already empty.";
            setDialogueHistory((prev) => [
              ...prev,
              { sender: "assistant", text: emptyMsg, time },
            ]);
            speak(emptyMsg);
          } else {
            clear();
            const clearMsg = "Your cart has been cleared.";
            setDialogueHistory((prev) => [
              ...prev,
              { sender: "assistant", text: clearMsg, time },
            ]);
            speak(clearMsg);
            toast("Cart cleared", "info");
          }
          break;
        }

        case "MENU_SEARCH": {
          const filter = (parsed.searchFilter || "").toLowerCase();
          const matches = menuCatalog.filter((item) => {
            const catMatch =
              (item.category_id === 1 && filter.includes("starter")) ||
              (item.category_id === 2 && (filter.includes("main") || filter.includes("course"))) ||
              (item.category_id === 3 && (filter.includes("dessert") || filter.includes("sweet"))) ||
              (item.category_id === 4 && (filter.includes("drink") || filter.includes("beverage")));

            const dietaryMatch =
              filter.includes("veg") &&
              (item.dietary?.toLowerCase().includes("veg") ||
                item.name.toLowerCase().includes("harvest") ||
                item.name.toLowerCase().includes("burrata") ||
                item.name.toLowerCase().includes("margherita"));

            const nameMatch =
              item.name.toLowerCase().includes(filter) ||
              item.description?.toLowerCase().includes(filter);

            return catMatch || dietaryMatch || nameMatch;
          });

          setSearchMatches(matches);
          const searchReply =
            matches.length > 0
              ? `Found ${matches.length} dishes for "${parsed.searchFilter}". You can tap to add any dish directly or ask me to order.`
              : `I couldn't find any dishes under "${parsed.searchFilter}". Try asking for Starters, Main Course, Desserts, or Drinks.`;

          setDialogueHistory((prev) => [
            ...prev,
            { sender: "assistant", text: searchReply, time },
          ]);
          speak(searchReply);
          break;
        }

        case "HELP":
        default: {
          setDialogueHistory((prev) => [
            ...prev,
            { sender: "assistant", text: parsed.assistantMessage, time },
          ]);
          speak(parsed.assistantMessage);
          break;
        }
      }
    },
    [pendingCommand, menuCatalog, cartItems, cartCount, cartTotal, speak, add, remove, chg, clear, router]
  );

  // Execute confirmed order into cart
  const executePendingOrder = (cmd: ParsedVoiceCommand) => {
    if (!cmd.matchedItem) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const qty = cmd.quantity || 1;
    const customization = cmd.customization;

    // Add to existing cart
    add(cmd.matchedItem, customization, qty);

    const confirmationMsg = `Confirmed! Added ${qty}× ${cmd.matchedItem.name} to your dining cart.`;
    setDialogueHistory((prev) => [
      ...prev,
      { sender: "assistant", text: confirmationMsg, time },
    ]);
    speak(confirmationMsg);
    toast(`Added ${qty}× ${cmd.matchedItem.name} to cart`, "success");
    setPendingCommand(null);
  };

  // Manual submission of typed command
  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText("");
    handleProcessText(text);
  };

  // Modify pending quantity
  const handleAdjustPendingQty = (delta: number) => {
    if (!pendingCommand) return;
    const newQty = Math.max(1, (pendingCommand.quantity || 1) + delta);
    setPendingCommand({
      ...pendingCommand,
      quantity: newQty,
    });
  };

  // Quick suggestions
  const SUGGESTIONS = [
    "Add two Truffle Tagliatelle",
    "Order Ribeye Prime with Hot spice",
    "Show me vegetarian dishes",
    "What's my cart total?",
    "Proceed to checkout",
  ];

  // Do not render floating mic button on Admin Panel or Chef Kitchen Display
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/chef")) {
    return null;
  }

  // Calculate pricing for pending order
  const pendingUnitPrice = pendingCommand?.matchedItem
    ? Number(pendingCommand.matchedItem.price) +
      (pendingCommand.customization?.portion.priceDelta || 0) +
      (pendingCommand.customization?.toppings || []).reduce((acc, t) => acc + t.price, 0)
    : 0;

  const pendingSubtotal = pendingUnitPrice * (pendingCommand?.quantity || 1);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40 print:hidden">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative group"
        >
          {/* Subtle pulsating outer aura */}
          <span
            className={`absolute -inset-1 rounded-full blur-md opacity-70 transition-all duration-500 ${
              isListening
                ? "bg-rose-500 animate-pulse"
                : "bg-gold/40 group-hover:bg-gold/70"
            }`}
          />

          <button
            onClick={() => {
              setIsOpen(true);
              if (!isOpen && !isListening && isSupported) {
                // Auto-start listening on open for immediate hands-free interaction
                startListening();
              }
            }}
            aria-label="Open Voice Ordering Assistant"
            className={`relative flex items-center gap-3 pl-2.5 pr-4 py-2 rounded-full shadow-xl transition-all duration-300 border ${
              isListening
                ? "bg-rose-600 text-white border-rose-400 shadow-rose-500/30"
                : "bg-white/95 text-[#1F241F] border-gold/60 hover:border-gold shadow-lg hover:shadow-xl backdrop-blur-md"
            }`}
          >
            <div className="relative shrink-0">
              {/* AI Chef Mascot Avatar */}
              <div className="relative h-11 w-11 rounded-full overflow-hidden border-2 border-gold shadow-md bg-white flex items-center justify-center">
                <img
                  src="/images/ai-chef-avatar.png"
                  alt="AI Chef Voice Mascot"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              {isListening ? (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white items-center justify-center">
                    <Mic className="h-2 w-2 text-white" />
                  </span>
                </span>
              ) : (
                <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-gold text-charcoal border border-white flex items-center justify-center shadow-xs">
                  <Mic className="h-2.5 w-2.5 text-charcoal" />
                </span>
              )}
            </div>

            <div className="hidden sm:flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C6D2D] font-bold leading-none">
                  {isListening ? "Listening Now" : "Voice Sommelier"}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <span className="text-xs font-serif font-bold text-[#1F241F] leading-tight mt-0.5">
                AI Chef Mascot
              </span>
            </div>

            {/* Micro Badge for active cart */}
            {cartCount > 0 && (
              <span className="hidden sm:inline-flex items-center justify-center h-5 w-5 rounded-full bg-gold text-charcoal font-bold text-[10px] ml-1 shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </motion.div>
      </div>

      {/* Luxury Voice Assistant Modal Panel */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full sm:max-w-xl h-[85vh] sm:h-[680px] bg-charcoal rounded-t-3xl sm:rounded-3xl border border-gold/30 shadow-2xl flex flex-col overflow-hidden text-sand"
            >
              {/* Header */}
              <div className="relative px-6 py-4 border-b border-sand/15 bg-charcoal/90 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-gold shadow-md bg-white shrink-0">
                    <img
                      src="/images/ai-chef-avatar.png"
                      alt="AI Chef Mascot"
                      className="w-full h-full object-cover"
                    />
                    {isListening && (
                      <span className="absolute inset-0 rounded-full border-2 border-rose-400 animate-ping opacity-75" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                        Nimza Voice Sommelier
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono tracking-widest uppercase bg-gold/20 text-gold border border-gold/30">
                        AI Chef
                      </span>
                    </div>
                    <p className="text-xs text-sand/60 font-sans">
                      Speak your order naturally to our digital chef
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Sound Toggle Button */}
                  <button
                    onClick={() => {
                      if (isSpeaking) stopSpeaking();
                      setSoundEnabled(!soundEnabled);
                    }}
                    className={`p-2 rounded-full border transition-colors ${
                      soundEnabled
                        ? "border-gold/40 bg-gold/10 text-gold hover:bg-gold/20"
                        : "border-sand/20 text-sand/40 hover:text-sand"
                    }`}
                    title={soundEnabled ? "Mute Voice Speech" : "Unmute Voice Speech"}
                  >
                    {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>

                  {/* Close Assistant */}
                  <button
                    onClick={() => {
                      stopListening();
                      stopSpeaking();
                      setIsOpen(false);
                    }}
                    className="p-2 rounded-full border border-sand/20 text-sand/60 hover:text-white hover:border-sand/40 transition-colors"
                    aria-label="Close Voice Assistant"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Status & Visualizer Ribbon */}
              <div className="px-6 py-3 bg-black/30 border-b border-sand/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {isListening ? (
                    <div className="flex items-center gap-2 text-rose-400">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                      </span>
                      <span className="font-medium font-mono text-[11px] tracking-wide">
                        Listening for commands...
                      </span>
                    </div>
                  ) : isSpeaking ? (
                    <div className="flex items-center gap-2 text-gold">
                      <span className="animate-pulse flex h-2.5 w-2.5 rounded-full bg-gold" />
                      <span className="font-medium font-mono text-[11px] tracking-wide">
                        Sommelier Speaking...
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sand/60">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="font-medium font-mono text-[11px] tracking-wide">
                        Ready • Tap mic or type below
                      </span>
                    </div>
                  )}
                </div>

                {/* Animated Audio Waveform */}
                <div className="flex items-center gap-1 h-4">
                  {[0.4, 0.8, 1.0, 0.6, 0.9, 0.5, 0.7].map((height, idx) => (
                    <motion.span
                      key={idx}
                      className={`w-0.5 rounded-full ${
                        isListening
                          ? "bg-rose-400"
                          : isSpeaking
                          ? "bg-gold"
                          : "bg-sand/20"
                      }`}
                      animate={
                        isListening || isSpeaking
                          ? {
                              height: [`${height * 6}px`, `${height * 18}px`, `${height * 8}px`],
                            }
                          : { height: "4px" }
                      }
                      transition={{
                        repeat: Infinity,
                        duration: 0.6 + idx * 0.08,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Speech Error Banner (Microphone permission / browser support) */}
              {speechError && (
                <div className="px-6 py-2.5 bg-rose-950/70 border-b border-rose-800 text-rose-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={15} className="text-rose-400 shrink-0" />
                    <span>{speechError}</span>
                  </div>
                  <button
                    onClick={() => {
                      resetTranscript();
                      startListening();
                    }}
                    className="ml-2 text-[11px] underline font-medium hover:text-white shrink-0"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Conversation Scroll Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 font-sans text-sm scrollbar-thin scrollbar-thumb-sand/20">
                {dialogueHistory.map((item, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${
                      item.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    {item.sender === "user" ? (
                      <div className="flex flex-col items-end max-w-[85%]">
                        <div className="rounded-2xl px-4 py-3 shadow-md bg-gold text-charcoal font-medium rounded-tr-xs">
                          <p className="leading-relaxed whitespace-pre-wrap">{item.text}</p>
                        </div>
                        <span className="text-[10px] text-sand/40 mt-1 px-1">{item.time}</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5 max-w-[88%]">
                        <div className="relative h-7 w-7 rounded-full overflow-hidden border border-gold/70 shrink-0 bg-white shadow-xs mt-1">
                          <img
                            src="/images/ai-chef-avatar.png"
                            alt="Chef"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col items-start">
                          <div className="rounded-2xl px-4 py-3 shadow-md bg-white/10 text-sand border border-white/10 rounded-tl-xs backdrop-blur-xs">
                            <p className="leading-relaxed whitespace-pre-wrap">{item.text}</p>
                          </div>
                          <span className="text-[10px] text-sand/40 mt-1 px-1">{item.time}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Live Interim Transcript Display while user speaks */}
                {interimTranscript && (
                  <div className="flex flex-col items-end">
                    <div className="max-w-[85%] rounded-2xl px-4 py-2.5 bg-gold/30 text-sand border border-gold/40 italic animate-pulse rounded-tr-xs">
                      <p className="leading-relaxed">“{interimTranscript}...”</p>
                    </div>
                    <span className="text-[10px] text-gold/70 mt-1 px-1">Hearing you...</span>
                  </div>
                )}

                {/* Proposed Order Preview Card (Awaiting user confirmation) */}
                {pendingCommand && pendingCommand.matchedItem && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="w-full rounded-2xl bg-gradient-to-br from-charcoal-tint/90 to-black/80 border-2 border-gold/70 p-4 shadow-xl text-sand space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-sand/20">
                      <span className="text-xs font-mono uppercase tracking-widest text-gold font-bold flex items-center gap-1.5">
                        <ShoppingBag size={14} /> Proposed Order Confirmation
                      </span>
                      <span className="text-[11px] font-sans px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30">
                        Explicit Review
                      </span>
                    </div>

                    <div className="flex items-start gap-3.5">
                      {pendingCommand.matchedItem.image_url && (
                        <img
                          src={pendingCommand.matchedItem.image_url}
                          alt={pendingCommand.matchedItem.name}
                          className="h-16 w-16 rounded-xl object-cover border border-sand/20 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-base font-bold text-white truncate">
                          {pendingCommand.matchedItem.name}
                        </h4>
                        <p className="text-xs text-sand/70 truncate mt-0.5">
                          {pendingCommand.matchedItem.description}
                        </p>

                        {/* Selected Customization Details */}
                        <div className="flex flex-wrap gap-1.5 mt-2 text-[11px]">
                          {pendingCommand.customization?.portion && (
                            <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-medium border border-white/10">
                              Portion: {pendingCommand.customization.portion.label}
                            </span>
                          )}
                          {pendingCommand.customization?.spiceLevel && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30 flex items-center gap-1">
                              <Flame size={11} /> {pendingCommand.customization.spiceLevel}
                            </span>
                          )}
                          {pendingCommand.customization?.toppings &&
                            pendingCommand.customization.toppings.map((top) => (
                              <span
                                key={top.id}
                                className="px-2 py-0.5 rounded-md bg-gold/15 text-gold font-medium border border-gold/30"
                              >
                                + {top.name} (${top.price.toFixed(2)})
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Stepper and Total Price */}
                    <div className="flex items-center justify-between pt-2 border-t border-sand/15">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-sand/70">Quantity:</span>
                        <div className="flex items-center border border-sand/30 rounded-lg overflow-hidden bg-black/40">
                          <button
                            onClick={() => handleAdjustPendingQty(-1)}
                            className="p-1.5 text-sand/70 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="px-3 font-mono text-sm font-bold text-white">
                            {pendingCommand.quantity || 1}
                          </span>
                          <button
                            onClick={() => handleAdjustPendingQty(1)}
                            className="p-1.5 text-sand/70 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-sand/60 block">Item Subtotal</span>
                        <span className="font-serif text-lg font-bold text-gold">
                          ${pendingSubtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => {
                          setPendingCommand(null);
                          const cancelMsg = "Order canceled. What else would you like to explore?";
                          setDialogueHistory((prev) => [
                            ...prev,
                            {
                              sender: "assistant",
                              text: cancelMsg,
                              time: new Date().toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              }),
                            },
                          ]);
                          speak(cancelMsg);
                        }}
                        className="py-2.5 px-3 rounded-xl border border-sand/30 text-sand/80 hover:text-white hover:bg-white/10 text-xs font-medium transition-colors"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={() => executePendingOrder(pendingCommand)}
                        className="py-2.5 px-3 rounded-xl bg-gold text-charcoal hover:bg-gold-light text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <Check size={15} /> Confirm &amp; Add to Cart
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Search / Filter Results display */}
                {searchMatches.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-gold font-bold block">
                      Dishes Found ({searchMatches.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {searchMatches.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2 hover:border-gold/50 transition-colors"
                        >
                          <div className="min-w-0">
                            <h5 className="font-serif text-xs font-bold text-white truncate">
                              {item.name}
                            </h5>
                            <span className="text-[11px] text-gold font-mono">
                              ${Number(item.price).toFixed(2)}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              add(item);
                              toast(`Added ${item.name} to cart`, "success");
                              const addMsg = `Added ${item.name} to your cart.`;
                              setDialogueHistory((prev) => [
                                ...prev,
                                {
                                  sender: "assistant",
                                  text: addMsg,
                                  time: new Date().toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }),
                                },
                              ]);
                              speak(addMsg);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-gold/20 hover:bg-gold text-gold hover:text-charcoal text-[11px] font-bold border border-gold/40 transition-colors shrink-0"
                          >
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={historyEndRef} />
              </div>

              {/* Quick Suggestion Chips */}
              <div className="px-6 py-2 border-t border-sand/10 bg-black/20 overflow-x-auto scrollbar-none flex items-center gap-2">
                <span className="text-[11px] text-sand/50 font-mono shrink-0">Try saying:</span>
                {SUGGESTIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleProcessText(sug)}
                    className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-white/5 hover:bg-gold/20 border border-white/10 hover:border-gold/40 text-sand/80 hover:text-gold transition-colors"
                  >
                    “{sug}”
                  </button>
                ))}
              </div>

              {/* Bottom Interactive Control Bar (Mic Toggle + Editable Text Input Fallback) */}
              <div className="p-4 bg-charcoal border-t border-sand/15">
                <form onSubmit={handleInputSubmit} className="flex items-center gap-2">
                  {/* Large Microphone Control Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isListening) {
                        stopListening();
                      } else {
                        startListening();
                      }
                    }}
                    className={`relative p-3 rounded-2xl border transition-all duration-200 shrink-0 ${
                      isListening
                        ? "bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-900/50"
                        : "bg-white/10 text-gold border-gold/40 hover:bg-gold/20"
                    }`}
                    title={isListening ? "Stop listening" : "Start speaking"}
                  >
                    {isListening ? (
                      <MicOff size={18} className="animate-pulse" />
                    ) : (
                      <Mic size={18} />
                    )}
                  </button>

                  {/* Text Input Fallback / Editable Transcript */}
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={
                        isListening
                          ? "Listening... (or type here)"
                          : "Type a command e.g., 'Add 2 Truffle Tagliatelle'..."
                      }
                      className="w-full rounded-2xl bg-white/5 border border-sand/20 px-4 py-3 text-xs text-white placeholder:text-sand/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-3 rounded-2xl bg-gold text-charcoal hover:bg-gold-light disabled:opacity-40 disabled:hover:bg-gold transition-all shrink-0 font-bold"
                    aria-label="Send text command"
                  >
                    <Send size={16} />
                  </button>
                </form>

                <div className="flex items-center justify-between mt-2.5 px-1 text-[11px] text-sand/40">
                  <span>English natural language processing (zero external AI latency)</span>
                  <button
                    onClick={() => handleProcessText("help")}
                    className="hover:text-gold transition-colors flex items-center gap-1"
                  >
                    <HelpCircle size={12} /> Command Guide
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
