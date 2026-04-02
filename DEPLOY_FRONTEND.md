# Frontend Deployment Guide (Vercel)

## 🚀 Quick Deploy to Vercel

### Method 1: Using Vercel Dashboard (Easiest)

1. **Go to Vercel**: https://vercel.com/new

2. **Import Git Repository**
   - Click "Import Project"
   - Connect your GitHub account
   - Select repository: `alokyadav9045/Nayibareilly`

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `client` ⚠️ IMPORTANT!
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Environment Variables** (Click "Add" for each)
   ```
   NEXT_PUBLIC_API_URL=http://localhost:4001/api
   ```
   
   > **Note**: Update this to your actual backend URL once deployed
   > Example: `https://your-backend.onrender.com/api`

5. **Click Deploy** 🎉

---

### Method 2: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to client directory
cd client

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

---

## 📋 Environment Variables Required

Set these in Vercel Dashboard → Settings → Environment Variables:

### Required:
- `NEXT_PUBLIC_API_URL` - Your backend API URL
  - Development: `http://localhost:4001/api`
  - Production: `https://your-backend-url.com/api`

### Optional (if features are enabled):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `JWT_SECRET` - JWT secret (must match backend)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key

---

## ✅ Pre-Deployment Checklist

Before deploying, ensure:

- [ ] Frontend builds successfully locally: `npm run build`
- [ ] Backend API is deployed and accessible
- [ ] CORS is configured on backend to allow your Vercel domain
- [ ] Environment variables are set in Vercel
- [ ] Root directory is set to `client` in Vercel

---

## 🔧 Troubleshooting

### Build Fails
1. Check build logs in Vercel dashboard
2. Ensure `client` is set as root directory
3. Verify all dependencies are in package.json
4. Test build locally: `cd client && npm run build`

### API Calls Fail
1. Check `NEXT_PUBLIC_API_URL` is set correctly
2. Verify backend CORS settings allow your Vercel domain
3. Check Network tab in browser DevTools

### Environment Variables Not Working
1. Variables starting with `NEXT_PUBLIC_` are exposed to browser
2. Other variables are only available in API routes/server
3. Redeploy after changing environment variables

---

## 🌐 Custom Domain (Optional)

1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update backend CORS to include your custom domain

---

## 📊 Post-Deployment

After successful deployment:

1. **Update Backend CORS**: Add your Vercel URL to allowed origins
2. **Test All Features**: Login, create issue, view map, etc.
3. **Monitor**: Check Vercel Analytics and Logs
4. **Set Production Environment Variables**: Update API URL to production backend

---

## 🔄 Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every pull request and branch

To disable auto-deploy:
Settings → Git → Disable "Automatic Deployments"

---

## 📱 Mobile Testing

Test your deployment on mobile devices:
1. Use Vercel's preview URLs
2. Test on different screen sizes
3. Check PWA functionality (if enabled)

---

## 🆘 Need Help?

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- GitHub Issues: Create issue in your repository

---

**Your Frontend Will Be Live At:**
- Production: `https://your-project.vercel.app`
- Preview: `https://your-project-branch.vercel.app`
- Custom Domain: `https://yourdomain.com` (if configured)
