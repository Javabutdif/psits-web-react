import "../App.css";
import { showToast } from "../utils/alertHelper";
import backendConnection from "./backendApi";
import axios from "axios";

const token = sessionStorage.getItem("Token");

export const getEvents = async () => {
  try {
    const response = await axios.get(`${backendConnection()}/api/events`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return false;
    } else {
      console.log("error", "An error occurred");
      return false;
    }
  }
};

//getAttendee

export const getAttendees = async (id) => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/events/attendees/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(response.data.data[0]);
    return {
      data: response.data.data[0],
      attendees: response.data.data[0].attendees,
    };
  } catch (error) {
    if (error.response && error.response.data) {
      return false;
    } else {
      console.log("error", "An error occurred");
      return false;
    }
  }
};

export const markAsPresent = async (eventId, attendeeId, navigate) => {
  try {
    const url = `${backendConnection()}/api/events/attendance/${eventId}/${attendeeId}`;

    const response = await axios.put(
      url,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      showToast("success", "Attendance successfully recorded!");
      navigate(`/admin/attendance/${eventId}`); // Navigate back after successful update
    }
  } catch (error) {
    console.error("Error marking attendance:", error);

    if (error.response) {
      switch (error.response.status) {
        case 403:
          showToast("error", "Access denied. Admins only.");
          break;
        case 404:
          showToast("error", "Event or attendee not found.");
          break;
        case 400:
          showToast("error", "Attendance already recorded.");
          break;
        default:
          showToast("error", "An error occurred while recording attendance.");
      }
    } else {
      showToast("error", "An error occurred while recording attendance.");
    }
  }
};

///check-limit/:eventId
export const getEventCheck = async (eventId) => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/events/check-limit/${eventId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(response.data.data.limit);
    return response.data.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return false;
    } else {
      console.log("error", "An error occurred");
      return false;
    }
  }
};

export const updateEventSettings = async (formData, eventId) => {
  try {
    const response = await axios.post(
      `${backendConnection()}/api/events/update-settings/${eventId}`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.status === 200 ? true : false;
  } catch (error) {
    if (error.response && error.response.data) {
      return false;
    } else {
      console.log("error", "An error occurred");
      return false;
    }
  }
};

export const raffleWinner = async (eventId, campus) => {
  try {
    const data = campus ? { campus } : {}; // Only include campus if specified

    const response = await axios.post(
      `${backendConnection()}/api/events/raffle/${eventId}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error selecting raffle winner:", error);
    return error;
  }
};

export const removeRaffleAttendee = async (eventId, attendeeId) => {
  try {
    const response = await axios.put(
      `${backendConnection()}/api/events/raffle/remove/${eventId}/${attendeeId}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error removing attendee from raffle:", error);
    return false;
  }
};

//add-attendee
export const addAttendee = async (formData) => {
  try {
    const response = await axios.post(
      `${backendConnection()}/api/events/add-attendee`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    showToast(
      response.status === 200 ? "success" : "error",
      response.data.message
    );
    return response.status === 200 ? true : false;
  } catch (error) {
    console.error("Error selecting raffle winner:", error);
    return error;
  }
};
///get-statistics/:eventId
export const getStatistic = async (eventId) => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/events/get-statistics/${eventId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.status === 200 ? response.data : [];
  } catch (error) {
    if (error.response && error.response.data) {
      return false;
    } else {
      console.log("error", "An error occurred");
      return false;
    }
  }
};
