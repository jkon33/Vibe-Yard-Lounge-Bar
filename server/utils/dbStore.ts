import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { MenuItem } from "../models/MenuItem";
import { SiteConfig } from "../models/SiteConfig";
import { Admin } from "../models/Admin";

// Cast model bindings as 'any' to avoid deep, compiler-dependent Mongoose TS errors
const MenuItemModel = MenuItem as any;
const SiteConfigModel = SiteConfig as any;
const AdminModel = Admin as any;

// Keep track of database state
export let isMongoConnected = false;
export let isFirebaseConnected = false;
export let firestoreDB: any = null;

const UPLOADS_DIR = path.join(process.cwd(), "server", "uploads");
const DATA_STORE_PATH = path.join(UPLOADS_DIR, "data-store.json");

// Try to initialize Firebase
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const rawConfig = fs.readFileSync(configPath, "utf8");
    const firebaseConfig = JSON.parse(rawConfig);
    const fbApp = initializeApp(firebaseConfig);
    firestoreDB = getFirestore(fbApp, firebaseConfig.firestoreDatabaseId);
    isFirebaseConnected = true;
    console.log("🔥 Successfully initialized Firebase Firestore for Cloud Persistence!");
  } else {
    console.warn("⚠️ firebase-applet-config.json not found in dbStore.ts.");
  }
} catch (err) {
  console.error("❌ Failed to initialize Firebase Firestore in dbStore.ts:", err);
}

// Default food & drink items to seed
const DEFAULT_MENU_ITEMS: any[] = [
  {
    id: "vy-drink-1",
    name: "Casamigo",
    description: "Premium high-grade tequila of exceptional quality, smooth body with fresh agave and clean citrus highlights.",
    regularPrice: 120000,
    vipPrice: 120500,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vy-drink-2",
    name: "Hennessy",
    description: "The world's premium standard in cognac, presenting highly refined fruity notes and rich oak smooth textures.",
    regularPrice: 80000,
    vipPrice: 80500,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1569701812502-3663087f7a5b?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vy-drink-3",
    name: "Hennessy VSOP",
    description: "A wonderfully harmonious and masterfully complex VSOP cognac with smooth notes of vanilla and toasted wood.",
    regularPrice: 100000,
    vipPrice: 100500,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vy-drink-4",
    name: "Martell Blue Swift",
    description: "Finest quality VSOP cognac aged in French oak and elegantly finished in real Kentucky Bourbon casks.",
    regularPrice: 90000,
    vipPrice: 90500,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1614313511387-1436a4480edd?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vy-drink-5",
    name: "Martell VS",
    description: "An elegant, light and golden Martell VS cognac showing vibrant pear notes and classic oak warmth.",
    regularPrice: 70000,
    vipPrice: 70500,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1551538827-9c02e5243009?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vy-drink-6",
    name: "Jameson Black",
    description: "Triple distilled, twice-charred signature Irish whiskey delivering rich, dark, and smooth caramel layers.",
    regularPrice: 40000,
    vipPrice: 40500,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vy-drink-7",
    name: "Jameson",
    description: "The classic triple-distilled, incredibly smooth signature blend of Irish pot still and grain whiskey.",
    regularPrice: 30000,
    vipPrice: 30500,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vy-drink-8",
    name: "Jack Daniel",
    description: "Charcoal-mellowed signature Tennessee whiskey with classic rich sweet notes of vanilla and maple.",
    regularPrice: 35000,
    vipPrice: 35500,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1508253730749-0fce185552db?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vy-drink-9",
    name: "Williams Lawson",
    description: "Blended sweet and fruit-forward Scotch whisky with a remarkably clean, bold finish.",
    regularPrice: 25000,
    vipPrice: 25500,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vy-drink-10",
    name: "Red Label",
    description: "Bold, rich blended Scotch whisky with smoky characters and energetic spice layers.",
    regularPrice: 25000,
    vipPrice: 25500,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vy-drink-11",
    name: "Jagameister",
    description: "Iconic premium herbal liqueur crafted precisely with 56 secret aromatic botanical ingredients.",
    regularPrice: 30000,
    vipPrice: 30500,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1560512823-829485b8bf24?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vy-drink-12",
    name: "Olmeca Tequila",
    description: "Authentic Mexican tequila from Los Altos, presenting fresh herbal agave and citrus highlights.",
    regularPrice: 35000,
    vipPrice: 35500,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1516535794938-6063878f08cc?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vy-drink-13",
    name: "Sierra Tropical",
    description: "Vibrant and exotic blend combining Sierra Tequila Blanco with passionfruit, mango, and tropical notes.",
    regularPrice: 30000,
    vipPrice: 30500,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vy-drink-14",
    name: "Sierra White",
    description: "Clear Sierra Tequila Silver, delivering full-bodied clean agave notes with a peppery kick.",
    regularPrice: 25000,
    vipPrice: 25500,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1510211706662-ac2c62c2f78e?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vy-drink-15",
    name: "Belaire Rose",
    description: "Exquisite French sparkling rosé champagne with deep, vibrant red berry flavors and gorgeous sparkles.",
    regularPrice: 80000,
    vipPrice: 80500,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1594487524494-7bd03f905c31?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vy-drink-16",
    name: "Belaire",
    description: "Ultra-premium elegant French sparkling wine, offering clean, crisp and beautifully balanced Luxury taste.",
    regularPrice: 70000,
    vipPrice: 70500,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vy-drink-17",
    name: "Matini Rose",
    description: "Premium smooth and beautifully aromatic sweet Italian sparkling wine with berry infusions.",
    regularPrice: 25000,
    vipPrice: 25500,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vy-drink-18",
    name: "Verve Du Vernay",
    description: "Delightful French sparkling wine with fresh floral bouquets, crisp palate, and lively bubbles.",
    regularPrice: 20000,
    vipPrice: 20500,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vy-drink-19",
    name: "Four Cousin",
    description: "Famous sweet red/rosé South African wine, showcasing naturally delicious, rich berry flavors.",
    regularPrice: 15000,
    vipPrice: 15500,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vy-drink-20",
    name: "4th Street",
    description: "Sophisticated yet accessible South African sweet red wine with delightful, refreshing fruitiness.",
    regularPrice: 12000,
    vipPrice: 12500,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1528826722302-d6074ea36606?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vy-drink-21",
    name: "De Marco",
    description: "Elegant, crisp, and robust red wine with a velvety, smooth finish on the palate.",
    regularPrice: 15000,
    vipPrice: 15500,
    category: "Drink",
    imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
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
    const parsed = JSON.parse(data);
    
    // Auto-migrate local store if it contains old mockups
    if (parsed.menuItems && parsed.menuItems.some((it: any) => it.id && it.id.includes("seed-"))) {
      console.log("🍟 Migrating local store old seeds to new official Vibe Yard menu...");
      parsed.menuItems = DEFAULT_MENU_ITEMS;
      fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(parsed, null, 2));
    }
    
    return parsed;
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

    // Auto-migrate if old seeds present in MongoDB
    const oldSeedInMongo = await MenuItemModel.findOne({ name: "Elixir of the Night" });
    if (oldSeedInMongo) {
      console.log("🍟 Found old mockups in MongoDB. Migrating to official Vibe Yard menu...");
      await MenuItemModel.deleteMany({});
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
    } else if (isFirebaseConnected && firestoreDB) {
      try {
        const menuCol = collection(firestoreDB, "menu");
        const snapshot = await getDocs(menuCol);
        
        let items: any[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            _id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : new Date()),
          });
        });

        // Auto-migrate if Firestore contains old placeholder mockups
        const hasOldPlaceholder = items.some((it) => it.id && it.id.includes("seed-"));
        if (hasOldPlaceholder) {
          console.log("🍟 Detected old mockups in Firestore. Migrating to official Vibe Yard menu...");
          for (const item of items) {
            if (item.id && item.id.includes("seed-")) {
              try {
                await deleteDoc(doc(firestoreDB, "menu", item.id));
              } catch (delErr) {
                console.error("Failed to delete old seed document of ID:", item.id, delErr);
              }
            }
          }
          items = [];
        }
        
        // If empty, seed it to Firestore
        if (items.length === 0) {
          console.log("🍟 Seeding Firestore menu items...");
          for (const item of DEFAULT_MENU_ITEMS) {
            const { id, ...rest } = item;
            // Clean up to keep only matching fields and avoid Mongo specific _id type issues
            const cleanRest = {
              name: rest.name,
              description: rest.description,
              regularPrice: Number(rest.regularPrice),
              vipPrice: Number(rest.vipPrice),
              category: rest.category,
              imageUrl: rest.imageUrl
            };
            const docRef = doc(firestoreDB, "menu", id);
            await setDoc(docRef, {
              ...cleanRest,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            items.push({
              id,
              _id: id,
              ...cleanRest,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
        
        // Sort descending by createdAt
        items.sort((a, b) => {
          const tA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
          const tB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
          return tB - tA;
        });
        
        return items;
      } catch (err) {
        console.error("Firestore getMenuItems error, falling back:", err);
        const store = readLocalStore();
        return store.menuItems;
      }
    } else {
      const store = readLocalStore();
      return store.menuItems;
    }
  },

  async addMenuItem(item: { name: string; description: string; regularPrice: number; vipPrice: number; category: "Drink" | "Food"; imageUrl: string }) {
    if (isMongoConnected) {
      const dbItem = await MenuItemModel.create(item);
      return dbItem;
    } else if (isFirebaseConnected && firestoreDB) {
      try {
        const itemId = "item-" + Date.now();
        const docRef = doc(firestoreDB, "menu", itemId);
        const newItem = {
          name: item.name,
          description: item.description,
          regularPrice: Number(item.regularPrice),
          vipPrice: Number(item.vipPrice),
          category: item.category,
          imageUrl: item.imageUrl,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(docRef, newItem);
        return {
          id: itemId,
          _id: itemId,
          ...newItem,
          createdAt: new Date(newItem.createdAt),
          updatedAt: new Date(newItem.updatedAt)
        };
      } catch (err) {
        console.error("Firestore addMenuItem error, falling back:", err);
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
    } else if (isFirebaseConnected && firestoreDB) {
      try {
        const cleanId = id.toString();
        const docRef = doc(firestoreDB, "menu", cleanId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const changeData: any = {
            ...updates,
            updatedAt: new Date().toISOString()
          };
          if (updates.regularPrice !== undefined) changeData.regularPrice = Number(updates.regularPrice);
          if (updates.vipPrice !== undefined) changeData.vipPrice = Number(updates.vipPrice);
          
          await updateDoc(docRef, changeData);
          const updatedSnap = await getDoc(docRef);
          const data = updatedSnap.data() || {};
          return {
            id: cleanId,
            _id: cleanId,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : new Date()),
          };
        }
        return null;
      } catch (err) {
        console.error("Firestore updateMenuItem error, falling back:", err);
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
    } else if (isFirebaseConnected && firestoreDB) {
      try {
        const cleanId = id.toString();
        const docRef = doc(firestoreDB, "menu", cleanId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const currentData = docSnap.data();
          await deleteDoc(docRef);
          return {
            id: cleanId,
            _id: cleanId,
            ...currentData
          };
        }
        return null;
      } catch (err) {
        console.error("Firestore deleteMenuItem error, falling back:", err);
        const store = readLocalStore();
        const index = store.menuItems.findIndex((it) => it.id === id || it._id === id);
        if (index !== -1) {
          const deleted = store.menuItems.splice(index, 1);
          writeLocalStore(store);
          return deleted[0];
        }
        return null;
      }
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
    } else if (isFirebaseConnected && firestoreDB) {
      try {
        const docRef = doc(firestoreDB, "siteConfig", "global");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data();
        } else {
          console.log("⚙️ Initializing global SiteConfig in Firestore...");
          await setDoc(docRef, DEFAULT_SITE_CONFIG);
          return DEFAULT_SITE_CONFIG;
        }
      } catch (err) {
        console.error("Firestore getSiteConfig error, falling back:", err);
        const store = readLocalStore();
        return store.siteConfig;
      }
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
    } else if (isFirebaseConnected && firestoreDB) {
      try {
        const docRef = doc(firestoreDB, "siteConfig", "global");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          await updateDoc(docRef, { logoUrl });
        } else {
          await setDoc(docRef, { ...DEFAULT_SITE_CONFIG, logoUrl });
        }
        const updatedSnap = await getDoc(docRef);
        return updatedSnap.data();
      } catch (err) {
        console.error("Firestore updateLogo error, falling back:", err);
        const store = readLocalStore();
        store.siteConfig.logoUrl = logoUrl;
        writeLocalStore(store);
        return store.siteConfig;
      }
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
    } else if (isFirebaseConnected && firestoreDB) {
      try {
        const docRef = doc(firestoreDB, "siteConfig", "global");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          await updateDoc(docRef, { banners: normalizedBanners });
        } else {
          await setDoc(docRef, { ...DEFAULT_SITE_CONFIG, banners: normalizedBanners });
        }
        const updatedSnap = await getDoc(docRef);
        return updatedSnap.data();
      } catch (err) {
        console.error("Firestore updateBanners error, falling back:", err);
        const store = readLocalStore();
        store.siteConfig.banners = normalizedBanners;
        writeLocalStore(store);
        return store.siteConfig;
      }
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
    } else if (isFirebaseConnected && firestoreDB) {
      try {
        const docRef = doc(firestoreDB, "siteConfig", "global");
        const docSnap = await getDoc(docRef);
        let bannersArr = [...DEFAULT_SITE_CONFIG.banners];
        if (docSnap.exists()) {
          const data = docSnap.data();
          bannersArr = data.banners || [];
        }
        if (bannersArr.length >= 5) {
          bannersArr.shift();
        }
        bannersArr.push(bannerUrl);
        
        if (docSnap.exists()) {
          await updateDoc(docRef, { banners: bannersArr });
        } else {
          await setDoc(docRef, { ...DEFAULT_SITE_CONFIG, banners: bannersArr });
        }
        const updatedSnap = await getDoc(docRef);
        return updatedSnap.data();
      } catch (err) {
        console.error("Firestore addBanner error, falling back:", err);
        const store = readLocalStore();
        if (store.siteConfig.banners.length >= 5) {
          store.siteConfig.banners.shift();
        }
        store.siteConfig.banners.push(bannerUrl);
        writeLocalStore(store);
        return store.siteConfig;
      }
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
    } else if (isFirebaseConnected && firestoreDB) {
      try {
        const docRef = doc(firestoreDB, "siteConfig", "global");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          let bannersArr = data.banners || [];
          if (bannersArr.length > index) {
            bannersArr.splice(index, 1);
            await updateDoc(docRef, { banners: bannersArr });
          }
        }
        const updatedSnap = await getDoc(docRef);
        return updatedSnap.data();
      } catch (err) {
        console.error("Firestore deleteBanner error, falling back:", err);
        const store = readLocalStore();
        if (store.siteConfig.banners.length > index) {
          store.siteConfig.banners.splice(index, 1);
          writeLocalStore(store);
        }
        return store.siteConfig;
      }
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
