import mongoose from "mongoose";

const SiteConfigSchema = new mongoose.Schema(
  {
    logoUrl: { type: String, default: "" },
    banners: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const SiteConfig = mongoose.models.SiteConfig || mongoose.model("SiteConfig", SiteConfigSchema);
