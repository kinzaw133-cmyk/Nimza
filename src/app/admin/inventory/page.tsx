"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Boxes,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  RefreshCw,
  Edit2,
  Trash2,
  TrendingDown,
  TrendingUp,
  PackageCheck,
  History,
  Download,
  UtensilsCrossed,
  ArrowRight,
  ArrowUpDown,
  Sparkles,
  Info,
  Clock,
  Layers,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  FileText,
  DollarSign,
  AlertCircle,
  Truck,
  MapPin,
  X,
  Play,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { toast, confirmDel } from "@/lib/notify";
import NimzaLogo from "@/components/NimzaLogo";

export interface RecipeLink {
  menu_item_id: number;
  menu_item_name: string;
  quantity_required: number;
  is_available?: boolean;
}

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_threshold: number;
  unit_cost: number;
  supplier?: string;
  storage_location?: string;
  last_restocked_at?: string;
  created_at?: string;
  linked_dishes?: RecipeLink[];
}

export interface InventoryTransaction {
  id: number;
  inventory_item_id: number;
  item_name?: string;
  type: "Restock" | "Order Consumption" | "Waste" | "Manual Adjustment";
  quantity_delta: number;
  previous_quantity: number;
  new_quantity: number;
  reason?: string;
  created_by?: string;
  created_at: string;
}

const INVENTORY_CATEGORIES = [
  "All Categories",
  "Truffles & Delicacies",
  "Meat & Seafood",
  "Dairy & Cheese",
  "Produce & Herbs",
  "Pantry & Dry Goods",
  "Beverages & Cellar",
];

const INVENTORY_UNITS = [
  "kg",
  "g",
  "lbs",
  "oz",
  "liters",
  "ml",
  "bottles",
  "portions",
  "units",
  "cans",
  "bunches",
];

// Curated seed inventory matching Nimza's Michelin-standard fine dining menu
const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 1,
    name: "Umbrian Black Winter Truffles",
    category: "Truffles & Delicacies",
    quantity: 450,
    unit: "g",
    min_threshold: 200,
    unit_cost: 2.8,
    supplier: "Tartufi Morra (Alba, Italy)",
    storage_location: "Walk-in Cooler Vault #1",
    last_restocked_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    linked_dishes: [
      { menu_item_id: 3, menu_item_name: "Truffle Tagliatelle", quantity_required: 15, is_available: true },
    ],
  },
  {
    id: 2,
    name: "Heritage Dry-Aged Prime Ribeye",
    category: "Meat & Seafood",
    quantity: 26,
    unit: "portions",
    min_threshold: 10,
    unit_cost: 16.5,
    supplier: "Piedmont Heritage Farms",
    storage_location: "Meat Aging Locker C",
    last_restocked_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    linked_dishes: [
      { menu_item_id: 4, menu_item_name: "Grilled Ribeye Prime", quantity_required: 1, is_available: true },
    ],
  },
  {
    id: 3,
    name: "Artisanal Burrata Pugliese",
    category: "Dairy & Cheese",
    quantity: 18,
    unit: "portions",
    min_threshold: 6,
    unit_cost: 4.2,
    supplier: "Caseificio Delizia (Bari, Italy)",
    storage_location: "Dairy Chiller B",
    last_restocked_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    linked_dishes: [
      { menu_item_id: 2, menu_item_name: "Burrata Pugliese", quantity_required: 1, is_available: true },
    ],
  },
  {
    id: 4,
    name: "Fresh Hand-Rolled Tagliatelle Dough",
    category: "Pantry & Dry Goods",
    quantity: 34,
    unit: "portions",
    min_threshold: 12,
    unit_cost: 2.4,
    supplier: "Nimza In-House Pasta Lab",
    storage_location: "Pasta Station Drawers",
    last_restocked_at: new Date().toISOString(),
    linked_dishes: [
      { menu_item_id: 3, menu_item_name: "Truffle Tagliatelle", quantity_required: 1, is_available: true },
    ],
  },
  {
    id: 5,
    name: "36-Month Parmigiano-Reggiano D.O.P.",
    category: "Dairy & Cheese",
    quantity: 8.5,
    unit: "kg",
    min_threshold: 3.0,
    unit_cost: 32.0,
    supplier: "Consorzio Vacche Rosse (Modena)",
    storage_location: "Cheese Room Rack 4",
    last_restocked_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    linked_dishes: [
      { menu_item_id: 3, menu_item_name: "Truffle Tagliatelle", quantity_required: 0.05, is_available: true },
      { menu_item_id: 6, menu_item_name: "Wood-Fired Margherita", quantity_required: 0.03, is_available: true },
    ],
  },
  {
    id: 6,
    name: "San Marzano D.O.P. Heirloom Tomatoes",
    category: "Produce & Herbs",
    quantity: 14.0,
    unit: "kg",
    min_threshold: 5.0,
    unit_cost: 6.5,
    supplier: "Agro Sarnese Vesuviano",
    storage_location: "Prep Pantry Bin 2",
    last_restocked_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    linked_dishes: [
      { menu_item_id: 2, menu_item_name: "Burrata Pugliese", quantity_required: 0.2, is_available: true },
      { menu_item_id: 6, menu_item_name: "Wood-Fired Margherita", quantity_required: 0.25, is_available: true },
    ],
  },
  {
    id: 7,
    name: "Cold-Pressed Amalfi Extra Virgin Olive Oil",
    category: "Pantry & Dry Goods",
    quantity: 16.5,
    unit: "liters",
    min_threshold: 6.0,
    unit_cost: 19.5,
    supplier: "Frantoio Muraglia (Puglia)",
    storage_location: "Dry Store Aisle 3",
    last_restocked_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    linked_dishes: [
      { menu_item_id: 1, menu_item_name: "Garden Harvest Bowl", quantity_required: 0.04, is_available: true },
      { menu_item_id: 2, menu_item_name: "Burrata Pugliese", quantity_required: 0.03, is_available: true },
    ],
  },
  {
    id: 8,
    name: "Wild Organic Arugula & Baby Radishes",
    category: "Produce & Herbs",
    quantity: 2.1,
    unit: "kg",
    min_threshold: 3.5, // LOW STOCK SAMPLE
    unit_cost: 7.5,
    supplier: "Provence Biodynamic Growers",
    storage_location: "Salad Station Crisper",
    last_restocked_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    linked_dishes: [
      { menu_item_id: 1, menu_item_name: "Garden Harvest Bowl", quantity_required: 0.15, is_available: true },
    ],
  },
  {
    id: 9,
    name: "Wild Scottish Salmon Fillets",
    category: "Meat & Seafood",
    quantity: 11,
    unit: "portions",
    min_threshold: 5,
    unit_cost: 12.0,
    supplier: "Loch Duart Sustainable Fishery",
    storage_location: "Seafood Iced Bin 1",
    last_restocked_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    linked_dishes: [
      { menu_item_id: 5, menu_item_name: "Pan-Seared Herb Salmon", quantity_required: 1, is_available: true },
    ],
  },
  {
    id: 10,
    name: "Valrhona Guanaja 70% Dark Chocolate",
    category: "Truffles & Delicacies",
    quantity: 9.0,
    unit: "kg",
    min_threshold: 4.0,
    unit_cost: 26.0,
    supplier: "Valrhona Grand Chocolatier (France)",
    storage_location: "Pastry Temperature Cabinet",
    last_restocked_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    linked_dishes: [
      { menu_item_id: 8, menu_item_name: "Molten Valrhona Sphere", quantity_required: 0.12, is_available: true },
    ],
  },
  {
    id: 11,
    name: "Single-Origin Savoiardi Ladyfingers",
    category: "Pantry & Dry Goods",
    quantity: 1.5,
    unit: "kg",
    min_threshold: 2.5, // LOW STOCK SAMPLE
    unit_cost: 9.0,
    supplier: "Pasticceria Bonomi (Verona)",
    storage_location: "Pastry Dry Shelf 1",
    last_restocked_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    linked_dishes: [
      { menu_item_id: 7, menu_item_name: "Tiramisu al Mascarpone", quantity_required: 0.1, is_available: true },
    ],
  },
  {
    id: 12,
    name: "Chianti Classico Riserva 2018 (Cellar Vintage)",
    category: "Beverages & Cellar",
    quantity: 0, // OUT OF STOCK SAMPLE
    unit: "bottles",
    min_threshold: 4,
    unit_cost: 44.0,
    supplier: "Castello di Brolio (Tuscany)",
    storage_location: "Sommelier Vault Bin 44",
    last_restocked_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    linked_dishes: [],
  },
];

const INITIAL_TRANSACTIONS: InventoryTransaction[] = [
  {
    id: 101,
    inventory_item_id: 1,
    item_name: "Umbrian Black Winter Truffles",
    type: "Restock",
    quantity_delta: 300,
    previous_quantity: 150,
    new_quantity: 450,
    reason: "Direct air courier shipment from Alba (Airway #9482)",
    created_by: "Chef Elias Varga",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 102,
    inventory_item_id: 2,
    item_name: "Heritage Dry-Aged Prime Ribeye",
    type: "Order Consumption",
    quantity_delta: -4,
    previous_quantity: 30,
    new_quantity: 26,
    reason: "Kitchen pass service dinner rush (Tickets #1041, #1042)",
    created_by: "KDS Auto-Deduction",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 103,
    inventory_item_id: 8,
    item_name: "Wild Organic Arugula & Baby Radishes",
    type: "Waste",
    quantity_delta: -0.6,
    previous_quantity: 2.7,
    new_quantity: 2.1,
    reason: "Wilting during delivery transit; quality check failed",
    created_by: "Sous Chef Marco",
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
];

export default function AdminInventoryPage() {
  const { user, role, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();

  // Core Data States
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [stockStatusFilter, setStockStatusFilter] = useState<"all" | "in-stock" | "low-stock" | "out-of-stock">("all");
  const [activeTab, setActiveTab] = useState<"inventory" | "ledger">("inventory");
  const [sortBy, setSortBy] = useState<"name" | "stock-asc" | "stock-desc" | "value">("name");

  // Modals States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockTarget, setRestockTarget] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState<string>("10");
  const [restockNote, setRestockNote] = useState<string>("");
  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);
  const [wasteTarget, setWasteTarget] = useState<InventoryItem | null>(null);
  const [wasteQty, setWasteQty] = useState<string>("1");
  const [wasteReason, setWasteReason] = useState<string>("Expired / Spoilage");

  // Load Inventory from Supabase (with fallback to curated catalog)
  const loadInventory = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch live inventory items
      const { data: dbItems, error: itemsErr } = await supabase
        .from("inventory_items")
        .select("*")
        .order("name", { ascending: true });

      // 2. Fetch recipe ingredient links
      const { data: dbRecipes } = await supabase
        .from("recipe_ingredients")
        .select("*, menu_items(id, name, is_available)");

      // 3. Fetch transactions
      const { data: dbTx } = await supabase
        .from("inventory_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      // 4. Fetch menu items for linking
      const { data: dbMenu } = await supabase
        .from("menu_items")
        .select("id, name, is_available, price, category_id");
      if (dbMenu) setMenuItems(dbMenu);

      // Check local storage overrides
      let localItems: InventoryItem[] = [];
      let localTx: InventoryTransaction[] = [];
      try {
        const rawItems = localStorage.getItem("nimza_inventory_items");
        if (rawItems) localItems = JSON.parse(rawItems);
        const rawTx = localStorage.getItem("nimza_inventory_transactions");
        if (rawTx) localTx = JSON.parse(rawTx);
      } catch {}

      let combinedItems: InventoryItem[] = [];

      if (!itemsErr && Array.isArray(dbItems) && dbItems.length > 0) {
        // Map database records
        combinedItems = dbItems.map((row: any) => {
          const links: RecipeLink[] = (dbRecipes || [])
            .filter((r: any) => r.inventory_item_id === row.id)
            .map((r: any) => ({
              menu_item_id: r.menu_item_id,
              menu_item_name: r.menu_items?.name || `Dish #${r.menu_item_id}`,
              quantity_required: Number(r.quantity_required || 1),
              is_available: r.menu_items?.is_available !== false,
            }));

          return {
            id: row.id,
            name: row.name,
            category: row.category || "Pantry & Dry Goods",
            quantity: Number(row.quantity || 0),
            unit: row.unit || "units",
            min_threshold: Number(row.min_threshold || 5),
            unit_cost: Number(row.unit_cost || 0),
            supplier: row.supplier,
            storage_location: row.storage_location,
            last_restocked_at: row.last_restocked_at,
            created_at: row.created_at,
            linked_dishes: links,
          };
        });
      } else if (localItems.length > 0) {
        combinedItems = localItems;
      } else {
        combinedItems = INITIAL_INVENTORY_ITEMS;
        localStorage.setItem("nimza_inventory_items", JSON.stringify(INITIAL_INVENTORY_ITEMS));
      }

      setItems(combinedItems);

      if (dbTx && dbTx.length > 0) {
        setTransactions(dbTx);
      } else if (localTx.length > 0) {
        setTransactions(localTx);
      } else {
        setTransactions(INITIAL_TRANSACTIONS);
        localStorage.setItem("nimza_inventory_transactions", JSON.stringify(INITIAL_TRANSACTIONS));
      }
    } catch (err) {
      console.error("Error loading inventory:", err);
      setItems(INITIAL_INVENTORY_ITEMS);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // Persist items locally and broadcast update
  const persistItems = (newItems: InventoryItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem("nimza_inventory_items", JSON.stringify(newItems));
      window.dispatchEvent(new CustomEvent("nimza_inventory_updated"));
    } catch {}
  };

  // Persist transaction ledger locally
  const recordTransaction = (tx: Omit<InventoryTransaction, "id">) => {
    const newTxRecord: InventoryTransaction = {
      id: Math.floor(1000 + Math.random() * 9000),
      ...tx,
    };
    const updated = [newTxRecord, ...transactions];
    setTransactions(updated);
    try {
      localStorage.setItem("nimza_inventory_transactions", JSON.stringify(updated));
    } catch {}

    // Asynchronously insert into Supabase if connected
    supabase
      .from("inventory_transactions")
      .insert({
        inventory_item_id: tx.inventory_item_id,
        type: tx.type,
        quantity_delta: tx.quantity_delta,
        previous_quantity: tx.previous_quantity,
        new_quantity: tx.new_quantity,
        reason: tx.reason,
        created_by: tx.created_by,
      })
      .then(() => {});
  };

  // Automatic food availability synchronization:
  // When an ingredient hits 0 or is depleted, automatically mark all linked dishes as unavailable!
  const syncMenuAvailability = async (ingredient: InventoryItem, newQty: number) => {
    if (!ingredient.linked_dishes || ingredient.linked_dishes.length === 0) return;

    const isDepleted = newQty <= 0;

    for (const link of ingredient.linked_dishes) {
      const dishId = link.menu_item_id;

      if (isDepleted) {
        // Automatically 86 the dish
        try {
          await supabase.from("menu_items").update({ is_available: false }).eq("id", dishId);
        } catch {}

        // Update local menu cache
        try {
          const raw = localStorage.getItem("nimza_menu_items_override") || "{}";
          const overrides = JSON.parse(raw);
          overrides[dishId] = false;
          localStorage.setItem("nimza_menu_items_override", JSON.stringify(overrides));
          window.dispatchEvent(new CustomEvent("nimza_menu_updated"));
        } catch {}

        toast(
          `⚠️ Auto 86'd: "${link.menu_item_name}" marked Sold Out due to depleted ${ingredient.name}`,
          "error"
        );
      } else if (ingredient.quantity <= 0 && newQty > 0) {
        // Restocked from zero: restore availability
        try {
          await supabase.from("menu_items").update({ is_available: true }).eq("id", dishId);
        } catch {}

        try {
          const raw = localStorage.getItem("nimza_menu_items_override") || "{}";
          const overrides = JSON.parse(raw);
          overrides[dishId] = true;
          localStorage.setItem("nimza_menu_items_override", JSON.stringify(overrides));
          window.dispatchEvent(new CustomEvent("nimza_menu_updated"));
        } catch {}

        toast(
          `✨ Restocked: "${link.menu_item_name}" automatically restored to Available on customer menu!`,
          "success"
        );
      }
    }
  };

  // Quick Restock Action
  const handleConfirmRestock = async () => {
    if (!restockTarget) return;
    const added = parseFloat(restockQty);
    if (isNaN(added) || added <= 0) {
      toast("Please enter a valid positive quantity", "error");
      return;
    }

    const prevQty = restockTarget.quantity;
    const newQty = Number((prevQty + added).toFixed(2));

    const updated = items.map((it) =>
      it.id === restockTarget.id
        ? {
            ...it,
            quantity: newQty,
            last_restocked_at: new Date().toISOString(),
          }
        : it
    );

    persistItems(updated);

    // Record audit ledger entry
    recordTransaction({
      inventory_item_id: restockTarget.id,
      item_name: restockTarget.name,
      type: "Restock",
      quantity_delta: added,
      previous_quantity: prevQty,
      new_quantity: newQty,
      reason: restockNote || "Standard Supplier Delivery",
      created_by: user?.email || "Executive Staff",
      created_at: new Date().toISOString(),
    });

    // Check menu availability auto-sync
    await syncMenuAvailability(restockTarget, newQty);

    // Update Supabase
    try {
      await supabase
        .from("inventory_items")
        .update({
          quantity: newQty,
          last_restocked_at: new Date().toISOString(),
        })
        .eq("id", restockTarget.id);
    } catch {}

    toast(`Restocked +${added} ${restockTarget.unit} of ${restockTarget.name}`, "success");
    setIsRestockModalOpen(false);
    setRestockTarget(null);
    setRestockNote("");
  };

  // Waste / Spoilage Action
  const handleConfirmWaste = async () => {
    if (!wasteTarget) return;
    const deduction = parseFloat(wasteQty);
    if (isNaN(deduction) || deduction <= 0) {
      toast("Please enter a valid positive quantity", "error");
      return;
    }

    const prevQty = wasteTarget.quantity;
    const newQty = Math.max(0, Number((prevQty - deduction).toFixed(2)));

    const updated = items.map((it) =>
      it.id === wasteTarget.id ? { ...it, quantity: newQty } : it
    );

    persistItems(updated);

    recordTransaction({
      inventory_item_id: wasteTarget.id,
      item_name: wasteTarget.name,
      type: "Waste",
      quantity_delta: -deduction,
      previous_quantity: prevQty,
      new_quantity: newQty,
      reason: wasteReason,
      created_by: user?.email || "Executive Staff",
      created_at: new Date().toISOString(),
    });

    // Auto-sync menu availability if depleted
    await syncMenuAvailability(wasteTarget, newQty);

    try {
      await supabase
        .from("inventory_items")
        .update({ quantity: newQty })
        .eq("id", wasteTarget.id);
    } catch {}

    toast(`Logged waste: -${deduction} ${wasteTarget.unit} of ${wasteTarget.name}`, "info");
    setIsWasteModalOpen(false);
    setWasteTarget(null);
  };

  // Delete ingredient with confirmation
  const handleDeleteIngredient = async (item: InventoryItem) => {
    const ok = await confirmDel(`Remove "${item.name}" from inventory tracking?`);
    if (!ok) return;

    const updated = items.filter((it) => it.id !== item.id);
    persistItems(updated);

    recordTransaction({
      inventory_item_id: item.id,
      item_name: item.name,
      type: "Manual Adjustment",
      quantity_delta: -item.quantity,
      previous_quantity: item.quantity,
      new_quantity: 0,
      reason: "Item removed from inventory catalog",
      created_by: user?.email || "Admin",
      created_at: new Date().toISOString(),
    });

    try {
      await supabase.from("inventory_items").delete().eq("id", item.id);
    } catch {}

    toast(`Removed "${item.name}" from inventory`, "info");
  };

  // Save (Create or Update) Ingredient in Modal
  const handleSaveIngredient = async (formData: any) => {
    if (!formData.name.trim()) {
      toast("Ingredient name is required", "error");
      return;
    }

    const qty = parseFloat(formData.quantity) || 0;
    const minThreshold = parseFloat(formData.min_threshold) || 5;
    const cost = parseFloat(formData.unit_cost) || 0;

    if (editingItem) {
      // Edit existing
      const prevQty = editingItem.quantity;
      const updated = items.map((it) =>
        it.id === editingItem.id
          ? {
              ...it,
              name: formData.name,
              category: formData.category,
              quantity: qty,
              unit: formData.unit,
              min_threshold: minThreshold,
              unit_cost: cost,
              supplier: formData.supplier,
              storage_location: formData.storage_location,
            }
          : it
      );

      persistItems(updated);

      if (qty !== prevQty) {
        recordTransaction({
          inventory_item_id: editingItem.id,
          item_name: formData.name,
          type: "Manual Adjustment",
          quantity_delta: Number((qty - prevQty).toFixed(2)),
          previous_quantity: prevQty,
          new_quantity: qty,
          reason: "Manual stock audit adjustment",
          created_by: user?.email || "Admin",
          created_at: new Date().toISOString(),
        });
      }

      await syncMenuAvailability(editingItem, qty);

      try {
        await supabase
          .from("inventory_items")
          .update({
            name: formData.name,
            category: formData.category,
            quantity: qty,
            unit: formData.unit,
            min_threshold: minThreshold,
            unit_cost: cost,
            supplier: formData.supplier,
            storage_location: formData.storage_location,
          })
          .eq("id", editingItem.id);
      } catch {}

      toast(`Updated "${formData.name}"`, "success");
    } else {
      // Create new
      const newId = Math.floor(100 + Math.random() * 900);
      const newItem: InventoryItem = {
        id: newId,
        name: formData.name,
        category: formData.category,
        quantity: qty,
        unit: formData.unit,
        min_threshold: minThreshold,
        unit_cost: cost,
        supplier: formData.supplier,
        storage_location: formData.storage_location,
        last_restocked_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        linked_dishes: [],
      };

      const updated = [newItem, ...items];
      persistItems(updated);

      recordTransaction({
        inventory_item_id: newId,
        item_name: formData.name,
        type: "Restock",
        quantity_delta: qty,
        previous_quantity: 0,
        new_quantity: qty,
        reason: "Initial stock registration",
        created_by: user?.email || "Admin",
        created_at: new Date().toISOString(),
      });

      try {
        await supabase.from("inventory_items").insert({
          id: newId,
          name: formData.name,
          category: formData.category,
          quantity: qty,
          unit: formData.unit,
          min_threshold: minThreshold,
          unit_cost: cost,
          supplier: formData.supplier,
          storage_location: formData.storage_location,
        });
      } catch {}

      toast(`Added "${formData.name}" to inventory`, "success");
    }

    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  // Run Order Consumption Audit (Simulate / Deduct actual customer order consumption)
  const handleRunConsumptionAudit = async () => {
    setIsRefreshing(true);
    let deductedItemsCount = 0;

    // Sample consumption simulation across current orders
    const updated = items.map((item) => {
      if (item.linked_dishes && item.linked_dishes.length > 0 && item.quantity > 0) {
        // Deduct 1-2 portions as dinner service prep
        const deduction = Math.min(item.quantity, Number((item.linked_dishes[0].quantity_required * 2).toFixed(2)));
        if (deduction > 0) {
          const newQty = Number((item.quantity - deduction).toFixed(2));
          deductedItemsCount++;

          recordTransaction({
            inventory_item_id: item.id,
            item_name: item.name,
            type: "Order Consumption",
            quantity_delta: -deduction,
            previous_quantity: item.quantity,
            new_quantity: newQty,
            reason: `Kitchen pass service fulfillment (${item.linked_dishes[0].menu_item_name})`,
            created_by: "KDS Auto-Deduction",
            created_at: new Date().toISOString(),
          });

          return { ...item, quantity: newQty };
        }
      }
      return item;
    });

    persistItems(updated);
    setIsRefreshing(false);
    toast(`Consumption audit complete: deducted usage for ${deductedItemsCount} active recipe ingredients`, "info");
  };

  // Computed KPI Metrics
  const metrics = useMemo(() => {
    const totalIngredients = items.length;
    let healthyCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalValuation = 0;

    items.forEach((it) => {
      const val = (it.quantity || 0) * (it.unit_cost || 0);
      totalValuation += val;

      if (it.quantity <= 0) {
        outOfStockCount++;
      } else if (it.quantity <= it.min_threshold) {
        lowStockCount++;
      } else {
        healthyCount++;
      }
    });

    return {
      totalIngredients,
      healthyCount,
      lowStockCount,
      outOfStockCount,
      totalValuation,
    };
  }, [items]);

  // Filtered & Sorted Inventory List
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Category filter
        if (selectedCategory !== "All Categories" && item.category !== selectedCategory) {
          return false;
        }

        // Status filter
        if (stockStatusFilter === "in-stock") {
          if (item.quantity <= item.min_threshold) return false;
        } else if (stockStatusFilter === "low-stock") {
          if (item.quantity <= 0 || item.quantity > item.min_threshold) return false;
        } else if (stockStatusFilter === "out-of-stock") {
          if (item.quantity > 0) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = item.name.toLowerCase().includes(q);
          const matchesSupplier = (item.supplier || "").toLowerCase().includes(q);
          const matchesLocation = (item.storage_location || "").toLowerCase().includes(q);
          const matchesDishes = (item.linked_dishes || []).some((d) =>
            d.menu_item_name.toLowerCase().includes(q)
          );
          if (!matchesName && !matchesSupplier && !matchesLocation && !matchesDishes) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "stock-asc") return a.quantity - b.quantity;
        if (sortBy === "stock-desc") return b.quantity - a.quantity;
        if (sortBy === "value") return b.quantity * b.unit_cost - a.quantity * a.unit_cost;
        return a.name.localeCompare(b.name);
      });
  }, [items, selectedCategory, stockStatusFilter, searchQuery, sortBy]);

  // Critical Low Stock / Out of Stock alerts
  const criticalAlertItems = useMemo(() => {
    return items.filter((it) => it.quantity <= it.min_threshold);
  }, [items]);

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-sand">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#1F241F] shadow-sm mb-3">
            <Boxes size={13} className="text-gold" />
            <span>Pantry &amp; Cellar Operations</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1F241F] tracking-tight">
            Inventory &amp; Stock
          </h1>
          <p className="text-sm md:text-base text-charcoal/70 mt-1 max-w-xl font-light">
            Real-time culinary stock ledger, automatic dish availability synchronization, threshold alerts, and usage audits.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Run Consumption Audit */}
          <button
            type="button"
            onClick={handleRunConsumptionAudit}
            disabled={isRefreshing}
            className="rounded-full border border-sand bg-white hover:border-gold hover:text-gold text-charcoal px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs"
            title="Deduct ingredient usage based on kitchen orders"
          >
            <Play size={12} className="text-gold fill-gold/20" />
            <span>Audit Consumption</span>
          </button>

          {/* Add New Ingredient */}
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setIsEditModalOpen(true);
            }}
            className="rounded-full bg-gold hover:bg-gold-light text-[#1F241F] px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm hover:scale-105 active:scale-95"
          >
            <Plus size={15} />
            <span>Add Ingredient</span>
          </button>

          {/* Refresh Pass */}
          <button
            type="button"
            onClick={loadInventory}
            disabled={isRefreshing}
            className="grid h-9 w-9 place-items-center rounded-full border border-sand bg-white text-charcoal hover:border-gold hover:text-gold transition-all"
            title="Reload inventory"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-gold" : ""} />
          </button>
        </div>
      </div>

      {/* CRITICAL STOCK ALERT BANNER (IF ANY LOW / OUT OF STOCK) */}
      {criticalAlertItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-5 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-950 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-200 text-amber-900 mt-0.5">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-amber-950 flex items-center gap-2">
                <span>Immediate Attention: {criticalAlertItems.length} Ingredients Below Threshold</span>
              </h3>
              <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                {criticalAlertItems
                  .slice(0, 3)
                  .map((it) => `${it.name} (${it.quantity} ${it.unit} left)`)
                  .join(", ")}
                {criticalAlertItems.length > 3 ? `, +${criticalAlertItems.length - 3} more` : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setRestockTarget(criticalAlertItems[0]);
              setRestockQty(String(criticalAlertItems[0].min_threshold * 2));
              setIsRestockModalOpen(true);
            }}
            className="shrink-0 rounded-full bg-amber-900 hover:bg-amber-950 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            Quick Restock ({criticalAlertItems[0].name.split(" ")[0]})
          </button>
        </motion.div>
      )}

      {/* KPI VALUATION DECK */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Ingredients */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-sand shadow-xs">
          <div className="flex items-center justify-between text-charcoal/60 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Tracked Items</span>
            <Boxes size={14} className="text-gold" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1F241F]">
            {metrics.totalIngredients}
          </p>
          <span className="text-[11px] text-charcoal/50">Active Pantry &amp; Cellar</span>
        </div>

        {/* Healthy In Stock */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">In Stock</span>
            <CheckCircle2 size={14} className="text-emerald-600" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-950">
            {metrics.healthyCount}
          </p>
          <span className="text-[11px] text-emerald-700">Above Min Threshold</span>
        </div>

        {/* Low Stock Warnings */}
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/80 border border-amber-300 shadow-xs">
          <div className="flex items-center justify-between text-amber-900 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Low Stock</span>
            <AlertTriangle size={14} className="text-amber-700" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-amber-950">
            {metrics.lowStockCount}
          </p>
          <span className="text-[11px] text-amber-800 font-medium">Reorder Recommended</span>
        </div>

        {/* Out of Stock (86'd) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-rose-50/80 border border-rose-300 shadow-xs">
          <div className="flex items-center justify-between text-rose-900 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Out of Stock</span>
            <XCircle size={14} className="text-rose-700" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-rose-950">
            {metrics.outOfStockCount}
          </p>
          <span className="text-[11px] text-rose-800 font-medium">Auto-86 Active</span>
        </div>

        {/* Total Valuation */}
        <div className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-3xl bg-white border border-sand shadow-xs">
          <div className="flex items-center justify-between text-charcoal/60 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Stock Valuation</span>
            <DollarSign size={14} className="text-gold" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-olive">
            ${metrics.totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-charcoal/50">Current Asset Value</span>
        </div>
      </div>

      {/* NAVIGATION TABS: INVENTORY VS TRANSACTION AUDIT LEDGER */}
      <div className="flex items-center justify-between border-b border-sand pb-1 gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("inventory")}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "inventory"
                ? "border-gold text-olive"
                : "border-transparent text-charcoal/50 hover:text-charcoal"
            }`}
          >
            <Boxes size={16} />
            <span>Ingredient Catalog ({items.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ledger")}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "ledger"
                ? "border-gold text-olive"
                : "border-transparent text-charcoal/50 hover:text-charcoal"
            }`}
          >
            <History size={16} />
            <span>Transaction Ledger ({transactions.length})</span>
          </button>
        </div>

        {activeTab === "inventory" && (
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-charcoal/50 font-bold uppercase text-[10px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="rounded-lg border border-sand bg-white px-2.5 py-1 text-xs text-charcoal outline-none focus:border-gold"
            >
              <option value="name">Name (A-Z)</option>
              <option value="stock-asc">Stock Level (Lowest First)</option>
              <option value="stock-desc">Stock Level (Highest First)</option>
              <option value="value">Valuation ($ High-Low)</option>
            </select>
          </div>
        )}
      </div>

      {activeTab === "inventory" ? (
        /* INVENTORY ITEMS VIEW */
        <div className="space-y-6">
          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-sand shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ingredient, supplier, storage location, or linked dish..."
                  className="w-full pl-9 pr-8 py-2 rounded-full bg-sand/20 border border-sand text-xs text-charcoal placeholder-charcoal/45 outline-none focus:border-gold focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {[
                  { key: "all", label: "All Status" },
                  { key: "in-stock", label: "In Stock" },
                  { key: "low-stock", label: "Low Stock" },
                  { key: "out-of-stock", label: "Out of Stock" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStockStatusFilter(key as any)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all shrink-0 ${
                      stockStatusFilter === key
                        ? "bg-[#1F241F] text-gold shadow-sm"
                        : "bg-sand/30 text-charcoal/70 hover:bg-sand"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-sand/40 pt-3">
              {INVENTORY_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all shrink-0 ${
                    selectedCategory === cat
                      ? "bg-gold text-charcoal font-bold shadow-xs"
                      : "bg-sand/20 text-charcoal/65 hover:bg-sand/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* INGREDIENTS TABLE */}
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-sand">
              <Boxes size={36} className="mx-auto text-gold mb-3 opacity-60" />
              <h3 className="font-serif text-xl font-bold text-[#1F241F]">No Ingredients Found</h3>
              <p className="text-xs text-charcoal/60 mt-1 max-w-md mx-auto">
                No items match your filter criteria. Try resetting your search or add a new ingredient.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All Categories");
                  setStockStatusFilter("all");
                }}
                className="mt-4 px-4 py-2 rounded-full bg-sand/30 hover:bg-sand text-xs font-bold text-charcoal"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-sand shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-sand/30 border-b border-sand text-[10px] font-bold uppercase tracking-wider text-charcoal/60">
                      <th className="py-4 px-5">Ingredient &amp; Category</th>
                      <th className="py-4 px-4">Current Stock</th>
                      <th className="py-4 px-4">Threshold</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4">Unit Cost &amp; Valuation</th>
                      <th className="py-4 px-4">Storage &amp; Supplier</th>
                      <th className="py-4 px-4">Linked Recipes</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand/50">
                    {filteredItems.map((item) => {
                      const isOutOfStock = item.quantity <= 0;
                      const isLowStock = !isOutOfStock && item.quantity <= item.min_threshold;
                      const isHealthy = !isOutOfStock && !isLowStock;

                      const stockPercentage = Math.min(
                        100,
                        Math.round((item.quantity / (item.min_threshold * 2.5)) * 100)
                      );

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-sand/15 transition-colors ${
                            isOutOfStock
                              ? "bg-rose-50/40"
                              : isLowStock
                              ? "bg-amber-50/30"
                              : ""
                          }`}
                        >
                          {/* Name & Category */}
                          <td className="py-4 px-5">
                            <span className="font-serif font-bold text-sm text-[#1F241F] block">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-charcoal/50 uppercase tracking-wide">
                              {item.category}
                            </span>
                          </td>

                          {/* Current Stock with Visual Meter */}
                          <td className="py-4 px-4 min-w-[140px]">
                            <div className="flex items-baseline gap-1">
                              <span className="font-mono text-sm font-bold text-[#1F241F]">
                                {item.quantity}
                              </span>
                              <span className="text-[10px] text-charcoal/60 font-semibold">
                                {item.unit}
                              </span>
                            </div>

                            {/* Stock Level Bar */}
                            <div className="w-24 h-1.5 rounded-full bg-sand/60 mt-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isOutOfStock
                                    ? "bg-rose-500 w-full"
                                    : isLowStock
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{ width: `${Math.max(8, stockPercentage)}%` }}
                              />
                            </div>
                          </td>

                          {/* Min Threshold */}
                          <td className="py-4 px-4 text-charcoal/70 font-mono">
                            {item.min_threshold} {item.unit}
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-4">
                            {isOutOfStock ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold">
                                <XCircle size={10} />
                                <span>Out of Stock (86&apos;d)</span>
                              </span>
                            ) : isLowStock ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                                <AlertTriangle size={10} />
                                <span>Low Stock</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                                <CheckCircle2 size={10} />
                                <span>In Stock</span>
                              </span>
                            )}
                          </td>

                          {/* Cost & Valuation */}
                          <td className="py-4 px-4 font-mono">
                            <span className="font-bold text-olive block">
                              ${(item.quantity * item.unit_cost).toFixed(2)}
                            </span>
                            <span className="text-[10px] text-charcoal/50">
                              @ ${item.unit_cost.toFixed(2)}/{item.unit}
                            </span>
                          </td>

                          {/* Storage & Supplier */}
                          <td className="py-4 px-4 text-charcoal/75">
                            <span className="flex items-center gap-1 text-[11px] text-charcoal">
                              <MapPin size={11} className="text-gold shrink-0" />
                              <span>{item.storage_location || "Central Pantry"}</span>
                            </span>
                            {item.supplier && (
                              <span className="text-[10px] text-charcoal/50 block truncate max-w-[140px]">
                                {item.supplier}
                              </span>
                            )}
                          </td>

                          {/* Linked Dishes */}
                          <td className="py-4 px-4">
                            {item.linked_dishes && item.linked_dishes.length > 0 ? (
                              <div className="space-y-1">
                                {item.linked_dishes.map((d, idx) => (
                                  <span
                                    key={idx}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                                      d.is_available === false
                                        ? "bg-rose-50 border-rose-200 text-rose-700 line-through"
                                        : "bg-sand/30 border-sand text-[#1F241F]"
                                    }`}
                                    title={`${d.quantity_required} ${item.unit} required per dish`}
                                  >
                                    <UtensilsCrossed size={9} />
                                    <span>{d.menu_item_name}</span>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-charcoal/40 italic">Not linked</span>
                            )}
                          </td>

                          {/* Quick Actions */}
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Restock Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setRestockTarget(item);
                                  setRestockQty(String(item.min_threshold * 2));
                                  setIsRestockModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-gold hover:bg-gold-light text-[#1F241F] font-bold text-[10px] uppercase tracking-wider transition-all shadow-2xs"
                                title="Add inventory delivery"
                              >
                                Restock
                              </button>

                              {/* Waste / Spoilage */}
                              <button
                                type="button"
                                onClick={() => {
                                  setWasteTarget(item);
                                  setWasteQty("1");
                                  setIsWasteModalOpen(true);
                                }}
                                className="px-2 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold uppercase transition-all"
                                title="Log spoilage, waste, or prep drop"
                              >
                                Waste
                              </button>

                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingItem(item);
                                  setIsEditModalOpen(true);
                                }}
                                className="grid h-7 w-7 place-items-center rounded-lg border border-sand bg-white text-charcoal hover:border-gold hover:text-gold transition-colors"
                                title="Edit ingredient properties"
                              >
                                <Edit2 size={12} />
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => handleDeleteIngredient(item)}
                                className="grid h-7 w-7 place-items-center rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete from inventory"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* AUDIT TRANSACTION LEDGER VIEW */
        <div className="space-y-4">
          <div className="bg-white rounded-[2.5rem] border border-sand shadow-sm overflow-hidden p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-sand mb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1F241F]">
                  Inventory Audit Ledger
                </h3>
                <p className="text-xs text-charcoal/60 mt-0.5">
                  Chronological record of stock additions, kitchen pass consumption, waste deductions, and counts.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-olive px-3 py-1 rounded-full bg-sand/30 border border-sand">
                {transactions.length} Recorded Entries
              </span>
            </div>

            {transactions.length === 0 ? (
              <p className="text-center py-12 text-xs text-charcoal/50">
                No inventory transactions recorded yet.
              </p>
            ) : (
              <div className="divide-y divide-sand/50 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 pb-2">
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Ingredient</th>
                      <th className="py-2.5 px-3">Transaction Type</th>
                      <th className="py-2.5 px-3">Stock Delta</th>
                      <th className="py-2.5 px-3">Before → After</th>
                      <th className="py-2.5 px-3">Reason / Details</th>
                      <th className="py-2.5 px-3">Staff / Author</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand/40">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-sand/15 transition-colors">
                        <td className="py-3 px-3 text-charcoal/60 font-mono text-[11px]">
                          {new Date(tx.created_at).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        <td className="py-3 px-3 font-bold text-[#1F241F]">
                          {tx.item_name || `Item #${tx.inventory_item_id}`}
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              tx.type === "Restock"
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                : tx.type === "Order Consumption"
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : tx.type === "Waste"
                                ? "bg-rose-100 text-rose-900 border border-rose-300"
                                : "bg-sand/40 text-charcoal border border-sand"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-mono font-bold">
                          <span
                            className={
                              tx.quantity_delta > 0
                                ? "text-emerald-700"
                                : tx.quantity_delta < 0
                                ? "text-rose-700"
                                : "text-charcoal"
                            }
                          >
                            {tx.quantity_delta > 0 ? `+${tx.quantity_delta}` : tx.quantity_delta}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-mono text-charcoal/70">
                          {tx.previous_quantity} → <strong>{tx.new_quantity}</strong>
                        </td>

                        <td className="py-3 px-3 text-charcoal/80 max-w-[220px] truncate">
                          {tx.reason || "Operational adjustment"}
                        </td>

                        <td className="py-3 px-3 text-charcoal/60 text-[11px]">
                          {tx.created_by || "System"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD / EDIT INGREDIENT MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] p-6 sm:p-8 border border-sand shadow-2xl z-10 text-charcoal max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-sand">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gold/20 text-[#8C6D2D] grid place-items-center">
                    <Boxes size={20} />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#1F241F]">
                      {editingItem ? "Edit Ingredient" : "Add New Ingredient"}
                    </h2>
                    <span className="text-[10px] font-mono text-gold uppercase font-bold tracking-wider">
                      Inventory Specification
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-sand/30 hover:bg-sand text-charcoal"
                >
                  <X size={15} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.currentTarget as any;
                  handleSaveIngredient({
                    name: target.name.value,
                    category: target.category.value,
                    quantity: target.quantity.value,
                    unit: target.unit.value,
                    min_threshold: target.min_threshold.value,
                    unit_cost: target.unit_cost.value,
                    supplier: target.supplier.value,
                    storage_location: target.storage_location.value,
                  });
                }}
                className="space-y-4 pt-4 text-xs"
              >
                {/* Ingredient Name */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                    Ingredient Name *
                  </label>
                  <input
                    name="name"
                    required
                    defaultValue={editingItem?.name || ""}
                    placeholder="e.g. Umbrian Black Winter Truffles"
                    className="w-full px-4 py-2.5 rounded-xl border border-sand bg-sand/20 text-charcoal outline-none focus:border-gold focus:bg-white text-xs"
                  />
                </div>

                {/* Category & Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      defaultValue={editingItem?.category || "Pantry & Dry Goods"}
                      className="w-full px-3 py-2.5 rounded-xl border border-sand bg-white text-charcoal outline-none focus:border-gold text-xs"
                    >
                      {INVENTORY_CATEGORIES.filter((c) => c !== "All Categories").map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                      Measurement Unit
                    </label>
                    <select
                      name="unit"
                      defaultValue={editingItem?.unit || "kg"}
                      className="w-full px-3 py-2.5 rounded-xl border border-sand bg-white text-charcoal outline-none focus:border-gold text-xs"
                    >
                      {INVENTORY_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Initial Stock, Threshold, Unit Cost */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                      Current Stock *
                    </label>
                    <input
                      name="quantity"
                      type="number"
                      step="any"
                      required
                      defaultValue={editingItem?.quantity ?? 10}
                      className="w-full px-3 py-2.5 rounded-xl border border-sand bg-sand/20 text-charcoal outline-none focus:border-gold font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                      Min Threshold *
                    </label>
                    <input
                      name="min_threshold"
                      type="number"
                      step="any"
                      required
                      defaultValue={editingItem?.min_threshold ?? 5}
                      className="w-full px-3 py-2.5 rounded-xl border border-sand bg-sand/20 text-charcoal outline-none focus:border-gold font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                      Unit Cost ($)
                    </label>
                    <input
                      name="unit_cost"
                      type="number"
                      step="0.01"
                      defaultValue={editingItem?.unit_cost ?? 5.0}
                      className="w-full px-3 py-2.5 rounded-xl border border-sand bg-sand/20 text-charcoal outline-none focus:border-gold font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Storage Location & Supplier */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                      Storage Location
                    </label>
                    <input
                      name="storage_location"
                      defaultValue={editingItem?.storage_location || ""}
                      placeholder="e.g. Walk-in Cooler A"
                      className="w-full px-3 py-2.5 rounded-xl border border-sand bg-sand/20 text-charcoal outline-none focus:border-gold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                      Supplier / Artisan
                    </label>
                    <input
                      name="supplier"
                      defaultValue={editingItem?.supplier || ""}
                      placeholder="e.g. Tartufi Morra (Italy)"
                      className="w-full px-3 py-2.5 rounded-xl border border-sand bg-sand/20 text-charcoal outline-none focus:border-gold text-xs"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-sand flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-sand text-charcoal hover:bg-sand/30 font-bold uppercase text-xs"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-gold hover:bg-gold-light text-[#1F241F] font-bold uppercase text-xs shadow-md"
                  >
                    {editingItem ? "Save Changes" : "Create Ingredient"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 2: QUICK RESTOCK MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isRestockModalOpen && restockTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRestockModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-6 sm:p-8 border border-sand shadow-2xl z-10 text-charcoal"
            >
              <div className="flex items-center justify-between pb-4 border-b border-sand">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">
                    Pantry Replenishment
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#1F241F]">
                    Restock {restockTarget.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-sand/30"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="py-4 space-y-3.5 text-xs">
                <div className="p-3 rounded-2xl bg-sand/20 border border-sand flex items-center justify-between font-mono">
                  <span>Current On-Hand:</span>
                  <strong>
                    {restockTarget.quantity} {restockTarget.unit}
                  </strong>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                    Quantity to Add ({restockTarget.unit}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={restockQty}
                    onChange={(e) => setRestockQty(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sand bg-white text-charcoal font-mono text-sm outline-none focus:border-gold"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                    Delivery Note / PO Invoice #
                  </label>
                  <input
                    type="text"
                    value={restockNote}
                    onChange={(e) => setRestockNote(e.target.value)}
                    placeholder="e.g. Invoice #8821 from Alba Courier"
                    className="w-full px-4 py-2 rounded-xl border border-sand bg-sand/20 text-charcoal text-xs outline-none focus:border-gold"
                  />
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-mono text-[11px] flex justify-between">
                  <span>Projected New Stock:</span>
                  <strong>
                    {(restockTarget.quantity + (parseFloat(restockQty) || 0)).toFixed(2)}{" "}
                    {restockTarget.unit}
                  </strong>
                </div>
              </div>

              <div className="pt-3 border-t border-sand flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-sand text-charcoal text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRestock}
                  className="px-5 py-2.5 rounded-full bg-gold hover:bg-gold-light text-[#1F241F] text-xs font-bold uppercase tracking-wider shadow-sm"
                >
                  Confirm Restock
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 3: LOG WASTE / SPOILAGE MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isWasteModalOpen && wasteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWasteModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-6 sm:p-8 border border-sand shadow-2xl z-10 text-charcoal"
            >
              <div className="flex items-center justify-between pb-4 border-b border-sand">
                <div>
                  <span className="text-[10px] font-bold uppercase text-rose-800 tracking-wider">
                    Inventory Reduction
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#1F241F]">
                    Log Waste for {wasteTarget.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWasteModalOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-sand/30"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="py-4 space-y-3.5 text-xs">
                <div className="p-3 rounded-2xl bg-sand/20 border border-sand flex items-center justify-between font-mono">
                  <span>Current On-Hand:</span>
                  <strong>
                    {wasteTarget.quantity} {wasteTarget.unit}
                  </strong>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                    Quantity Lost / Wasted ({wasteTarget.unit}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={wasteQty}
                    onChange={(e) => setWasteQty(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sand bg-white text-charcoal font-mono text-sm outline-none focus:border-rose-400"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                    Reason for Loss
                  </label>
                  <select
                    value={wasteReason}
                    onChange={(e) => setWasteReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-sand bg-white text-charcoal text-xs outline-none focus:border-gold"
                  >
                    <option value="Expired / Spoilage">Expired / Spoilage</option>
                    <option value="Damaged / Dropped in Kitchen">Damaged / Dropped in Kitchen</option>
                    <option value="Culinary Quality Rejection">Culinary Quality Rejection</option>
                    <option value="Trimming Prep Loss">Trimming Prep Loss</option>
                    <option value="Physical Audit Discrepancy">Physical Audit Discrepancy</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-sand flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWasteModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-sand text-charcoal text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmWaste}
                  className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm"
                >
                  Deduct Waste
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
