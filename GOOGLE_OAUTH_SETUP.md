# Google OAuth Setup Guide for Level Up English

This guide walks you through setting up Google OAuth authentication for the Level Up English application.

## Prerequisites
- Supabase project created (already done: `lturpknvxtvsdbfcjbre`)
- Google account for Google Cloud Console

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console
1. Navigate to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project or select existing one:
   - Click "Select a Project" → "New Project"
   - Name: "Level Up English"
   - Click "Create"

### 1.2 Enable Google+ API
1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and press the **Enable** button
4. Wait for the API to be enabled

### 1.3 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth 2.0 Client IDs**
3. If prompted, configure the OAuth consent screen first:
   - Click **Create OAuth consent screen**
   - Select **External** user type → **Create**
   - Fill in:
     - **App name**: Level Up English
     - **User support email**: your-email@gmail.com
     - **Developer contact**: your-email@gmail.com
   - Click **Save and Continue**
   - Skip optional scopes
   - Add test users (optional)
   - Complete the setup

4. Back to Credentials, click **+ Create Credentials** → **OAuth 2.0 Client IDs**
5. Choose **Web application**
6. Set **Name**: "Level Up English Web"
7. Under **Authorized JavaScript origins**, add:
   ```
   http://localhost:8080
   http://localhost:3000
   https://lturpknvxtvsdbfcjbre.supabase.co
   ```

8. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:8080/auth/callback
   http://localhost:3000/auth/callback
   https://lturpknvxtvsdbfcjbre.supabase.co/auth/v1/callback
   ```

9. Click **Create**
10. Copy your **Client ID** and **Client Secret** (you'll need these next)

## Step 2: Configure Google in Supabase

### 2.1 Open Supabase Dashboard
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project: `lturpknvxtvsdbfcjbre`

### 2.2 Enable Google Provider
1. Navigate to **Authentication** → **Providers**
2. Find **Google** in the provider list
3. Click on Google to expand options
4. Toggle **Enabled** to ON
5. Paste your credentials:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
6. Click **Save**

### 2.3 Verify Redirect URL
1. Still in the Google provider settings, check the **Callback URL** field
2. It should show: `https://lturpknvxtvsdbfcjbre.supabase.co/auth/v1/callback`
3. Copy this URL and ensure it's added to Google Cloud Console (Step 1.7)

## Step 3: Update Your Application

### 3.1 Environment Variables
Your `.env` file should already have:
```env
VITE_SUPABASE_URL=https://lturpknvxtvsdbfcjbre.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dXJwa252eHR2c2RiZmNqYnJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzY3NzEsImV4cCI6MjA5MjUxMjc3MX0.d2Zx_GmYWMqNOtbuRyKgj6Fb6AV3tyKC0S8H6faTYeo
```

If not present, add them to your `.env` file.

### 3.2 Restart Development Server
```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
bun run dev
# or
npm run dev
```

## Step 4: Test Google Authentication

1. Open your app: http://localhost:8080
2. Click "Sign in with Google" button
3. You should be redirected to Google login
4. After successful login, you'll be redirected back to the app
5. Check the browser console (F12) for any errors

## Troubleshooting

### Issue: 400 Bad Request Error
**Cause**: OAuth credentials not configured or redirect URI mismatch
**Solution**:
- Verify Google provider is **Enabled** in Supabase
- Check Client ID and Client Secret are copied correctly
- Verify redirect URIs match exactly (including trailing slashes)
- Clear browser cache and localStorage
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

### Issue: "Redirect URI mismatch"
**Cause**: The redirect URL doesn't match what you configured
**Solution**:
- Ensure `http://localhost:8080/auth/callback` is in Google Console
- Check Supabase callback URL
- Verify exact spelling and protocol (http vs https)

### Issue: Session Not Found After Login
**Cause**: Supabase session not synced properly
**Solution**:
- Check browser console for errors
- Verify RLS policies in Supabase
- Wait 2-3 seconds after redirect
- Check localStorage for auth token in DevTools → Application

### Issue: "OAuth configuration error"
**Cause**: Missing or invalid credentials in Supabase
**Solution**:
- Go back to Supabase → Providers → Google
- Verify credentials are pasted (not partially)
- Click Save again
- Restart dev server

## Debugging Tips

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Click your project
3. Go to **Auth** → **User Management**
4. Look for any failed login attempts
5. Check **Logs** for detailed error messages

### Check Browser Console
1. Press F12 to open Developer Tools
2. Go to **Console** tab
3. Look for error messages starting with "OAuth" or "Supabase"
4. Copy full error and search online

### Check Network Requests
1. Open Developer Tools → **Network** tab
2. Click "Sign in with Google"
3. Look for request to `authorize?provider=google...`
4. Check response status (400 = bad config, 401 = auth failed)

## Security Notes

⚠️ **Never commit your `.env` file to git!**
- Add `.env` to `.gitignore` (already done)
- Keep your Google Client Secret private
- Don't share Supabase keys in public repositories

## Next Steps

Once Google OAuth is working:
1. Test on production URL
2. Add more OAuth providers (GitHub, Microsoft, etc.)
3. Set up email verification
4. Enable MFA for users
5. Create user profile completion flow

## Support

If you still have issues:
1. Check all URLs for typos
2. Verify credentials are correct
3. Try in an incognito/private window
4. Clear browser cache completely
5. Check Supabase status page for outages
6. Open an issue on GitHub with error message and steps to reproduce

---

**✅ Once you complete these steps, Google authentication should work!**
