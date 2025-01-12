import "../App.css";
import { showToast } from "../utils/alertHelper";
import backendConnection from "./backendApi";
import axios from "axios";

const token = sessionStorage.getItem("Token");

export const membership = async () => {
  try {
    const response = await axios.get(`${backendConnection()}/api/students`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      window.location.reload();
      return false;
    } else {
      console.log("error", "An error occurred");
      return false;
    }
  }
};
export const deletedStudent = async () => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/students/deleted-students`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
export const membershipRequest = async () => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/membershipRequest`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

export const renewAllStudent = async () => {
  try {
    const response = await axios.put(
      `${backendConnection()}/api/renew-student`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
       showToast("success", response.data.message);
    }
    return response.status === 200;
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred");
    }
    console.error("Renew all students error:", error);
    return false;
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
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      return true;
    } else {
      console.error(response.data.message);
      showToast("error", response.data.message || "An error occurred");
    }
  } catch (error) {
    if (error.response && error.response.data) {
      console.error(error);
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      console.error(error);
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
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.message;
  } catch (error) {
    if (error.response && error.response.data) {
      console.log("error", error.response.data.message || "An error occurred");
      window.location.reload();
    } else {
      console.log("error", "An error occurred");
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
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.message;
  } catch (error) {
    if (error.response && error.response.data) {
      console.log("error", error.response.data.message || "An error occurred");
    } else {
      console.log("error", "An error occurred");
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
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.message;
  } catch (error) {
    if (error.response && error.response.data) {
      console.log("error", error.response.data.message || "An error occurred");
    } else {
      console.log("error", "An error occurred");
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
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.message;
  } catch (error) {
    if (error.response && error.response.data) {
      console.log("error", error.response.data.message || "An error occurred");
    } else {
      console.log("error", "An error occurred");
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
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.message;
  } catch (error) {
    if (error.response && error.response.data) {
      console.log("error", error.response.data.message || "An error occurred");
    } else {
      console.log("error", "An error occurred");
    }
  }
};

export const merchCreated = async () => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/merchandise-created`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.message;
  } catch (error) {
    if (error.response && error.response.data) {
      console.log("error", error.response.data.message || "An error occurred");
    } else {
      console.log("error", "An error occurred");
    }
  }
};
export const placedOrders = async () => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/placed-orders`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.message;
  } catch (error) {
    if (error.response && error.response.data) {
      console.log("error", error.response.data.message || "An error occurred");
    } else {
      console.log("error", "An error occurred");
    }
  }
};

export const renewStudent = async () => {
  try {
    const response = await axios.get(`${backendConnection()}/api/renew`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      console.log("error", error.response.data.message || "An error occurred");
    } else {
      console.log("error", "An error occurred");
    }
  }
};

export const membershipHistory = async () => {
  try {
    const response = await axios.get(`${backendConnection()}/api/history`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      console.log("error", error.response.data.message || "An error occurred");
    } else {
      console.log("error", "An error occurred");
    }
  }
};

export const merchandise = async () => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/merch/retrieve`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

export const merchandiseAdmin = async () => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/merch/retrieve-admin`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

export const deleteMerchandise = async (_id) => {
  try {
    const response = await axios.put(
      `${backendConnection()}/api/merch/delete-soft`,
      { _id },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      return true;
    } else {
      return false;
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

export const publishMerchandise = async (_id) => {
  try {
    const response = await axios.put(
      `${backendConnection()}/api/merch/publish`,
      { _id },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      return true;
    } else {
      return false;
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
//Hard Delete
export const requestDeletion = async (id_number) => {
  try {
    const response = await axios.put(
      `${backendConnection()}/api/students/cancel/${id_number}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.status;
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred");
    }
    console.error("Error:", error);
  }
};

export const studentDeletion = async (id_number, name) => {
  try {
    const response = await axios.put(
      `${backendConnection()}/api/students/softdelete`,
      { id_number, name },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.status;
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred");
    }
    console.error("Error:", error);
  }
};
export const studentRestore = async (id_number) => {
  try {
    const response = await axios.put(
      `${backendConnection()}/api/students/restore`,
      { id_number },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.status;
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred");
    }
    console.error("Error:", error);
  }
};

//Create Merchandise
export const addMerchandise = async (formData) => {
  try {
    const response = await axios.post(
      `${backendConnection()}/api/merch`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 201) {
      return true;
    } else {
      return false;
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

export const getDashboardStats = async () => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/dashboard-stats`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      console.log("error", error.response.data.message || "An error occurred");
    } else {
      console.log("error", "An error occurred");
    }
  }
};

export const getOrderDate = async () => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/get-order-date`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      console.log("error", error.response.data.message || "An error occurred");
    } else {
      console.log("error", "An error occurred");
    }
  }
};

export const deleteReports = async (id, merchName) => {
  try {
    const response = await axios.delete(
      `${backendConnection()}/api/merch/delete-report`,

      {
        data: { id, merchName },
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
      return false;
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

//get-all-officers

export const getAllOfficers = async () => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/get-all-officers`,

      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      console.log(response.data.data);
      return response.data.data;
    }
  } catch (error) {
    if (error.response && error.response.data) {
      //showToast("error", error.response.data.message || "An error occurred");
    } else {
      //showToast("error", "An error occurred");
    }
    console.error("Error:", error);
  }
};

export const getSuspendOfficers = async () => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/get-suspend-officers`,

      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      console.log(response.data.data);
      return response.data.data;
    }
  } catch (error) {
    if (error.response && error.response.data) {
      //showToast("error", error.response.data.message || "An error occurred");
    } else {
      //showToast("error", "An error occurred");
    }
    console.error("Error:", error);
  }
};

export const editOfficerApi = async (updatedMember) => {
  try {
    const response = await axios.post(
      `${backendConnection()}/api/editOfficer`,
      updatedMember,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      showToast("success", response.data.message);
    } else {
      console.error(response.data.message);
    }
  } catch (error) {
    if (error.response && error.response.data) {
      console.error(error);
    } else {
      console.error(error);
    }
  }
};

export const officerSuspend = async (id_number) => {
  try {
    const response = await axios.put(
      `${backendConnection()}/api/admin/suspend`,
      { id_number },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(response.data.message);
    return response.status;
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred");
    }
    console.error("Error:", error);
  }
};
export const officerRestore = async (id_number) => {
  try {
    const response = await axios.put(
      `${backendConnection()}/api/admin/restore-officer`,
      { id_number },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.status;
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred");
    }
    console.error("Error:", error);
  }
};
