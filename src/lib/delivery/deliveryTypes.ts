// NIMZA DELIVERY MANAGEMENT SYSTEM - CORE TYPES & REPOSITORY

export type DeliveryStatus =
  | "Pending"
  | "Assigned"
  | "Picked Up"
  | "On the Way"
  | "Delivered"
  | "Cancelled";

export interface CourierPersonnel {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar: string;
  vehicle_type: "Motorcycle" | "Electric Scooter" | "Bicycle" | "Car";
  vehicle_plate: string;
  status: "Available" | "On Delivery" | "On Break" | "Off Duty";
  rating: number;
  total_deliveries: number;
  current_lat: number;
  current_lng: number;
  is_active: boolean;
}

export interface DeliveryItemDetail {
  name: string;
  quantity: number;
  price: number;
  customizations?: string;
}

export interface DeliveryOrder {
  id: number;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  city_district: string;
  delivery_notes?: string;
  items: DeliveryItemDetail[];
  total: number;
  payment_method: string;
  payment_status: "Paid" | "Pending" | "Pay on Delivery";
  status: DeliveryStatus;
  driver_id?: string | null;
  driver_name?: string;
  driver_phone?: string;
  driver_vehicle?: string;
  driver_avatar?: string;
  // Geographical coordinates for live radar tracking
  driver_lat: number;
  driver_lng: number;
  dest_lat: number;
  dest_lng: number;
  progress_percent: number; // 0 to 100
  distance_km: number;
  eta_minutes: number;
  speed_kmh?: number;
  assigned_at?: string;
  picked_up_at?: string;
  delivered_at?: string;
}

// Nimza Fine Dining Culinary Kitchen Hub Coordinates (City Center Reference)
export const NIMZA_KITCHEN_COORDS = {
  lat: 45.4642,
  lng: 9.1900,
  name: "Nimza Restaurant & Kitchen Pass",
  address: "14 Via Monte Napoleone, Gastronomy Quarter",
};

// Default Delivery Personnel Fleet
export const DEFAULT_COURIERS: CourierPersonnel[] = [
  {
    id: "driver-1",
    name: "Marco Rossi",
    phone: "+1 (555) 382-9102",
    email: "driver.marco@nimza.example",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    vehicle_type: "Motorcycle",
    vehicle_plate: "NZ-482-B",
    status: "On Delivery",
    rating: 4.9,
    total_deliveries: 184,
    current_lat: 45.4685,
    current_lng: 9.1975,
    is_active: true,
  },
  {
    id: "driver-2",
    name: "Elena Rostova",
    phone: "+1 (555) 749-2041",
    email: "driver.elena@nimza.example",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80",
    vehicle_type: "Electric Scooter",
    vehicle_plate: "NZ-119-V",
    status: "Available",
    rating: 5.0,
    total_deliveries: 240,
    current_lat: 45.4642,
    current_lng: 9.1900,
    is_active: true,
  },
  {
    id: "driver-3",
    name: "Tariq Mansour",
    phone: "+1 (555) 612-8830",
    email: "driver.tariq@nimza.example",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    vehicle_type: "Electric Scooter",
    vehicle_plate: "NZ-734-E",
    status: "Available",
    rating: 4.8,
    total_deliveries: 96,
    current_lat: 45.4642,
    current_lng: 9.1900,
    is_active: true,
  },
  {
    id: "driver-4",
    name: "Lucas Vance",
    phone: "+1 (555) 438-1755",
    email: "driver.lucas@nimza.example",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    vehicle_type: "Car",
    vehicle_plate: "NZ-901-C",
    status: "Off Duty",
    rating: 4.9,
    total_deliveries: 310,
    current_lat: 45.4600,
    current_lng: 9.1850,
    is_active: true,
  },
];

// Initial Delivery Orders with realistic addresses & tracking coordinates
export const DEFAULT_DELIVERY_ORDERS: DeliveryOrder[] = [
  {
    id: 8491,
    created_at: new Date(Date.now() - 22 * 60000).toISOString(),
    customer_name: "Countess Elena Vance",
    customer_phone: "+1 (555) 892-4100",
    delivery_address: "Penthouse 4B, 742 Evergreen Promenade",
    city_district: "Embassy Gardens & Diplomatic Quarter",
    delivery_notes: "Ring bell 4B at private elevator, handle truffle emulsion with care.",
    items: [
      { name: "Truffle Tagliatelle", quantity: 2, price: 18.0, customizations: "Portion: Chef's Standard | Spice: Mild" },
      { name: "Molten Valrhona Sphere", quantity: 1, price: 10.0 },
      { name: "Blood Orange Citrus Spritz", quantity: 2, price: 7.0 },
    ],
    total: 60.0,
    payment_method: "Credit & Debit Cards",
    payment_status: "Paid",
    status: "On the Way",
    driver_id: "driver-1",
    driver_name: "Marco Rossi",
    driver_phone: "+1 (555) 382-9102",
    driver_vehicle: "Motorcycle (NZ-482-B)",
    driver_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    driver_lat: 45.4715,
    driver_lng: 9.2025,
    dest_lat: 45.4780,
    dest_lng: 9.2150,
    progress_percent: 65,
    distance_km: 1.1,
    eta_minutes: 6,
    speed_kmh: 32,
    assigned_at: new Date(Date.now() - 18 * 60000).toISOString(),
    picked_up_at: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 8492,
    created_at: new Date(Date.now() - 14 * 60000).toISOString(),
    customer_name: "Dr. Alistair Finch",
    customer_phone: "+1 (555) 314-5926",
    delivery_address: "Villa 12, Cypress Hilltop Enclave",
    city_district: "Prestige Heights",
    delivery_notes: "Security gate code #8821, leave at front reception door.",
    items: [
      { name: "Grilled Ribeye Prime", quantity: 1, price: 29.0, customizations: "Portion: Grand Tasting (+$5) | Spice: Medium" },
      { name: "Burrata Pugliese", quantity: 1, price: 14.0 },
      { name: "Tiramisu al Mascarpone", quantity: 1, price: 9.0 },
    ],
    total: 57.0,
    payment_method: "Credit & Debit Cards",
    payment_status: "Paid",
    status: "Picked Up",
    driver_id: "driver-2",
    driver_name: "Elena Rostova",
    driver_phone: "+1 (555) 749-2041",
    driver_vehicle: "Electric Scooter (NZ-119-V)",
    driver_avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80",
    driver_lat: 45.4655,
    driver_lng: 9.1915,
    dest_lat: 45.4520,
    dest_lng: 9.1720,
    progress_percent: 15,
    distance_km: 2.8,
    eta_minutes: 14,
    speed_kmh: 24,
    assigned_at: new Date(Date.now() - 8 * 60000).toISOString(),
    picked_up_at: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    id: 8493,
    created_at: new Date(Date.now() - 8 * 60000).toISOString(),
    customer_name: "Sophia Delacroix",
    customer_phone: "+1 (555) 492-8172",
    delivery_address: "Apt 8C, The Glass Tower, 210 Grand Boulevard",
    city_district: "Financial Promenade",
    delivery_notes: "Call upon arrival, do not leave in lobby.",
    items: [
      { name: "Pan-Seared Herb Salmon", quantity: 2, price: 22.0 },
      { name: "Garden Harvest Bowl", quantity: 1, price: 11.0 },
    ],
    total: 55.0,
    payment_method: "Pay on Delivery",
    payment_status: "Pending",
    status: "Pending",
    driver_id: null,
    driver_lat: NIMZA_KITCHEN_COORDS.lat,
    driver_lng: NIMZA_KITCHEN_COORDS.lng,
    dest_lat: 45.4600,
    dest_lng: 9.2080,
    progress_percent: 0,
    distance_km: 3.2,
    eta_minutes: 25,
  },
  {
    id: 8489,
    created_at: new Date(Date.now() - 95 * 60000).toISOString(),
    customer_name: "Lord Julian Sterling",
    customer_phone: "+1 (555) 234-8901",
    delivery_address: "Estate 7, The Heritage Reserve, East Gate",
    city_district: "Royal Park Estates",
    delivery_notes: "Leave with private security checkpoint.",
    items: [
      { name: "Grilled Ribeye Prime", quantity: 2, price: 29.0 },
      { name: "Wood-Fired Margherita", quantity: 1, price: 15.0 },
      { name: "Tiramisu al Mascarpone", quantity: 2, price: 9.0 },
    ],
    total: 91.0,
    payment_method: "Credit & Debit Cards",
    payment_status: "Paid",
    status: "Delivered",
    driver_id: "driver-1",
    driver_name: "Marco Rossi",
    driver_phone: "+1 (555) 382-9102",
    driver_vehicle: "Motorcycle (NZ-482-B)",
    driver_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    driver_lat: 45.4850,
    driver_lng: 9.2200,
    dest_lat: 45.4850,
    dest_lng: 9.2200,
    progress_percent: 100,
    distance_km: 0,
    eta_minutes: 0,
    assigned_at: new Date(Date.now() - 85 * 60000).toISOString(),
    picked_up_at: new Date(Date.now() - 70 * 60000).toISOString(),
    delivered_at: new Date(Date.now() - 48 * 60000).toISOString(),
  },
];

// Helper: Haversine distance in kilometers between two GPS points
export function calculateGpsDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Local Storage helpers for Instant Client-side Reactivity & Multi-tab Sync
export function getStoredDeliveryCouriers(): CourierPersonnel[] {
  if (typeof window === "undefined") return DEFAULT_COURIERS;
  try {
    const raw = localStorage.getItem("nimza_delivery_couriers");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_COURIERS;
}

export function saveStoredDeliveryCouriers(couriers: CourierPersonnel[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("nimza_delivery_couriers", JSON.stringify(couriers));
    window.dispatchEvent(new Event("nimza_delivery_couriers_updated"));
  } catch {}
}

export function getStoredDeliveryOrders(): DeliveryOrder[] {
  if (typeof window === "undefined") return DEFAULT_DELIVERY_ORDERS;
  try {
    const raw = localStorage.getItem("nimza_delivery_orders");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_DELIVERY_ORDERS;
}

export function saveStoredDeliveryOrders(orders: DeliveryOrder[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("nimza_delivery_orders", JSON.stringify(orders));
    window.dispatchEvent(new Event("nimza_delivery_orders_updated"));
  } catch {}
}
