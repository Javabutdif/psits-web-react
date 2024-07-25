import React from "react";
import UnderConstruction from "../components/UnderConstruction";
const organizationHierarchy = [
  {
    role: "President",
    image: "https://example.com/images/president.png",
  },
  {
    role: "Vice Presidents - Internal",
    members: [
      { role: "Vice President - Internal 1", image: "https://example.com/images/vp-internal-1.png" },
      { role: "Vice President - Internal 2", image: "https://example.com/images/vp-internal-2.png" }
    ]
  },
  {
    role: "Key Roles",
    members: [
      { role: "Auditor", image: "https://example.com/images/auditor.png" },
      { role: "Secretary", image: "https://example.com/images/secretary.png" },
      { role: "Treasurer", image: "https://example.com/images/treasurer.png" }
    ]
  },
  {
    role: "Additional Roles",
    members: [
      { role: "Assistant Treasurer", image: "https://example.com/images/assistant-treasurer.png" },
      { role: "Public Information Officer (PIO)", image: "https://example.com/images/pio.png" },
      { role: "Chief Volunteer", image: "https://example.com/images/chief-volunteer.png" },
      { role: "Public Relations Officer (PRO)", image: "https://example.com/images/pro.png" }
    ]
  },
  {
    role: "Representatives",
    members: [
      { role: "Representative - 2nd Year", image: "https://example.com/images/rep-2nd-year.png" },
      { role: "Representative - 3rd Year", image: "https://example.com/images/rep-3rd-year.png" },
      { role: "Representative - 4th Year", image: "https://example.com/images/rep-4th-year.png" }
    ]
  }
];



function Faculty() {
  



  return (
    <div className="container text-center p-5">
      <UnderConstruction />
    </div>
  );
}
export default Faculty;
