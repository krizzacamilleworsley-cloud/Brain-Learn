# 🚀 Quick Start: Deploy GrammarQuest to Vercel

## Your App is Ready! Here's What to Do:

### Step 1: Prepare Your Local Environment (2 minutes)

**Windows Users:**
```powershell
.\prepare-vercel.bat
```

**Mac/Linux Users:**
```bash
chmod +x prepare-vercel.sh
./prepare-vercel.sh
```

This script:
- ✅ Cleans up dependencies
- ✅ Removes unused Lovable files
- ✅ Tests your build
- ✅ Confirms everything works

### Step 2: Push to GitHub (3 minutes)

```bash
git add .
git commit -m "Remove Lovable, prepare for Vercel deployment"
git push origin main
```

### Step 3: Deploy to Vercel (5 minutes)

1. Go to **https://vercel.com**
2. Sign up (free) or log in
3. Click **"New Project"**
4. Click **"Import Git Repository"**
5. Select your GitHub repo
6. Click **"Deploy"**

That's it! Vercel will build and deploy your app.

### Step 4: Add Environment Variables (3 minutes)

While Vercel builds, prepare your variables:

**In Vercel Dashboard:**
1. Go to your project
2. Click **Settings** → **Environment Variables**
3. Add each variable below and save

**Copy & Paste These:**

```env
# Firebase (for Google authentication)
VITE_FIREBASE_API_KEY=AIzaSyC0GUrnHMBLoh5X0510IsuJcizSt7ganvk
VITE_FIREBASE_AUTH_DOMAIN=grammar-quest-d2e28.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=grammar-quest-d2e28
VITE_FIREBASE_STORAGE_BUCKET=grammar-quest-d2e28.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=89617948117
VITE_FIREBASE_APP_ID=1:89617948117:web:0614b6851b7a4c0b56315c

# Supabase (for database)
VITE_SUPABASE_URL=https://lturpknvxtvsdbfcjbre.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dXJwa252eHR2c2RiZmNqYnJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzY3NzEsImV4cCI6MjA5MjUxMjc3MX0.d2Zx_GmYWMqNOtbuRyKgj6Fb6AV3tyKC0S8H6faTYeo
VITE_SUPABASE_PROJECT_ID=lturpknvxtvsdbfcjbre
```

### Step 5: Done! 🎉

Your app is now live at: `https://your-project.vercel.app`

### Test It

1. Open your Vercel deployment URL
2. Click **"Sign in with Google"**
3. Complete the login flow
4. Play a quiz
5. Check the leaderboard

## Troubleshooting

**Build failed?**
→ Check build logs in Vercel Dashboard → Deployments → Click failed deploy → Logs

**Can't sign in?**
→ Make sure Firebase environment variables are added in Vercel

**Quiz/Leaderboard not working?**
→ Make sure Supabase environment variables are added in Vercel

## Need Help?

📖 **Full Guide**: See `VERCEL_DEPLOYMENT_GUIDE.md`

📋 **Checklist**: See `DEPLOYMENT_CHECKLIST.md`

📝 **Summary**: See `CLEANUP_AND_DEPLOYMENT_SUMMARY.md`

---

**That's it! Your GrammarQuest app is production-ready. Deploy now! 🚀**