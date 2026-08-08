export type ContributionType = "developer" | "media" | "volunteer";

export interface Contribution {
  _id: string;
  memberId: string;
  idNumber: string;
  name?: string;
  type: ContributionType;
  githubUsername?: string;
  commitCount?: number;
  description?: string;
  date: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncStatus {
  lastSyncedAt: string | null;
  status: "success" | "error" | null;
  developerCount: number;
  repository?: string;
  errorMessage?: string;
  failedDevelopers?: { githubUsername: string; error: string }[];
}

export interface CreateContributionPayload {
  idNumber: string;
  type: "developer" | "media" | "volunteer";
  description: string;
  date: string;
}

export interface AdminOption {
  _id: string;
  id_number: string;
  name: string;
  position?: string;
}

export interface StudentOption {
  _id: string;
  id_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  course?: string;
  year?: number;
}

export interface UpdateContributionPayload {
  description?: string;
  date?: string;
}

export interface SetGithubUsernamePayload {
  githubUsername: string;
}