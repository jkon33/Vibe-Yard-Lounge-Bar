import { Request, Response } from "express";
import { dbStore } from "../utils/dbStore";
import { broadcastUpdate } from "../utils/wsManager";
import { menuItemSchema } from "../utils/validators";

// Helper to validate Base64 image
function validateBase64Image(base64Str: string): { isValid: boolean; error?: string } {
  // If it's pure Unsplash URL (seeded or default), it is valid
  if (base64Str.startsWith("http://") || base64Str.startsWith("https://")) {
    return { isValid: true };
  }

  // Check prefix
  const matches = base64Str.match(/^data:image\/(jpeg|png|webp);base64,/);
  if (!matches) {
    return { isValid: false, error: "Only JPEG, PNG, and WEBP images are allowed." };
  }

  // Check size (base64 is ~33% larger than binary, so 2MB binary is ~2.7MB base64)
  const sizeInBytes = (base64Str.length * 3) / 4;
  const maxBytes = 2 * 1024 * 1024; // 2MB
  if (sizeInBytes > maxBytes) {
    return { isValid: false, error: "Image size exceeds 2MB limit." };
  }

  // Basic malicious script scan (e.g. check for <script> or tags inside base64, though unlikely)
  if (base64Str.includes("PHNjcmlwdD")) { // base64 for <script
    return { isValid: false, error: "Malicious content signature detected in image upload." };
  }

  return { isValid: true };
}

export async function getMenu(req: Request, res: Response): Promise<any> {
  try {
    const items = await dbStore.getMenuItems();
    return res.status(200).json({
      success: true,
      data: items,
    });
  } catch (err) {
    console.error("Get menu error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch menu." });
  }
}

export async function createMenuItem(req: Request, res: Response): Promise<any> {
  try {
    const parseResult = menuItemSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid menu item data.",
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const { name, description, regularPrice, vipPrice, category, imageUrl } = parseResult.data;

    // Validate image format & size (max 2MB, jpeg/png/webp)
    const imgCheck = validateBase64Image(imageUrl);
    if (!imgCheck.isValid) {
      return res.status(400).json({
        success: false,
        message: imgCheck.error,
      });
    }

    const newItem = await dbStore.addMenuItem({
      name,
      description,
      regularPrice,
      vipPrice,
      category,
      imageUrl,
    });

    // Notify connected clients via WebSockets
    broadcastUpdate("menu_updated", { action: "create", item: newItem });

    return res.status(201).json({
      success: true,
      message: "Menu item created successfully.",
      data: newItem,
    });
  } catch (err) {
    console.error("Create menu item error:", err);
    return res.status(500).json({ success: false, message: "Failed to create menu item." });
  }
}

export async function updateMenuItem(req: Request, res: Response): Promise<any> {
  try {
    const { id } = req.params;
    const parseResult = menuItemSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid update data.",
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const updates = parseResult.data;

    if (updates.imageUrl) {
      const imgCheck = validateBase64Image(updates.imageUrl);
      if (!imgCheck.isValid) {
        return res.status(400).json({
          success: false,
          message: imgCheck.error,
        });
      }
    }

    const updatedItem = await dbStore.updateMenuItem(id, updates as any);
    if (!updatedItem) {
      return res.status(404).json({ success: false, message: "Menu item not found." });
    }

    // Notify connected clients
    broadcastUpdate("menu_updated", { action: "update", item: updatedItem });

    return res.status(200).json({
      success: true,
      message: "Menu item updated successfully.",
      data: updatedItem,
    });
  } catch (err) {
    console.error("Update menu item error:", err);
    return res.status(500).json({ success: false, message: "Failed to update menu item." });
  }
}

export async function deleteMenuItem(req: Request, res: Response): Promise<any> {
  try {
    const { id } = req.params;
    const deleted = await dbStore.deleteMenuItem(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Menu item not found." });
    }

    // Notify connected clients
    broadcastUpdate("menu_updated", { action: "delete", id });

    return res.status(200).json({
      success: true,
      message: "Menu item deleted successfully.",
      data: deleted,
    });
  } catch (err) {
    console.error("Delete menu item error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete menu item." });
  }
}
