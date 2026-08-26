import { Router } from "express";
import { emailWebhook } from "../webhooks/email.webhook";
const router = Router();

router.post("/", emailWebhook.email);


export default router;
