// NIMZA MULTI-BRANCH LOCATIONS REPOSITORY

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
    coordinates: { lat: 45.4642, lng: 9.19 },
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
    coordinates: { lat: 45.478, lng: 9.215 },
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
    coordinates: { lat: 45.451, lng: 9.178 },
  },
];

export function getStoredBranches(): BranchLocation[] {
  if (typeof window === "undefined") return INITIAL_BRANCHES;
  try {
    const raw = localStorage.getItem("nimza_branches");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
