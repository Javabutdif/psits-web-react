import { getPosition } from "../../authentication/Authentication";

export const formattedDate = (date) => {
  const dates = new Date(date);

  return dates.toLocaleDateString();
};

export const conditionalPosition = () => {
  const position = getPosition();

  return (
    position === "Treasurer" ||
    position === "Assistant Treasurer" ||
    position === "Auditor" ||
    position === "Developer"
  );
};
