import jwt from "jsonwebtoken";
import { Response } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-futuristic-cyber-vibe-security-key-2026";

// Cookie configurations
export const getCookieOptions = (isRefresh = false) => {
  const isProd = process.env.NODE_ENV === "production";
  
  return {
    httpOnly: true,
    // When in dev inside an iframe, partitioned/SameSite=None permits cookie sending if secure
    secure: true, 
    sameSite: "none" as const, // Allows work in and out of the iframe
    maxAge: isRefresh ? 7 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000, // 7 days vs 15 min
    path: "/",
  };
};

export const generateAccessToken = (payload: { username: string }): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (payload: { username: string }): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

export const sendAuthCookies = (res: Response, username: string) => {
  const accessToken = generateAccessToken({ username });
  const refreshToken = generateRefreshToken({ username });

  res.cookie("accessToken", accessToken, getCookieOptions(false));
  res.cookie("refreshToken", refreshToken, getCookieOptions(true));

  return { accessToken, refreshToken };
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", { ...getCookieOptions(false), maxAge: 0 });
  res.clearCookie("refreshToken", { ...getCookieOptions(true), maxAge: 0 });
};
