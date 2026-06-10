import { Router } from "express";
import { 
  login, 
  logout, 
  checkAuthStatus 
} from "../controllers/adminController";
import { 
  getMenu, 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem 
} from "../controllers/menuController";
import { 
  getSiteConfig, 
  uploadLogo, 
  addBanner, 
  deleteBanner, 
  updateBannersOrder 
} from "../controllers/siteConfigController";
import { protectAdmin } from "../middleware/auth";
import { publicRateLimiter, secureAdminLimiter } from "../middleware/rateLimit";

const router = Router();

// ==========================================
// PUBLIC ENDPOINTS (under publicRateLimiter)
// ==========================================

// Get Menu Items
router.get("/menu", publicRateLimiter, getMenu);

// Get Site Logo and Banners
router.get("/site-config", publicRateLimiter, getSiteConfig);


// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

// Login (under secure brute-force protection rate limiting)
router.post("/admin/login", secureAdminLimiter, login);

// Logout
router.post("/admin/logout", logout);

// Auth check - to check if the cookie token is valid on client reload
router.get("/admin/auth-check", protectAdmin, checkAuthStatus);


// ==========================================
// ADMIN WORKFLOW (PROTECTED & RATE-LIMITED)
// ==========================================

// Menu CRUD
router.post("/admin/menu", secureAdminLimiter, protectAdmin, createMenuItem);
router.put("/admin/menu/:id", secureAdminLimiter, protectAdmin, updateMenuItem);
router.delete("/admin/menu/:id", secureAdminLimiter, protectAdmin, deleteMenuItem);

// Logo Upload
router.post("/admin/logo", secureAdminLimiter, protectAdmin, uploadLogo);

// Banners Upload, Ordering, and Removal
router.post("/admin/banners", secureAdminLimiter, protectAdmin, addBanner);         // upload/add banner
router.put("/admin/banners", secureAdminLimiter, protectAdmin, updateBannersOrder); // reorder banners
router.delete("/admin/banners/:index", secureAdminLimiter, protectAdmin, deleteBanner);  // delete banner

export default router;
