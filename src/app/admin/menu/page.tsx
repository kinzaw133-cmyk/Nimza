"use client";

import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { toast, confirmDel, ask } from "@/lib/notify";
import NimzaLogo from "@/components/NimzaLogo";

// Curated high-resolution culinary image presets for rapid dish setup
const IMAGE_PRESETS = [
  {
    name: "Truffle Pasta",
    url: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80",
    category: "Mains",
  },
  {
    name: "Prime Ribeye",
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    category: "Mains",
  },
  {
    name: "Pan Salmon",
    url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
    category: "Mains",
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
    category: "Mains",
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

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  image_url: "",
  badge: "",
  category_id: "",
};

export default function AdminMenu() {
  const { role, loading } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [editId, setEditId] = useState(0);
  const [filterCat, setFilterCat] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const loadData = async () => {
    try {
      const catsRes = await supabase.from("categories").select("*").order("id");
      const itemsRes = await supabase.from("menu_items").select("*,categories(name)").order("id");
      setCategories(catsRes.data || []);
      setItems(itemsRes.data || []);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    if (loading) return;
    if (role !== "admin") {
      toast("Admin privileges required", "error");
      router.push("/");
      return;
    }
    loadData();
  }, [role, loading]);

  async function handleAddCategory() {
    const name = await ask("New culinary category name");
    if (!name) return;
    const { error } = await supabase.from("categories").insert({ name });
    if (error) {
      toast(error.message, "error");
    } else {
      toast(`Category "${name}" created`, "success");
      loadData();
    }
  }

  async function handleEditCategory(cat: any) {
    const name = await ask("Rename category", cat.name);
    if (!name) return;
    await supabase.from("categories").update({ name }).eq("id", cat.id);
    toast("Category updated", "success");
    loadData();
  }

  async function handleDeleteCategory(cat: any) {
    if (!(await confirmDel(`Delete category "${cat.name}" and disassociate dishes?`))) return;
    await supabase.from("categories").delete().eq("id", cat.id);
    toast("Category deleted", "info");
    loadData();
  }

  async function handleImageUpload(e: any) {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const path = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;

    try {
      const { error } = await supabase.storage.from("menu").upload(path, file);
      if (error) {
        toast(error.message, "error");
        return;
      }
      const publicUrl = supabase.storage.from("menu").getPublicUrl(path).data.publicUrl;
      setForm({ ...form, image_url: publicUrl });
      toast("Image uploaded to menu storage", "success");
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSaveDish(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      toast("Dish name is required", "error");
      return;
    }

    if (isNaN(Number(form.price)) || Number(form.price) <= 0) {
      toast("Please enter a valid positive price", "error");
      return;
    }

    const row = {
      name: form.name.trim(),
      description: form.description?.trim() || null,
      price: Number(form.price),
      image_url: form.image_url?.trim() || null,
      badge: form.badge || null,
      category_id: form.category_id ? Number(form.category_id) : null,
    };

    const { error } = editId
      ? await supabase.from("menu_items").update(row).eq("id", editId)
      : await supabase.from("menu_items").insert(row);

    if (error) {
      toast(error.message, "error");
      return;
    }

    toast(editId ? `Updated "${form.name}"` : `Added "${form.name}" to menu`, "success");
    setForm(EMPTY_FORM);
    setEditId(0);
    loadData();
  }

  async function handleDeleteItem(item: any) {
    if (!(await confirmDel(`Remove "${item.name}" from the active menu?`))) return;
    await supabase.from("menu_items").delete().eq("id", item.id);
    toast("Dish removed", "info");
    loadData();
  }

  const filteredItems = items.filter((item) => {
    const matchesCat = !filterCat || item.category_id === filterCat;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const setField = (key: string) => (e: any) => setForm({ ...form, [key]: e.target.value });

  return (
    <main className="min-h-screen bg-ivory text-charcoal pt-36 pb-28 px-6 md:px-12 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-10 border-b border-sand">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-sand/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-olive mb-2">
              <Sparkles size={12} className="text-gold" /> Restaurant Management
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-olive">
              Menu & Culinary Curation
            </h1>
            <p className="text-sm text-charcoal/70 mt-1">
              Configure categories, culinary items, real-time pricing, and visual presentation.
            </p>
          </div>
          <NimzaLogo variant="badge" size="sm" />
        </div>

        {/* Section 1: Categories Management Bar */}
        <div className="mb-10 p-6 md:p-8 rounded-[2rem] bg-white border border-sand shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-olive flex items-center gap-2">
                <Tag size={18} className="text-gold" />
                <span>Culinary Categories ({categories.length})</span>
              </h3>
              <p className="text-xs text-charcoal/60 mt-0.5">
                Organize your kitchen offerings by course and collection.
              </p>
            </div>
            <button
              onClick={handleAddCategory}
              className="btn-d !py-2 !px-4 !text-xs flex items-center gap-1.5 shadow"
            >
              <Plus size={14} />
              <span>Add Category</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            {categories.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-3 rounded-full bg-sand/30 border border-sand px-4 py-2 text-xs font-semibold text-charcoal shadow-sm"
              >
                <span>{c.name}</span>
                <button
                  aria-label="Rename category"
                  onClick={() => handleEditCategory(c)}
                  className="text-charcoal/60 hover:text-gold transition-colors"
                >
                  <Pencil size={12} />
                </button>
                <button
                  aria-label="Delete category"
                  onClick={() => handleDeleteCategory(c)}
                  className="text-charcoal/60 hover:text-rose-600 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Section 2: Create / Edit Dish Form */}
        <div className="mb-14 p-8 md:p-10 rounded-[2.5rem] bg-white border border-sand shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-sand">
            <div>
              <h2 className="font-serif text-2xl font-bold text-olive flex items-center gap-2">
                <ChefHat size={22} className="text-gold" />
                <span>{editId ? `Edit Dish: ${form.name}` : "Create New Culinary Item"}</span>
              </h2>
              <p className="text-xs text-charcoal/60 mt-0.5">
                Set item name, price, category, high-res photo URL, and special badges.
              </p>
            </div>
            {editId > 0 && (
              <button
                type="button"
                onClick={() => {
                  setEditId(0);
                  setForm(EMPTY_FORM);
                }}
                className="text-xs text-rose-700 hover:underline font-bold"
              >
                Cancel Editing
              </button>
            )}
          </div>

          <form onSubmit={handleSaveDish} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-3">
              {/* Dish Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                  Dish Title *
                </label>
                <input
                  required
                  className="inp"
                  placeholder="e.g. Umbrian Truffle Tagliatelle"
                  value={form.name}
                  onChange={setField("name")}
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                  Price ($ USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/50 font-bold">$</span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.5"
                    className="inp !pl-8 font-serif font-bold"
                    placeholder="24.00"
                    value={form.price}
                    onChange={setField("price")}
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                  Category *
                </label>
                <select
                  required
                  className="inp cursor-pointer"
                  value={form.category_id}
                  onChange={setField("category_id")}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                  Culinary Description & Ingredients
                </label>
                <input
                  className="inp"
                  placeholder="Hand-rolled pasta, Umbrian black truffle, 36-month aged Parmigiano..."
                  value={form.description}
                  onChange={setField("description")}
                />
              </div>

              {/* Badge */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                  Promotional Badge (Optional)
                </label>
                <select
                  className="inp cursor-pointer"
                  value={form.badge}
                  onChange={setField("badge")}
                >
                  <option value="">No Badge</option>
                  {BADGE_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image URL & Upload */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                Image Source (URL or File Upload)
              </label>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <input
                  className="inp flex-1"
                  placeholder="https://images.unsplash.com/..."
                  value={form.image_url}
                  onChange={setField("image_url")}
                />

                <label className="btn-d !py-3 !px-5 text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
                  <Upload size={14} />
                  <span>{isUploading ? "Uploading..." : "Upload File"}</span>
                  <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                </label>
              </div>

              {/* Live Preview & Quick Image Presets */}
              <div className="mt-4 p-4 rounded-2xl bg-sand/20 border border-sand">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/60">
                    Quick Preset Food Imagery (Click to apply URL):
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
                          ? "bg-gold text-charcoal font-bold border-gold"
                          : "bg-white border-sand hover:border-gold text-charcoal/80"
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>

                {/* Preview Thumbnail */}
                {form.image_url && (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-sand shadow"
                    />
                    <div className="text-xs text-charcoal/70">
                      <p className="font-bold text-olive">Image Preview</p>
                      <p className="text-[11px] text-charcoal/50 truncate max-w-sm">{form.image_url}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-sand flex items-center justify-end gap-3">
              <button type="submit" className="btn !py-3.5 !px-8 text-sm font-bold shadow-lg shadow-gold/20">
                {editId ? "Update Dish Record" : "Add Dish to Menu"}
              </button>
            </div>
          </form>
        </div>

        {/* Section 3: Active Dishes Management Table */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
            <div>
              <h3 className="font-serif text-2xl font-bold text-olive">
                Active Menu Catalog ({filteredItems.length})
              </h3>
              <p className="text-xs text-charcoal/60 mt-0.5">
                Review prices, descriptions, and edit or remove items from the dining card.
              </p>
            </div>

            {/* Search & Category Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter dishes..."
                  className="rounded-full border border-sand bg-white pl-8 pr-3 py-1.5 text-xs text-charcoal outline-none focus:border-gold"
                />
              </div>

              <select
                value={filterCat}
                onChange={(e) => setFilterCat(Number(e.target.value))}
                className="rounded-full border border-sand bg-white px-3 py-1.5 text-xs text-charcoal outline-none focus:border-gold cursor-pointer"
              >
                <option value={0}>All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-white border border-sand flex flex-col justify-between gap-4 transition-all hover:border-gold/50 shadow-sm"
              >
                <div>
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-3 border border-sand/80">
                    <img
                      src={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80"}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                    {item.badge && (
                      <span className="absolute top-2 left-2 rounded-full bg-gold px-2.5 py-0.5 text-[10px] font-bold text-olive shadow">
                        {item.badge}
                      </span>
                    )}
                    <span className="absolute bottom-2 right-2 rounded-full bg-olive-deep/90 backdrop-blur-md px-3 py-0.5 text-sm font-serif font-bold text-gold border border-gold/30">
                      ${Number(item.price).toFixed(2)}
                    </span>
                  </div>

                  <span className="text-[10px] uppercase tracking-widest font-bold text-charcoal/50">
                    {item.categories?.name || "General Menu"}
                  </span>
                  <h4 className="font-serif text-xl font-bold text-olive mt-0.5">{item.name}</h4>
                  <p className="text-xs text-charcoal/70 line-clamp-2 mt-1 font-light">
                    {item.description || "Freshly cooked to order."}
                  </p>
                </div>

                <div className="pt-3 border-t border-sand flex items-center justify-between">
                  <span className="font-serif text-lg font-bold text-olive">
                    ${Number(item.price).toFixed(2)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      aria-label="Edit dish"
                      onClick={() => {
                        setEditId(item.id);
                        setForm({
                          name: item.name,
                          description: item.description || "",
                          price: item.price,
                          image_url: item.image_url || "",
                          badge: item.badge || "",
                          category_id: item.category_id || "",
                        });
                        window.scrollTo({ top: 350, behavior: "smooth" });
                      }}
                      className="p-2 rounded-xl border border-sand hover:bg-gold/20 hover:text-gold-dark transition-all"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      aria-label="Delete dish"
                      onClick={() => handleDeleteItem(item)}
                      className="p-2 rounded-xl border border-sand hover:bg-rose-50 hover:text-rose-600 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
