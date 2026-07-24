import {
  getAllOfficers,
  editAdminAccess,
  revokeAllStudent,
  membershipPrice,
  changeMembershipPrice,
} from "@/features/admin/api/admin";
import type { Officer } from "../types/settings.types";
import type { PsitsRole } from "@/features/admin/constants/adminAccess";

export const fetchOfficers = async (roleFilter?: string): Promise<Officer[] | undefined> => {
  return getAllOfficers(roleFilter) as unknown as Officer[];
};

export const updateOfficerAccess = async (
  id_number: string,
  newAccess: PsitsRole
): Promise<boolean | void> => {
  return editAdminAccess(id_number, [newAccess]);
};

export const fetchMembershipPrice = async (): Promise<number | false> => {
  return membershipPrice();
};

export const updateMembershipPrice = async (
  price: string | number
): Promise<boolean> => {
  return changeMembershipPrice(price);
};

export const revokeAllActiveMemberships = async (): Promise<boolean> => {
  return revokeAllStudent();
};
