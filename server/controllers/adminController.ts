import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import { dbStore } from "../utils/dbStore";
import { sendAuthCookies, clearAuthCookies } from "../utils/jwt";
import { loginSchema } from "../utils/validators";

export async function login(req: Request, res: Response): Promise<any> {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input. Check credentials structure.",
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const { username, password } = parseResult.data;
    
    // Find admin
    const admin = await dbStore.getAdminByUsername(username);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    // Check password
    const passwordMatch = await bcryptjs.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    // Send JWT HTTP-only cookies
    const { refreshToken } = sendAuthCookies(res, admin.username);

    // Update refresh token in database/store
    await dbStore.updateAdminRefreshToken(admin.username, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Authentication successful.",
      data: {
        username: admin.username,
      },
      user: {
        username: admin.username,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error occurred.",
    });
  }
}

export async function logout(req: Request, res: Response): Promise<any> {
  try {
    // If user is authenticated, clear refreshing details
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      // Decode or retrieve user
      const admin = await dbStore.getAdminByUsername("admin"); // Demo fallback or custom
      if (admin) {
        await dbStore.updateAdminRefreshToken(admin.username, "");
      }
    }

    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message: "Logout successful. Session cleared.",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during logout.",
    });
  }
}

export async function checkAuthStatus(req: any, res: Response): Promise<any> {
  if (req.user) {
    return res.status(200).json({
      success: true,
      data: {
        username: req.user.username,
      },
      user: {
        username: req.user.username,
      },
    });
  }
  return res.status(401).json({
    success: false,
    message: "Stale session. Please login.",
  });
}
