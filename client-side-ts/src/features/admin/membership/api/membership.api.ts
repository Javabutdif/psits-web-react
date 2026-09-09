import api from "@/api/axios";
import { showToast } from "@/utils/alertHelper";
import type {
  Membership,
  MembershipReportFilters,
  CreateMembershipFormData,
  UpdateMembershipFormData,
  HistoryRecord,
} from "../types/membership.types";

export const getMemberships = async (
  filters?: MembershipReportFilters
): Promise<Membership[] | undefined> => {
  try {
    const params: Record<string, string> = {};
    if (filters?.name?.trim()) params.name = filters.name.trim();
    if (filters?.from) params.from = filters.from;
    if (filters?.to) params.to = filters.to;
    const response = await api.get("/api/membership", { params });
    if (response.status === 200) {
      return response.data?.data as Membership[];
    }
    return undefined;
  } catch (error: any) {
    console.error("Failed to fetch memberships:", error);
    return undefined;
  }
};

export const getMembershipById = async (
  id: string
): Promise<Membership | undefined> => {
  try {
    const response = await api.get(`/api/membership/${id}`);
    if (response.status === 200) {
      return response.data?.data as Membership;
    }
    return undefined;
  } catch (error: any) {
    console.error("Failed to fetch membership:", error);
    return undefined;
  }
};

export const getMembershipHistories = async (
  id: string
): Promise<HistoryRecord[] | undefined> => {
  try {
    const response = await api.get(`/api/membership/${id}/histories`);
    if (response.status === 200) {
      return response.data?.data as HistoryRecord[];
    }
    return undefined;
  } catch (error: any) {
    console.error("Failed to fetch membership histories:", error);
    return undefined;
  }
};

export const activateMembership = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post(`/api/membership/${id}/activate`);
    if (response.status === 200) {
      const message =
        response.data?.message ?? "Membership activated successfully.";
      showToast("success", message);
      return { success: true, message };
    }
    return { success: false, message: "Failed to activate membership." };
  } catch (error: any) {
    const message =
      error?.response?.data?.message ?? "Failed to activate membership.";
    showToast("error", message);
    return { success: false, message };
  }
};

export const createMembership = async (
  data: CreateMembershipFormData
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post("/api/membership", data);
    if (response.status === 201) {
      showToast(
        "success",
        response.data?.message ?? "Membership created successfully."
      );
      return {
        success: true,
        message: response.data?.message ?? "Membership created successfully.",
      };
    }
    return { success: false, message: "Failed to create membership." };
  } catch (error: any) {
    const message =
      error?.response?.data?.message ?? "Failed to create membership.";
    showToast("error", message);
    return { success: false, message };
  }
};

export const updateMembership = async (
  id: string,
  data: UpdateMembershipFormData
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.put(`/api/membership/${id}`, data);
    if (response.status === 200) {
      showToast(
        "success",
        response.data?.message ?? "Membership updated successfully."
      );
      return {
        success: true,
        message: response.data?.message ?? "Membership updated successfully.",
      };
    }
    return { success: false, message: "Failed to update membership." };
  } catch (error: any) {
    const message =
      error?.response?.data?.message ?? "Failed to update membership.";
    showToast("error", message);
    return { success: false, message };
  }
};

export const revokeMembership = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/api/membership/${id}`);
    if (response.status === 200) {
      showToast(
        "success",
        response.data?.message ?? "Membership revoked successfully."
      );
      return {
        success: true,
        message: response.data?.message ?? "Membership revoked successfully.",
      };
    }
    return { success: false, message: "Failed to revoke membership." };
  } catch (error: any) {
    const message =
      error?.response?.data?.message ?? "Failed to revoke membership.";
    showToast("error", message);
    return { success: false, message };
  }
};

export const expirePastDueMemberships = async (): Promise<{
  success: boolean;
  count: number;
}> => {
  try {
    const response = await api.post("/api/membership/expire-past-due");
    if (response.status === 200) {
      showToast(
        "success",
        response.data?.message ?? "Expired past-due memberships."
      );
      return { success: true, count: response.data?.count ?? 0 };
    }
    return { success: false, count: 0 };
  } catch (error: any) {
    console.error("Failed to expire memberships:", error);
    return { success: false, count: 0 };
  }
};
