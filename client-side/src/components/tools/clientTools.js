import { getInformationData } from "../../authentication/Authentication";

export const formattedDate = (date) => {
  const dates = new Date(date);

  return dates.toLocaleDateString();
};

export const conditionalPosition = () => {
  const user = getInformationData();

  return (
    user.position === "Treasurer" ||
    user.position === "Assistant Treasurer" ||
    user.position === "Auditor" ||
    user.position === "Head Developer" ||
    user.position === "President"
  );
};

export const higherPosition = () => {
  const user = getInformationData();

  return (
    user.position === "President" ||
    user.position === "Head Developer" ||
    user.position === "Developer"
  );
};
export const mediaPosition = () => {
  const user = getInformationData();

  return user.position === "P.R.O";
};
export const volunteerPosition = () => {
  const user = getInformationData();

  return user.position === "Chief Volunteer";
};

export const headDevPosition = () => {
  const user = getInformationData();

  return user.position === "Head Developer";
};
export const presidentPosition = () => {
  const user = getInformationData();

  return user.position === "President";
};
export const treasurerPosition = () => {
  const user = getInformationData();

  return user.position === "Treasurer";
};
export const higherOfficers = () => {
  const user = getInformationData();

  return (
    user.position === "President" ||
    user.position === "Vice-President Internal" ||
    user.position === "Vice-President External" ||
    user.position === "Secretary" ||
    user.position === "Head Developer"
  );
};

export const deletePosition = () => {
  const user = getInformationData();

  return user.position === "Treasurer" || user.position === "Head Developer";
};

export const restrictedComponent = () => {
  return ["logs"];
};

export const restrictedComponentOtherCampus = () => {
  return [
    "events",
    "statistics",
    "raffle",
    "attendance",
    "addAttendee",
    "qrCodeScanner",
  ];
};
