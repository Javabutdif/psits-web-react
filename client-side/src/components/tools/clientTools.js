import { getInformationData } from "../../authentication/Authentication";

export const formattedDate = (date) => {
  const dates = new Date(date);

  return dates.toLocaleDateString();
};

//None dont have access
//Standard have access to all except finance, executive and admin (PRO, PIO, Chief Volunteer, REPs)
//Finance have access to all except executive and admin (Treasurer, Assitant Treasurer, Auditor)
//Executive have access to all except admin (President, Vice-President Internal, Vice-President External, Secretary)
//Admin have access to all (Head Developer)

export const noneConditionalAccess = () => {
  const data = getInformationData();
  return data.access === "none";
};
export const standardConditionalAccess = () => {
  const data = getInformationData();
  return data.access === "standard" && data.campus === "UC-Main";
};
export const financeConditionalAccess = () => {
  const data = getInformationData();
  return data.access === "finance" && data.campus === "UC-Main";
};
export const executiveConditionalAccess = () => {
  const data = getInformationData();
  return data.access === "executive" && data.campus === "UC-Main";
};
export const adminConditionalAccess = () => {
  const data = getInformationData();
  return data.access === "admin" && data.campus === "UC-Main";
};

//Dynamic access levels
export const financeAndAdminConditionalAccess = () => {
  return financeConditionalAccess() || adminConditionalAccess();
};
export const executiveAndAdminConditionalAccess = () => {
  return executiveConditionalAccess() || adminConditionalAccess();
};

//Logs access
export const logsAccess = () => {
  return financeAndAdminConditionalAccess() || executiveConditionalAccess();
};
export const settingsAccess = () => {
  return financeAndAdminConditionalAccess() || executiveConditionalAccess();
};

export const restrictedComponent = () => {
  return ["logs", "settings"];
};

export const restrictedComponentOtherCampus = () => {
  return [
    "events",
    "statistics",
    "raffle",
    "attendance",
    "addAttendee",
    "qrCodeScanner",
    "profile",
  ];
};
