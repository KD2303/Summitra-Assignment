# 🚀 Summitra — Deployment Guide (Render & Vercel)

This guide walks you through deploying **Summitra** with:
- **Backend (Node.js + Express + Socket.IO + Database)** on **[Render](https://render.com)**
- **Frontend (React + Vite + Tailwind CSS)** on **[Vercel](https://vercel.com)**

---

## 🏗️ Architecture Overview

```mermaid
graph LR
    subgraph Vercel ["Frontend (Vercel)"]
        SPA["React SPA (Vite)"]
    end

    subgraph Render ["Backend (Render)"]
        API["Express API Server"]
        WS["Socket.IO Server"]
        DB[("MySQL / Cloud DB or In-Memory")]
    end

    SPA -->|REST API (/api/*)| API
    SPA <-->|Real-time Seats WebSocket| WS
    API <--> DB
```

---

## Part 1: Deploy Backend on Render

### Step 1: Create a Web Service on Render
1. Go to your **[Render Dashboard](https://dashboard.render.com/)**.
2. Click **New +** ➔ **Web Service**.
3. Connect your GitHub / GitLab repository containing `Summitra-Assignment`.
4. Configure the Web Service settings:
   - **Name:** `summitra-api` (or your preferred name)
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

### Step 2: Configure Environment Variables on Render
Scroll to **Environment Variables** and add:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `10000` | Port assigned by Render (handled automatically) |
| `CLIENT_ORIGIN` | `https://your-app.vercel.app` | Your Vercel frontend URL (comma-separated if multiple) |
| `JWT_SECRET` | `your_secure_random_jwt_secret_32_chars` | Secret key for JWT admin authentication |

#### Optional Database Connection:
- **Cloud MySQL (Aiven / PlanetScale / Railway / TiDB / AWS RDS):**
  - Set `DATABASE_URL=mysql://user:pass@host:port/dbname?ssl={"rejectUnauthorized":false}` or individual `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
- **Zero-Config Fallback:**
  - If you do not configure a database, Summitra automatically runs in **In-Memory ACID Database Mode** with full features, real-time seat locks, and seed events ready!

### Step 3: Deploy & Copy Your Render URL
1. Click **Create Web Service**.
2. Once deployed, note down your backend URL:
   `https://summitra-api.onrender.com`
3. Verify by visiting `https://summitra-api.onrender.com/api/health` — it should return:
   ```json
   {"status":"OK","database":"connected"}
   ```

---

## Part 2: Deploy Frontend on Vercel

### Step 1: Import Project to Vercel
1. Go to **[Vercel Dashboard](https://vercel.com/new)**.
2. Click **Add New...** ➔ **Project**.
3. Select your repository.

### Step 2: Configure Build Settings
In the **Configure Project** screen:
- **Framework Preset:** `Vite`
- **Root Directory:** Click `Edit` and select `client` *(or leave as `./` since root `vercel.json` is configured!)*
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Step 3: Add Environment Variables
Under **Environment Variables**, add:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://summitra-api.onrender.com` | Your Render backend URL |

> [!TIP]
> `VITE_SOCKET_URL` is automatically derived from `VITE_API_URL`. You don't need to specify it unless you run WebSockets on a different host.

### Step 4: Deploy!
Click **Deploy**. Within 1–2 minutes, Vercel will build and assign your live URL:
`https://summitra.vercel.app`

---

## Part 3: Link Vercel URL back to Render

1. Go back to your **Render Dashboard** ➔ `summitra-api` ➔ **Environment**.
2. Update `CLIENT_ORIGIN` to your exact Vercel production domain:
   ```env
   CLIENT_ORIGIN=https://summitra.vercel.app
   ```
3. Click **Save Changes** (Render will automatically redeploy with the allowed origin).

---

## Part 4: Production Feature Checklist

- [x] **Vercel SPA Rewrites ([`vercel.json`](file:///d:/Dev%20Stuff/Summitra-Assignment/vercel.json)):** Direct navigation to `/events/1`, `/checkout/1`, and `/admin` does not trigger 404 errors on browser refresh.
- [x] **CORS & WebSocket Origin:** Render backend allows Vercel production and `*.vercel.app` preview branches.
- [x] **API Base URL Normalization:** Client automatically handles URLs with or without trailing `/api` (e.g. `https://api.onrender.com` or `https://api.onrender.com/api`).
- [x] **Dynamic WebSocket Routing:** Socket.IO client automatically extracts host origin from `VITE_API_URL`.
- [x] **Database Resilience:** Database pool supports `DATABASE_URL`, cloud SSL certificates (`DB_SSL`), and auto-falls back to the in-memory engine if external MySQL is unreachable.
- [x] **Admin Security:** Protected admin routes verify cryptographic JWT tokens with the backend before granting access.
