import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminResetPassword from "./pages/AdminResetPassword";
import { RefreshCw } from "lucide-react";

type Page = "home" | "login" | "admin" | "reset-password";

function MainApp() {
  const { state: authState, checkAuth } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Capture resetToken param on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("resetToken");
    if (token) {
      setResetToken(token);
      setCurrentPage("reset-password");
      // Clean query parameters from URL history nicely
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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
    case "reset-password":
      return (
        <AdminResetPassword
          token={resetToken || ""}
          onBackToLogin={() => setCurrentPage("login")}
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
  // Load Tawk.to live chat dynamically on app mount
  useEffect(() => {
    if ((window as any).Tawk_API) return;

    (window as any).Tawk_API = (window as any).Tawk_API || {};
    (window as any).Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://embed.tawk.to/6a2ca4858705f01c3509b7ea/1jqv65av6";
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.body.appendChild(script);
    }
  }, []);

  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
