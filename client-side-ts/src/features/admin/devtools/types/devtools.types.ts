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

export interface CronExecutionLog {
  _id: string;
  jobName: string;
  scheduledAt: Date;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface EnvStatusItem {
  key: string;
  configured: boolean;
  value: string | null;
}

export interface RateLimitStats {
  windowMs: number;
  maxRequests: number;
  blockedToday: number;
}

export interface CollectionStat {
  name: string;
  docs: number;
  avgObjSize: number;
  storageSize: number;
  indexes: number;
  warning?: string;
}
