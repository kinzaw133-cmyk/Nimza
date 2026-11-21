"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Check, AlertCircle } from "lucide-react";

export interface CountryInfo {
  code: string; // ISO 2-letter code
  name: string;
  flag: string; // Emoji flag
  dialCode: string; // e.g. "+92"
}

export const COUNTRIES: CountryInfo[] = [
  { code: "PK", name: "Pakistan", flag: "🇵🇰", dialCode: "+92" },
  { code: "US", name: "United States", flag: "🇺🇸", dialCode: "+1" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", dialCode: "+44" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", dialCode: "+971" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", dialCode: "+966" },
  { code: "CA", name: "Canada", flag: "🇨🇦", dialCode: "+1" },
  { code: "AU", name: "Australia", flag: "🇦🇺", dialCode: "+61" },
  { code: "IN", name: "India", flag: "🇮🇳", dialCode: "+91" },
  { code: "DE", name: "Germany", flag: "🇩🇪", dialCode: "+49" },
  { code: "FR", name: "France", flag: "🇫🇷", dialCode: "+33" },
  { code: "IT", name: "Italy", flag: "🇮🇹", dialCode: "+39" },
  { code: "TR", name: "Turkey", flag: "🇹🇷", dialCode: "+90" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", dialCode: "+41" },
  { code: "ES", name: "Spain", flag: "🇪🇸", dialCode: "+34" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", dialCode: "+31" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", dialCode: "+974" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", dialCode: "+965" },
  { code: "OM", name: "Oman", flag: "🇴🇲", dialCode: "+968" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭", dialCode: "+973" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", dialCode: "+65" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", dialCode: "+60" },
  { code: "CN", name: "China", flag: "🇨🇳", dialCode: "+86" },
  { code: "JP", name: "Japan", flag: "🇯🇵", dialCode: "+81" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", dialCode: "+82" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", dialCode: "+62" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", dialCode: "+880" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰", dialCode: "+94" },
  { code: "NP", name: "Nepal", flag: "🇳🇵", dialCode: "+977" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", dialCode: "+27" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", dialCode: "+20" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", dialCode: "+234" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", dialCode: "+254" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", dialCode: "+55" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", dialCode: "+52" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", dialCode: "+64" },
  { code: "IE", name: "Ireland", flag: "🇮🇪", dialCode: "+353" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", dialCode: "+46" },
  { code: "NO", name: "Norway", flag: "🇳🇴", dialCode: "+47" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", dialCode: "+45" },
  { code: "BE", name: "Belgium", flag: "🇧🇪", dialCode: "+32" },
  { code: "AT", name: "Austria", flag: "🇦🇹", dialCode: "+43" },
  { code: "GR", name: "Greece", flag: "🇬🇷", dialCode: "+30" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", dialCode: "+351" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", dialCode: "+63" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", dialCode: "+66" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", dialCode: "+84" },
  { code: "RU", name: "Russia", flag: "🇷🇺", dialCode: "+7" },
  { code: "PL", name: "Poland", flag: "🇵🇱", dialCode: "+48" },
  { code: "JO", name: "Jordan", flag: "🇯🇴", dialCode: "+962" },
  { code: "LB", name: "Lebanon", flag: "🇱🇧", dialCode: "+961" },
];

interface PhoneInputWithCountryProps {
  countryCode: string; // e.g. "+92"
  onCountryCodeChange: (dialCode: string) => void;
  phoneNumber: string; // 11 digits
  onPhoneNumberChange: (phone: string) => void;
  required?: boolean;
  label?: string;
  error?: string;
  placeholder?: string;
  className?: string;
}

export default function PhoneInputWithCountry({
  countryCode,
  onCountryCodeChange,
  phoneNumber,
  onPhoneNumberChange,
  required = false,
  label = "Contact Phone",
  error,
  placeholder = "03001234567",
  className = "",
}: PhoneInputWithCountryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Find currently selected country by dial code or fallback
  const selectedCountry = useMemo(() => {
    return (
      COUNTRIES.find((c) => c.dialCode === countryCode) ||
      COUNTRIES[0] // Pakistan +92 default
    );
  }, [countryCode]);

  // Filter countries by search query
  const filteredCountries = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const q = search.toLowerCase().trim();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Strictly enforce numeric digits only, max 11 digits
  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Strip everything that is not a numeric digit (0-9)
    const digitsOnly = raw.replace(/\D/g, "");
    // Truncate to maximum 11 numbers
    const truncated = digitsOnly.slice(0, 11);
    onPhoneNumberChange(truncated);
  };

  const isComplete = phoneNumber.length === 11;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70">
            {label} {required && <span className="text-gold">*</span>}
          </label>
          <span
            className={`text-[10px] font-mono font-bold transition-colors ${
              isComplete
                ? "text-emerald-700"
                : phoneNumber.length > 0
                ? "text-amber-700"
                : "text-charcoal/50"
            }`}
          >
            {phoneNumber.length}/11 numbers
            {isComplete && " ✓"}
          </span>
        </div>
      )}

      {/* Input Group with Country Code Dropdown Trigger */}
      <div className="relative flex rounded-2xl bg-[#FAFAF8] border border-sand/90 focus-within:border-gold focus-within:ring-1 focus-within:ring-gold transition-all shadow-xs">
        {/* Country Code Trigger Button */}
        <div ref={dropdownRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="h-full px-3.5 py-3 flex items-center gap-2 border-r border-sand/80 bg-sand/20 hover:bg-sand/35 rounded-l-2xl transition-colors text-xs font-semibold text-[#1F241F]"
            title="Select Country Code"
          >
            <span className="text-lg leading-none select-none" role="img" aria-label={selectedCountry.name}>
              {selectedCountry.flag}
            </span>
            <span className="font-mono font-bold text-xs">{selectedCountry.dialCode}</span>
            <ChevronDown size={13} className={`text-charcoal/60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Country Code Dropdown Popover */}
          {isOpen && (
            <div className="absolute left-0 top-full mt-2 w-72 max-h-80 bg-white rounded-2xl border border-sand/80 shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
              {/* Search Header */}
              <div className="p-2.5 border-b border-sand/60 bg-sand/15">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search country or code..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-sand/80 text-charcoal placeholder-charcoal/40 outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Countries List */}
              <div className="overflow-y-auto max-h-60 divide-y divide-sand/30 scrollbar-thin">
                {filteredCountries.length === 0 ? (
                  <div className="p-4 text-center text-xs text-charcoal/50">
                    No country found
                  </div>
                ) : (
                  filteredCountries.map((country) => {
                    const isSelected = country.dialCode === countryCode;
                    return (
                      <button
                        key={`${country.code}-${country.dialCode}`}
                        type="button"
                        onClick={() => {
                          onCountryCodeChange(country.dialCode);
                          setIsOpen(false);
                          setSearch("");
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gold/10 transition-colors text-xs ${
                          isSelected ? "bg-gold/15 font-bold text-[#1F241F]" : "text-charcoal/80"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="text-base select-none">{country.flag}</span>
                          <span className="truncate">{country.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className="font-mono text-charcoal/60 text-[11px] font-semibold">
                            {country.dialCode}
                          </span>
                          {isSelected && <Check size={13} className="text-gold" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* 11-Digit Numbers Only Input Box */}
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={11}
          required={required}
          value={phoneNumber}
          onChange={handlePhoneInputChange}
          placeholder={placeholder}
          className="flex-1 w-full bg-transparent px-4 py-3 text-sm font-mono text-[#1F241F] placeholder:text-charcoal/35 outline-none tracking-wider rounded-r-2xl"
        />
      </div>

      {/* Helper & Validation Notice */}
      {error ? (
        <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
          <AlertCircle size={12} />
          {error}
        </p>
      ) : phoneNumber.length > 0 && phoneNumber.length < 11 ? (
        <p className="text-[11px] text-amber-700 flex items-center gap-1 font-medium">
          <span>⚠️ Exactly 11 digits required (entered {phoneNumber.length} of 11)</span>
        </p>
      ) : null}
    </div>
  );
}
