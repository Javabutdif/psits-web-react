import { jwtDecode } from "jwt-decode";
import { react, useEffect, useState } from "react";
import axios from "axios";
import backendConnection from "../api/backendApi";

//Set Authentication when successful login
export const setAuthentication = (token) => {
  if (!token) return null;
  const user = jwtDecode(token);
  const currentTime = new Date().getTime();
  const time = user.role === "Student" ? 20 * 60 * 1000 : 60 * 60 * 1000;
  const expiryTime = currentTime + time;

  const authen =
    user.role === "Admin"
      ? {
          name: user.user.name,
          id: user.user.id_number,
          course: user.user.course,
          year: user.user.year,
          position: user.user.position,
          expiry: expiryTime,
          role: user.role,
        }
      : {
          id: user.user.id_number,
          position: user.user.position,
          expiry: expiryTime,
        };
  localStorage.setItem("Data", JSON.stringify(authen));
  sessionStorage.setItem("Token", token);
};

export const getAuthentication = () => {
  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((row) => row.startsWith("token="));

  if (!tokenCookie) return null;

  const token = tokenCookie.split("=")[1]; // Extract the token value

  // Check if the token exists and is valid
  if (token) {
    // You can add logic here to check the validity of the token
    console.log(token);
    return "Token is present"; // Return a placeholder or flag
  }

  return null; // Token not found
};

export const getRoute = () => {
  const sessionToken = sessionStorage.getItem("Token");
  if (!sessionToken) return null;
  const token = jwtDecode(sessionToken);

  return !sessionToken ? null : token.role;
};

//Edit Student
export const setRetrieveStudent = (data, course, year) => {
  const authen = localStorage.getItem("Data");
  if (!authen) return null;
  const users = JSON.parse(authen);

  const edited =
    users.role === "Student"
      ? {
          name: users.name,
          id: users.id,
          course: course,
          year: year,
          email: data,
          position: users.position,
          expiry: users.expiry,
          membership: users.membership,
          role: users.role,
        }
      : {
          name: data,
          id: users.id,
          course: course,
          year: year,
          position: users.position,
          expiry: users.expiry,
          role: users.role,
        };
  localStorage.setItem("Data", JSON.stringify(edited));
};

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
      console.log(response.data);
      user = {
        name: response.data.user.name,
        position: response.data.user.position,
        id: response.data.user.id_number,
      };
    } else if (response.data.role === "Student") {
      console.log(response.data);
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
      };
    }
  } catch (err) {
    console.error("Not authorized:", err);
  } finally {
    console.log(user.id);
    return user; // Return user, loading state, and error
  }
};
export const getPosition = () => {
  const sessionToken = sessionStorage.getItem("Token");
  if (!sessionToken) return null;
  const token = jwtDecode(sessionToken);

  return token.user.position;
};
export const getId = () => {
  const sessionToken = sessionStorage.getItem("Token");
  if (!sessionToken) return null;
  const token = jwtDecode(sessionToken);

  return token.user.id_number;
};
export const getRfid = () => {
  const sessionToken = sessionStorage.getItem("Token");
  if (!sessionToken) return null;
  const token = jwtDecode(sessionToken);

  return token.user.rfid;
};
export const getMembershipStatus = () => {
  const authen = localStorage.getItem("Data");
  if (!authen) return null;
  const users = JSON.parse(authen);

  if (!users.membership) {
    const sessionToken = sessionStorage.getItem("Token");
    if (!sessionToken) return null;
    const token = jwtDecode(sessionToken);
    return token.user.membership;
  } else {
    return users.membership;
  }
};
export const getRenewStatus = () => {
  const sessionToken = sessionStorage.getItem("Token");
  if (!sessionToken) return null;
  const token = jwtDecode(sessionToken);
  return token.user.renew === undefined ? "None" : token.user.renew;
};

export const getInformationData = () => {
  const sessionToken = sessionStorage.getItem("Token");
  const token = jwtDecode(sessionToken);
  let name =
    token.role === "Admin"
      ? token.user.name
      : token.user.first_name +
        " " +
        token.user.middle_name +
        " " +
        token.user.last_name;
  return [
    token.user.id_number,
    name,
    token.user.email,
    token.user.course,
    token.user.year,
    token.user.role,
    token.user.position,
  ];
};

//Remove Authentication after logout
export const removeAuthentication = () => {
  localStorage.removeItem("Data");
  sessionStorage.removeItem("Token");
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
