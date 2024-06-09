// Key = AuthenticationToken
// Value = ID Number of Student / Admin
// Time = 20 Minutes Max
// Position = Admin / Student

//Set Authentication when successful login
export const setAuthentication = (value, position) => {
  const currentTime = new Date().getTime();
  const time = 20 * 60 * 1000;
  const expiryTime = currentTime + time;

  const authen = { value, expiry: expiryTime, role: position };
  localStorage.setItem("AuthenticationToken", JSON.stringify(authen));
};

//Retrive Token sa Private Route, every route e check if valid pa ang token
export const getAuthentication = (key) => {
  const authen = localStorage.getItem(key);
  if (!authen) return null;

  const item = JSON.parse(authen);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.role;
};

//Remove Authentication after logout
export const removeAuthentication = (key) => {
  localStorage.removeItem(key);
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
