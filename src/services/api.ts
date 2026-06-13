import { MenuItem, SiteConfig } from "../types";

// Base URL for the API
const getApiBase = () => {
  const envBase = import.meta.env.VITE_API_BASE;
  if (envBase) {
    const clean = envBase.replace(/\/$/, "");
    if (clean.includes("://") && !clean.endsWith("/api") && !clean.includes("/api/")) {
      return `${clean}/api`;
    }
    return clean;
  }
  return "/api";
};

const API_BASE = getApiBase();

// Fetch wrapper that handles cookies and standardizes payloads
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; errors?: any }> {
  const url = `${API_BASE}${endpoint}`;
  
  // Set default credentials to "include" to transmit JWT secure cookies
  options.credentials = "include";
  
  // Default headers
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }
  options.headers = headers;

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`API request error on ${endpoint}:`, error);
    return {
      success: false,
      message: "Network configuration or server response mismatch.",
    };
  }
}

export const apiService = {
  // Public Methods
  async getMenu() {
    return request<MenuItem[]>("/menu");
  },

  async getSiteConfig() {
    return request<SiteConfig>("/site-config");
  },

  // Auth Methods
  async login(credentials: Record<string, string>) {
    return request<{ username: string }>("/admin/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  async logout() {
    return request<void>("/admin/logout", {
      method: "POST",
    });
  },

  async checkAuth() {
    return request<{ username: string }>("/admin/auth-check", {
      method: "GET",
    });
  },

  async forgotPassword(email: string) {
    return request<{ message: string; devResetLink?: string }>("/admin/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(payload: Record<string, string>) {
    return request<{ message: string }>("/admin/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Admin Methods (Protected)
  async createMenuItem(item: Omit<MenuItem, "_id" | "id" | "createdAt" | "updatedAt">) {
    return request<MenuItem>("/admin/menu", {
      method: "POST",
      body: JSON.stringify(item),
    });
  },

  async updateMenuItem(id: string, item: Partial<MenuItem>) {
    return request<MenuItem>(`/admin/menu/${id}`, {
      method: "PUT",
      body: JSON.stringify(item),
    });
  },

  async deleteMenuItem(id: string) {
    return request<void>(`/admin/menu/${id}`, {
      method: "DELETE",
    });
  },

  async updateLogo(logoUrl: string) {
    return request<SiteConfig>("/admin/logo", {
      method: "POST",
      body: JSON.stringify({ logoUrl }),
    });
  },

  async addBanner(bannerUrl: string) {
    return request<SiteConfig>("/admin/banners", {
      method: "POST",
      body: JSON.stringify({ bannerUrl }),
    });
  },

  async deleteBanner(index: number) {
    return request<SiteConfig>(`/admin/banners/${index}`, {
      method: "DELETE",
    });
  },

  async updateBannersOrder(banners: string[]) {
    return request<SiteConfig>("/admin/banners", {
      method: "PUT",
      body: JSON.stringify({ banners }),
    });
  }
};

// WebSocket setup hook
export function createWebSocketConnection(
  onMenuUpdate: (payload: any) => void,
  onConfigUpdate: (payload: any) => void
): () => void {
  // Determine dynamic WebSocket URL
  let wsUrl = "";
  const envWs = import.meta.env.VITE_WS_URL;
  if (envWs) {
    wsUrl = envWs;
  } else if (import.meta.env.VITE_API_BASE) {
    const cleanApiBase = import.meta.env.VITE_API_BASE.replace(/\/$/, "");
    let derived = cleanApiBase.replace(/^http:/, "ws:").replace(/^https:/, "wss:");
    derived = derived.replace(/\/api$/, "");
    wsUrl = derived;
  } else {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    wsUrl = `${protocol}//${window.location.host}`;
  }
  let ws: WebSocket;
  let reconnectTimer: NodeJS.Timeout;
  let keepAliveTimer: NodeJS.Timeout;

  function connect() {
    console.log("[WS Client] Aligning connection to:", wsUrl);
    ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "menu_updated") {
          onMenuUpdate(payload.data);
        } else if (payload.type === "config_updated") {
          onConfigUpdate(payload.data);
        }
      } catch (err) {
        // ignore
      }
    };

    ws.onopen = () => {
      // console.log("[WS Client] Connected to real-time update engine.");
      // Start ping-pong keepalive every 30 seconds
      keepAliveTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 30000);
    };

    ws.onclose = () => {
      clearInterval(keepAliveTimer);
      // console.warn("[WS Client] Connection lost. Attempting reconnection...");
      reconnectTimer = setTimeout(() => {
        connect();
      }, 5000); // retry in 5s
    };

    ws.onerror = (err) => {
      // console.error("[WS Client] Socket encountered warning", err);
      ws.close();
    };
  }

  connect();

  // Return a cleanup function
  return () => {
    clearInterval(keepAliveTimer);
    clearTimeout(reconnectTimer);
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      ws.close();
    }
  };
}
