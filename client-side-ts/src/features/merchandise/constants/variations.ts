export type ProductVariation = {
  value: string;
  label: string;
  swatch: string;
  categories?: string[];
  autoSelect?: boolean;
};

export const PRODUCT_VARIATION_OPTIONS: ProductVariation[] = [
  // uniform-only
  {
    value: "White",
    label: "White",
    swatch: "#ffffff",
    categories: ["uniform"],
    autoSelect: true,
  },
  {
    value: "Purple",
    label: "Purple",
    swatch: "#a855f7",
    categories: ["uniform"],
    autoSelect: true,
  },
  // general colours
  { value: "Black", label: "Black", swatch: "#000000" },
  { value: "Red", label: "Red", swatch: "#ef4444" },
  { value: "Yellow", label: "Yellow", swatch: "#eab308" },
  { value: "Orange", label: "Orange", swatch: "#f97316" },
  { value: "Blue", label: "Blue", swatch: "#3b82f6" },
  { value: "Green", label: "Green", swatch: "#22c55e" },
  { value: "Pink", label: "Pink", swatch: "#ec4899" },
  { value: "Gray", label: "Gray", swatch: "#9ca3af" },
  { value: "Brown", label: "Brown", swatch: "#92400e" },
  { value: "Cyan", label: "Cyan", swatch: "#06b6d4" },
  { value: "Magenta", label: "Magenta", swatch: "#d946ef" },
  { value: "Teal", label: "Teal", swatch: "#14b8a6" },
  { value: "Maroon", label: "Maroon", swatch: "#7f1d1d" },
  { value: "Innovatio", label: "Innovatio", swatch: "#1C9DDE" },
  { value: "Paradox", label: "Paradox", swatch: "#6366f1" },
  { value: "BSIT Wave", label: "BSIT Wave", swatch: "#0ea5e9" },
];

/** Kept so any existing import of PRODUCT_VARIATIONS keeps compiling. */
export const PRODUCT_VARIATIONS = PRODUCT_VARIATION_OPTIONS.map(
  (variation) => variation.value
);

const VARIATION_BY_VALUE = new Map(
  PRODUCT_VARIATION_OPTIONS.map((option) => [option.value, option])
);

/**
 * Uniform products only offer White / Purple. Everything else falls back to the
 * general colour list (any option without a `categories` restriction).
 */
export const getVariationsForCategory = (category?: string) => {
  const scoped = PRODUCT_VARIATION_OPTIONS.filter((option) =>
    option.categories?.includes(category ?? "")
  );
  return scoped.length > 0
    ? scoped
    : PRODUCT_VARIATION_OPTIONS.filter((option) => !option.categories);
};

export const getVariationSwatch = (value: string) =>
  VARIATION_BY_VALUE.get(value)?.swatch ?? "#d4d4d4";

export const getVariationLabel = (value: string) =>
  VARIATION_BY_VALUE.get(value)?.label ?? value;

export const getAutoSelectedVariations = (category?: string) =>
  getVariationsForCategory(category)
    .filter((option) => option.autoSelect)
    .map((option) => option.value);

const BUNDLED_VARIATION_CATEGORIES = ["uniform"];
export const isBundledVariationCategory = (category?: string) =>
  BUNDLED_VARIATION_CATEGORIES.includes((category ?? "").toLowerCase());
