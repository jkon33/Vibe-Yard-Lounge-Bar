export interface MenuItem {
  _id?: string;
  id?: string; // fallback for seeded items
  name: string;
  description: string;
  regularPrice: number;
  vipPrice: number;
  category: "Drink" | "Food";
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteConfig {
  logoUrl: string;
  banners: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  loading: boolean;
}
