export interface EmailQueueEntry {
  _id: string;
  type: string;
  subtype?: string;
  email: string;
  status: string;
  referenceCode?: string;
  retryCount: number;
  timestamp: Date;
}

export interface HealthStats {
  uptime: string;
  memory: { used: number; total: number };
  emailConfigured: boolean;
  mongoConnected: boolean;
  students: number;
  pendingOrders: number;
  merchItems: number;
  activeEvents: number;
  memberships: number;
}

export interface SessionInfo {
  id: string;
  name: string;
  idNumber: string;
  role: "admin" | "student";
  campus?: string;
  position?: string;
}
