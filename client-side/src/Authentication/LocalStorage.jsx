// Key = AuthenticationToken
// Value = ID Number of Student / Admin
// Time = 20 Minutes Max
// Position = Admin / Student

export const setAuthentication = (value, position) => {
  const currentTime = new Date().getTime();
  const time = 20 * 60 * 1000;
  const expiryTime = currentTime + time;

  // Set the authentication object
  const authen = { value, expiry: expiryTime, role: position };
  localStorage.setItem("AuthenticationToken", JSON.stringify(authen));
};

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

export const removeAuthentication = (key) => {
  localStorage.removeItem(key);
};
