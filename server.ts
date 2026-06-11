import express from "express";
import path from "path";
import http from "http";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import { connectDB, ensureDirectories } from "./server/utils/dbStore";
import { initWebSocketServer } from "./server/utils/wsManager";
import apiRouter from "./server/routes/api";
import { createServer as createViteServer } from "vite";

async function startServer() {
  // Ensure required directories exist
  ensureDirectories();

  // Try to connect to MongoDB. Fallback is handled automatically within DB Store
  await connectDB();

  const app = express();
  const PORT = 3000;

  // Create HTTP server (shared with WebSocket)
  const server = http.createServer(app);

  // Initialize WebSocket server on port 3000 upgrade
  initWebSocketServer(server);

  // 1. Security Headers (Helmet.js)
  // Disable CSP in development to prevent Vite bundle loading blocks, otherwise use standard.
  const isProd = process.env.NODE_ENV === "production";
  app.use(
    helmet({
      contentSecurityPolicy: isProd
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://fonts.googleapis.com"],
              styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
              imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.unsplash.com"],
              fontSrc: ["'self'", "https://fonts.gstatic.com"],
              connectSrc: ["'self'", "wss:", "ws:", "https://*.unsplash.com"],
            },
          }
        : false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      crossOriginEmbedderPolicy: false,
    })
  );

  // 2. CORS Handling
  // Do NOT allow '*' wildcard for credentials (cookies). Specify origins:
  app.use((req, res, next) => {
    // Read allowed origins from env or default
    const rawOrigins = process.env.ALLOWED_ORIGINS || "";
    const allowedOrigins = rawOrigins
      .split(",")
      .map(o => o.trim())
      .filter(Boolean);

    // Dynamic checks
    const origin = req.headers.origin;
    
    // Fallback default lists
    const defaults = ["http://localhost:3000", "http://127.0.0.1:3000"];
    
    if (origin) {
      const cleanOrigin = origin.replace(/\/$/, "");
      const isAllowed = allowedOrigins.some(allowed => {
        const cleanAllowed = allowed.replace(/\/$/, "");
        return cleanAllowed === cleanOrigin;
      });

      const isVercelSubdomain = cleanOrigin.endsWith(".vercel.app");
      const isRenderSubdomain = cleanOrigin.endsWith(".onrender.com");

      if (isAllowed || defaults.includes(origin) || isVercelSubdomain || isRenderSubdomain || !isProd) {
        res.setHeader("Access-Control-Allow-Origin", origin);
      }
    } else {
      // safe fallback
      if (!isProd) {
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
      }
    }

    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // 3. Request Parsers
  app.use(express.json({ limit: "5mb" })); // accommodates logo and banner base64 images upload
  app.use(express.urlencoded({ limit: "5mb", extended: true }));
  app.use(cookieParser());

  // 4. Data Sanitization against NoSQL query injections
  app.use(mongoSanitize());

  // 5. API Routes
  app.use("/api", apiRouter);

  // 6. Vite Integration & Front-end assets
  if (!isProd) {
    console.log("⚡ Booting Vite Interactive Development Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("📦 Running in Production. Serving pre-compiled client assets from /dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind server
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`📡 Vibe Yard Full-Stack App online at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("CRITICAL: Failed to boot Vibe Yard server:", err);
});
