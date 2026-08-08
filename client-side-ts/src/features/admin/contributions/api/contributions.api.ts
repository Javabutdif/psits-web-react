import axios from "axios";
import type { AxiosError } from "axios";
import backendConnection from "../../../../api/backendApi";
import { showToast } from "../../../../utils/alertHelper";
import type {
  Contribution,
  SyncStatus,
  CreateContributionPayload,
  UpdateContributionPayload,
  SetGithubUsernamePayload,
  AdminOption,
  StudentOption,
} from "../types/contribution.types";

interface ApiErrorResponse {
  message?: string;
}

const getAuthToken = (): string | null => sessionStorage.getItem("Token");

const createHeaders = () => ({
  "Content-Type": "application/json",
  ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
});

const handleApiError = (error: unknown, showUser = true): void => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const message = axiosError.response?.data?.message || "An error occurred";
    if (showUser) showToast("error", message);
    console.error("API Error:", axiosError.response?.data || axiosError.message);
  } else {
    if (showUser) showToast("error", "An unexpected error occurred");
    console.error("Unexpected Error:", error);
  }
};

export const searchStudents = async (
  query: string
): Promise<StudentOption[] | void> => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/v2/contributions/students/search`,
      { headers: createHeaders(), params: { q: query } }
    );
    return response.data.data || [];
  } catch (error) {
    handleApiError(error, false);
    return undefined;
  }
};

export const getAdminOptions = async (): Promise<AdminOption[] | void> => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/v2/contributions/admins`,
      { headers: createHeaders() }
    );
    return response.data.data || [];
  } catch (error) {
    handleApiError(error, false);
    return undefined;
  }
};

export const getContributions = async (
  type?: string
): Promise<Contribution[] | void> => {
  try {
    const params = type ? { type } : {};
    const response = await axios.get(
      `${backendConnection()}/api/v2/contributions`,
      { headers: createHeaders(), params }
    );
    return response.data.data || [];
  } catch (error) {
    handleApiError(error, false);
    return undefined;
  }
};

export const createContribution = async (
  payload: CreateContributionPayload
): Promise<boolean> => {
  try {
    const response = await axios.post(
      `${backendConnection()}/api/v2/contributions`,
      payload,
      { headers: createHeaders() }
    );
    if (response.status === 201) {
      showToast("success", "Contribution created successfully");
      return true;
    }
    return false;
  } catch (error) {
    handleApiError(error);
    return false;
  }
};

export const updateContribution = async (
  id: string,
  payload: UpdateContributionPayload
): Promise<boolean> => {
  try {
    const response = await axios.put(
      `${backendConnection()}/api/v2/contributions/${id}`,
      payload,
      { headers: createHeaders() }
    );
    if (response.status === 200) {
      showToast("success", "Contribution updated successfully");
      return true;
    }
    return false;
  } catch (error) {
    handleApiError(error);
    return false;
  }
};

export const deleteContribution = async (
  id: string
): Promise<boolean> => {
  try {
    const response = await axios.delete(
      `${backendConnection()}/api/v2/contributions/${id}`,
      { headers: createHeaders() }
    );
    if (response.status === 200) {
      showToast("success", "Contribution deleted successfully");
      return true;
    }
    return false;
  } catch (error) {
    handleApiError(error);
    return false;
  }
};

export const syncDeveloperContributions = async (): Promise<boolean> => {
  try {
    const response = await axios.post(
      `${backendConnection()}/api/v2/contributions/github/sync`,
      {},
      { headers: createHeaders() }
    );
    if (response.status === 200) {
      showToast("success", "Developer contributions synced");
      return true;
    }
    return false;
  } catch (error) {
    handleApiError(error);
    return false;
  }
};

export const getGithubSyncStatus = async (): Promise<SyncStatus | void> => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/v2/contributions/github/status`,
      { headers: createHeaders() }
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, false);
    return undefined;
  }
};

export const setGithubUsername = async (
  idNumber: string,
  payload: SetGithubUsernamePayload
): Promise<boolean> => {
  try {
    const response = await axios.patch(
      `${backendConnection()}/api/v2/contributions/admin/${idNumber}/github-username`,
      payload,
      { headers: createHeaders() }
    );
    if (response.status === 200) {
      showToast("success", "GitHub username updated");
      return true;
    }
    return false;
  } catch (error) {
    handleApiError(error);
    return false;
  }
};