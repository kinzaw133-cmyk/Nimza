import { FoodCustomization, PortionOption, ToppingOption } from "@/components/Cart";
import { DEFAULT_PORTIONS, AVAILABLE_TOPPINGS } from "@/components/FoodCustomizationModal";

export type VoiceIntentType =
  | "ADD_TO_CART"
  | "REMOVE_FROM_CART"
  | "UPDATE_QUANTITY"
  | "VIEW_CART"
  | "CART_TOTAL"
  | "CLEAR_CART"
  | "MENU_SEARCH"
  | "CHECKOUT"
  | "CONFIRM"
  | "CANCEL"
  | "HELP"
  | "UNKNOWN";

export interface ParsedVoiceCommand {
  intent: VoiceIntentType;
  rawText: string;
  matchedItem?: any;
  quantity?: number;
  customization?: FoodCustomization;
  searchFilter?: string;
  assistantMessage: string;
  isActionable: boolean;
  unavailableItem?: any;
}

const NUMBER_WORDS: Record<string, number> = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  couple: 2,
  "a couple of": 2,
  dozen: 12,
  "half dozen": 6,
};

// Aliases and search terms mapping to canonical dishes
const ITEM_SYNONYMS: Record<string, string[]> = {
  "Truffle Tagliatelle": [
    "truffle tagliatelle",
    "truffle pasta",
    "tagliatelle",
    "pasta",
    "black truffle pasta",
    "truffle noodles",
  ],
  "Grilled Ribeye Prime": [
    "grilled ribeye prime",
    "ribeye prime",
    "ribeye",
    "rib eye",
    "steak",
    "prime ribeye",
    "beef",
    "prime beef",
    "dry aged ribeye",
  ],
  "Burrata Pugliese": [
    "burrata pugliese",
    "burrata",
    "cheese starter",
    "buffalo burrata",
    "mozzarella starter",
  ],
  "Garden Harvest Bowl": [
    "garden harvest bowl",
    "harvest bowl",
    "salad",
    "garden salad",
    "vegan bowl",
    "harvest salad",
  ],
  "Pan-Seared Herb Salmon": [
    "pan-seared herb salmon",
    "pan seared herb salmon",
    "salmon",
    "herb salmon",
    "wild salmon",
    "fish",
  ],
  "Wood-Fired Margherita": [
    "wood-fired margherita",
    "wood fired margherita",
    "margherita pizza",
    "margherita",
    "pizza",
    "cheese pizza",
  ],
  "Tiramisu al Mascarpone": [
    "tiramisu al mascarpone",
    "tiramisu",
    "coffee dessert",
    "mascarpone tiramisu",
  ],
  "Molten Valrhona Sphere": [
    "molten valrhona sphere",
    "valrhona sphere",
    "molten sphere",
    "chocolate sphere",
    "chocolate cake",
    "molten cake",
    "lava cake",
  ],
  "Blood Orange Citrus Spritz": [
    "blood orange citrus spritz",
    "citrus spritz",
    "blood orange spritz",
    "spritz",
    "orange spritz",
    "orange drink",
    "citrus drink",
    "mocktail",
  ],
};

// Helper: Extract quantity from transcript
function extractQuantity(text: string): number {
  const words = text.toLowerCase().split(/\s+/);

  // Check for digit directly (e.g. "2", "3")
  for (const w of words) {
    const num = parseInt(w, 10);
    if (!isNaN(num) && num > 0 && num < 100) {
      return num;
    }
  }

  // Check for word numbers
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (NUMBER_WORDS[w]) {
      return NUMBER_WORDS[w];
    }
  }

  return 1; // Default
}

// Helper: Extract portion size
function extractPortion(text: string): PortionOption {
  const lower = text.toLowerCase();
  if (lower.includes("petite") || lower.includes("tasting portion") || lower.includes("small")) {
    return DEFAULT_PORTIONS[0]; // Petite Tasting (-$2.50)
  }
  if (
    lower.includes("grand") ||
    lower.includes("large") ||
    lower.includes("double") ||
    lower.includes("feast")
  ) {
    return DEFAULT_PORTIONS[2]; // Grand Feast (+$6.00)
  }
  return DEFAULT_PORTIONS[1]; // Chef's Standard ($0.00)
}

// Helper: Extract spice level
function extractSpice(text: string): "Mild" | "Medium" | "Hot" {
  const lower = text.toLowerCase();
  if (lower.includes("extra hot") || lower.includes("spicy") || lower.includes("hot") || lower.includes("fiery")) {
    return "Hot";
  }
  if (lower.includes("medium") || lower.includes("moderate")) {
    return "Medium";
  }
  return "Mild";
}

// Helper: Extract toppings
function extractToppings(text: string): ToppingOption[] {
  const lower = text.toLowerCase();
  const selected: ToppingOption[] = [];

  if (lower.includes("truffle butter")) {
    selected.push(AVAILABLE_TOPPINGS[0]);
  }
  if (lower.includes("parmesan") || lower.includes("parmigiano") || lower.includes("extra cheese")) {
    selected.push(AVAILABLE_TOPPINGS[1]);
  }
  if (lower.includes("garlic") || lower.includes("garlic confit")) {
    selected.push(AVAILABLE_TOPPINGS[2]);
  }
  if (lower.includes("mushroom") || lower.includes("porcini")) {
    selected.push(AVAILABLE_TOPPINGS[3]);
  }
  if (lower.includes("pancetta") || lower.includes("bacon")) {
    selected.push(AVAILABLE_TOPPINGS[4]);
  }
  if (lower.includes("mozzarella") || lower.includes("buffalo mozz")) {
    selected.push(AVAILABLE_TOPPINGS[5]);
  }

  return selected;
}

// Fuzzy matching of item name against catalog items
export function matchMenuItem(
  spokenText: string,
  menuCatalog: any[]
): { item: any | null; matchScore: number } {
  const clean = spokenText.toLowerCase();

  // 1. Direct synonym matching
  for (const [canonicalName, synonyms] of Object.entries(ITEM_SYNONYMS)) {
    for (const syn of synonyms) {
      if (clean.includes(syn)) {
        const found = menuCatalog.find(
          (m) => m.name.toLowerCase() === canonicalName.toLowerCase()
        );
        if (found) return { item: found, matchScore: 1.0 };
      }
    }
  }

  // 2. Exact or substring match in catalog names
  for (const item of menuCatalog) {
    const itemName = item.name.toLowerCase();
    if (clean.includes(itemName)) {
      return { item, matchScore: 0.95 };
    }
  }

  // 3. Keyword token overlap matching
  let bestItem: any = null;
  let highestScore = 0;

  for (const item of menuCatalog) {
    const tokens = item.name.toLowerCase().split(/\s+/);
    let matchedTokens = 0;

    for (const t of tokens) {
      if (t.length > 2 && clean.includes(t)) {
        matchedTokens++;
      }
    }

    const score = matchedTokens / tokens.length;
    if (score > highestScore && score >= 0.4) {
      highestScore = score;
      bestItem = item;
    }
  }

  return { item: bestItem, matchScore: highestScore };
}

export const DEFAULT_FALLBACK_CATALOG = [
  {
    id: 1,
    category_id: 1,
    name: "Garden Harvest Bowl",
    description: "Seasonal tender leaves, wild herbs, shaved radishes, and cold-pressed citrus dressing.",
    ingredients: "Baby spinach, wild arugula, heirloom radishes, cold-pressed Amalfi lemon, extra virgin olive oil",
    price: 11.0,
    image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    badge: "Organic",
    dietary: "Vegan",
    is_available: true,
  },
  {
    id: 2,
    category_id: 1,
    name: "Burrata Pugliese",
    description: "Creamy artisanal burrata, heirloom confit tomatoes, basil oil, toasted sourdough.",
    ingredients: "Artisanal buffalo burrata, heirloom confit tomatoes, basil oil, grilled sourdough",
    price: 14.0,
    image_url: "https://images.unsplash.com/photo-1592417817098-8f3d69102a47?w=800&q=80",
    badge: "Chef's Pick",
    dietary: "Vegetarian",
    is_available: true,
  },
  {
    id: 3,
    category_id: 2,
    name: "Truffle Tagliatelle",
    description: "Hand-rolled tagliatelle, black winter truffle emulsion, 36-month aged Parmigiano.",
    ingredients: "Handmade semolina pasta, Umbrian black winter truffles, 36-month aged Parmigiano-Reggiano, churned butter",
    price: 18.0,
    image_url: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80",
    badge: "Top Pick",
    dietary: "Hand-Crafted",
    is_available: true,
  },
  {
    id: 4,
    category_id: 2,
    name: "Grilled Ribeye Prime",
    description: "300g heritage dry-aged beef, bone marrow glaze, roasted heritage carrots, thyme jus.",
    ingredients: "45-day dry-aged beef, roasted bone marrow glaze, glazed heritage carrots, fresh thyme jus",
    price: 29.0,
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    badge: "Wood-Fired",
    dietary: "Gluten-Free",
    is_available: true,
  },
  {
    id: 5,
    category_id: 2,
    name: "Pan-Seared Herb Salmon",
    description: "Wild Scottish salmon, champagne beurre blanc, braised fennel, sea greens.",
    ingredients: "Wild Scottish salmon, champagne beurre blanc, braised Florence fennel, sea samphire",
    price: 22.0,
    image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
    badge: "Wild Catch",
    dietary: "Gluten-Free",
    is_available: true,
  },
  {
    id: 6,
    category_id: 2,
    name: "Wood-Fired Margherita",
    description: "San Marzano D.O.P. tomatoes, buffalo mozzarella, fresh sweet basil, extra virgin olive oil.",
    ingredients: "San Marzano D.O.P. tomatoes, fresh Fior di Latte mozzarella, sweet Genovese basil, organic olive oil",
    price: 15.0,
    image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
    badge: "Classic",
    dietary: "Vegetarian",
    is_available: true,
  },
  {
    id: 7,
    category_id: 3,
    name: "Tiramisu al Mascarpone",
    description: "Savoiardi soaked in single-origin espresso, sweet mascarpone foam, Valrhona cocoa.",
    ingredients: "Single-origin espresso, Savoiardi ladyfingers, sweet mascarpone cream, Valrhona cocoa",
    price: 9.0,
    image_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80",
    badge: "Chef's Recipe",
    dietary: "Vegetarian",
    is_available: true,
  },
  {
    id: 8,
    category_id: 3,
    name: "Molten Valrhona Sphere",
    description: "Warm dark chocolate ganache cake, Madagascar bourbon vanilla ice cream, golden lace.",
    ingredients: "70% Guanaja chocolate, Madagascar bourbon vanilla bean ice cream, caramel spun lace",
    price: 10.0,
    image_url: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80",
    badge: "Signature",
    dietary: "Vegetarian",
    is_available: true,
  },
  {
    id: 9,
    category_id: 4,
    name: "Blood Orange Citrus Spritz",
    description: "Sicilian blood orange, wild garden rosemary, sparkling mineral water, botanical bitters.",
    ingredients: "Fresh Sicilian blood orange juice, wild garden rosemary sprig, sparkling San Pellegrino water, herbal bitters",
    price: 7.0,
    image_url: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80",
    badge: "Zero Proof",
    dietary: "Vegan",
    is_available: true,
  },
];

export function processVoiceCommand(
  rawSpeech: string,
  menuCatalog: any[],
  currentCart?: { items: any[]; total: number; count: number }
): ParsedVoiceCommand {
  const cleanText = rawSpeech.trim();
  const lower = cleanText.toLowerCase();

  if (!cleanText) {
    return {
      intent: "UNKNOWN",
      rawText: rawSpeech,
      assistantMessage: "I didn't catch that. Tap the microphone and tell me what you'd like to order.",
      isActionable: false,
    };
  }

  // 1. CONFIRM
  if (
    lower === "yes" ||
    lower === "confirm" ||
    lower === "add it" ||
    lower === "looks good" ||
    lower === "submit" ||
    lower.startsWith("yes ") ||
    lower.startsWith("confirm ")
  ) {
    return {
      intent: "CONFIRM",
      rawText: cleanText,
      assistantMessage: "Order confirmed! Adding dishes to your cart now.",
      isActionable: true,
    };
  }

  // 2. CANCEL
  if (
    lower === "cancel" ||
    lower === "no" ||
    lower === "never mind" ||
    lower === "discard" ||
    lower === "clear" ||
    lower.startsWith("cancel ")
  ) {
    return {
      intent: "CANCEL",
      rawText: cleanText,
      assistantMessage: "Cancelled. Let me know if you would like anything else.",
      isActionable: true,
    };
  }

  // 3. CHECKOUT
  if (
    lower.includes("checkout") ||
    lower.includes("pay now") ||
    lower.includes("proceed to payment") ||
    lower.includes("finish order") ||
    lower.includes("place order")
  ) {
    return {
      intent: "CHECKOUT",
      rawText: cleanText,
      assistantMessage: "Taking you to checkout to finalize your table order.",
      isActionable: true,
    };
  }

  // 4. CART TOTAL
  if (
    lower.includes("total") ||
    lower.includes("how much") ||
    lower.includes("cart cost") ||
    lower.includes("bill")
  ) {
    const totalStr = `$${Number(currentCart.total || 0).toFixed(2)}`;
    const itemsCount = currentCart.count || 0;
    return {
      intent: "CART_TOTAL",
      rawText: cleanText,
      assistantMessage:
        itemsCount > 0
          ? `Your current order total is ${totalStr} with ${itemsCount} dish${
              itemsCount > 1 ? "es" : ""
            }. Would you like to proceed to checkout?`
          : "Your cart is currently empty. Would you like to hear our signature specialties?",
      isActionable: false,
    };
  }

  // 5. VIEW CART
  if (
    lower.includes("show cart") ||
    lower.includes("view cart") ||
    lower.includes("what is in my cart") ||
    lower.includes("show my order") ||
    lower.includes("open cart")
  ) {
    return {
      intent: "VIEW_CART",
      rawText: cleanText,
      assistantMessage: `You have ${currentCart.count} item${
        currentCart.count !== 1 ? "s" : ""
      } in your order. Showing your cart now.`,
      isActionable: true,
    };
  }

  // 6. CLEAR CART
  if (
    lower.includes("clear cart") ||
    lower.includes("empty cart") ||
    lower.includes("remove all dishes") ||
    lower.includes("clear my order")
  ) {
    return {
      intent: "CLEAR_CART",
      rawText: cleanText,
      assistantMessage: "Are you sure you want to clear your current cart?",
      isActionable: true,
    };
  }

  // 7. MENU SEARCH / DIETARY FILTER
  if (
    lower.includes("show") ||
    lower.includes("vegetarian") ||
    lower.includes("vegan") ||
    lower.includes("gluten free") ||
    lower.includes("dessert") ||
    lower.includes("starter") ||
    lower.includes("main") ||
    lower.includes("drink") ||
    lower.includes("wine")
  ) {
    let filterCategory = "Menu";
    if (lower.includes("vegetarian")) filterCategory = "Vegetarian";
    else if (lower.includes("vegan")) filterCategory = "Vegan";
    else if (lower.includes("gluten")) filterCategory = "Gluten-Free";
    else if (lower.includes("dessert")) filterCategory = "Desserts";
    else if (lower.includes("starter")) filterCategory = "Starters";
    else if (lower.includes("main")) filterCategory = "Main Course";
    else if (lower.includes("drink")) filterCategory = "Drinks";

    return {
      intent: "MENU_SEARCH",
      rawText: cleanText,
      searchFilter: filterCategory,
      assistantMessage: `Filtering our menu for ${filterCategory} specialties. Discover our chef's hand-crafted selections.`,
      isActionable: true,
    };
  }

  // 8. HELP
  if (lower.includes("help") || lower.includes("what can you do") || lower.includes("commands")) {
    return {
      intent: "HELP",
      rawText: cleanText,
      assistantMessage:
        "You can speak commands like: 'Add two Truffle Tagliatelle', 'Order Prime Ribeye Grand with Hot spice', 'What's my cart total?', or 'Proceed to checkout'.",
      isActionable: false,
    };
  }

  // 9. REMOVE FROM CART
  if (lower.includes("remove") || lower.includes("delete") || lower.includes("take off")) {
    const { item } = matchMenuItem(cleanText, menuCatalog);
    if (item) {
      return {
        intent: "REMOVE_FROM_CART",
        rawText: cleanText,
        matchedItem: item,
        assistantMessage: `Would you like me to remove ${item.name} from your cart?`,
        isActionable: true,
      };
    }
  }

  // 10. ADD TO CART (Core Ordering Intent)
  const isAddCommand =
    lower.includes("add") ||
    lower.includes("order") ||
    lower.includes("want") ||
    lower.includes("get") ||
    lower.includes("give me") ||
    lower.includes("like") ||
    lower.includes("buy") ||
    lower.includes("have");

  const { item: matchedItem } = matchMenuItem(cleanText, menuCatalog);

  if (matchedItem) {
    // Check item availability
    if (matchedItem.is_available === false) {
      return {
        intent: "ADD_TO_CART",
        rawText: cleanText,
        unavailableItem: matchedItem,
        assistantMessage: `I apologize, our ${matchedItem.name} is currently sold out today. Would you like to explore our other signature dishes?`,
        isActionable: false,
      };
    }

    const quantity = extractQuantity(cleanText);
    const portion = extractPortion(cleanText);
    const spiceLevel = extractSpice(cleanText);
    const toppings = extractToppings(cleanText);

    const customization: FoodCustomization = {
      portion,
      spiceLevel,
      toppings,
    };

    const portionText = portion.label !== "Chef's Standard" ? ` (${portion.label})` : "";
    const spiceText = spiceLevel !== "Mild" ? ` • ${spiceLevel} spice` : "";
    const toppingsText = toppings.length > 0 ? ` with extra ${toppings.map((t) => t.name).join(", ")}` : "";

    return {
      intent: "ADD_TO_CART",
      rawText: cleanText,
      matchedItem,
      quantity,
      customization,
      assistantMessage: `I found ${quantity}× ${matchedItem.name}${portionText}${spiceText}${toppingsText} ($${(
        matchedItem.price * quantity
      ).toFixed(2)}). Would you like to confirm and add this to your cart?`,
      isActionable: true,
    };
  }

  // Unrecognized
  return {
    intent: "UNKNOWN",
    rawText: cleanText,
    assistantMessage: `I didn't recognize any dishes matching "${cleanText}". We offer Truffle Tagliatelle, Prime Ribeye, Burrata, and more. What would you like?`,
    isActionable: false,
  };
}
