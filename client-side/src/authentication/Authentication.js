import { jwtDecode } from "jwt-decode";
import { react, useEffect, useState } from "react";
import axios from "axios";
import backendConnection from "../api/backendApi";

export const useUser = async () => {
  let user;
  try {
    const response = await axios.get(
      `${backendConnection()}/api/protected-route`,
      {
        withCredentials: true,
      }
    );
   
    if (response.data.role === "Admin") {
      user = {
        name: response.data.user.name,
        position: response.data.user.position,
        id: response.data.user.id_number,
        course: response.data.user.course,
        role: response.data.role,
        year: response.data.user.year,
        email: response.data.user.email,
      };
      sessionStorage.setItem("Data", JSON.stringify(user));
    } else if (response.data.role === "Student") {
      user = {
        id: response.data.user.id_number,
        course: response.data.user.course,
        name:
          response.data.user.first_name +
          " " +
          response.data.user.middle_name +
          " " +
          response.data.user.last_name,

        position: response.data.user.position,
        year: response.data.user.year,
        rfid: response.data.user.rfid,
        role: response.data.role,
        email: response.data.user.email,
      };

      sessionStorage.setItem("Data", JSON.stringify(user));
    }
  } catch (err) {
    console.log("Authentication");
    console.error("Not authorized:", err);
  } 
};

export const getRoute = () => {
  const sessionToken = sessionStorage.getItem("Data");
  if (!sessionToken) return null;

  return !sessionToken ? null : sessionToken.role;
};
export const getInformationData = () => {
  const sessionToken = JSON.parse(sessionStorage.getItem("Data"));

  return {
    id_number: sessionToken.id,
    name: sessionToken.name,
    email: sessionToken.email,
    course: sessionToken.course,
    year: sessionToken.year,
    role: sessionToken.role,
    position: sessionToken.position,
  };
};


export const removeAuthentication = () => {
  localStorage.removeItem("Data");
  sessionStorage.removeItem("Data");
};

//Attempt Increment
export const attemptAuthentication = () => {
  let attempt = parseInt(localStorage.getItem("attempt")) || 0;
  if (attempt === 2) {
    timeOutAuthentication();
  }
  attempt++;
  localStorage.setItem("attempt", attempt);
};

//Retrieve Attempt for conditional
export const getAttemptAuthentication = () => {
  return parseInt(localStorage.getItem("attempt")) || 0;
};
//Reset Attempt when successful login
export const resetAttemptAuthentication = () => {
  localStorage.removeItem("attempt");
};
//After 3 attempts, mu set og 1 minute rest para dili stress sa database
export const timeOutAuthentication = () => {
  const currentTime = new Date().getTime();
  const time = 60 * 1000;
  const expiryTime = currentTime + time;

  localStorage.setItem("timeout", expiryTime);
};
//E retrieve ang timeout
export const getTimeout = () => {
  const now = new Date();
  const time = localStorage.getItem("timeout");

  if (!time) {
    return null;
  }

  if (now.getTime() > time) {
    localStorage.removeItem("timeout");
    localStorage.removeItem("attempt");
    return null;
  }

  return time;
};
