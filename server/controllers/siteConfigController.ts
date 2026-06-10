import { Request, Response } from "express";
import { dbStore } from "../utils/dbStore";
import { broadcastUpdate } from "../utils/wsManager";
import { logoSchema, singleBannerSchema, bannersSchema } from "../utils/validators";

// Helper to validate image string
function validateBase64Image(base64Str: string): { isValid: boolean; error?: string } {
  if (base64Str.startsWith("http://") || base64Str.startsWith("https://")) {
    return { isValid: true };
  }

  const matches = base64Str.match(/^data:image\/(jpeg|png|webp);base64,/);
  if (!matches) {
    return { isValid: false, error: "Only JPEG, PNG, and WEBP images are allowed." };
  }

  const sizeInBytes = (base64Str.length * 3) / 4;
  const maxBytes = 2 * 1024 * 1024; // 2MB
  if (sizeInBytes > maxBytes) {
    return { isValid: false, error: "Image size exceeds 2MB limit." };
  }

  return { isValid: true };
}

export async function getSiteConfig(req: Request, res: Response): Promise<any> {
  try {
    const config = await dbStore.getSiteConfig();
    return res.status(200).json({
      success: true,
      data: config,
    });
  } catch (err) {
    console.error("Get site config error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch configuration." });
  }
}

export async function uploadLogo(req: Request, res: Response): Promise<any> {
  try {
    const parseResult = logoSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid logo data.",
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const { logoUrl } = parseResult.data;

    // Validate if it is base64 or URL
    const imgCheck = validateBase64Image(logoUrl);
    if (!imgCheck.isValid) {
      return res.status(400).json({
        success: false,
        message: imgCheck.error,
      });
    }

    const config = await dbStore.updateLogo(logoUrl);
    
    // Broadcast config update
    broadcastUpdate("config_updated", config);

    return res.status(200).json({
      success: true,
      message: "Logo updated successfully.",
      data: config,
    });
  } catch (err) {
    console.error("Upload logo error:", err);
    return res.status(500).json({ success: false, message: "Failed to update logo." });
  }
}

export async function addBanner(req: Request, res: Response): Promise<any> {
  try {
    const parseResult = singleBannerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid banner data.",
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const { bannerUrl } = parseResult.data;

    // Validate
    const imgCheck = validateBase64Image(bannerUrl);
    if (!imgCheck.isValid) {
      return res.status(400).json({
        success: false,
        message: imgCheck.error,
      });
    }

    const config = await dbStore.addBanner(bannerUrl);

    // Broadcast config update
    broadcastUpdate("config_updated", config);

    return res.status(200).json({
      success: true,
      message: "Banner added successfully.",
      data: config,
    });
  } catch (err) {
    console.error("Add banner error:", err);
    return res.status(500).json({ success: false, message: "Failed to add banner." });
  }
}

export async function deleteBanner(req: Request, res: Response): Promise<any> {
  try {
    const index = parseInt(req.params.index);
    if (isNaN(index)) {
      return res.status(400).json({ success: false, message: "Invalid banner index." });
    }

    const config = await dbStore.deleteBanner(index);

    // Broadcast config update
    broadcastUpdate("config_updated", config);

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully.",
      data: config,
    });
  } catch (err) {
    console.error("Delete banner error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete banner." });
  }
}

export async function updateBannersOrder(req: Request, res: Response): Promise<any> {
  try {
    const parseResult = bannersSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid banners sorting data.",
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const { banners } = parseResult.data;

    const config = await dbStore.updateBanners(banners);

    // Broadcast config update
    broadcastUpdate("config_updated", config);

    return res.status(200).json({
      success: true,
      message: "Banners updated successfully.",
      data: config,
    });
  } catch (err) {
    console.error("Update banners error:", err);
    return res.status(500).json({ success: false, message: "Failed to update banners order." });
  }
}
