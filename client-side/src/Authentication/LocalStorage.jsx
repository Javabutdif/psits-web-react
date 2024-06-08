// Key = AuthenticationToken
// Value = ID Number of Student / Admin
// Time = 20 Minutes Max
// Position = Admin / Student

export const setAuthentication = (key, value, time, position) => {
  const getTime = Date().getTime();
  //set the authentication
  const authen = { value, expiry: getTime + time, role: position };
  localStorage.setItem(key, JSON.stringify(authen));
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
