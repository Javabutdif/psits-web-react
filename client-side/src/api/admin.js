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
export const deletedStudent = async () => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/students/deleted-students`,
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

export const renewAllStudent = async () => {
  try {
    const response = await axios.put(
      `${backendConnection()}/api/renew-student`,
      {}, // Pass an empty object if no data needs to be sent
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.status === 200;
  } catch (error) {
    if (error.response && error.response.data) {
      showToast("error", error.response.data.message || "An error occurred");
    } else {
      showToast("error", "An error occurred");
    }
    console.error("Renew all students error:", error); // Optional: Log the error for debugging
    return false; // Explicitly return false in case of an error
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
      },
    });

    return response.data.message;
  } catch (error) {
    if (error.response && error.response.data) {
      console.log("error", error.response.data.message || "An error occurred");
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
export const approveOrders = () => {};

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
      console.log("error", error.response.data.message || "An error occurred");
    } else {
      console.log("error", "An error occurred");
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

export const merchandiseAdmin = async () => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/merch/retrieve-admin`,
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

export const deleteMerchandise = async (_id) => {
  try {
    const response = await axios.put(
      `${backendConnection()}/api/merch/delete-soft`,
      { _id },
      {
        headers: {
          "Content-Type": "application/json",
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
//Soft Delete
export const studentDeletion = async (id_number, name) => {
  try {
    const response = await axios.put(
      `${backendConnection()}/api/students/softdelete`,
      { id_number, name },
      {
        headers: {
          "Content-Type": "application/json",
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
export const updateMerchandise = async () => {};
export const merchandiseHistory = async () => {};
export const merchandiseOrder = async () => {};
export const orders = async () => {};
export const resources = async () => {};
export const settings = async () => {};
export const student = async () => {};
