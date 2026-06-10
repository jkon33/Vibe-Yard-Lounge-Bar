import { Request, Response, NextFunction } from "express";
import { verifyToken, sendAuthCookies, getCookieOptions } from "../utils/jwt";
import { dbStore } from "../utils/dbStore";

export interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
  };
}

export async function protectAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { accessToken, refreshToken } = req.cookies;

  // 1. Try to verify access token
  if (accessToken) {
    const decoded = verifyToken(accessToken);
    if (decoded) {
      req.user = { username: decoded.username };
      return next();
    }
  }

  // 2. Access token failed or missing, try refresh token
  if (refreshToken) {
    const decodedRefresh = verifyToken(refreshToken);
    if (decodedRefresh) {
      // Verify refresh token against database / store
      const admin = await dbStore.getAdminByUsername(decodedRefresh.username);
      if (admin && admin.refreshToken === refreshToken) {
        // Token matches! Rotate tokens
        const { accessToken: newAccess, refreshToken: newRefresh } = sendAuthCookies(res, admin.username);
        
        // Update stored refresh token
        await dbStore.updateAdminRefreshToken(admin.username, newRefresh);
        
        req.user = { username: admin.username };
        return next();
      }
    }
  }

  // Clear stale cookies
  res.clearCookie("accessToken", { ...getCookieOptions(false), maxAge: 0 });
  res.clearCookie("refreshToken", { ...getCookieOptions(true), maxAge: 0 });

  return res.status(401).json({
    success: false,
    message: "Unauthorized. Authentication token expired or missing.",
  });
}
