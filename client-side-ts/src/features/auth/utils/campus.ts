const CAMPUS_ALIASES: Record<string, string> = {
  ucmain: "UC_MAIN",
  ucbanilad: "UC_BANILAD",
  uclm: "UC_LM",
  ucpt: "UC_PT",
  uccs: "UC_CS",
};

export const normalizeCampus = (campus?: string | null): string => {
  if (!campus) return "";

  const compact = campus.toLowerCase().replace(/[^a-z0-9]/g, "");
  return CAMPUS_ALIASES[compact] ?? campus;
};
