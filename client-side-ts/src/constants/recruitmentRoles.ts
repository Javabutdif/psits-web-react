export type RecruitmentRolePosition = {
  id: string;
  name: string;
};

export type RecruitmentRoleCatalogItem = {
  id: string;
  title: string;
  positions: RecruitmentRolePosition[];
};

export const RECRUITMENT_ROLE_CATALOG: RecruitmentRoleCatalogItem[] = [
  {
    id: "developer",
    title: "Developer",
    positions: [
      { id: "frontend", name: "Front-end" },
      { id: "backend", name: "Back-end" },
      { id: "fullstack", name: "Full-stack" },
      { id: "uiux", name: "UI/UX Designer" },
      { id: "qa", name: "QA Tester" },
    ],
  },
  {
    id: "media",
    title: "Media Creative",
    positions: [
      { id: "video", name: "Videographer" },
      { id: "photo", name: "Photojournalist" },
      { id: "creatives", name: "Creatives" },
      { id: "techwrite", name: "Technical Writer" },
    ],
  },
  {
    id: "officer",
    title: "Officer",
    positions: [
      { id: "president", name: "President" },
      { id: "vp-external", name: "Vice Pres. - External" },
      { id: "vp-internal", name: "Vice Pres. - Internal" },
      { id: "auditor", name: "Auditor" },
      { id: "asst-treasurer", name: "Asst. Treasurer" },
      { id: "treasurer", name: "Treasurer" },
      { id: "secretary", name: "Secretary" },
      { id: "chief-volunteer", name: "Chief Volunteer" },
      { id: "pro", name: "PRO" },
      { id: "pio", name: "PIO" },
      { id: "rep-1st", name: "1st Year REP" },
      { id: "rep-2nd", name: "2nd Year REP" },
      { id: "rep-3rd", name: "3rd Year REP" },
      { id: "rep-4th", name: "4th Year REP" },
    ],
  },
  {
    id: "volunteer",
    title: "Volunteer",
    positions: [],
  },
];
