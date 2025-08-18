import { Notyf } from "notyf";
import "notyf/notyf.min.css";

const notyf = new Notyf({
  duration: 2000,
  position: { x: "left", y: "top" },
});

export const showToast = (type, message) => {
  if (type === "success") notyf.success(message);
  else notyf.error(message);
};
