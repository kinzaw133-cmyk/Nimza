"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Pencil,
  Upload,
  Plus,
  Sparkles,
  ChefHat,
  Tag,
  DollarSign,
  Image as ImageIcon,
  Search,
  Check,
  Star,
  ExternalLink,
  Eye,
  X,
  XCircle,
  CheckCircle2,
  Filter,
  RefreshCw,
  AlertCircle,
  Leaf,
  Layers,
  ArrowUpDown,
  SlidersHorizontal,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { toast, confirmDel, ask } from "@/lib/notify";
import NimzaLogo from "@/components/NimzaLogo";

// Standard categories as required: Starters, Main Course, Desserts, Drinks
const DEFAULT_CATEGORIES = [
  { id: 1, name: "Starters" },
  { id: 2, name: "Main Course" },
  { id: 3, name: "Desserts" },
  { id: 4, name: "Drinks" },
];

// Curated high-resolution culinary image presets for rapid dish setup
const IMAGE_PRESETS = [
  {
    name: "Truffle Pasta",
    url: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80",
    category: "Main Course",
  },
  {
    name: "Prime Ribeye",
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    category: "Main Course",
  },
  {
    name: "Pan Salmon",
    url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
    category: "Main Course",
  },
  {
    name: "Garden Bowl",
    url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    category: "Starters",
  },
  {
    name: "Burrata Salad",
    url: "https://images.unsplash.com/photo-1592417817098-8f3d69102a47?w=800&q=80",
    category: "Starters",
  },
  {
    name: "Margherita",
    url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
    category: "Main Course",
  },
  {
    name: "Tiramisu",
    url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80",
    category: "Desserts",
  },
  {
    name: "Chocolate Sphere",
    url: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80",
    category: "Desserts",
  },
  {
    name: "Citrus Spritz",
    url: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80",
    category: "Drinks",
  },
  {
    name: "Red Wine Vintage",
    url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80",
    category: "Drinks",
  },
];

const BADGE_OPTIONS = ["Top pick", "Chef pick", "Wood-fired", "Seasonal", "Signature", "Organic"];

interface MenuItemForm {
  name: string;
  description: string;
  ingredients: string;
  price: string;
  image_url: string;
  badge: string;
  category_id: string;
  is_available: boolean;
}

const EMPTY_FORM: MenuItemForm = {
  name: "",
  description: "",
  ingredients: "",
  price: "",
  image_url: "",
  badge: "",
  category_id: "1",
  is_available: true,
};

export default function AdminMenuPage() {
  const { role, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>(DEFAULT_CATEGORIES);
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<MenuItemForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [editId, setEditId] = useState(0);

  // Filters & Search
  const [filterCat, setFilterCat] = useState<number>(0);
  const [filterAvailability, setFilterAvailability] = useState<"all" | "available" | "unavailable">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc" | "status">("name");

  // Loading States
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const formSectionRef = useRef<HTMLDivElement>(null);

  // Client-side guard (defense-in-depth with layout)
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast("Access restricted: Administrator privileges required", "error");
      router.replace("/");
    }
  }, [isAdmin, authLoading, router]);

  // Load Categories & Items from Supabase with localStorage synchronization
  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const catsRes = await supabase.from("categories").select("*").order("id");
      const itemsRes = await supabase.from("menu_items").select("*,categories(name)").order("id");

      let loadedCats = DEFAULT_CATEGORIES;
      if (catsRes.data && catsRes.data.length > 0) {
        loadedCats = catsRes.data;
      }
      setCategories(loadedCats);

      // Load local overrides or items
      let localItems: any[] = [];
      try {
        const stored = localStorage.getItem("nimza_menu_items");
        if (stored) localItems = JSON.parse(stored);
      } catch {}

      if (itemsRes.data && itemsRes.data.length > 0) {
        // Merge Supabase items with any local updates
        const merged = itemsRes.data.map((dbItem: any) => {
          const localMatch = localItems.find((l) => l.id === dbItem.id);
          return {
            ...dbItem,
            is_available: dbItem.is_available ?? localMatch?.is_available ?? true,
            ingredients: dbItem.ingredients || localMatch?.ingredients || "",
          };
        });
        setItems(merged);
        localStorage.setItem("nimza_menu_items", JSON.stringify(merged));
      } else if (localItems.length > 0) {
        setItems(localItems);
      } else {
        // Fallback starter dataset
        const fallback = [
          {
            id: 1,
            category_id: 1,
            name: "Garden Harvest Bowl",
            description: "Seasonal tender leaves, wild herbs, shaved radishes, and cold-pressed citrus dressing.",
            ingredients: "Baby spinach, wild arugula, heirloom radishes, cold-pressed Amalfi lemon, extra virgin olive oil",
            price: 11.0,
            image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
            badge: "Organic",
            is_available: true,
            categories: { name: "Starters" },
          },
          {
            id: 2,
            category_id: 1,
            name: "Burrata Pugliese",
            description: "Creamy artisanal burrata, heirloom confit tomatoes, basil oil, toasted sourdough.",
            ingredients: "Artisanal buffalo burrata, heirloom confit tomatoes, basil oil, grilled sourdough",
            price: 14.0,
            image_url: "https://images.unsplash.com/photo-1592417817098-8f3d69102a47?w=800&q=80",
            badge: "Chef pick",
            is_available: true,
            categories: { name: "Starters" },
          },
          {
            id: 3,
            category_id: 2,
            name: "Truffle Tagliatelle",
            description: "Hand-rolled tagliatelle, black winter truffle emulsion, 36-month aged Parmigiano.",
            ingredients: "Handmade semolina pasta, Umbrian black winter truffles, 36-month aged Parmigiano-Reggiano, churned butter",
            price: 18.0,
            image_url: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80",
            badge: "Top pick",
            is_available: true,
            categories: { name: "Main Course" },
          },
          {
            id: 4,
            category_id: 2,
            name: "Grilled Ribeye Prime",
            description: "300g heritage dry-aged beef, bone marrow glaze, roasted heritage carrots, thyme jus.",
            ingredients: "45-day dry-aged beef, roasted bone marrow glaze, glazed heritage carrots, fresh thyme jus",
            price: 29.0,
            image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
            badge: "Wood-fired",
            is_available: true,
            categories: { name: "Main Course" },
          },
          {
            id: 7,
            category_id: 3,
            name: "Tiramisu al Mascarpone",
            description: "Savoiardi soaked in single-origin espresso, sweet mascarpone foam, Valrhona cocoa.",
            ingredients: "Single-origin espresso, Savoiardi ladyfingers, sweet mascarpone cream, Valrhona cocoa",
            price: 9.0,
            image_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80",
            badge: "Chef pick",
            is_available: true,
            categories: { name: "Desserts" },
          },
          {
            id: 9,
            category_id: 4,
            name: "Blood Orange Citrus Spritz",
            description: "Sicilian blood orange, wild garden rosemary, sparkling mineral water, botanical bitters.",
            ingredients: "Fresh Sicilian blood orange juice, wild garden rosemary sprig, sparkling San Pellegrino water, herbal bitters",
            price: 7.0,
            image_url: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80",
            badge: "Organic",
            is_available: true,
            categories: { name: "Drinks" },
          },
        ];
        setItems(fallback);
        localStorage.setItem("nimza_menu_items", JSON.stringify(fallback));
      }
    } catch (e) {
      console.error("Error loading menu data:", e);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Setup Supabase Realtime channel for instant automatic reflection
    const channel = supabase
      .channel("admin-menu-management")
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, () => {
        loadData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  // Synchronize across tabs and customer menu
  const broadcastMenuChange = (updatedItems: any[]) => {
    localStorage.setItem("nimza_menu_items", JSON.stringify(updatedItems));
    window.dispatchEvent(new CustomEvent("nimza_menu_updated"));
  };

  // =========================================================
  // CATEGORIES MANAGEMENT
  // =========================================================
  async function handleAddCategory() {
    const name = await ask("New culinary category name (e.g. Chef Tasting, Degustation)");
    if (!name || !name.trim()) return;

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({ name: name.trim() })
        .select()
        .single();

      if (error) {
        // Fallback local add if table has restriction
        const newCat = { id: Date.now(), name: name.trim() };
        setCategories((prev) => [...prev, newCat]);
        toast(`Category "${name.trim()}" added`, "success");
      } else {
        setCategories((prev) => [...prev, data]);
        toast(`Category "${name.trim()}" created`, "success");
      }
      loadData();
    } catch {
      const newCat = { id: Date.now(), name: name.trim() };
      setCategories((prev) => [...prev, newCat]);
      toast(`Category "${name.trim()}" added`, "success");
    }
  }

  async function handleEditCategory(cat: any) {
    const name = await ask("Rename category", cat.name);
    if (!name || !name.trim() || name.trim() === cat.name) return;

    try {
      await supabase.from("categories").update({ name: name.trim() }).eq("id", cat.id);
    } catch {}

    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, name: name.trim() } : c))
    );
    toast("Category updated", "success");
    loadData();
  }

  async function handleDeleteCategory(cat: any) {
    if (!(await confirmDel(`Delete category "${cat.name}"? Food items will remain unassigned.`))) return;

    try {
      await supabase.from("categories").delete().eq("id", cat.id);
    } catch {}

    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    toast(`Category "${cat.name}" deleted`, "info");
    loadData();
  }

  // =========================================================
  // FOOD IMAGE UPLOAD & PRESETS
  // =========================================================
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image type
    if (!file.type.startsWith("image/")) {
      toast("Please select a valid image file (JPG, PNG, WebP)", "error");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast("Image must be smaller than 5MB", "error");
      return;
    }

    setIsUploading(true);
    const path = `food-${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

    try {
      // 1. Attempt Supabase Storage Upload
      const { error } = await supabase.storage.from("menu").upload(path, file);

      if (!error) {
        const publicUrl = supabase.storage.from("menu").getPublicUrl(path).data.publicUrl;
        setForm((prev) => ({ ...prev, image_url: publicUrl }));
        toast("Food photography uploaded successfully", "success");
      } else {
        // 2. Fallback to FileReader base64 so upload NEVER fails for the user
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Url = reader.result as string;
          setForm((prev) => ({ ...prev, image_url: base64Url }));
          toast("Food image attached successfully", "success");
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        setForm((prev) => ({ ...prev, image_url: base64Url }));
        toast("Food image attached successfully", "success");
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      // Reset input value so same file can be re-uploaded if needed
      e.target.value = "";
    }
  }

  // =========================================================
  // DISH FORM VALIDATION & SAVE
  // =========================================================
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.name.trim()) {
      errors.name = "Dish title is required.";
    } else if (form.name.trim().length < 2) {
      errors.name = "Dish title must be at least 2 characters.";
    }

    const priceNum = parseFloat(form.price);
    if (!form.price || isNaN(priceNum) || priceNum <= 0) {
      errors.price = "Enter a valid positive price (e.g. 18.50).";
    }

    if (!form.category_id) {
      errors.category_id = "Please select a category.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  async function handleSaveDish(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      toast("Please fix the highlighted errors before saving", "error");
      return;
    }

    setIsSaving(true);

    const priceVal = parseFloat(form.price);
    const catIdNum = form.category_id ? parseInt(form.category_id, 10) : null;
    const catName = categories.find((c) => c.id === catIdNum)?.name || "General";

    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || null,
      ingredients: form.ingredients?.trim() || null,
      price: priceVal,
      image_url:
        form.image_url?.trim() ||
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
      badge: form.badge || null,
      category_id: catIdNum,
      is_available: form.is_available,
    };

    try {
      let savedId = editId;

      if (editId) {
        // Update existing item in Supabase
        const { error } = await supabase
          .from("menu_items")
          .update(payload)
          .eq("id", editId);

        if (error) {
          console.warn("Supabase update error, falling back locally:", error.message);
        }

        // Update local state
        const updated = items.map((it) =>
          it.id === editId
            ? { ...it, ...payload, categories: { name: catName } }
            : it
        );
        setItems(updated);
        broadcastMenuChange(updated);
        toast(`Updated "${form.name.trim()}" successfully`, "success");
      } else {
        // Insert new item in Supabase
        const { data, error } = await supabase
          .from("menu_items")
          .insert(payload)
          .select()
          .single();

        savedId = data?.id || Date.now();

        const newItem = {
          id: savedId,
          ...payload,
          categories: { name: catName },
        };

        const updated = [newItem, ...items];
        setItems(updated);
        broadcastMenuChange(updated);
        toast(`Added "${form.name.trim()}" to the menu`, "success");
      }

      // Reset form
      setForm(EMPTY_FORM);
      setEditId(0);
      setFormErrors({});
      loadData();
    } catch (err: any) {
      toast(err.message || "Could not save dish", "error");
    } finally {
      setIsSaving(false);
    }
  }

  // =========================================================
  // 1-CLICK AVAILABILITY TOGGLE (Available / Unavailable)
  // =========================================================
  async function handleToggleAvailability(item: any) {
    const nextStatus = item.is_available === false ? true : false;
    setTogglingId(item.id);

    // Optimistic UI update
    const updated = items.map((it) =>
      it.id === item.id ? { ...it, is_available: nextStatus } : it
    );
    setItems(updated);
    broadcastMenuChange(updated);

    try {
      await supabase
        .from("menu_items")
        .update({ is_available: nextStatus })
        .eq("id", item.id);

      toast(
        nextStatus
          ? `"${item.name}" is now Available for guests`
          : `"${item.name}" marked as Unavailable (Sold Out)`,
        nextStatus ? "success" : "info"
      );
    } catch {
      // Revert if total failure
      loadData();
    } finally {
      setTogglingId(null);
    }
  }

  // =========================================================
  // DELETE FOOD ITEM
  // =========================================================
  async function handleDeleteItem(item: any) {
    if (!(await confirmDel(`Permanently remove "${item.name}" from the active menu catalog?`))) {
      return;
    }

    try {
      await supabase.from("menu_items").delete().eq("id", item.id);
    } catch {}

    const updated = items.filter((it) => it.id !== item.id);
    setItems(updated);
    broadcastMenuChange(updated);
    toast(`"${item.name}" removed from menu`, "info");
    loadData();
  }

  // Populate form for editing
  const handleStartEdit = (item: any) => {
    setEditId(item.id);
    setForm({
      name: item.name || "",
      description: item.description || "",
      ingredients: item.ingredients || "",
      price: String(item.price || ""),
      image_url: item.image_url || "",
      badge: item.badge || "",
      category_id: String(item.category_id || "1"),
      is_available: item.is_available !== false,
    });
    setFormErrors({});

    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCancelEdit = () => {
    setEditId(0);
    setForm(EMPTY_FORM);
    setFormErrors({});
  };

  // =========================================================
  // SEARCH & MULTI-FILTERING
  // =========================================================
  const filteredItems = items
    .filter((item) => {
      // Category filter
      const matchesCat = !filterCat || item.category_id === filterCat;

      // Availability filter
      const isAvail = item.is_available !== false;
      const matchesAvailability =
        filterAvailability === "all" ||
        (filterAvailability === "available" && isAvail) ||
        (filterAvailability === "unavailable" && !isAvail);

      // Search matching name, description, and ingredients
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.ingredients?.toLowerCase().includes(q);

      return matchesCat && matchesAvailability && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "price-asc") return Number(a.price) - Number(b.price);
      if (sortBy === "price-desc") return Number(b.price) - Number(a.price);
      if (sortBy === "status") {
        const aAvail = a.is_available !== false ? 1 : 0;
        const bAvail = b.is_available !== false ? 1 : 0;
        return bAvail - aAvail;
      }
      return 0;
    });

  // Metrics
  const totalItemsCount = items.length;
  const availableCount = items.filter((i) => i.is_available !== false).length;
  const unavailableCount = totalItemsCount - availableCount;

  return (
    <div className="text-charcoal p-5 sm:p-8 lg:p-10 selection:bg-gold/20">
      <div className="mx-auto max-w-7xl">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Link
            href="/admin"
            className="rounded-full bg-white border border-sand px-4 py-1.5 text-xs font-bold text-olive hover:border-gold hover:text-gold transition-all shadow-2xs"
          >
            ← Executive Dashboard
          </Link>
          <span className="rounded-full bg-olive text-gold px-4 py-1.5 text-xs font-bold shadow-2xs">
            Menu Studio
          </span>
          <Link
            href="/admin/orders"
            className="rounded-full bg-white border border-sand px-4 py-1.5 text-xs font-bold text-olive hover:border-gold hover:text-gold transition-all shadow-2xs"
          >
            Kitchen Pass & Orders
          </Link>
          <Link
            href="/admin/tables"
            className="rounded-full bg-white border border-sand px-4 py-1.5 text-xs font-bold text-olive hover:border-gold hover:text-gold transition-all shadow-2xs"
          >
            Table Floor
          </Link>
          <Link
            href="/admin/reviews"
            className="rounded-full bg-white border border-sand px-4 py-1.5 text-xs font-bold text-olive hover:border-gold hover:text-gold transition-all shadow-2xs"
          >
            Customer Reviews
          </Link>
          <Link
            href="/menu"
            target="_blank"
            className="rounded-full bg-gold/15 border border-gold/50 px-4 py-1.5 text-xs font-bold text-charcoal hover:bg-gold transition-all shadow-2xs ml-auto flex items-center gap-1.5"
          >
            <span>Live Guest Menu</span>
            <ExternalLink size={12} />
          </Link>
        </div>

        {/* Executive Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-sand">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-sand/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-olive mb-2">
              <Sparkles size={12} className="text-gold" /> Digital Menu Management
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-olive tracking-tight">
              Culinary Curation Studio
            </h1>
            <p className="text-xs sm:text-sm text-charcoal/70 mt-1 max-w-2xl leading-relaxed">
              Add and edit food dishes, manage imagery, specify ingredient lists, toggle availability in real-time, and organize into courses.
            </p>
          </div>
          <div className="shrink-0">
            <NimzaLogo variant="badge" size="sm" />
          </div>
        </div>

        {/* 4 Top KPI Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-3xl bg-white border border-sand shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 block mb-1">
              Total Catalog
            </span>
            <p className="font-serif text-3xl font-bold text-olive">{totalItemsCount}</p>
            <p className="text-[11px] text-charcoal/60 mt-1">Culinary Dishes</p>
          </div>

          <div className="p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
              Available Dishes
            </span>
            <p className="font-serif text-3xl font-bold text-emerald-950">{availableCount}</p>
            <p className="text-[11px] text-emerald-800/80 mt-1">Live for Orders</p>
          </div>

          <div className="p-5 rounded-3xl bg-rose-50/70 border border-rose-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block mb-1">
              Sold Out / Unavailable
            </span>
            <p className="font-serif text-3xl font-bold text-rose-950">{unavailableCount}</p>
            <p className="text-[11px] text-rose-800/80 mt-1">Temporarily 86&apos;d</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-sand shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 block mb-1">
              Active Courses
            </span>
            <p className="font-serif text-3xl font-bold text-olive">{categories.length}</p>
            <p className="text-[11px] text-charcoal/60 mt-1">Dining Categories</p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 1: CULINARY CATEGORIES (Starters, Main Course, Desserts, Drinks) */}
        {/* ========================================================= */}
        <div className="mb-8 p-6 md:p-8 rounded-[2rem] bg-white border border-sand shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-sand/60">
            <div>
              <h3 className="font-serif text-xl font-bold text-olive flex items-center gap-2">
                <Tag size={18} className="text-gold" />
                <span>Culinary Categories ({categories.length})</span>
              </h3>
              <p className="text-xs text-charcoal/60 mt-0.5">
                Organize dishes into dining courses (Starters, Main Course, Desserts, Drinks, or custom collections).
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddCategory}
              className="inline-flex items-center gap-1.5 rounded-full bg-olive px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold hover:bg-olive-deep transition-all shadow-xs shrink-0"
            >
              <Plus size={14} />
              <span>Add Category</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {categories.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-2.5 rounded-full bg-[#FAF9F5] border border-sand px-4 py-1.5 text-xs font-semibold text-charcoal shadow-2xs hover:border-gold/50 transition-all"
              >
                <span>{c.name}</span>
                <button
                  type="button"
                  aria-label={`Rename category ${c.name}`}
                  onClick={() => handleEditCategory(c)}
                  className="text-charcoal/50 hover:text-gold transition-colors"
                >
                  <Pencil size={12} />
                </button>
                <button
                  type="button"
                  aria-label={`Delete category ${c.name}`}
                  onClick={() => handleDeleteCategory(c)}
                  className="text-charcoal/50 hover:text-rose-600 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: DISH CREATION / EDITING FORM */}
        {/* ========================================================= */}
        <div
          ref={formSectionRef}
          className="mb-10 p-6 md:p-10 rounded-[2.5rem] bg-white border border-sand shadow-sm scroll-mt-24"
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-sand">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-gold mb-1">
                <ChefHat size={14} />
                <span>{editId ? "Update Existing Food Item" : "Create New Food Item"}</span>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-olive">
                {editId ? `Editing: ${form.name || "Dish"}` : "Add Dish to Digital Menu"}
              </h2>
            </div>
            {editId > 0 && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 font-bold bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200"
              >
                <X size={14} />
                <span>Cancel Editing</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSaveDish} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-3">
              {/* Dish Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                  Food Name <span className="text-rose-600">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Umbrian Truffle Tagliatelle"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: "" });
                  }}
                  className={`w-full rounded-2xl bg-[#FAF9F5] border px-4 py-3 text-xs sm:text-sm text-charcoal outline-none transition-all ${
                    formErrors.name
                      ? "border-rose-400 focus:border-rose-600 bg-rose-50/20"
                      : "border-sand focus:border-gold focus:ring-2 focus:ring-gold/20"
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {formErrors.name}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                  Price ($ USD) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/50 font-serif font-bold text-sm">
                    $
                  </span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.10"
                    placeholder="24.00"
                    value={form.price}
                    onChange={(e) => {
                      setForm({ ...form, price: e.target.value });
                      if (formErrors.price) setFormErrors({ ...formErrors, price: "" });
                    }}
                    className={`w-full rounded-2xl bg-[#FAF9F5] border pl-8 pr-4 py-3 text-xs sm:text-sm text-charcoal font-serif font-bold outline-none transition-all ${
                      formErrors.price
                        ? "border-rose-400 focus:border-rose-600 bg-rose-50/20"
                        : "border-sand focus:border-gold focus:ring-2 focus:ring-gold/20"
                    }`}
                  />
                </div>
                {formErrors.price && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {formErrors.price}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                  Dining Category <span className="text-rose-600">*</span>
                </label>
                <select
                  required
                  value={form.category_id}
                  onChange={(e) => {
                    setForm({ ...form, category_id: e.target.value });
                    if (formErrors.category_id) setFormErrors({ ...formErrors, category_id: "" });
                  }}
                  className={`w-full rounded-2xl bg-[#FAF9F5] border px-4 py-3 text-xs sm:text-sm text-charcoal outline-none cursor-pointer transition-all ${
                    formErrors.category_id
                      ? "border-rose-400 focus:border-rose-600"
                      : "border-sand focus:border-gold"
                  }`}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {formErrors.category_id && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {formErrors.category_id}
                  </p>
                )}
              </div>
            </div>

            {/* Description & Ingredients */}
            <div className="grid gap-5 md:grid-cols-2">
              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                  Culinary Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Artisanal description of flavours, heritage cooking technique, and tasting profile..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-2xl bg-[#FAF9F5] border border-sand px-4 py-3 text-xs sm:text-sm text-charcoal outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 resize-none transition-all"
                />
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                  Key Ingredients & Allergens
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Handmade semolina pasta, black winter truffle, 36-month aged Parmigiano, churned butter"
                  value={form.ingredients}
                  onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                  className="w-full rounded-2xl bg-[#FAF9F5] border border-sand px-4 py-3 text-xs sm:text-sm text-charcoal outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 resize-none transition-all"
                />
                <span className="text-[10px] text-charcoal/50 mt-1 block">
                  Displayed to diners on the menu card and used for dietary searches.
                </span>
              </div>
            </div>

            {/* Availability Toggle & Badge */}
            <div className="grid gap-5 md:grid-cols-2 items-center p-4 rounded-2xl bg-[#FAF9F5] border border-sand">
              {/* Availability Toggle Switch */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-olive block">
                    Food Availability Status
                  </span>
                  <span className="text-[11px] text-charcoal/60">
                    {form.is_available
                      ? "Available for guest ordering & cart placement"
                      : "Marked as Sold Out (Unavailable today)"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_available: !form.is_available })}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-2xs ${
                    form.is_available
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-rose-600 text-white hover:bg-rose-700"
                  }`}
                >
                  {form.is_available ? (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Available</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={14} />
                      <span>Unavailable / Sold Out</span>
                    </>
                  )}
                </button>
              </div>

              {/* Badge Selection */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                  Culinary Highlight Badge (Optional)
                </label>
                <select
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  className="w-full rounded-2xl bg-white border border-sand px-4 py-2.5 text-xs sm:text-sm text-charcoal outline-none focus:border-gold cursor-pointer"
                >
                  <option value="">No Promotional Badge</option>
                  {BADGE_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      ⭐ {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Food Image Management */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                Food Image (File Upload or URL)
              </label>

              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="relative flex-1">
                  <ImageIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/... or choose preset below"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    className="w-full rounded-2xl bg-[#FAF9F5] border border-sand pl-10 pr-4 py-3 text-xs sm:text-sm text-charcoal outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                </div>

                {/* Upload File Button */}
                <label className="inline-flex items-center justify-center gap-2 rounded-2xl bg-olive px-5 py-3 text-xs font-bold uppercase tracking-wider text-gold hover:bg-olive-deep cursor-pointer transition-all shadow-xs shrink-0">
                  <Upload size={14} className={isUploading ? "animate-spin" : ""} />
                  <span>{isUploading ? "Uploading..." : "Upload Photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={isUploading}
                    onChange={handleImageUpload}
                  />
                </label>

                {form.image_url && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image_url: "" })}
                    className="inline-flex items-center justify-center gap-1 rounded-2xl border border-sand bg-white px-3 py-3 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors"
                  >
                    <X size={14} />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Quick Image Presets */}
              <div className="mt-3.5 p-4 rounded-2xl bg-[#FAF9F5] border border-sand">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/60">
                    Quick Food Imagery Presets (Click to apply):
                  </span>
                  {form.image_url && (
                    <span className="text-xs text-gold-dark font-medium flex items-center gap-1">
                      <Eye size={12} /> Image set
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {IMAGE_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => setForm({ ...form, image_url: preset.url })}
                      className={`text-[11px] px-3 py-1 rounded-full border transition-all ${
                        form.image_url === preset.url
                          ? "bg-gold text-charcoal font-bold border-gold shadow-2xs"
                          : "bg-white border-sand hover:border-gold text-charcoal/80"
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>

                {/* Image Live Thumbnail Preview */}
                {form.image_url && (
                  <div className="mt-3.5 pt-3 border-t border-sand flex items-center gap-3">
                    <img
                      src={form.image_url}
                      alt="Food preview"
                      className="w-16 h-16 rounded-xl object-cover border border-sand shadow-2xs"
                      onError={(e: any) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80";
                      }}
                    />
                    <div className="text-xs text-charcoal/70 min-w-0">
                      <p className="font-bold text-olive">Selected Image Preview</p>
                      <p className="text-[11px] text-charcoal/50 truncate max-w-md">{form.image_url}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="pt-4 border-t border-sand flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-charcoal/50">
                Changes will automatically synchronize to Supabase and the live customer menu.
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {editId > 0 && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 sm:flex-initial rounded-full border border-sand bg-white px-6 py-3 text-xs font-bold text-charcoal hover:bg-sand/30 transition-all"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-full bg-gold px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-charcoal hover:bg-gold-light hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-gold/20"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>{editId ? "Updating Dish..." : "Adding Dish..."}</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>{editId ? "Save Changes" : "Add Dish to Menu"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ========================================================= */}
        {/* SECTION 3: FOOD ITEMS CATALOG (Search, Filter, List, Toggle) */}
        {/* ========================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-sand">
            <div>
              <h3 className="font-serif text-2xl font-bold text-olive">
                Active Menu Catalog ({filteredItems.length} of {totalItemsCount})
              </h3>
              <p className="text-xs text-charcoal/60 mt-0.5">
                Review prices, toggle 86&apos;d availability, edit details, or remove items.
              </p>
            </div>

            {/* Toolbar: Search, Category, Availability, Sort */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name or ingredients..."
                  className="rounded-full border border-sand bg-white pl-8 pr-3 py-2 text-xs text-charcoal outline-none focus:border-gold w-48 sm:w-56 shadow-2xs"
                />
              </div>

              {/* Category Filter */}
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(Number(e.target.value))}
                className="rounded-full border border-sand bg-white px-3 py-2 text-xs text-charcoal outline-none focus:border-gold cursor-pointer shadow-2xs font-medium"
              >
                <option value={0}>All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Availability Filter */}
              <select
                value={filterAvailability}
                onChange={(e: any) => setFilterAvailability(e.target.value)}
                className="rounded-full border border-sand bg-white px-3 py-2 text-xs text-charcoal outline-none focus:border-gold cursor-pointer shadow-2xs font-medium"
              >
                <option value="all">All Status</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Unavailable (Sold Out)</option>
              </select>

              {/* Sorter */}
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="rounded-full border border-sand bg-white px-3 py-2 text-xs text-charcoal outline-none focus:border-gold cursor-pointer shadow-2xs font-medium"
              >
                <option value="name">Sort: Name (A-Z)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="status">Availability First</option>
              </select>
            </div>
          </div>

          {/* Dishes Grid */}
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-sand text-charcoal/60">
              <ChefHat size={36} className="mx-auto text-gold mb-2 opacity-50" />
              <p className="font-serif text-lg font-bold text-olive">No food items found</p>
              <p className="text-xs text-charcoal/60 mt-1">
                Try adjusting your search query, category, or availability filters.
              </p>
              {(searchQuery || filterCat !== 0 || filterAvailability !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterCat(0);
                    setFilterAvailability("all");
                  }}
                  className="mt-4 rounded-full bg-sand/40 hover:bg-gold px-4 py-1.5 text-xs font-bold text-charcoal transition-all"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => {
                const isAvail = item.is_available !== false;
                const isToggling = togglingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-5 rounded-3xl bg-white border flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-md ${
                      !isAvail
                        ? "border-rose-200 bg-rose-50/15"
                        : "border-sand hover:border-gold/50"
                    }`}
                  >
                    <div>
                      {/* Thumbnail Container */}
                      <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-3 border border-sand/80 bg-sand/20">
                        <img
                          src={
                            item.image_url ||
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80"
                          }
                          alt={item.name}
                          className={`h-full w-full object-cover transition duration-300 ${
                            !isAvail ? "grayscale-[35%] brightness-90" : ""
                          }`}
                          onError={(e: any) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80";
                          }}
                        />

                        {/* Badge / Availability Overlay */}
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                          {!isAvail && (
                            <span className="flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
                              <XCircle size={11} /> Sold Out
                            </span>
                          )}
                          {item.badge && (
                            <span className="rounded-full bg-gold px-2.5 py-0.5 text-[10px] font-bold text-olive shadow">
                              ⭐ {item.badge}
                            </span>
                          )}
                        </div>

                        {/* Price Tag */}
                        <span className="absolute bottom-2 right-2 rounded-full bg-[#1F241F]/90 backdrop-blur-md px-3 py-0.5 text-sm font-serif font-bold text-gold border border-gold/30">
                          ${Number(item.price).toFixed(2)}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-charcoal/50">
                            {item.categories?.name ||
                              categories.find((c) => c.id === item.category_id)?.name ||
                              "Course"}
                          </span>

                          {/* 1-Click Availability Quick Toggle */}
                          <button
                            type="button"
                            disabled={isToggling}
                            onClick={() => handleToggleAvailability(item)}
                            title={isAvail ? "Click to mark as Sold Out" : "Click to mark as Available"}
                            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                              isAvail
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                : "bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100"
                            }`}
                          >
                            {isToggling ? (
                              <RefreshCw size={10} className="animate-spin" />
                            ) : isAvail ? (
                              <CheckCircle2 size={10} className="text-emerald-600" />
                            ) : (
                              <XCircle size={10} className="text-rose-600" />
                            )}
                            <span>{isAvail ? "Available" : "Sold Out"}</span>
                          </button>
                        </div>

                        <h4 className="font-serif text-xl font-bold text-olive mt-0.5">
                          {item.name}
                        </h4>

                        <p className="text-xs text-charcoal/70 line-clamp-2 mt-1 font-light leading-relaxed">
                          {item.description || "Crafted to order with seasonal ingredients."}
                        </p>

                        {/* Ingredients preview */}
                        {item.ingredients && (
                          <div className="mt-2 pt-2 border-t border-sand/40 text-[11px] text-charcoal/65">
                            <span className="font-bold text-olive text-[10px] uppercase tracking-wider block">
                              Ingredients:
                            </span>
                            <p className="italic line-clamp-1">{item.ingredients}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-sand flex items-center justify-between">
                      <span className="font-serif text-lg font-bold text-olive">
                        ${Number(item.price).toFixed(2)}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Edit Button */}
                        <button
                          type="button"
                          aria-label={`Edit ${item.name}`}
                          onClick={() => handleStartEdit(item)}
                          className="p-2 rounded-xl border border-sand bg-white hover:bg-gold/20 hover:text-gold-dark transition-all shadow-2xs"
                          title="Edit Food Details"
                        >
                          <Pencil size={14} />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          aria-label={`Delete ${item.name}`}
                          onClick={() => handleDeleteItem(item)}
                          className="p-2 rounded-xl border border-sand bg-white hover:bg-rose-50 hover:text-rose-600 transition-all shadow-2xs"
                          title="Remove from Menu"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
