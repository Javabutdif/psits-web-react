import "../App.css";
import backendConnection from "./backendApi";
import axios from "axios";
import { showToast } from "../utils/alertHelper";
import { setAuthentication } from "../authentication/Authentication";

export const login = async (formData) => {
  try {
    const response = await axios.post(
      `${backendConnection()}/api/login`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;

    if (data.role === "Admin" || data.role === "Student") {
      showToast("success", "Signed in successfully");
      setAuthentication(data.name, data.id_number, data.role, data.position);

      return data.role;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error:", error);
    showToast("error", "An error occurred. Please try again.");
    return null;
  }
};

export const register = async (formData) => {
  try {
    const response = await axios.post(
      `${backendConnection()}/api/register`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return true;
  } catch (error) {
    console.error("Error:", error);
    showToast("error", "An error occurred. Please try again.");
    return null;
  }
};
