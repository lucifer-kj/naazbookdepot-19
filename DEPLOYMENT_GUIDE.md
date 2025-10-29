# 🚀 Deployment Guide - Naaz Book Depot

## Quick Fix for Blank Page Issue

Your app is building successfully but showing a blank page. Here's how to fix it:

### 1. **Environment Variables Setup**

**For Vercel:**
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables:

```bash
VITE_SUPABASE_URL=https://tyjnywhsynuwgclpehtx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5am55d2hzeW51d2djbHBlaHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTAwODMsImV4cCI6MjA3Njk4NjA4M30.opDu5zS7aQh17B-Mf7awqNo4DayPZx_fA4e3-SDXzqw
VITE_NODE_ENV=production
VITE_APP_VERSION=1.0.0
```

**For Netlify:**
1. Go to Site settings → Environment variables
2. Add the same variables above

### 2. **Redeploy**

After adding environment variables:
```bash
# Commit the new files
git add .
git commit -m "fix: add deployment configuration and production fixes"
git push origin main
```

### 3. **Check Browser Console**

1. Open your deployed site
2. Press F12 to open Developer Tools
3. Check the Console tab for any JavaScript errors
4. Check the Network tab to see if files are loading

### 4. **Common Issues & Solutions**

**Issue: Still blank page after env vars**
- Check if your deployment platform supports SPA routing
- Ensure the `vercel.json` or `netlify.toml` files are properly configured

**Issue: 404 errors on refresh**
- The routing configuration in `vercel.json`/`netlify.toml` should fix this
- Make sure the rewrite rules are working

**Issue: Environment variables not loading**
- Ensure all VITE_ prefixed variables are set in your deployment platform
- Check that the build command is `npm run build`

### 5. **Debugging Steps**

1. **Check Build Output:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Test Locally with Production Build:**
   ```bash
   VITE_NODE_ENV=production npm run build
   npm run preview
   ```

3. **Check Network Requests:**
   - Open browser dev tools
   - Go to Network tab
   - Look for failed requests (red entries)

### 6. **Platform-Specific Instructions**

**Vercel:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Netlify:**
- Build Command: `npm run build`
- Publish Directory: `dist`

**Railway/Render:**
- Build Command: `npm run build`
- Start Command: `npm run preview`

### 7. **Emergency Fallback**

If the issue persists, you can create a simple index.html in the dist folder:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Naaz Book Depot - Loading...</title>
</head>
<body>
    <div id="root">
        <div style="text-align: center; padding: 50px;">
            <h1>Naaz Book Depot</h1>
            <p>Loading application...</p>
            <script>
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            </script>
        </div>
    </div>
</body>
</html>
```

## Next Steps

1. Add environment variables to your deployment platform
2. Redeploy the application
3. Check browser console for errors
4. If still having issues, share the browser console errors

The app should now load properly! 🎉