# Google OAuth Troubleshooting Checklist

## ✅ What I've Done
- [x] Created comprehensive Google OAuth setup guide (`GOOGLE_OAUTH_SETUP.md`)
- [x] Improved error handling with detailed logging
- [x] Added debug information display on auth page
- [x] Enhanced OAuth callback handler
- [x] Added helpful error messages

## 🔧 Quick Setup Checklist

### Step 1: Google Cloud Console
- [ ] Created Google Cloud project
- [ ] Enabled Google+ API
- [ ] Created OAuth 2.0 credentials (Web application)
- [ ] Added authorized JavaScript origins:
  - [ ] `http://localhost:8080`
  - [ ] `https://lturpknvxtvsdbfcjbre.supabase.co`
- [ ] Added authorized redirect URIs:
  - [ ] `http://localhost:8080/auth/callback`
  - [ ] `https://lturpknvxtvsdbfcjbre.supabase.co/auth/v1/callback`
- [ ] Copied Client ID
- [ ] Copied Client Secret

### Step 2: Supabase Configuration
- [ ] Went to Authentication → Providers
- [ ] Enabled Google provider
- [ ] Pasted Client ID
- [ ] Pasted Client Secret
- [ ] Verified callback URL matches
- [ ] Clicked Save

### Step 3: Application
- [ ] Restarted dev server: `bun run dev`
- [ ] Cleared browser cache
- [ ] Hard refreshed: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

## 🧪 Testing
1. Open http://localhost:8080
2. Click "Sign in with Google"
3. You should be redirected to Google login
4. After successful login, redirect to /auth/callback
5. Should redirect to dashboard

## 🔍 Debug Info on Auth Page
- Click "Show Debug Info" on the login page to see:
  - Supabase URL
  - Key status
  - Current app URL
  - Expected callback URL

## 📋 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| 400 Bad Request | OAuth not configured | Follow setup guide, ensure credentials are in Supabase |
| Redirect URI mismatch | URL doesn't match | Add exact URL to both Google Console and Supabase |
| Session not found | Session sync delay | Wait 2-3 seconds, check localStorage for token |
| Provider not found | Google not enabled in Supabase | Go to Supabase → Providers → Enable Google |
| Invalid credentials | Wrong Client ID/Secret | Verify copied values, try copying again |

## 🛠 Advanced Debugging

### Check Supabase Logs
```bash
# Open Supabase dashboard
# Go to: Project → Auth → User Management
# Look for failed login attempts
```

### Check Browser Console
- Press F12
- Go to Console tab
- Look for errors starting with 🔴 (red circle emoji)
- Copy full error message

### Check Network Requests
- Press F12 → Network tab
- Click "Sign in with Google"
- Look for request to `authorize?provider=google`
- Check response status and details

### Check LocalStorage
- Press F12 → Application → LocalStorage
- Look for `sb-*` keys (Supabase tokens)
- If empty, session wasn't created

## 📞 Need Help?

1. **Check browser console** (F12) - look for red errors
2. **Enable debug info** on auth page - shows configuration
3. **Review GOOGLE_OAUTH_SETUP.md** - detailed step-by-step guide
4. **Check Supabase logs** - see what went wrong on backend
5. **Verify all URLs exactly** - typos are the #1 cause of issues

## ✨ Once It Works

Your app will:
- ✅ Redirect to Google login when clicking the button
- ✅ Authenticate the user
- ✅ Create a user profile in Supabase
- ✅ Store session in browser
- ✅ Redirect to dashboard
- ✅ Show leaderboard and quiz sections

Happy authenticating! 🚀
