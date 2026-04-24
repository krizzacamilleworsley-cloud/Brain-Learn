# Vercel Deployment Checklist for GrammarQuest

## Pre-Deployment Checklist

### Code & Dependencies
- [ ] Remove all Lovable references ✅ (Done)
- [ ] Update footer text ✅ (Done)
- [ ] Remove lovable-tagger from vite.config.ts ✅ (Done)
- [ ] Remove lovable dependencies from package.json ✅ (Done)
- [ ] Run `npm install` to clean up node_modules
- [ ] Test locally: `npm run dev`
- [ ] Run linter: `npm run lint`
- [ ] Run tests: `npm run test`

### Firebase Configuration
- [ ] Firebase project created
- [ ] Google OAuth enabled in Firebase
- [ ] Firebase config credentials ready
- [ ] Update Firebase authorized domains to include Vercel domain

### Supabase Configuration
- [ ] Database migrations applied
- [ ] RLS policies configured
- [ ] Environment variables ready

### Git Setup
- [ ] Code pushed to GitHub
- [ ] .env file added to .gitignore
- [ ] vercel.json created ✅
- [ ] .vercelignore created ✅

## Deployment Steps

### Step 1: Create Vercel Account
- [ ] Sign up at https://vercel.com
- [ ] Link GitHub account

### Step 2: Create Vercel Project
- [ ] Import GitHub repository
- [ ] Select project root folder
- [ ] Let Vercel auto-detect Vite configuration

### Step 3: Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

**Firebase Variables:**
```
VITE_FIREBASE_API_KEY = AIzaSyC0GUrnHMBLoh5X0510IsuJcizSt7ganvk
VITE_FIREBASE_AUTH_DOMAIN = grammar-quest-d2e28.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = grammar-quest-d2e28
VITE_FIREBASE_STORAGE_BUCKET = grammar-quest-d2e28.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 89617948117
VITE_FIREBASE_APP_ID = 1:89617948117:web:0614b6851b7a4c0b56315c
```

**Supabase Variables:**
```
VITE_SUPABASE_URL = https://lturpknvxtvsdbfcjbre.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID = lturpknvxtvsdbfcjbre
```

### Step 4: Deploy
- [ ] Click "Deploy" in Vercel
- [ ] Wait for build to complete (2-5 minutes)
- [ ] View build logs if needed

### Step 5: Test Production
- [ ] Open deployed URL
- [ ] Test Google Sign-in
- [ ] Check leaderboard loads
- [ ] Try a quiz
- [ ] Verify XP saves to Supabase

### Step 6: Configure Custom Domain (Optional)
- [ ] In Vercel: Settings → Domains
- [ ] Add custom domain
- [ ] Configure DNS records
- [ ] Wait for SSL certificate (5-48 hours)

### Step 7: Update Firebase OAuth URLs
In Google Cloud Console:
- [ ] Add Vercel domain to Authorized JavaScript origins
- [ ] Add Vercel domain `/auth` to Authorized redirect URIs
- [ ] Save changes

## Post-Deployment

### Monitoring
- [ ] Enable Vercel Web Analytics
- [ ] Check performance metrics
- [ ] Monitor error rates
- [ ] Set up alerts (optional)

### Updates
- [ ] Push changes to GitHub
- [ ] Vercel auto-deploys
- [ ] Test changes in staging URL first (optional)
- [ ] Monitor production after each deployment

## Environment Variables Quick Reference

| Variable | Location | Example |
|----------|----------|---------|
| `VITE_FIREBASE_*` | Firebase Console | grammar-quest-bd1b1 |
| `VITE_SUPABASE_URL` | Supabase Settings | https://...supabase.co |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase → API | eyJ... |

## Troubleshooting

### Build Fails
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Run `npm install && npm run build` locally
4. Fix any errors, commit, and push

### Authentication Not Working
1. Verify Firebase credentials in Vercel
2. Check Firebase console for allowed domains
3. Clear browser cache and cookies
4. Test in incognito mode

### Database Not Connecting
1. Check Supabase URL in environment variables
2. Verify network access in Supabase
3. Test connection locally first
4. Check Supabase status page

### Performance Issues
1. Use Vercel Analytics to identify bottlenecks
2. Optimize bundle size: `npm run build` shows size
3. Consider upgrading Vercel plan
4. Enable Vercel Edge Caching

## Rollback

If something goes wrong after deployment:
1. In Vercel: Deployments tab
2. Click "Redeploy" on previous working version
3. Or revert GitHub commit and push

## Support Resources

- **Vercel**: https://vercel.com/docs
- **Firebase**: https://firebase.google.com/docs
- **Supabase**: https://supabase.io/docs
- **This guide**: See VERCEL_DEPLOYMENT_GUIDE.md

---

## Quick Commands

```bash
# Install dependencies
npm install

# Test locally
npm run dev

# Build for production
npm run build

# Deploy with Vercel CLI
npm install -g vercel
vercel --prod
```

---

✅ **Ready to deploy? Follow the steps above and your app will be live in minutes!**