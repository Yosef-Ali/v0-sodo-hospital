# Vercel Deployment Checklist ✅

## Environment Variables Set in Vercel

Make sure these are added in **Vercel Dashboard → Settings → Environment Variables**:

### Neon Database
- ✅ `DATABASE_URL`
- ✅ `DATABASE_URL_UNPOOLED`
- ✅ `PGHOST`
- ✅ `PGHOST_UNPOOLED`
- ✅ `PGUSER`
- ✅ `PGDATABASE`
- ✅ `PGPASSWORD`
- ✅ `POSTGRES_URL`
- ✅ `POSTGRES_URL_NON_POOLING`
- ✅ `POSTGRES_USER`
- ✅ `POSTGRES_HOST`
- ✅ `POSTGRES_PASSWORD`
- ✅ `POSTGRES_DATABASE`
- ✅ `POSTGRES_URL_NO_SSL`
- ✅ `POSTGRES_PRISMA_URL`

### Stack Auth
- ✅ `NEXT_PUBLIC_STACK_PROJECT_ID`
- ✅ `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
- ✅ `STACK_SECRET_SERVER_KEY`

## Post-Deployment Steps

### 1. Update Stack Auth URLs

Go to [Stack Auth Dashboard](https://app.stack-auth.com/projects/4c772339-3fa4-4a0e-8e70-9e5881ad9a53/settings):

Update these URLs to match your Vercel domain:

```
Sign In URL: https://your-app.vercel.app/login
Sign Up URL: https://your-app.vercel.app/signup
Callback URL: https://your-app.vercel.app/dashboard
Home URL: https://your-app.vercel.app
After Sign Out URL: https://your-app.vercel.app
```

**Allowed Redirect URLs:**
```
https://your-app.vercel.app/*
https://your-app.vercel.app/dashboard
https://your-app.vercel.app/login
https://your-app.vercel.app/signup
```

### 2. Test Authentication Flow

After deployment, test these flows:

#### ✅ Landing Page
- [ ] Visit `https://your-app.vercel.app`
- [ ] Landing page loads correctly
- [ ] Green theme is applied
- [ ] All cards and animations work

#### ✅ Sign Up
- [ ] Go to `https://your-app.vercel.app/signup`
- [ ] Create account with email/password
- [ ] Should redirect to `/dashboard`
- [ ] User info appears in sidebar

#### ✅ Sign In
- [ ] Go to `https://your-app.vercel.app/login`
- [ ] Sign in with your credentials
- [ ] Should redirect to `/dashboard`
- [ ] User profile shows in sidebar

#### ✅ Google OAuth
- [ ] Click "Sign in with Google" on login page
- [ ] Authorize with Google
- [ ] Should redirect to `/dashboard`

#### ✅ Sign Out
- [ ] Click profile in sidebar
- [ ] Click "Sign Out"
- [ ] Should redirect to landing page
- [ ] Access to `/dashboard` should redirect to `/login`

#### ✅ Protected Routes
- [ ] Try accessing `/dashboard` without login
- [ ] Should redirect to `/login`
- [ ] Try accessing `/users` without login
- [ ] Should redirect to `/login`

#### ✅ User Management
- [ ] Sign in as admin
- [ ] Go to `/users`
- [ ] User management page loads
- [ ] Can see current user in table
- [ ] Invite form works

### 3. Database Connection Test

Test database connectivity:

#### ✅ Neon Dashboard
- [ ] Go to [Neon Console](https://console.neon.tech)
- [ ] Check database is active
- [ ] Verify connection pooling is enabled
- [ ] Check for any connection errors in logs

#### ✅ Database Tables (Optional)
If you want to create user profiles table:

```sql
-- Run this in Neon SQL Editor
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
```

### 4. Performance Checks

#### ✅ Lighthouse Score
Run Lighthouse audit in Chrome DevTools:
- [ ] Performance > 90
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 90

#### ✅ Build Logs
Check Vercel deployment logs:
- [ ] No build errors
- [ ] No runtime errors
- [ ] All routes deployed successfully

### 5. Security Checks

#### ✅ Environment Variables
- [ ] `.env.local` is NOT committed to git
- [ ] All secrets are in Vercel environment variables
- [ ] No API keys in client-side code

#### ✅ HTTPS
- [ ] All pages load over HTTPS
- [ ] No mixed content warnings
- [ ] SSL certificate is valid

#### ✅ CORS
- [ ] Stack Auth domain is allowed
- [ ] No CORS errors in console

### 6. Monitoring Setup (Optional)

#### ✅ Vercel Analytics
Enable in Vercel Dashboard:
- [ ] Web Analytics
- [ ] Speed Insights
- [ ] Audience Insights (if on Pro plan)

#### ✅ Error Tracking
Consider adding:
- [ ] Sentry for error tracking
- [ ] LogRocket for session replay
- [ ] Vercel Logs for debugging

### 7. Google OAuth Configuration

If Google sign-in doesn't work:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services → Credentials**
3. Add Authorized JavaScript origins:
   ```
   https://your-app.vercel.app
   https://api.stack-auth.com
   ```
4. Add Authorized redirect URIs:
   ```
   https://api.stack-auth.com/api/v1/auth/oauth/callback/google
   https://your-app.vercel.app/auth/callback
   ```

### 8. Common Issues & Fixes

#### Issue: "Unauthorized" error on sign in
**Fix**:
- Check Stack Auth project ID in Vercel env vars
- Verify publishable key is correct
- Check Stack Auth dashboard for project status

#### Issue: Redirect loop after sign in
**Fix**:
- Update callback URLs in Stack Auth dashboard
- Clear browser cookies and cache
- Check middleware.ts is not blocking authenticated routes

#### Issue: Database connection timeout
**Fix**:
- Verify Neon database is active
- Check connection string format
- Use pooled connection (`DATABASE_URL` with `-pooler`)

#### Issue: Google OAuth not working
**Fix**:
- Add Vercel domain to Google OAuth allowed origins
- Update redirect URIs in Google Console
- Enable Google OAuth in Stack Auth dashboard

### 9. Custom Domain (Optional)

If you want a custom domain:

1. **Add Domain in Vercel**:
   - Go to Vercel Dashboard → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Stack Auth**:
   - Change all URLs from `*.vercel.app` to your custom domain
   - Update allowed redirect URLs

3. **Update Google OAuth**:
   - Add custom domain to authorized origins
   - Add custom domain redirect URIs

### 10. Final Verification

Run through entire user flow:

1. [ ] Visit landing page as guest
2. [ ] Sign up with new account
3. [ ] Get redirected to dashboard
4. [ ] User info shows in sidebar
5. [ ] Navigate to different pages
6. [ ] Sign out
7. [ ] Sign in again
8. [ ] Everything works smoothly

## Success! 🎉

Your SODDO Hospital app is now live on Vercel with:
- ✅ Neon PostgreSQL database
- ✅ Stack Auth authentication
- ✅ Google OAuth
- ✅ Green theme applied
- ✅ User management
- ✅ Protected routes

## Next Steps

Now you can focus on building:
1. Document management features
2. Team collaboration tools
3. Approval workflows
4. Reports and analytics
5. Real-time notifications

## Need Help?

If anything doesn't work:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Review Stack Auth dashboard logs
4. Check Neon database logs
5. Verify all environment variables are set correctly

## Deployment URL

Your app should be live at:
```
https://your-project-name.vercel.app
```

Share it with your team and start managing hospital documents! 🏥📄
