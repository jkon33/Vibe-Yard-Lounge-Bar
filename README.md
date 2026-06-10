# 🔮 Vibe Yard Lounge & Bar - Menu Management & Dashboard

A complete, production-ready full-stack catalog web application featuring real-time WebSockets synchronization, full CRUD administration, and maximum-security defenses. Specifically curated for **Vibe Yard Lounge & Bar** with a futuristic Cyberpunk glassmorphic aesthetic.

Built with React 19, Vite, Express, and MongoDB.

---

## 🚀 Key Feature Set

1. **Futuristic Neon Interface:** Immersive dark design powered by `Poppins` typography, glowing glassmorphism gradients, and Framer Motion animations.
2. **Dual-Mode Resilient Database Layer:** Automatically detects if MongoDB is ready. Connects to `MongoDB Atlas` in production but falls back to a reliable localized persistent JSON store in development preview, ensuring instant functional access without startup failures.
3. **Admin Panel Control:** Direct CRUD pathways mapping Menu Items (consisting of distinct Food or Drink classifications), custom Site Banner Slides, prioritisation orders, and header Logo images.
4. **Real-Time Client Feeds:** Pure WebSockets broadcast protocol propagates administrative modifications instantly to customers without screen refreshes.
5. **Robust Security Stack:** Rate limiting, CORS origin lockdowns, MongoDB injection sanitizers, Helmet.js Headers defenses, automatic XSS content-stripping, and secure JWT refresh token rotations stored in secure Client cookies.

---

## 🛠️ Unified Database Fallback & Seeding

When the application launches:
* **Production / Configured Environment:** Connects and provisions schemas seamlessly onto your MongoDB Atlas Cluster using Mongoose.
* **Development Sandbox:** Gracefully utilizes a persistent JSON store located in `./server/uploads/data-store.json`.
* **Automatic Seeding:** Pre-populates a rich catalog of glowing cocktails and fusion foods with realistic images, saving manual setup time.

### Default Credentials
* **Username:** `admin`
* **Secret Phrase:** `VibeYardSecurePass2026!`

---

## 📋 Comprehensive Environment Configuration

Define the following environment variables in `.env` inside the server or hosting platforms:

```env
# MongoDB Connection String (Atlas Cluster)
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/vibeyard?retryWrites=true&w=majority"

# Secure Cryptographic Salt for JWT
JWT_SECRET="super-secret-futuristic-cyber-vibe-security-key-2026"

# Controlled Administration Seeds
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="VibeYardSecurePass2026!"

# Allowed Gateways (CORS space/comma-separated whitelist)
ALLOWED_ORIGINS="http://localhost:3000,https://vibeyard-frontend.vercel.app"
```

---

## 🐳 Step-by-Step Production Deployments

### 1. MongoDB Atlas Setup
1. Create a free-tier database at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database Access User with **Read and Write** permissions.
3. Go to **Network Access** and select **Add IP Address** -> Choose **Allow Access from Anywhere** (0.0.0.0/0) or whitelisted Render static outgoing IPs.
4. Snatch your SRV Connection String under `Connect -> Drivers -> Node.js`.

---

### 2. Back-end API Deployment on Render
1. Register/Login to [Render](https://render.com).
2. Choose **New +** -> **Web Service**.
3. Link your GitHub repository or connect directly.
4. Set the following Build and Start parameters:
   - **Runtime:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start`
5. Go to **Environment Variables** and input the full configuration list listed in the Env Section.
6. Once deployed, trace the generated Render Web Service absolute URL (e.g. `https://vibeyard-backend.onrender.com`).

---

### 3. Front-end Deployment on Vercel
1. Register/Login to [Vercel](https://vercel.com).
2. Choose **Add New...** -> **Project**.
3. Import your repository.
4. Set **Build and Output Settings** to default Vite values:
   - **Build Command:** `vite build`
   - **Output Directory:** `dist`
5. Vercel automatically deploys front-end routers.
6. Remember to copy your Vercel URL and add it back to your Render environmental `ALLOWED_ORIGINS` to satisfy CORS secure standards.

---

## 🛡️ Cyber-Defensive Security Architecture

This platform integrates modern Web Application Firewall (WAF) style protections directly into Node.js middleware:

* **NoSQL Query Injection Prevention (`express-mongo-sanitize`):** Automatically scrubs incoming req queries or bodies of any nested MongoDB operator characters (e.g. `$ne: ""`), neutralizing authentication bypass attacks.
* **Dual-Tier Rate Limiting (`express-rate-limit`):**
  * *Public Gateways:* 100 requests per 15 minutes to eliminate scraping or DoS flood potentials.
  * *Admin Gateways:* Lockout trigger allowing maximum 20 requests per hour to defeat automated login brute-forcing.
* **Helmet.js secure HTTP Headers:** Enforces modern strict browser practices by setting secure options for framing defenses, DNS prefetching, same-origin referrers, and MIME-type sniffing locks.
* **XSS Neutralization:** All textual inputs from administrators undergo Zod validation and a sanitization regex parse that strips dangerous HTML structures (such as `<script>`, `onload`, etc.) before database write triggers.
* **Secured JWT Cookies:** Authentication relies on double-token JWT payloads stored entirely in `HttpOnly`, `Secure`, `SameSite: None` client cookies. Scripts cannot access these tokens, rendering cross-site scripting (XSS) payload token thefts impossible.
