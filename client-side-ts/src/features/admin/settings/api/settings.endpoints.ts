import axios, { type AxiosError, type AxiosResponse } from "axios";
import backendConnection from "../../../../api/backendApi";
import { showToast } from "../../../../utils/alertHelper";

interface ApiErrorResponse {
  message?: string;
}

const getAuthToken = (): string | null => sessionStorage.getItem("Token");

const createHeaders = () => ({
  "Content-Type": "application/json",
  ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
});

export const membershipPrice = async (): Promise<number | false> => {
  try {
    const response: AxiosResponse<{ data: { membership_price: number } }> =
      await axios.get(`${backendConnection()}/api/admin/get-membership-price`, {
        headers: createHeaders(),
      });
    return response.status === 200
      ? response.data.data.membership_price
      : false;
  } catch {
    return false;
  }
};

export const changeMembershipPrice = async (
  price: string | number
): Promise<boolean> => {
  const newPriceFormData = new FormData();
  newPriceFormData.set("price", String(price));
  try {
    const response: AxiosResponse = await axios.put(
      `${backendConnection()}/api/admin/change-membership-price`,
      newPriceFormData,
      { headers: createHeaders() }
    );
    if (response.status === 200) showToast("success", response.data.message);
    return response.status === 200;
  } catch (error) {
    console.error("Error changing membership price:", error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const message = axiosError.response?.data?.message || "Failed to update membership price";
      showToast("error", message);
    } else {
      showToast("error", "An unexpected error occurred");
    }
    return false;
  }
};
