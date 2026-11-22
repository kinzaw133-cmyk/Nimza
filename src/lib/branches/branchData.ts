// NIMZA MULTI-BRANCH LOCATIONS REPOSITORY
// High-fidelity luxury dining destinations with realtime Google Maps integration

export interface BranchLocation {
  id: string;
  name: string;
  tagline: string;
  address: string;
  cityDistrict: string;
  phone: string;
  email: string;
  headChef: string;
  sommelier: string;
  tableCount: number;
  seatingCapacity: number;
  operatingHours: string;
  status: "Open" | "Near Capacity" | "Private Buyout" | "Closed";
  image_url: string;
  features: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const INITIAL_BRANCHES: BranchLocation[] = [
  {
    id: "branch-downtown",
    name: "Nimza Capital Flagship",
    tagline: "The original culinary hearth & wood-fire pass",
    address: "12 Garden Road, Capital Enclave, Luxury Quarter",
    cityDistrict: "Downtown Capital",
    phone: "+1 (555) 392-1049",
    email: "flagship@nimza.example",
    headChef: "Chef Elias Vance (Brigade Leader)",
    sommelier: "Matteo Laurent",
    tableCount: 18,
    seatingCapacity: 72,
    operatingHours: "12:00 PM – 11:30 PM Daily",
    status: "Open",
    image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    features: [
      "Open Flame Tuscan Wood Grill",
      "Private Salon (16 Guests)",
      "White-Glove Valet Parking",
      "Cellar Wine Vault",
    ],
    coordinates: { lat: 45.4642, lng: 9.1900 },
  },
  {
    id: "branch-marina",
    name: "Nimza Marina Waterfront",
    tagline: "Panoramic coastal terrace & Mediterranean raw bar",
    address: "Pier 7, The Grand Promenade, Marina Boardwalk",
    cityDistrict: "Waterfront Harbour",
    phone: "+1 (555) 749-8201",
    email: "marina@nimza.example",
    headChef: "Chef Clara Moretti",
    sommelier: "Guillaume Roche",
    tableCount: 24,
    seatingCapacity: 96,
    operatingHours: "1:00 PM – 12:00 AM (Tue-Sun)",
    status: "Open",
    image_url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
    features: [
      "Open-Air Sea View Terrace",
      "Wild Oyster & Crudo Raw Bar",
      "Private Yacht Tender Docking",
      "Sunset Cocktail Lounge",
    ],
    coordinates: { lat: 45.4780, lng: 9.2150 },
  },
  {
    id: "branch-heritage",
    name: "Nimza Heritage Reserve & Vault",
    tagline: "Historic stone courtyard & subterranean wine cellar",
    address: "Via Monte 14, Historic Quarter, Renaissance Gate",
    cityDistrict: "Heritage Old Town",
    phone: "+1 (555) 819-3342",
    email: "heritage@nimza.example",
    headChef: "Chef Alessandro Rossi",
    sommelier: "Chiara Bellini",
    tableCount: 14,
    seatingCapacity: 50,
    operatingHours: "5:30 PM – 11:00 PM (Evenings Only)",
    status: "Near Capacity",
    image_url: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80",
    features: [
      "14th Century Stone Vault",
      "Historic Olive Grove Courtyard",
      "Fire Pit Lounge",
      "Rare Vintage Library Service",
    ],
    coordinates: { lat: 45.4510, lng: 9.1780 },
  },
  {
    id: "branch-riviera",
    name: "Nimza Riviera Cliffside Pergola",
    tagline: "Overhanging Mediterranean cliff garden & lemon wood embers",
    address: "Strada Costiera 48, Amalfi Cliff Promenade, Positano Vista",
    cityDistrict: "Amalfi Riviera",
    phone: "+1 (555) 632-4419",
    email: "riviera@nimza.example",
    headChef: "Chef Gianluca Ferri",
    sommelier: "Serena Donati",
    tableCount: 20,
    seatingCapacity: 80,
    operatingHours: "12:30 PM – 11:00 PM (Seasonal)",
    status: "Open",
    image_url: "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&q=80",
    features: [
      "Pergola Ocean Cliffside Views",
      "Wood-Fired Wild Seafood Pit",
      "Capri Limoncello Degustation",
      "Helipad Shuttle Concierge",
    ],
    coordinates: { lat: 40.6281, lng: 14.4850 },
  },
  {
    id: "branch-alpine",
    name: "Nimza Alpine Chalet & Sanctuary",
    tagline: "High-altitude winter lodge, Swiss pinewood hearth & raclette vault",
    address: "Via Serlas 29, Snow Peak Ridge, Upper Engadin",
    cityDistrict: "Alpine Highlands",
    phone: "+1 (555) 902-8871",
    email: "alpine@nimza.example",
    headChef: "Chef Henrik Lindqvist",
    sommelier: "Christoph Steiner",
    tableCount: 16,
    seatingCapacity: 60,
    operatingHours: "11:30 AM – 11:00 PM Daily",
    status: "Open",
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    features: [
      "Open Hearth Alpine Fireplace",
      "Dry-Aged Wagyu & Truffle Fondue",
      "Ski-in Ski-out Snow Terrace",
      "Sub-Zero Champagne Bar",
    ],
    coordinates: { lat: 46.4983, lng: 9.8392 },
  },
  {
    id: "branch-fashion",
    name: "Nimza Quadrilatero Fashion Lounge",
    tagline: "Chic marble champagne atrium & late-night jazz degustation",
    address: "Via Montenapoleone 18, Golden Quad, Haute Couture Boulevard",
    cityDistrict: "Fashion District",
    phone: "+1 (555) 418-7720",
    email: "quadrilatero@nimza.example",
    headChef: "Chef Valentino Russo",
    sommelier: "Giselle Moreau",
    tableCount: 22,
    seatingCapacity: 88,
    operatingHours: "1:00 PM – 1:30 AM Daily",
    status: "Private Buyout",
    image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
    features: [
      "Carrara Marble Tasting Atrium",
      "Live Grand Piano & Jazz Trio",
      "Caviar & Krug Champagne Salon",
      "VIP Private Elevators",
    ],
    coordinates: { lat: 45.4691, lng: 9.1953 },
  },
];

export function getStoredBranches(): BranchLocation[] {
  if (typeof window === "undefined") return INITIAL_BRANCHES;
  try {
    const raw = localStorage.getItem("nimza_branches");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Automatically merge any newly added initial branches if missing
        const existingIds = new Set(parsed.map((p: any) => p.id));
        const missingInitial = INITIAL_BRANCHES.filter((b) => !existingIds.has(b.id));
        if (missingInitial.length > 0) {
          const merged = [...parsed, ...missingInitial];
          localStorage.setItem("nimza_branches", JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    }
  } catch {}
  return INITIAL_BRANCHES;
}

export function saveStoredBranches(branches: BranchLocation[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("nimza_branches", JSON.stringify(branches));
    window.dispatchEvent(new Event("nimza_branches_updated"));
  } catch {}
}

export function resetToDefaultBranches(): BranchLocation[] {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("nimza_branches", JSON.stringify(INITIAL_BRANCHES));
      window.dispatchEvent(new Event("nimza_branches_updated"));
    } catch {}
  }
  return INITIAL_BRANCHES;
}

export function getActiveBranch(): BranchLocation {
  const branches = getStoredBranches();
  if (typeof window === "undefined") return branches[0];
  try {
    const activeId = localStorage.getItem("nimza_active_branch_id");
    const found = branches.find((b) => b.id === activeId);
    if (found) return found;
  } catch {}
  return branches[0];
}

export function setActiveBranch(branchId: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("nimza_active_branch_id", branchId);
    window.dispatchEvent(new Event("nimza_active_branch_changed"));
  } catch {}
}
