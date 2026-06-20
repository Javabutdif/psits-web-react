const CAMPUS_ALIASES: Record<string, string> = {
  ucmain: "UC-MAIN",
  ucbanilad: "UC-BANILAD",
  uclm: "UC-LM",
  ucpt: "UC-PT",
  uccs: "UC-CS",
};

export const normalizeCampus = (campus?: string | null): string => {
  if (!campus) return "";

  const compact = campus.toLowerCase().replace(/[^a-z0-9]/g, "");
  return CAMPUS_ALIASES[compact] ?? campus;
};
