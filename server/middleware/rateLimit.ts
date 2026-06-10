import rateLimit from "express-rate-limit";

// 100 requests per 15 minutes for public endpoints
export const publicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Rate limit exceeded. Cyber threat defense active. Please retry in 15 minutes.",
  },
});

// 20 requests per hour for admin authentication & write operations
export const secureAdminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Brute face mitigation active. System locked for admin actions. Please retry in 1 hour.",
  },
});
