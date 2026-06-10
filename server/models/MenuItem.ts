import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    regularPrice: { type: Number, required: true },
    vipPrice: { type: Number, required: true },
    category: { type: String, enum: ["Drink", "Food"], required: true },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true }
);

export const MenuItem = mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);
