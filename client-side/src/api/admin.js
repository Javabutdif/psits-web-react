import "../App.css";
import backendConnection from "./backendApi";
import axios from "axios";
import { showToast } from "../utils/alertHelper";

export const membershipRequest = async () => {};
export const editStudent = async () => {};
export const inventory = async () => {};
export const analytics = async () => {};
export const membershipHistory = async () => {};
export const membershipRenewal = async () => {};
export const merchandise = async () => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/merch/retrieve`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred");
    }
    console.error("Error:", error);
  }
};
export const searchMerchandise = async (searchQuery) => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/merch/:${searchQuery}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred");
    }
    console.error("Error:", error);
  }
};
export const merchandiseHistory = async () => {};
export const merchandiseOrder = async () => {};
export const orders = async () => {};
export const resources = async () => {};
export const settings = async () => {};
export const student = async () => {};
