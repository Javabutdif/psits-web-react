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
