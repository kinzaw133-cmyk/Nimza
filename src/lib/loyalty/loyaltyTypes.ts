// NIMZA VIP GASTRONOMY LOYALTY REWARDS SYSTEM

export type LoyaltyTierKey = "Bronze" | "Silver" | "Gold" | "Platinum";

export interface LoyaltyTier {
  name: LoyaltyTierKey;
  label: string;
  minPoints: number;
  multiplier: number; // e.g. 1.0x, 1.25x, 1.5x, 2.0x points earned per dollar
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  perks: string[];
}

export const LOYALTY_TIERS: Record<LoyaltyTierKey, LoyaltyTier> = {
  Bronze: {
    name: "Bronze",
    label: "Bronze Gourmet",
    minPoints: 0,
    multiplier: 1.0,
    color: "#CD7F32",
    badgeBg: "bg-amber-100",
    badgeBorder: "border-amber-300",
    badgeText: "text-amber-900",
    perks: [
      "1 VIP Point for every $1 spent",
      "Complimentary birthday amuse-bouche",
      "Access to seasonal secret menu dishes",
    ],
  },
  Silver: {
    name: "Silver",
    label: "Silver Connoisseur",
    minPoints: 200,
    multiplier: 1.25,
    color: "#C0C0C0",
    badgeBg: "bg-slate-100",
    badgeBorder: "border-slate-300",
    badgeText: "text-slate-800",
    perks: [
      "1.25x VIP Points multiplier",
      "Priority table seating reservation",
      "Complimentary artisan bread & herb butter",
      "5% automatic privilege savings on wine cellar",
    ],
  },
  Gold: {
    name: "Gold",
    label: "Gold Epicure",
    minPoints: 600,
    multiplier: 1.5,
    color: "#D4AF37",
    badgeBg: "bg-amber-100/80",
    badgeBorder: "border-gold",
    badgeText: "text-amber-950 font-bold",
    perks: [
      "1.5x VIP Points multiplier",
      "Guaranteed window table or chef's counter seating",
      "Complimentary chef's digestif or dessert course",
      "10% privileged dining reduction",
      "Dedicated concierge line for event bookings",
    ],
  },
  Platinum: {
    name: "Platinum",
    label: "Platinum Ambassador",
    minPoints: 1500,
    multiplier: 2.0,
    color: "#E5E4E2",
    badgeBg: "bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200",
    badgeBorder: "border-gold-light",
    badgeText: "text-charcoal font-black",
    perks: [
      "2.0x VIP Points multiplier",
      "Chef Elias personal table visit & bespoke tasting courses",
      "Unlimited complimentary house dessert on all visits",
      "VIP private dining room booking fee waived",
      "Annual invitation to Nimza Harvest Gala",
    ],
  },
};

export interface RedeemablePerk {
  id: string;
  title: string;
  category: "Voucher" | "Dish" | "Experience";
  pointsCost: number;
  cashEquivalentUsd: number;
  description: string;
  image_url: string;
  code: string;
}

export const REDEEMABLE_PERKS: RedeemablePerk[] = [
  {
    id: "perk-1",
    title: "$10 Dining Cash Voucher",
    category: "Voucher",
    pointsCost: 100,
    cashEquivalentUsd: 10,
    description: "Instant $10 deduction applicable on any dine-in or doorstep delivery ticket.",
    image_url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80",
    code: "VIP10OFF",
  },
  {
    id: "perk-2",
    title: "Artisanal Truffle Tiramisu",
    category: "Dish",
    pointsCost: 140,
    cashEquivalentUsd: 14,
    description: "Complimentary single serving of our signature Mascarpone espresso dessert.",
    image_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80",
    code: "FREETIRAMISU",
  },
  {
    id: "perk-3",
    title: "$25 Master Gastronomy Voucher",
    category: "Voucher",
    pointsCost: 220,
    cashEquivalentUsd: 25,
    description: "Generous $25 certificate for fine dining courses, pastas, or ribeye cuts.",
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80",
    code: "VIP25OFF",
  },
  {
    id: "perk-4",
    title: "Sommelier Reserve Wine Flight",
    category: "Experience",
    pointsCost: 350,
    cashEquivalentUsd: 40,
    description: "Three 75ml tasting pours of vintage Italian Chianti Classico & Barolo.",
    image_url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80",
    code: "WINEFLIGHT",
  },
  {
    id: "perk-5",
    title: "Private Kitchen Pass Tour & Tasting",
    category: "Experience",
    pointsCost: 800,
    cashEquivalentUsd: 95,
    description: "15-minute brigade greeting by Chef Elias with kitchen amuse-bouche plating.",
    image_url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&q=80",
    code: "CHEFTOUR",
  },
];

export interface LoyaltyProfile {
  totalPointsEarned: number;
  availablePoints: number;
  redeemedPoints: number;
  currentTier: LoyaltyTierKey;
  nextTierPointsNeeded: number;
  transactions: Array<{
    id: string;
    type: "earned" | "redeemed";
    description: string;
    points: number;
    date: string;
    orderId?: number;
  }>;
}

export const DEFAULT_LOYALTY_PROFILE: LoyaltyProfile = {
  totalPointsEarned: 380,
  availablePoints: 260,
  redeemedPoints: 120,
  currentTier: "Silver",
  nextTierPointsNeeded: 220,
  transactions: [
    {
      id: "tx-1",
      type: "earned",
      description: "Dining Ticket #8492 - Pan-Seared Salmon & Garden Harvest",
      points: 82,
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
      orderId: 8492,
    },
    {
      id: "tx-2",
      type: "redeemed",
      description: "Redeemed: $10 Dining Cash Voucher (Code: VIP10OFF)",
      points: -100,
      date: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: "tx-3",
      type: "earned",
      description: "Dining Ticket #8489 - Prime Ribeye & Truffle Tagliatelle",
      points: 135,
      date: new Date(Date.now() - 14 * 86400000).toISOString(),
      orderId: 8489,
    },
    {
      id: "tx-4",
      type: "earned",
      description: "VIP Welcome Sign-up Bonus Points",
      points: 150,
      date: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
  ],
};

// Storage helper functions
export function getStoredLoyaltyProfile(): LoyaltyProfile {
  if (typeof window === "undefined") return DEFAULT_LOYALTY_PROFILE;
  try {
    const raw = localStorage.getItem("nimza_loyalty_profile");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.availablePoints === "number") {
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_LOYALTY_PROFILE;
}

export function saveStoredLoyaltyProfile(profile: LoyaltyProfile) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("nimza_loyalty_profile", JSON.stringify(profile));
    window.dispatchEvent(new Event("nimza_loyalty_updated"));
  } catch {}
}

export function awardLoyaltyPoints(orderTotal: number, orderId?: number): number {
  const profile = getStoredLoyaltyProfile();
  const tier = LOYALTY_TIERS[profile.currentTier] || LOYALTY_TIERS.Bronze;
  const pointsAwarded = Math.round(orderTotal * tier.multiplier);

  const updatedTotal = profile.totalPointsEarned + pointsAwarded;
  const updatedAvailable = profile.availablePoints + pointsAwarded;

  // Recalculate tier
  let newTier: LoyaltyTierKey = "Bronze";
  if (updatedTotal >= LOYALTY_TIERS.Platinum.minPoints) newTier = "Platinum";
  else if (updatedTotal >= LOYALTY_TIERS.Gold.minPoints) newTier = "Gold";
  else if (updatedTotal >= LOYALTY_TIERS.Silver.minPoints) newTier = "Silver";

  const nextTierPoints =
    newTier === "Platinum"
      ? 0
      : newTier === "Gold"
      ? Math.max(0, LOYALTY_TIERS.Platinum.minPoints - updatedTotal)
      : newTier === "Silver"
      ? Math.max(0, LOYALTY_TIERS.Gold.minPoints - updatedTotal)
      : Math.max(0, LOYALTY_TIERS.Silver.minPoints - updatedTotal);

  const updatedProfile: LoyaltyProfile = {
    ...profile,
    totalPointsEarned: updatedTotal,
    availablePoints: updatedAvailable,
    currentTier: newTier,
    nextTierPointsNeeded: nextTierPoints,
    transactions: [
      {
        id: `tx-${Date.now()}`,
        type: "earned",
        description: `Order Ticket #${orderId || "Online"} Reward (${tier.multiplier}x Multiplier)`,
        points: pointsAwarded,
        date: new Date().toISOString(),
        orderId,
      },
      ...profile.transactions,
    ],
  };

  saveStoredLoyaltyProfile(updatedProfile);
  return pointsAwarded;
}

export function redeemLoyaltyPerk(perk: RedeemablePerk): boolean {
  const profile = getStoredLoyaltyProfile();
  if (profile.availablePoints < perk.pointsCost) return false;

  const updatedProfile: LoyaltyProfile = {
    ...profile,
    availablePoints: profile.availablePoints - perk.pointsCost,
    redeemedPoints: profile.redeemedPoints + perk.pointsCost,
    transactions: [
      {
        id: `tx-${Date.now()}`,
        type: "redeemed",
        description: `Redeemed: ${perk.title} (Promo: ${perk.code})`,
        points: -perk.pointsCost,
        date: new Date().toISOString(),
      },
      ...profile.transactions,
    ],
  };

  saveStoredLoyaltyProfile(updatedProfile);
  return true;
}
