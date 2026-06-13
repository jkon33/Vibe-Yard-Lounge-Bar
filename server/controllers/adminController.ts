import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { dbStore } from "../utils/dbStore";
import { sendAuthCookies, clearAuthCookies } from "../utils/jwt";
import { loginSchema } from "../utils/validators";
import { sendResetEmail } from "../utils/email";

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

export async function forgotPassword(req: Request, res: Response): Promise<any> {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required for credential clearance.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    
    // Check if there is an admin matching this email
    const admin = await dbStore.getAdminByEmail(cleanEmail);
    if (!admin) {
      // Return success to prevent email enumeration, but with a standard systemic success message
      return res.status(200).json({
        success: true,
        message: "If that email address exists in our gateway mainframe list, a reset-authorization code was dispatched.",
      });
    }

    // Generate token and expiration (1 hour)
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await dbStore.updateAdminResetToken(admin.username, token, expires);

    // Build the reset link
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
    const resetUrl = `${appUrl.replace(/\/$/, "")}/?resetToken=${token}`;

    const mailRes = await sendResetEmail(cleanEmail, resetUrl);

    return res.status(200).json({
      success: true,
      message: "If that email address exists in our gateway mainframe list, a reset-authorization code was dispatched.",
      devResetLink: !process.env.SMTP_HOST ? resetUrl : undefined,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Gateway failure in credential clearance pathway.",
    });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<any> {
  try {
    const { token, newPassword } = req.body;
    if (!token || typeof token !== "string" || !newPassword || typeof newPassword !== "string") {
      return res.status(400).json({
        success: false,
        message: "Reset token and new passphrase cipher are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New cipher key must consist of at least 6 characters.",
      });
    }

    const admin = await dbStore.getAdminByResetToken(token);
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Cipher reset token is invalid or has expired.",
      });
    }

    // Check expiration
    const expiryDate = admin.resetPasswordExpires ? new Date(admin.resetPasswordExpires) : null;
    if (!expiryDate || expiryDate.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Cipher reset token has expired.",
      });
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(newPassword, 12);

    // Save password, clear the reset fields
    await dbStore.updateAdminPassword(admin.username, hashedPassword);

    return res.status(200).json({
      success: true,
      message: "Mainframe credential cipher successfully re-keyed. You can now login.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal gateway failure while re-keying credentials.",
    });
  }
}
