import { Router } from "express";
import {
  getAllActiveStudentsController,
  setStudentMembershipRequest,
  getAllDeleteStudentController,
  getMembershipStatusController,
  softDeleteStudentController,
  restoreDeletedStudentController,
  cancelMembershipRequestController,
  editStudentController,
  changeStudentPassword,
  fetchSpecificStudentController,
  fetchSpecificMembershipHistoryController,
  editStudentYearLevel,
  isYearUpdatedController,
} from "../controllers/student.controller";
import {
  requireAccessTokenV2,
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
  adminAccessAuthenticateV2,
} from "../middlewares/authV2.middleware";

const router = Router();

// GET list of accepted students
router.get(
  "/students",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getAllActiveStudentsController
);
//Student Request Membership
router.put(
  "/students/request",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["student"]),
  setStudentMembershipRequest
);

router.get(
  "/students/deleted-students",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getAllDeleteStudentController
);

router.get(
  "/students/get-membership-status/:id",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin", "student"]),
  getMembershipStatusController
);

// SOFT DELETE student by id_number
router.put(
  "/students/softdelete",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  softDeleteStudentController
);

router.put(
  "/students/restore",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  restoreDeletedStudentController
);

router.put(
  "/students/cancel-membership",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin", "finance"]),
  cancelMembershipRequestController
);

router.post(
  "/students/edited-student",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  editStudentController
);

router.post(
  "/students/change-password-admin",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  changeStudentPassword
);

router.get(
  "/fetch-specific-student/:id_number",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin", "student"]),
  fetchSpecificStudentController
);

router.get(
  "/students/student-membership-history/:id_number",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  fetchSpecificMembershipHistoryController
);

router.put(
  "/students/edit-year-level/:id_number",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin", "student"]),
  editStudentYearLevel
);

router.get(
  "/students/is-year-updated/:id_number",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin", "student"]),
  isYearUpdatedController
);

export default router;
