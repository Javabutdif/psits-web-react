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
    user.position === "Head Developer"
  );
};

export const higherPosition = () => {
  const user = getInformationData();

  return user.position === "Developer" || user.position === "Head Developer";
};

export const deletePosition = () => {
  const user = getInformationData();

  return user.position === "Treasurer" || user.position === "Head Developer";
};
