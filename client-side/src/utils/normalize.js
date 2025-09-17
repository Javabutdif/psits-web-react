export default function normalizeField(field) {
  if (!field) return [];

  // Case 1: Already a simple array of strings
  if (Array.isArray(field) && typeof field[0] === "string") {
    return field;
  }

  // Case 2: Array of objects with $each
  if (Array.isArray(field) && field[0]?.$each) {
    return field[0].$each;
  }

  // Case 3: Single string
  if (typeof field === "string") {
    return [field];
  }

  return [];
}
