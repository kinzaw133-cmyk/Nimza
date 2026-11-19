// NIMZA COUPONS & PROMOTIONAL VOUCHERS REPOSITORY

export interface CouponItem {
  code: string;
  title: string;
  discountType: "percentage" | "fixed";
  discountValue: number; // e.g. 10 for 10% or 15 for $15
  minSpendUsd: number;
  description: string;
  badge: string;
  expiryDate: string;
  isActive: boolean;
}

export const INITIAL_COUPONS: CouponItem[] = [
  {
    code: "NIMZA10",
    title: "10% VIP Welcome Privilege",
    discountType: "percentage",
    discountValue: 10,
    minSpendUsd: 0,
    description: "Enjoy 10% off your artisanal culinary experience.",
    badge: "10% OFF",
    expiryDate: "Dec 31, 2027",
    isActive: true,
  },
  {
    code: "TASTE20",
    title: "20% Grand Gastronomy Tasting",
    discountType: "percentage",
    discountValue: 20,
    minSpendUsd: 60,
    description: "20% reduction on fine dining orders exceeding $60 USD.",
    badge: "20% OFF",
    expiryDate: "Ongoing",
    isActive: true,
  },
  {
    code: "VIP10OFF",
    title: "$10 Loyalty Dining Certificate",
    discountType: "fixed",
    discountValue: 10,
    minSpendUsd: 30,
    description: "Redeemed via loyalty points. $10 instant ticket deduction.",
    badge: "$10 OFF",
    expiryDate: "Valid 30 Days",
    isActive: true,
  },
  {
    code: "VIP25OFF",
    title: "$25 Epicurean Master Voucher",
    discountType: "fixed",
    discountValue: 25,
    minSpendUsd: 80,
    description: "Exclusive $25 coupon for orders of $80 or more.",
    badge: "$25 OFF",
    expiryDate: "Valid 60 Days",
    isActive: true,
  },
  {
    code: "CHEFSPECIAL",
    title: "$15 Chef Elias Degustation Credit",
    discountType: "fixed",
    discountValue: 15,
    minSpendUsd: 50,
    description: "Complimentary credit towards signature courses and grilled cuts.",
    badge: "$15 OFF",
    expiryDate: "Limited Reserve",
    isActive: true,
  },
  {
    code: "FREEDELIVERY",
    title: "Complimentary Doorstep Courier Delivery",
    discountType: "fixed",
    discountValue: 5,
    minSpendUsd: 25,
    description: "Waives standard courier transit and priority packaging fee.",
    badge: "FREE TRANSIT",
    expiryDate: "Ongoing",
    isActive: true,
  },
];

export function getStoredCoupons(): CouponItem[] {
  if (typeof window === "undefined") return INITIAL_COUPONS;
  try {
    const raw = localStorage.getItem("nimza_active_coupons");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_COUPONS;
}

export function saveStoredCoupons(coupons: CouponItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("nimza_active_coupons", JSON.stringify(coupons));
    window.dispatchEvent(new Event("nimza_coupons_updated"));
  } catch {}
}

export function validateCoupon(
  code: string,
  subtotal: number
): {
  valid: boolean;
  coupon?: CouponItem;
  discountAmount: number;
  message: string;
} {
  const coupons = getStoredCoupons();
  const match = coupons.find(
    (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive
  );

  if (!match) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Coupon "${code.toUpperCase()}" is invalid or expired.`,
    };
  }

  if (subtotal < match.minSpendUsd) {
    return {
      valid: false,
      coupon: match,
      discountAmount: 0,
      message: `Coupon requires minimum order of $${match.minSpendUsd.toFixed(2)}. Add $${(
        match.minSpendUsd - subtotal
      ).toFixed(2)} more to apply.`,
    };
  }

  let discount = 0;
  if (match.discountType === "percentage") {
    discount = (subtotal * match.discountValue) / 100;
  } else {
    discount = match.discountValue;
  }

  discount = Math.min(subtotal, Number(discount.toFixed(2)));

  return {
    valid: true,
    coupon: match,
    discountAmount: discount,
    message: `Applied ${match.badge}: saved $${discount.toFixed(2)} on your meal!`,
  };
}
