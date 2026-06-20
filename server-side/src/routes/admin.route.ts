import { Router } from "express";

import {
  getSearchStudentByIdController,
  getDashboardStats,
  getAllAdminMembersController,
  getAllSuspendAdminAccountController,
  editAdminController,
  changeAdminPasswordController,
  setSuspendAdminAccountController,
  setMemberRoleRemoveController,
  setRestoreAdminAccountController,
  setAdminRequestRoleController,
  getAllRequestAdminAccountController,
  approveRoleMemberController,
  setDeclineMemberRoleController,
  addNewAdminAccountController,
  approveAdminAccountController,
  declineAdminAccountController,
  setNewAdminAccessController,
  getAllAdminController,
  getStudentCountController,
} from "../controllers/admin.v2.controller";
import {
  approveMembershipController,
  getMembershipHistoryController,
  getMembershipRequestController,
  getActiveMembershipCountController,
  revokeAllMembershipController,
  changeMemberPriceController,
  getMemberPriceController,
} from "../controllers/membership.v2.controller";

import {
  requireAccessTokenV2,
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
  adminAccessAuthenticateV2,
} from "../middlewares/authV2.middleware";
import { psits_roles } from "../enums/role.enums";
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
  adminAccessAuthenticateV2([psits_roles.ADMIN, psits_roles.FINANCE]),
  approveMembershipController
);
//Revoke Student Membership
router.put(
  "/revoke-student",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2([psits_roles.ADMIN]),
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
  "/get-dashboard",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getDashboardStats
);
router.get(
  "/dashboard-stats",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getDashboardStats
);
//get-active-membership-count
router.get(
  "/get-active-membership-count",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getActiveMembershipCountController
);

//get-student-count
router.get(
  "/get-students-count",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getStudentCountController
);

//Get All admin officers
router.get(
  "/get-all-officers",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2([
    psits_roles.ADMIN,
    psits_roles.FINANCE,
    psits_roles.EXECUTIVE,
  ]),
  getAllAdminController
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
  adminAccessAuthenticateV2([psits_roles.ADMIN]),
  editAdminController
);
//Change Password Admin Account
router.post(
  "/change-password-officer",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2([psits_roles.ADMIN]),
  changeAdminPasswordController
);
//Set Admin Account to Suspend
router.put(
  "/suspend",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2([psits_roles.ADMIN]),
  setSuspendAdminAccountController
);
//Set Member Role Remove
router.put(
  "/role-remove",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2([psits_roles.ADMIN, psits_roles.EXECUTIVE]),
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
  getAllRequestAdminAccountController
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
  adminAccessAuthenticateV2([psits_roles.ADMIN]),
  approveRoleMemberController
);
//Set Decline Role for Members
router.put(
  "/decline-role",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2([psits_roles.ADMIN]),
  setDeclineMemberRoleController
);
//Add New Admin Account
router.post(
  "/add-officer",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2([psits_roles.ADMIN]),
  addNewAdminAccountController
);
//Approve Admin Account Creation
router.put(
  "/approve-admin-account",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2([psits_roles.ADMIN]),
  approveAdminAccountController
);
//Decline Admin Account Creation
router.put(
  "/decline-admin-account",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2([psits_roles.ADMIN]),
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
  getMemberPriceController
);
router.put(
  "/change-membership-price",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2([psits_roles.ADMIN, psits_roles.FINANCE]),
  changeMemberPriceController
);

export default router;
