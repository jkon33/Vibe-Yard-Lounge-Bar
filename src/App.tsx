import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { RefreshCw } from "lucide-react";

type Page = "home" | "login" | "admin";

function MainApp() {
  const { state: authState, checkAuth } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("home");

  // Sync state with current authenticated condition
  useEffect(() => {
    if (!authState.loading) {
      if (authState.isAuthenticated) {
        if (currentPage === "login") {
          setCurrentPage("admin");
        }
      } else {
        if (currentPage === "admin") {
          setCurrentPage("login");
        }
      }
    }
  }, [authState.isAuthenticated, authState.loading]);

  // Handle loading state
  if (authState.loading && currentPage === "admin") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <RefreshCw size={24} className="animate-spin text-violet-500 mb-2" />
        <span className="text-xs font-mono text-neutral-500">Authenticating mainframe handshake...</span>
      </div>
    );
  }

  // Pure State-Based Routing Layer
  switch (currentPage) {
    case "login":
      return (
        <AdminLogin
          onBackToHome={() => setCurrentPage("home")}
          onLoginSuccess={() => setCurrentPage("admin")}
        />
      );
    case "admin":
      return (
        <AdminDashboard
          onLogoutSuccess={() => setCurrentPage("home")}
        />
      );
    case "home":
    default:
      return (
        <Home
          onNavigateToLogin={() => {
            if (authState.isAuthenticated) {
              setCurrentPage("admin");
            } else {
              setCurrentPage("login");
            }
          }}
        />
      );
  }
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
