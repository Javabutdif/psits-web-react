import { jwtDecode } from "jwt-decode";

//Set Authentication when successful login
export const setAuthentication = (token) => {
  const user = jwtDecode(token);
  const currentTime = new Date().getTime();
  const time = user.role === "Student" ? 20 * 60 * 1000 : 60 * 60 * 1000;
  const expiryTime = currentTime + time;

  const authen =
    user.role === "Admin"
      ? {
          name:
            user.user.first_name +
            " " +
            user.user.middle_name +
            " " +
            user.user.last_name,
          id: user.user.id_number,
          course: user.user.course,
          year: user.user.year,
          position: user.user.position,
          expiry: expiryTime,
          role: user.role,
        }
      : {
          name:
            user.user.first_name +
            " " +
            user.user.middle_name +
            " " +
            user.user.last_name,
          id: user.user.id_number,
          course: user.user.course,
          year: user.user.year,
          email: user.user.email,
          position: user.user.position,
          expiry: expiryTime,
          membership: user.user.membership,
          role: user.role,
        };
  localStorage.setItem("Data", JSON.stringify(authen));
  sessionStorage.setItem("Token", token);
};

//Retrive Token sa Private Route, every route e check if valid pa ang token
export const getAuthentication = () => {
  try {
    const authen = localStorage.getItem("Data");
    const sessionToken = sessionStorage.getItem("Token");
    const token = jwtDecode(sessionToken);
    if (!authen) return null;

    const item = JSON.parse(authen);
    const now = new Date();

    if (now.getTime() > item.expiry) {
      localStorage.removeItem("Data");
      sessionStorage.removeItem("Token");
      return null;
    }
    if (
      item.id === token.user.id_number &&
      item.position === token.user.position
    ) {
      if (item.role === "Admin") {
        return "Administrator";
      } else {
        return "Student";
      }
    } else {
      return null;
    }
  } catch (Exception) {
    removeAuthentication();
    return null;
  }
};

export const getRoute = () => {
  const authen = localStorage.getItem("Data");
  const info = JSON.parse(authen);

  return !authen ? null : info.role;
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

export const getUser = () => {
  const authen = localStorage.getItem("Data");
  if (!authen) return null;
  const user = JSON.parse(authen);

  if (user.position === "N/A") return [user.name, user.role];

  return [user.name, user.position, user.id];
};
export const getId = () => {
  const authen = localStorage.getItem("Data");
  if (!authen) return null;
  const user = JSON.parse(authen);

  return user.id;
};
export const getMembershipStatus = () => {
  const authen = localStorage.getItem("Data");
  if (!authen) return null;
  const user = JSON.parse(authen);

  return user.membership;
};
export const setMembershipStatus = () => {
  const authen = localStorage.getItem("Data");
  if (!authen) return null;
  const users = JSON.parse(authen);

  const edited = {
    name: users.name,
    id: users.id,
    course: users.course,
    year: users.year,
    position: users.position,
    expiry: users.expiry,
    membership: "Pending",
    role: users.role,
  };
  localStorage.setItem("Data", JSON.stringify(edited));
};
export const getInformationData = () => {
  const authen = localStorage.getItem("Data");
  if (!authen) return null;

  const info = JSON.parse(authen);

  return [
    info.id,
    info.name,
    info.email,
    info.course,
    info.year,
    info.role,
    info.position,
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
