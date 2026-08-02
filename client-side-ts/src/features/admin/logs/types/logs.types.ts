export interface AdminLog {
  _id: string;
  admin: string;
  admin_id: string;
  action: string;
  target?: string;
  target_id?: string;
  target_model?: string;
  timestamp: string;
}

export interface LogFilters {
  search: string;
  action: string;
  fromDate: string;
  toDate: string;
}

export const LogEventOptions = [
  "Admin Login (v2)",
  "Admin Logged Out (V2)",
  "Change Password",
  "Edited Admin",
  "Edited Student",
  "Edited Merchandise",
  "Edited Order",
  "Changed Student Password",
  "Admin Login",
  "Admin Logged Out",
  "Exported Merchandise Report CSV",
  "Remove Role",
  "Suspend Admin Account",
  "Restore Suspended Admin",
  "Requested a Role",
  "Approved a Role",
  "Declined a Role",
  "Create Admin Account",
  "Approved Admin Account",
  "Declined Admin Account",
  "Change Access",
];
