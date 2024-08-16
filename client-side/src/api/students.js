import "../App.css";
import backendConnection from "./backendApi";
import axios from "axios";
import { showToast } from "../utils/alertHelper";
import {
  setRetrieveStudent,
  setMembershipStatus,
} from "../authentication/Authentication";

export const requestMembership = async (id_number) => {
  try {
    console.log("Sending request for ID:", id_number);
    const response = await axios.put(
      `${backendConnection()}/api/students/request`,
      { id_number },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      showToast("success", response.data.message);
      setMembershipStatus();
    } else {
      showToast("error", response.data.message);
    }
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred");
    }
    console.error("Error:", error);
  }
};

export const edit = async (formData) => {
  try {
    const response = await axios.post(
      `${backendConnection()}/api/edit`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const { student, message } = response.data;
    if (response.status === 200) {
      showToast("success", message);

      setRetrieveStudent(student.data, student.course, student.year);
    } else {
      showToast("error", message);
    }
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred");
    }
    console.error("Error:", error);
  }
};

export const getMembershipStatusStudents = async (id_number) => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/students/get-membership-status`,
      {
        params: { id_number }, // Use params to pass query parameters
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      console.log(response.data);
      return response.data;
    } else {
      showToast("error", response.data.message);
    }
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred");
    }
    console.error("Error:", error);
  }
};

export const addToCartApi = async (formData) => {
  try {
    const response = await axios.post(
      `${backendConnection()}/api/cart/add-cart`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      showToast("success", response.data.message);
    } else {
      showToast("error", response.data.message);
    }
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred");
    }
    console.error("Error:", error);
  }
};



export const viewCart = async (id_number) => {
  try {
    const response = await axios.get(`${backendConnection()}/api/cart/view-cart`, {
      params: { id_number },
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    if (error.response && error.response.data) {
      console.error("Error:", error);
    } else {
      console.error("Error:", error);
    }
    console.error("Error:", error);
  }
};
