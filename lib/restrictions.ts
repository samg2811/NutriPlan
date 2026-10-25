// Dietary restriction filtering. This file has no browser or server code,
// so it can be used in components and in API routes.
//
// It checks ingredient names (and the meal name) for keywords. It is a
// best-effort check, not a guarantee: an ingredient with an unusual name
// can slip through, so people with allergies must still read labels.

export type RestrictionDef = {
  id: string;
  label: string;
  terms: string[]; // words that make a meal NOT allowed
  except?: string[]; // phrases that look like a match but are fine
};

const MEAT = [
  "chicken", "turkey", "beef", "pork", "bacon", "ham", "sausage", "steak",
  "lamb", "veal", "duck", "goose", "venison", "bison", "brisket", "burger",
  "hamburger", "hot dog", "pepperoni", "salami", "prosciutto", "pancetta",
  "chorizo", "meatball", "meatloaf", "meat", "rib", "jerky", "bone broth",
  "bratwurst", "kielbasa", "carnitas",
];
const FISH = [
  "fish", "salmon", "tuna", "cod", "tilapia", "trout", "halibut", "mackerel",
  "sardine", "anchovy", "anchovies", "haddock", "bass", "snapper", "catfish",
  "mahi", "swordfish", "worcestershire",
];
const SHELLFISH = [
  "shrimp", "prawn", "crab", "lobster", "crawfish", "crayfish", "clam",
  "mussel", "oyster", "scallop", "squid", "octopus", "calamari", "shellfish",
];
const DAIRY = [
  "milk", "cheese", "butter", "cream", "yogurt", "yoghurt", "whey", "casein",
  "ghee", "parmesan", "mozzarella", "cheddar", "feta", "ricotta", "paneer",
  "half and half", "buttermilk", "kefir", "mascarpone", "provolone", "gouda",
  "brie", "cotija", "queso",
];
const DAIRY_EXCEPT = [
  "peanut butter", "almond butter", "nut butter", "cashew butter",
  "sunflower butter", "cocoa butter", "shea butter", "butternut",
  "coconut milk", "coconut cream", "almond milk", "oat milk", "soy milk",
  "rice milk", "cashew milk", "cream of tartar", "dairy-free", "dairy free",
  "non-dairy", "vegan cheese", "vegan butter",
];
const EGG = ["egg", "mayonnaise", "mayo"];
const MEAT_EXCEPT = [
  "plant-based meat", "meat substitute", "meat alternative", "vegan meat",
];

export const RESTRICTIONS: RestrictionDef[] = [
  {
    id: "vegetarian",
    label: "Vegetarian",
    terms: [...MEAT, ...FISH, ...SHELLFISH, "gelatin", "lard"],
    except: MEAT_EXCEPT,
  },
  {
    id: "vegan",
    label: "Vegan",
    terms: [
      ...MEAT, ...FISH, ...SHELLFISH, ...DAIRY, ...EGG,
      "honey", "gelatin", "lard",
    ],
    except: [...MEAT_EXCEPT, ...DAIRY_EXCEPT],
  },
  {
    id: "pescatarian",
    label: "Pescatarian",
    terms: [...MEAT, "gelatin", "lard"],
    except: MEAT_EXCEPT,
  },
  {
    id: "gluten-free",
    label: "Gluten-free",
    terms: [
      "wheat", "flour", "bread", "breadcrumb", "panko", "pasta", "spaghetti",
      "macaroni", "noodle", "tortilla", "pita", "bagel", "couscous", "barley",
      "rye", "bulgur", "farro", "seitan", "cracker", "soy sauce", "oat",
      "oatmeal", "bun", "pancake", "waffle", "cereal", "biscuit", "muffin",
      "crouton", "lasagna", "orzo", "udon", "ramen",
    ],
    except: [
      "corn tortilla", "gluten-free", "gluten free", "rice noodle",
      "rice flour", "almond flour", "coconut flour", "corn flour",
      "rice pasta",
    ],
  },
  { id: "dairy-free", label: "Dairy-free", terms: DAIRY, except: DAIRY_EXCEPT },
  { id: "egg-free", label: "Egg-free", terms: EGG },
  { id: "peanut-free", label: "Peanut-free", terms: ["peanut"] },
  {
    id: "tree-nut-free",
    label: "Tree-nut-free",
    terms: [
      "almond", "walnut", "pecan", "cashew", "pistachio", "hazelnut",
      "macadamia", "brazil nut", "pine nut", "chestnut", "nut", "praline",
      "nutella", "marzipan",
    ],
    except: ["water chestnut"],
  },
  { id: "shellfish-free", label: "Shellfish-free", terms: SHELLFISH },
  { id: "fish-free", label: "Fish-free", terms: FISH },
  {
    id: "soy-free",
    label: "Soy-free",
    terms: [
      "soy", "soybean", "soya", "tofu", "tempeh", "edamame", "miso", "tamari",
      "teriyaki",
    ],
  },
  { id: "sesame-free", label: "Sesame-free", terms: ["sesame", "tahini", "hummus"] },
  {
    id: "no-pork",
    label: "No pork",
    terms: [
      "pork", "bacon", "ham", "prosciutto", "pepperoni", "salami", "sausage",
      "hot dog", "lard", "chorizo", "pancetta", "bratwurst", "kielbasa",
      "carnitas",
    ],
  },
  {
    id: "no-beef",
    label: "No beef",
    terms: ["beef", "steak", "veal", "burger", "hamburger", "brisket", "meatball"],
  },
];

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Whole-word match that also allows a plural ending ("egg" matches "eggs",
// but "egg" does not match "eggplant")
function makeMatcher(terms: string[], flags = "i") {
  const alt = terms.map(escapeRe).join("|");
  return new RegExp(`\\b(?:${alt})(?:s|es)?\\b`, flags);
}

const COMPILED = new Map(
  RESTRICTIONS.map((def) => [
    def.id,
    {
      def,
      match: makeMatcher(def.terms),
      except: def.except?.length ? makeMatcher(def.except, "gi") : null,
    },
  ])
);

// Turns what a person typed ("Mushrooms") into a search word ("mushroom")
export function normalizeAvoidTerm(raw: string): string {
  let t = raw.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 40);
  t = t.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");
  if (t.length < 2) return "";
  if (t.endsWith("ies") && t.length > 4) return t.slice(0, -3) + "y";
  if (/(ches|shes|sses|xes|oes)$/.test(t)) return t.slice(0, -2);
  if (t.endsWith("s") && !t.endsWith("ss") && t.length > 3) return t.slice(0, -1);
  return t;
}

export type Prefs = { ids: string[]; avoid: string[] };

// Makes sure saved or received preferences are safe to use
export function cleanPrefs(ids: unknown, avoid: unknown): Prefs {
  const cleanIds = Array.isArray(ids)
    ? Array.from(
        new Set(
          ids.filter((x): x is string => typeof x === "string" && COMPILED.has(x))
        )
      )
    : [];
  const cleanAvoid = Array.isArray(avoid)
    ? Array.from(
        new Set(
          avoid
            .filter((x): x is string => typeof x === "string")
            .map((x) => x.toLowerCase().trim().slice(0, 40))
            .filter((x) => x.length >= 2)
        )
      ).slice(0, 20)
    : [];
  return { ids: cleanIds, avoid: cleanAvoid };
}

type MealLike = { name: string; ingredients: { name: string }[] };

// Returns the reasons a meal is not allowed (empty list = allowed)
export function findViolations(
  meal: MealLike,
  ids: string[],
  avoid: string[] = []
): string[] {
  const texts = [meal.name, ...meal.ingredients.map((i) => i.name)];
  const reasons: string[] = [];

  for (const id of ids) {
    const c = COMPILED.get(id);
    if (!c) continue;
    for (const t of texts) {
      const clean = c.except ? t.toLowerCase().replace(c.except, " ") : t.toLowerCase();
      if (c.match.test(clean)) {
        reasons.push(`${c.def.label}: ${t}`);
        break;
      }
    }
  }

  for (const raw of avoid) {
    const term = normalizeAvoidTerm(raw);
    if (!term) continue;
    const re = makeMatcher([term]);
    for (const t of texts) {
      if (re.test(t.toLowerCase())) {
        reasons.push(`Avoiding "${raw}": ${t}`);
        break;
      }
    }
  }

  return reasons;
}

export function isMealAllowed(meal: MealLike, ids: string[], avoid: string[] = []) {
  return findViolations(meal, ids, avoid).length === 0;
}

// Readable list like ["Vegetarian", "Peanut-free", "mushroom"]
export function describePrefs(ids: string[], avoid: string[]): string[] {
  const labels = ids
    .map((id) => COMPILED.get(id)?.def.label)
    .filter((x): x is string => Boolean(x));
  return [...labels, ...avoid];
}
