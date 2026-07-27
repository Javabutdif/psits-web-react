import "../App.css";
import { showToast } from "../utils/alertHelper";
import backendConnection from "./backendApi";
import axios from "axios";

export const login = async (formData) => {
  try {
    const response = await axios.post(
      `${backendConnection()}/api/login`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    if (response.status === 200) {
      const { accessToken, user, message } = response.data;

      sessionStorage.setItem("Token", accessToken);

      return {
        role: user.role === "admin" ? "Admin" : "Student",
        campus: user.campus,
        token: accessToken,
        message,
      };
    } else {
      showToast("error", response.data.message);
      return false;
    }
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
      return false;
    } else {
      showToast("error", "An error occurred");
      return false;
    }
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
    if (response.status === 200) {
      return true;
    } else {
      showToast("error", response.data.message);
    }
    // console.log(response.data.message);
  } catch (error) {
    console.error("Error:", error.response.data.message);
    showToast("error", error.response.data.message);
    return null;
  }
};

export const handleLogouts = async () => {
  try {
    const response = await axios.post(
      `${backendConnection()}/api/v2/auth/logout`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    if (response.status === 200) {
      return true;
    } else {
      showToast("error", response.data.message);
    }

    // console.log(response.data.message);
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data.message : error.message
    );
    showToast(
      "error",
      error.response ? error.response.data.message : error.message
    );
    return null;
  }
};
