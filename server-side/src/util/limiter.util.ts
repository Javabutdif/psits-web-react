import { rateLimit } from "express-rate-limit";
import { incrementRateLimitBlocked } from "../services/devtools.service";

// Development mode: More lenient limits for testing
const isDevelopment = process.env.NODE_ENV !== "production";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 100 : 20, // 100 attempts in dev, 20 in production
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    incrementRateLimitBlocked();
    res.status(429).json({
      message:
        "Too many login attempts from this IP, please try again after 15 minutes.",
    });
  },
});

export default loginLimiter;
