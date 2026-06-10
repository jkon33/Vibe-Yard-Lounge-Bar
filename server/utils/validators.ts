import { z } from "zod";

// Admin login validation
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required").max(50, "Username too long"),
  password: z.string().min(1, "Password is required").max(100, "Password too long"),
});

// Menu item validation
export const menuItemSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters")
    .transform(val => val.replace(/<[^>]*>/g, "")), // HTML sanitizer
  description: z.string()
    .min(1, "Description is required")
    .max(500, "Description cannot exceed 500 characters")
    .transform(val => val.replace(/<[^>]*>/g, "")), // HTML sanitizer
  regularPrice: z.number().positive("Price must be positive"),
  vipPrice: z.number().positive("VIP price must be positive"),
  category: z.enum(["Drink", "Food"]),
  imageUrl: z.string().min(1, "Image is required"),
});

// Site logo validation
export const logoSchema = z.object({
  logoUrl: z.string().min(1, "Logo is required"),
});

// Banners schema
export const bannersSchema = z.object({
  banners: z.array(z.string()).max(5, "Maximum 5 banners"),
});

export const singleBannerSchema = z.object({
  bannerUrl: z.string().min(1, "Banner is required"),
});
