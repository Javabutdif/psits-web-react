export type ProductVariation = {
  /** Persisted to the DB. Never change these - existing orders reference them. */
  value: string;
  /** Shown to admins in the picker. */
  label: string;
  /** Rendered as the colour dot on the student-facing detail view. */
  swatch: string;
  /** When set, this variation is only offered for these product categories. */
  categories?: string[];
};

export const PRODUCT_VARIATION_OPTIONS: ProductVariation[] = [
  // uniform-only
  {
    value: "Set A (BSIT)",
    label: "Set A",
    swatch: "#ffffff",
    categories: ["uniform"],
  },
  {
    value: "Set B (BSCS)",
    label: "Set B",
    swatch: "#a855f7",
    categories: ["uniform"],
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
 * Uniform products only offer Set A / Set B. Everything else falls back to the
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
