import { Router } from "express";
import {
  agentController,
  destroySessionController,
} from "../controllers/noetix-chat.v2.controller";
import {
  requireAccessTokenV2,
  roleAuthenticateV2,
  adminAccessAuthenticateV2,
} from "../middlewares/authV2.middleware";
import { psits_roles } from "../enums/role.enums";

const router = Router();

router.post(
  "/agent",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2([
    psits_roles.ADMIN,
    psits_roles.FINANCE,
    psits_roles.DEVELOPER,
    psits_roles.EXECUTIVE,
    psits_roles.HEAD_FINANCE,
  ]),
  agentController
);

router.post(
  "/session/destroy",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2([
    psits_roles.ADMIN,
    psits_roles.FINANCE,
    psits_roles.DEVELOPER,
    psits_roles.EXECUTIVE,
    psits_roles.HEAD_FINANCE,
  ]),
  destroySessionController
);

export default router;
