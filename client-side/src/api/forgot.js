import "../App.css";
import backendConnection from "./backendApi";
import axios from "axios";
import { showToast } from "../utils/alertHelper";
const token = sessionStorage.getItem("Token");

export const forgotPassword = async (email, id_number) => {
  try {
    const response = await axios.post(
      `${backendConnection()}/api/student/forgot-password`,
      {
        email,
        id_number,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      showToast("success", response.data.message);
      return true;
    } else {
      showToast("error", response.data.message);
      return false;
    }
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred");
    }
    console.error("Error:", error);
    return false;
  }
};

export const changePassword = async (password, id_number) => {
  try {
    const response = await axios.post(
      `${backendConnection()}/api/students/change-password-admin`,
      {
        password,
        id_number,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      showToast("success", response.data.message);
      return true;
    } else {
      showToast("error", response.data.message);
      return false;
    }
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred");
    }
    console.error("Error:", error);
    return false;
  }
};

export const changePasswordAdmin = async (password, id_number) => {
  try {
    const response = await axios.post(
      `${backendConnection()}/api/admin/change-password-officer`,
      {
        password,
        id_number,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      showToast("success", response.data.message);
      return true;
    } else {
      showToast("error", response.data.message);
      return false;
    }
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred");
    }
    console.error("Error:", error);
    return false;
  }
};
