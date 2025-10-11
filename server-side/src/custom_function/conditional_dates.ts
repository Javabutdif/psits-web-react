export const expiryStatus = (date_end: Date) => {
  const current = new Date();

  return current > date_end;
};
