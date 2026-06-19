import { Router } from "express";

import {
  getSearchStudentByIdController,
  approveMembershipController,
  revokeAllMembershipController,
  getMembershipHistoryController,
  getMembershipRequestController,
  getStudentsCountController,
  getActiveMembershipCountController,
  getPublishMerchandiseCountController,
  getOrderPlacedCountController,
  getStudentDashboardCountController,
  getDailySalesController,
  getAllAdminAccountsController,
  getAllAdminMembersController,
  getAllSuspendAdminAccountController,
  editAdminAccountController,
  changeAdminPasswordController,
  setSuspendAdminAccountController,
  setMemberRoleRemoveController,
  setRestoreAdminAccountController,
  setAdminRequestRoleController,
  getAllRequestMemberController,
  getAllRequestAdminAccountController,
  approveRoleMemberController,
  setDeclineMemberRoleController,
  addNewAdminAccountController,
  approveAdminAccountController,
  declineAdminAccountController,
  setNewAdminAccessController,
  getMembershipPrice,
  changeMembershipPrice,
} from "../controllers/admin.controller";
import {
  requireAccessTokenV2,
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
  adminAccessAuthenticateV2,
} from "../middlewares/authV2.middleware";
const router = Router();

//Search student by ID
router.get(
  "/student_search/:id_number",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getSearchStudentByIdController
);
//ApproveMembership
router.post(
  "/approve-membership",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin", "finance"]),
  approveMembershipController
);
//Revoke Student Membership
router.put(
  "/revoke-student",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin"]),
  revokeAllMembershipController
);
//Membership History
router.get(
  "/history",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getMembershipHistoryController
);
//Membership Request
router.get(
  "/membership-request",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getMembershipRequestController
);
//Dashboard Student Counts
router.get(
  "/get-students-count",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getStudentsCountController
);
//get-active-membership-count
router.get(
  "/get-active-membership-count",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getActiveMembershipCountController
);
//Dashboard Publish Merchandise Count
router.get(
  "/merchandise-created",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getPublishMerchandiseCountController
);
//Dashboard Placed Order Count
router.get(
  "/placed-orders",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getOrderPlacedCountController
);
//All Student Dashboard Stats
router.get(
  "/dashboard-stats",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getStudentDashboardCountController
);
//Get Daily Sales Stats
router.get(
  "/get-daily-sales",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getDailySalesController
);
//Get All admin officers
router.get(
  "/get-all-officers",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin", "finance", "executive"]),
  getAllAdminAccountsController
);
//Get All Members
router.get(
  "/get-all-members",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getAllAdminMembersController
);
//Get Suspend Admin Accounts
router.get(
  "/get-suspend-officers",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getAllSuspendAdminAccountController
);
//Edit Admin Account
router.post(
  "/edit-officer",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin"]),
  editAdminAccountController
);
//Change Password Admin Account
router.post(
  "/change-password-officer",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin"]),
  changeAdminPasswordController
);
//Set Admin Account to Suspend
router.put(
  "/suspend",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin"]),
  setSuspendAdminAccountController
);
//Set Member Role Remove
router.put(
  "/role-remove",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin", "executive"]),
  setMemberRoleRemoveController
);
//Set Restore Deleted Admin
router.put(
  "/restore-officer",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin"]),
  setRestoreAdminAccountController
);
//Set Admin Request Role to Member
router.put(
  "/request-role",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  setAdminRequestRoleController
);
//Get all Members Account Request Role
router.get(
  "/get-request-role",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getAllRequestMemberController
);
//Get all Admin Account Request Role
router.get(
  "/get-request-admin",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getAllRequestAdminAccountController
);
//Set Approve Role for Members
router.put(
  "/approve-role",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin"]),
  approveRoleMemberController
);
//Set Decline Role for Members
router.put(
  "/decline-role",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin"]),
  setDeclineMemberRoleController
);
//Add New Admin Account
router.post(
  "/add-officer",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin"]),
  addNewAdminAccountController
);
//Approve Admin Account Creation
router.put(
  "/approve-admin-account",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin"]),
  approveAdminAccountController
);
//Decline Admin Account Creation
router.put(
  "/decline-admin-account",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin"]),
  declineAdminAccountController
);
//update-admin-access
router.put(
  "/update-admin-access",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  setNewAdminAccessController
);
router.get(
  "/get-membership-price",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getMembershipPrice
);
router.put(
  "/change-membership-price",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin", "finance"]),
  changeMembershipPrice
);

export default router;
