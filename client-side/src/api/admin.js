import "../App.css";
import backendConnection from "./backendApi";
import axios from "axios";
import { showToast } from "../utils/alertHelper";

export const membership = async () => {
  try {
    const response = await axios.get(`${backendConnection()}/api/students`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

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
export const membershipRequest = async () => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/membershipRequest`,
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
export const approveMembership = async (formData) => {
  try {
    const response = await axios.post(
      `${backendConnection()}/api/approve-membership`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.status === 200 ? true : false;
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred");
    }
  }
};
//Total Numbers of All Members
export const allMembers = async () => {
  try {
    const response = await axios.get(`${backendConnection()}/api/all-members`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data.message;
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred");
    }
  }
};
//Total Numbers of all request
export const totalRequest = async () => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/request-members`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.message;
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred");
    }
  }
};
//Total Numbers of all Renewal
export const totalRenewal = async () => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/renewal-members`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.message;
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred");
    }
  }
};
//Total Numbers of all Deleted
export const totalDeleted = async () => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/deleted-members`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.message;
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred");
    }
  }
};
//History Total
export const totalHistory = async () => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/history-members`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.message;
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred");
    }
  }
};
export const editStudent = async () => {};
export const inventory = async () => {};
export const analytics = async () => {};
export const membershipHistory = async () => {
  try {
    const response = await axios.get(`${backendConnection()}/api/history`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred");
    }
  }
};
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

export const merchandiseHistory = async () => {};
export const merchandiseOrder = async () => {};
export const orders = async () => {};
export const resources = async () => {};
export const settings = async () => {};
export const student = async () => {};
