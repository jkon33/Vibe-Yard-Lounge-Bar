import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { MenuItem } from "../models/MenuItem";
import { SiteConfig } from "../models/SiteConfig";
import { Admin } from "../models/Admin";

// Cast model bindings as 'any' to avoid deep, compiler-dependent Mongoose TS errors
const MenuItemModel = MenuItem as any;
const SiteConfigModel = SiteConfig as any;
const AdminModel = Admin as any;

// Keep track of database state
export let isMongoConnected = false;

const UPLOADS_DIR = path.join(process.cwd(), "server", "uploads");
const DATA_STORE_PATH = path.join(UPLOADS_DIR, "data-store.json");

// Default food & drink items to seed
const DEFAULT_MENU_ITEMS: any[] = [
  {
    id: "seed-1",
    name: "Elixir of the Night",
    description: "A deep violet glowing rum infusion with elderflower, butterfly pea tea, and a dust of edible gold.",
    regularPrice: 18,
    vipPrice: 11,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "seed-2",
    name: "Neon Cyber Shake",
    description: "Electric blue coconut and lychee blend with a pop of sour raspberry popping candy.",
    regularPrice: 15,
    vipPrice: 9,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "seed-3",
    name: "Zero-Gravity Mojito",
    description: "Classic lime and mint molecular sphere afloat in clarified sparkling soda.",
    regularPrice: 16,
    vipPrice: 10,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "seed-4",
    name: "Smoked Fusion Tacos",
    description: "Crispy smoked duck tacos dressed with sweet ginger glaze, microgreens, and wasabi crema.",
    regularPrice: 22,
    vipPrice: 14,
    category: "Food",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "seed-5",
    name: "Cyberpunk Slider Trio",
    description: "Charcoal brioche buns, wagyu beef, melted radioactive cheddar, and truffled atomic mayo.",
    regularPrice: 25,
    vipPrice: 16,
    category: "Food",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "seed-6",
    name: "Cosmic Truffle Fries",
    description: "Crispy skin-on purple potatoes coated in luxury truffle oil, gold salt, and fresh herbs.",
    regularPrice: 19,
    vipPrice: 12,
    category: "Food",
    imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const DEFAULT_SITE_CONFIG = {
  logoUrl: "Vibe Yard Lounge", 
  banners: [
    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&h=500&q=80",
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&h=500&q=80",
    "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&h=500&q=80"
  ]
};

// Initial JSON file structure if local fallback is active
interface LocalStoreSchema {
  menuItems: any[];
  siteConfig: typeof DEFAULT_SITE_CONFIG;
  admin: {
    username: string;
    passwordHash: string;
    refreshToken: string;
  };
}

// Function to initialize directories
export function ensureDirectories() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

// Read from JSON file
function readLocalStore(): LocalStoreSchema {
  ensureDirectories();
  if (!fs.existsSync(DATA_STORE_PATH)) {
    // Generate fresh store
    const initialConfig: LocalStoreSchema = {
      menuItems: DEFAULT_MENU_ITEMS,
      siteConfig: DEFAULT_SITE_CONFIG,
      admin: {
        username: process.env.ADMIN_USERNAME || "admin",
        passwordHash: bcryptjs.hashSync(process.env.ADMIN_PASSWORD || "VibeYardSecurePass2026!", 12),
        refreshToken: "",
      },
    };
    fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(initialConfig, null, 2));
    return initialConfig;
  }
  try {
    const data = fs.readFileSync(DATA_STORE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read local data store. Recreating.", err);
    const initialConfig: LocalStoreSchema = {
      menuItems: DEFAULT_MENU_ITEMS,
      siteConfig: DEFAULT_SITE_CONFIG,
      admin: {
        username: process.env.ADMIN_USERNAME || "admin",
        passwordHash: bcryptjs.hashSync(process.env.ADMIN_PASSWORD || "VibeYardSecurePass2026!", 12),
        refreshToken: "",
      },
    };
    return initialConfig;
  }
}

// Write to JSON file
function writeLocalStore(data: LocalStoreSchema) {
  ensureDirectories();
  fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(data, null, 2));
}

// Initialize db connection
export async function connectDB() {
  ensureDirectories();
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("⚠️ MONGODB_URI environment variable is not defined. Falling back to local JSON data store.");
    isMongoConnected = false;
    return;
  }

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("🚀 Connected to MongoDB Atlas successfully.");
    isMongoConnected = true;

    // Seed database if empty
    await seedMongo();
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB Atlas. Falling back to local JSON store.", error);
    isMongoConnected = false;
  }
}

// Seed MongoDB if empty
async function seedMongo() {
  try {
    const adminCount = await AdminModel.countDocuments();
    if (adminCount === 0) {
      const username = process.env.ADMIN_USERNAME || "admin";
      const password = process.env.ADMIN_PASSWORD || "VibeYardSecurePass2026!";
      const hashedPassword = await bcryptjs.hash(password, 12);
      await AdminModel.create({
        username,
        password: hashedPassword,
        refreshToken: "",
      });
      console.log(`👤 Admin user seeded successfully. Username: ${username}`);
    }

    const menuCount = await MenuItemModel.countDocuments();
    if (menuCount === 0) {
      // Strip IDs before database seeding so Atlas assigns native ObjectIds
      const seedRaw = DEFAULT_MENU_ITEMS.map(({ id, ...rest }) => rest);
      await MenuItemModel.insertMany(seedRaw);
      console.log("🍟 Menu items seeded in MongoDB.");
    }

    const configCount = await SiteConfigModel.countDocuments();
    if (configCount === 0) {
      await SiteConfigModel.create(DEFAULT_SITE_CONFIG);
      console.log("⚙️ SiteConfig seeded in MongoDB.");
    }
  } catch (err) {
    console.error("Error seeding MongoDB", err);
  }
}

// Operations Interface
export const dbStore = {
  // MENU ITEMS
  async getMenuItems() {
    if (isMongoConnected) {
      return await MenuItemModel.find().sort({ createdAt: -1 });
    } else {
      const store = readLocalStore();
      return store.menuItems;
    }
  },

  async addMenuItem(item: { name: string; description: string; regularPrice: number; vipPrice: number; category: "Drink" | "Food"; imageUrl: string }) {
    if (isMongoConnected) {
      const dbItem = await MenuItemModel.create(item);
      return dbItem;
    } else {
      const store = readLocalStore();
      const newItem = {
        id: "item-" + Date.now(),
        ...item,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.menuItems.push(newItem);
      writeLocalStore(store);
      return newItem;
    }
  },

  async updateMenuItem(id: string, updates: { name?: string; description?: string; regularPrice?: number; vipPrice?: number; category?: "Drink" | "Food"; imageUrl?: string }) {
    if (isMongoConnected) {
      const dbItem = await MenuItemModel.findOneAndUpdate({ _id: id }, updates, { new: true });
      return dbItem;
    } else {
      const store = readLocalStore();
      const index = store.menuItems.findIndex((it) => it.id === id || it._id === id);
      if (index !== -1) {
        store.menuItems[index] = {
          ...store.menuItems[index],
          ...updates,
          updatedAt: new Date(),
        };
        writeLocalStore(store);
        return store.menuItems[index];
      }
      return null;
    }
  },

  async deleteMenuItem(id: string) {
    if (isMongoConnected) {
      const res = await MenuItemModel.findOneAndDelete({ _id: id });
      return res;
    } else {
      const store = readLocalStore();
      const index = store.menuItems.findIndex((it) => it.id === id || it._id === id);
      if (index !== -1) {
        const deleted = store.menuItems.splice(index, 1);
        writeLocalStore(store);
        return deleted[0];
      }
      return null;
    }
  },

  // SITE CONFIG (Logo & Banners)
  async getSiteConfig() {
    if (isMongoConnected) {
      let config = await SiteConfigModel.findOne();
      if (!config) {
        config = await SiteConfigModel.create(DEFAULT_SITE_CONFIG);
      }
      return config;
    } else {
      const store = readLocalStore();
      return store.siteConfig;
    }
  },

  async updateLogo(logoUrl: string) {
    if (isMongoConnected) {
      let config = await SiteConfigModel.findOne();
      if (!config) {
        config = await SiteConfigModel.create({ ...DEFAULT_SITE_CONFIG, logoUrl });
      } else {
        config.logoUrl = logoUrl;
        await config.save();
      }
      return config;
    } else {
      const store = readLocalStore();
      store.siteConfig.logoUrl = logoUrl;
      writeLocalStore(store);
      return store.siteConfig;
    }
  },

  async updateBanners(banners: string[]) {
    const normalizedBanners = banners.slice(0, 5);
    if (isMongoConnected) {
      let config = await SiteConfigModel.findOne();
      if (!config) {
        config = await SiteConfigModel.create({ ...DEFAULT_SITE_CONFIG, banners: normalizedBanners });
      } else {
        config.banners = normalizedBanners;
        await config.save();
      }
      return config;
    } else {
      const store = readLocalStore();
      store.siteConfig.banners = normalizedBanners;
      writeLocalStore(store);
      return store.siteConfig;
    }
  },

  async addBanner(bannerUrl: string) {
    if (isMongoConnected) {
      let config = await SiteConfigModel.findOne();
      if (!config) {
        config = await SiteConfigModel.create({ ...DEFAULT_SITE_CONFIG, banners: [bannerUrl] });
      } else {
        if (config.banners.length >= 5) {
          config.banners.shift(); 
        }
        config.banners.push(bannerUrl);
        await config.save();
      }
      return config;
    } else {
      const store = readLocalStore();
      if (store.siteConfig.banners.length >= 5) {
        store.siteConfig.banners.shift();
      }
      store.siteConfig.banners.push(bannerUrl);
      writeLocalStore(store);
      return store.siteConfig;
    }
  },

  async deleteBanner(index: number) {
    if (isMongoConnected) {
      let config = await SiteConfigModel.findOne();
      if (config && config.banners && config.banners.length > index) {
        config.banners.splice(index, 1);
        await config.save();
      }
      return config;
    } else {
      const store = readLocalStore();
      if (store.siteConfig.banners.length > index) {
        store.siteConfig.banners.splice(index, 1);
        writeLocalStore(store);
      }
      return store.siteConfig;
    }
  },

  // ADMIN AUTHENTICATION
  async getAdminByUsername(username: string) {
    if (isMongoConnected) {
      return await AdminModel.findOne({ username });
    } else {
      const store = readLocalStore();
      if (store.admin.username === username) {
        return {
          _id: "admin-id",
          username: store.admin.username,
          password: store.admin.passwordHash,
          refreshToken: store.admin.refreshToken,
        };
      }
      return null;
    }
  },

  async updateAdminRefreshToken(username: string, token: string) {
    if (isMongoConnected) {
      return await AdminModel.findOneAndUpdate({ username }, { refreshToken: token }, { new: true });
    } else {
      const store = readLocalStore();
      if (store.admin.username === username) {
        store.admin.refreshToken = token;
        writeLocalStore(store);
        return {
          username: store.admin.username,
          password: store.admin.passwordHash,
          refreshToken: store.admin.refreshToken,
        };
      }
      return null;
    }
  }
};
