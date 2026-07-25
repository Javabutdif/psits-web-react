import axios from "axios";
import type { AxiosError, AxiosResponse } from "axios";
import backendConnection from "@/api/backendApi";
import { showToast } from "@/utils/alertHelper";
import type { PromoLogEntry } from "../types/promo.types";

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
    console.error(
      "API Error:",
      axiosError.response?.data || axiosError.message
    );
  } else {
    if (showUser) showToast("error", "An unexpected error occurred");
    console.error("Unexpected Error:", error);
  }
};

export const createPromoCode = async (formData: FormData): Promise<boolean> => {
  try {
    const token = getAuthToken();
    const response: AxiosResponse = await axios.post(
      `${backendConnection()}/api/promo/create`,
      formData,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (response.status === 200) {
      showToast("success", response.data.message);
      return true;
    } else {
      showToast("error", response.data.message);
      return false;
    }
  } catch (error) {
    handleApiError(error);
    return false;
  }
};

export const updatePromoCode = async (formData: FormData): Promise<boolean> => {
  try {
    const token = getAuthToken();
    const response: AxiosResponse = await axios.post(
      `${backendConnection()}/api/promo/update`,
      formData,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (response.status === 200) {
      showToast("success", response.data.message);
      return true;
    } else {
      showToast("error", response.data.message);
      return false;
    }
  } catch (error) {
    handleApiError(error);
    return false;
  }
};

export const getAllPromoCodes = async () => {
  try {
    const response: AxiosResponse = await axios.get(
      `${backendConnection()}/api/promo/fetch`,
      { headers: createHeaders() }
    );
    console.log(response);
    if (response.status === 200) {
      return response.data.promo;
    }
    return response.data.promo;
  } catch (error) {
    handleApiError(error);
  }
};

export const deletePromo = async (id: string): Promise<boolean> => {
  try {
    const response: AxiosResponse = await axios.delete(
      `${backendConnection()}/api/promo/delete/${id}`,
      { headers: createHeaders() }
    );
    if (response.status === 200) {
      showToast("success", response.data.message);
      return true;
    } else {
      showToast("error", response.data.message);
      return false;
    }
  } catch (error) {
    handleApiError(error);
    return false;
  }
};

export const getPromoLogs = async (): Promise<PromoLogEntry[] | undefined> => {
  try {
    const response: AxiosResponse<{ log: PromoLogEntry[] }> = await axios.get(
      `${backendConnection()}/api/promo/log`,
      { headers: createHeaders() }
    );
    if (response.status === 200) {
      return response.data.log;
    }
    return undefined;
  } catch (error) {
    handleApiError(error);
    return undefined;
  }
};
