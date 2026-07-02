# NayiBareilly Platform Deployment Guide

This guide provides step-by-step instructions for deploying the NayiBareilly platform to production. The platform consists of a **Next.js Frontend** (Client) and a **Node.js/Express Backend** (Server), using a **PostgreSQL** database and **Cloudinary** for image storage.

> [!NOTE]
> **Recommended Hosting Stack:**
> *   **Frontend:** Vercel (Optimized for Next.js)
> *   **Backend:** Render, Railway, or AWS EC2 (Node.js runtime)
> *   **Database:** Supabase or Neon (PostgreSQL)

---

## 1. Database & External Services Preparation

Before deploying your code, ensure your external services are ready for production.

### A. PostgreSQL Database (Supabase)
1. Go to your Supabase project dashboard.
2. Navigate to **Project Settings -> Database**.
3. Copy your **Transaction Connection String** (Session mode or Transaction mode depending on your Prisma setup).
4. Ensure your database is fully migrated by running this locally first:
   ```bash
   cd server
   npx prisma migrate deploy
   ```

### B. Cloudinary (Image Storage)
1. Ensure your Cloudinary account is active.
2. Copy your `Cloud Name`, `API Key`, and `API Secret`.
3. In your Cloudinary dashboard, ensure you have an upload folder named `nayibareilly` if your code expects it.

### C. Authentication Secrets
1. Generate secure random strings for your production environment (you can use `openssl rand -hex 32` or an online generator).
2. You will need secure values for `JWT_SECRET`, `JWT_REFRESH_SECRET`, `REFRESH_TOKEN_HASH_SECRET`, and `SESSION_SECRET`.

---

## 2. Deploying the Backend (Node.js/Express)

We recommend deploying the backend on **Render.com** or **Railway.app** for seamless Node.js hosting.

### Render.com Deployment Steps:
1. Create a new **Web Service** on Render.
2. Connect your GitHub repository.
3. Set the **Root Directory** to `server`.
4. Configure the build and start commands:
   *   **Build Command:** `npm ci && npx prisma generate && npx prisma migrate deploy`
   *   **Start Command:** `npm start`
5. **Environment Variables**: Add the following variables to your Render service:
   *   `NODE_ENV`: `production`
   *   `PORT`: `4001` (Or let Render auto-assign and remove this)
   *   `CLIENT_ORIGIN`: `https://your-frontend-domain.com` (CRITICAL for CORS)
   *   `DATABASE_URL`: `your_supabase_connection_string`
   *   `DIRECT_URL`: `your_supabase_direct_connection_string`
   *   `JWT_SECRET`: `your_generated_secret`
   *   `CLOUDINARY_CLOUD_NAME`: `dfvudsdld`
   *   `CLOUDINARY_API_KEY`: `your_api_key`
   *   `CLOUDINARY_API_SECRET`: `your_api_secret`
   *   *(Include all other required variables from your `server/.env` file).*

> [!IMPORTANT]  
> **CORS Configuration:** Your `CLIENT_ORIGIN` in the backend must perfectly match your live frontend URL (e.g., `https://nayibareilly.vercel.app`), otherwise the frontend will get `CORS Policy Blocked` errors.

---

## 3. Deploying the Frontend (Next.js)

We highly recommend deploying the frontend to **Vercel**, the creators of Next.js.

### Vercel Deployment Steps:
1. Go to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. **Framework Preset**: Next.js (Vercel will detect this automatically).
4. **Root Directory**: Click `Edit` and select `client`.
5. **Environment Variables**: Add the following variables:
   *   `NEXT_PUBLIC_API_URL`: `https://your-backend-url.onrender.com/api` (Point this to your LIVE backend URL)
   *   `NEXT_PUBLIC_WS_URL`: `https://your-backend-url.onrender.com` (For live socket connections)
   *   *(Include any Firebase or Google Maps keys if applicable).*
6. Click **Deploy**.

> [!WARNING]  
> **Do not use `localhost` or `127.0.0.1` in production!** Your `NEXT_PUBLIC_API_URL` must point to the public internet address of your Render/Railway backend server.

---

## 4. Post-Deployment Verification Checklist

Once both services show "Deployed / Live", verify the platform using this checklist:

*   [ ] **API Connectivity:** Open the live frontend URL and check the browser console (F12). Ensure there are no `ERR_CONNECTION_REFUSED` or `CORS Error` messages.
*   [ ] **Database Connection:** Check the backend server logs (in Render/Railway dashboard) to ensure Prisma successfully connected to Supabase without timeout errors.
*   [ ] **Image Uploads:** Submit a test Civic Issue report from the frontend. Verify that the image uploads correctly to Cloudinary and displays on the feed.
*   [ ] **Authentication:** Attempt to log in with the admin credentials to ensure JWT cookies are being set correctly across domains.

> [!TIP]
> If authentication fails in production but works locally, it is usually because cookies require `Secure: true` and `SameSite: 'none'` when the frontend and backend are hosted on different domains (e.g., `vercel.app` and `onrender.com`). Ensure your backend cookie configuration accounts for cross-domain usage in production.
