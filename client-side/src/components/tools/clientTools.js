import { getInformationData } from "../../authentication/Authentication";

export const formattedDate = (date) => {
  const dates = new Date(date);
  if (isNaN(dates.getTime())) {
    return "Invalid Date";
  } else {
    return dates.toLocaleDateString();
  }
};

export const handlePrintDataPos = (name) => {
  const words = name.split(" ");
  let fullName = "";

  for (let i = 0; i < words.length - 1; i++) {
    fullName += words[i].charAt(0) + ".";
  }
  fullName += " " + words[words.length - 1];

  return fullName;
};

export const generateReferenceCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let referenceCode = "";
  for (let i = 0; i < 11; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    referenceCode += characters[randomIndex];
  }
  return referenceCode;
};

export const capitalizeWord = (word) => {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

export const formattedLastName = (name) => {
  const names = name.trim().split(/\s+/);
  if (names.length < 2) return name;
  const lastName = names.pop();
  const firstNames = names.join(" ");
  return `${lastName}, ${firstNames}`;
};

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
