import { Resend } from "resend";
import { Request, Response, NextFunction } from "express";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function verifyResendWebhook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payload = req.body;
    console.log("Payload raw", req);
     console.log("Payload with text", req.body);
    console.log("Payload with toString", payload);
    const event = resend.webhooks.verify({
      payload,
      headers: {
        id: req.get("svix-id")!,
        timestamp: req.get("svix-timestamp")!,
        signature: req.get("svix-signature")!,
      },
      webhookSecret: process.env.RESEND_WEBHOOK_SECRET!,
    });

    console.log("Verified event:", event.type);

    // Make the verified event available to the next handler
    req.body = event;
    console.log(req.body);
    next();
  } catch (error) {
    console.error("Resend webhook verification failed:", error);

    return res.status(400).json({
      message: "Invalid webhook signature",
    });
  }
}
