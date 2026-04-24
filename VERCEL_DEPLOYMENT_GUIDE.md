# GrammarQuest Vercel Deployment Guide

## Overview
GrammarQuest is deployed on Vercel (frontend) + Supabase (backend). This guide walks you through the complete setup process.

## Architecture
- **Frontend**: Vercel (React + Vite)
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Firebase
- **Storage**: Supabase Storage (for certificates)

## Prerequisites
- Vercel account (free tier available) - https://vercel.com
- Firebase project already configured
- Supabase project with database already set up
- GitHub account (recommended for easy integration)

## Step 1: Prepare Your Repository

### Option A: Using GitHub (Recommended)
1. Push your code to GitHub:
```bash
git remote add origin https://github.com/yourusername/level-up-english.git
git branch -M main
git push -u origin main
```

### Option B: Without GitHub
You can deploy from your local machine using Vercel CLI.

## Step 2: Connect to Vercel

### Option A: GitHub Integration (Easiest)
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Click "Import Git Repository"
4. Select your GitHub repository
5. Vercel will auto-detect it's a Vite project
6. Continue to environment variables

### Option B: Using Vercel CLI
```bash
npm install -g vercel
vercel
# Follow the prompts to connect your account and deploy
```

## Step 3: Configure Environment Variables

In your Vercel project settings, add these environment variables:

### Firebase Configuration
```
VITE_FIREBASE_API_KEY=AIzaSyC0GUrnHMBLoh5X0510IsuJcizSt7ganvk
VITE_FIREBASE_AUTH_DOMAIN=grammar-quest-d2e28.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=grammar-quest-d2e28
VITE_FIREBASE_STORAGE_BUCKET=grammar-quest-d2e28.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=89617948117
VITE_FIREBASE_APP_ID=1:89617948117:web:0614b6851b7a4c0b56315c
```

### Supabase Configuration
```
VITE_SUPABASE_URL=https://lturpknvxtvsdbfcjbre.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dXJwa252eHR2c2RiZmNqYnJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzY3NzEsImV4cCI6MjA5MjUxMjc3MX0.d2Zx_GmYWMqNOtbuRyKgj6Fb6AV3tyKC0S8H6faTYeo
VITE_SUPABASE_PROJECT_ID=lturpknvxtvsdbfcjbre
```

### Steps to Add Environment Variables
1. In Vercel project, go to **Settings** → **Environment Variables**
2. Add each variable name and value
3. Select which deployments it applies to (Production, Preview, Development)
4. Click "Save"

## Step 4: Deploy

### Automatic Deployment (GitHub)
Once environment variables are set:
1. Push a commit to GitHub
2. Vercel automatically builds and deploys
3. View build progress in Vercel dashboard

### Manual Deployment (Vercel CLI)
```bash
vercel --prod
```

## Step 5: Configure Domain

### Using Vercel Domain
1. In Vercel project, go to **Domains**
2. Your project gets a free domain: `your-project.vercel.app`
3. Use this domain as your production URL

### Using Custom Domain
1. In Vercel project, go to **Domains**
2. Click "Add Domain"
3. Enter your custom domain
4. Follow DNS setup instructions
5. Usually takes 5-48 hours to propagate

## Step 6: Update Firebase OAuth URLs

After deployment, update Firebase to allow your Vercel domain:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Your project → **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins**:
   - `https://your-domain.vercel.app`
5. Add to **Authorized redirect URIs**:
   - `https://your-domain.vercel.app/auth`
6. Save

## Step 7: Test Production Deployment

1. Open your deployed app: `https://your-project.vercel.app`
2. Test user authentication:
   - Click "Sign in with Google"
   - Complete OAuth flow
   - Should redirect to dashboard
3. Test game features:
   - Try Easy quiz
   - Check leaderboard
   - Verify XP is saved in Supabase

## Monitoring & Logs

### View Deployment Logs
1. In Vercel project, go to **Deployments**
2. Click on any deployment
3. Click "Logs" to see build output
4. Troubleshoot any errors

### Enable Analytics
1. In Vercel project settings
2. Enable **Web Analytics**
3. Monitor user activity, page load times, etc.

## Environment Variables Summary

```env
# Firebase
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

## Troubleshooting

### Build Fails
1. Check **Deployment logs** in Vercel
2. Common issues:
   - Missing environment variables → Add to Vercel settings
   - TypeScript errors → Fix in code, push again
   - Dependency issues → Delete node_modules, reinstall locally

### Authentication Not Working
1. Verify Firebase credentials in environment variables
2. Check Firebase console for allowed domains
3. Verify Supabase is accessible

### Slow Performance
1. Check Vercel **Analytics** for bottlenecks
2. Optimize images in public folder
3. Consider upgrading Vercel plan for better performance

## Continuous Deployment

Your app will automatically redeploy when you:
1. Push to `main` branch (or configured branch)
2. Environment variables change
3. Vercel settings change

To disable auto-deployment:
- Project Settings → **Git** → Toggle "Auto-deploy on push"

## Custom Build & Development Commands

Configured in `vercel.json`:
- **Build**: `npm run build`
- **Output**: `dist/`
- **Framework**: Vite
- **Node version**: 20.x

To modify, edit `vercel.json` in project root.

## Next Steps

1. **Monitor performance** - Use Vercel Analytics
2. **Enable CDN caching** - Configure cache headers
3. **Set up error tracking** - Integrate Sentry or similar
4. **Configure backups** - Enable Supabase backups
5. **Plan scaling** - Monitor usage and upgrade as needed

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.io/docs
- **Firebase Docs**: https://firebase.google.com/docs

---

**Your GrammarQuest app is now live on Vercel! 🚀**

Check your deployment at: `https://your-project.vercel.app`