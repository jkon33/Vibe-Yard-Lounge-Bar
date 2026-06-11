import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthState } from "../types";
import { apiService } from "../services/api";

interface AuthContextType {
  state: AuthState;
  login: (credentials: Record<string, string>) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    username: null,
    loading: true,
  });

  const checkAuth = async () => {
    setState((prev) => ({ ...prev, loading: true }));
    const response = await apiService.checkAuth();
    const userData = response.data || (response as any).user;
    if (response.success && userData) {
      setState({
        isAuthenticated: true,
        username: userData.username,
        loading: false,
      });
    } else {
      setState({
        isAuthenticated: false,
        username: null,
        loading: false,
      });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: Record<string, string>) => {
    const res = await apiService.login(credentials);
    const userData = res.data || (res as any).user;
    if (res.success && userData) {
      setState({
        isAuthenticated: true,
        username: userData.username,
        loading: false,
      });
      return { success: true };
    }
    return {
      success: false,
      message: res.message || "Authentication credentials denied.",
    };
  };

  const logout = async () => {
    await apiService.logout();
    setState({
      isAuthenticated: false,
      username: null,
      loading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be consumed within an AuthProvider");
  }
  return context;
}
