# Neon Database + Stack Auth Setup Guide

This guide will help you understand and configure the authentication system for SODDO Hospital using Neon database and Stack Auth.

## What's Configured

- **Database**: Neon PostgreSQL (with connection pooling)
- **Authentication**: Stack Auth (by Neon)
- **Auth Methods**: Email/Password and Google OAuth

## Environment Variables

Your `.env.local` file is already configured with the following:

### Neon Database
```env
DATABASE_URL=postgresql://neondb_owner:npg_iNf4Z2WPnKMw@ep-bold-moon-agr8xxho-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
PGHOST=ep-bold-moon-agr8xxho-pooler.c-2.eu-central-1.aws.neon.tech
PGUSER=neondb_owner
PGDATABASE=neondb
PGPASSWORD=npg_iNf4Z2WPnKMw
```

### Stack Auth
```env
NEXT_PUBLIC_STACK_PROJECT_ID=4c772339-3fa4-4a0e-8e70-9e5881ad9a53
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pck_cx6rnaztjstcf22xdnwkgy0n2h2nyd5mhtck00f8bhryr
STACK_SECRET_SERVER_KEY=ssk_cne1nm6jb63yc5yjxvazfb72r7a2s9ndpv9xvp8kxx4k8
```

## How Authentication Works

### 1. Stack Auth Provider

The app is wrapped with `StackAuthProvider` in `app/layout.tsx`:

```typescript
<StackAuthProvider>
  {children}
</StackAuthProvider>
```

This provides authentication context to all pages and components.

### 2. Authentication Pages

#### Login Page (`/login`)
- Email/password login
- Google OAuth login
- Auto-redirects to dashboard if already logged in

#### Signup Page (`/signup`)
- Email/password registration
- Google OAuth signup
- Creates new user account

### 3. Protected Routes

The sidebar component uses Stack Auth to:
- Display user information when logged in
- Show sign in button when not logged in
- Handle sign out functionality

```typescript
const user = useUser(); // From Stack Auth

if (user) {
  // Show user profile and sign out button
} else {
  // Show sign in button
}
```

### 4. Server-Side Authentication

For server components and API routes:

```typescript
import { stackServerApp } from "@/lib/stack";

const user = await stackServerApp.getUser();
```

## Testing Authentication

### 1. Start Development Server

```bash
npm run dev
```

### 2. Test Sign Up

1. Navigate to `http://localhost:3000/signup`
2. Enter email and password
3. Click "Create Account"
4. You'll be redirected to `/dashboard`

### 3. Test Sign In

1. Navigate to `http://localhost:3000/login`
2. Enter your credentials
3. Click "Sign In"
4. You'll be redirected to `/dashboard`

### 4. Test Google OAuth

1. Click "Sign in with Google" on login or signup page
2. Authorize with your Google account
3. You'll be redirected to `/dashboard`

### 5. Test Sign Out

1. Click your profile in the sidebar
2. Click "Sign Out"
3. You'll be redirected to the landing page

## Stack Auth Features

### User Management

Access the user management dashboard at `/users` (requires authentication).

Features:
- View all users
- Invite new users
- Manage user roles (Admin, Manager, User)
- Search users by name or email

### User Roles

- **Admin**: Full access to all features
- **Manager**: Can manage teams and approve documents
- **User**: Can create and manage own documents

## Configuring Stack Auth (Optional)

If you want to customize Stack Auth settings:

1. Go to [Stack Auth Dashboard](https://app.stack-auth.com)
2. Sign in with your Neon account
3. Select your project: `4c772339-3fa4-4a0e-8e70-9e5881ad9a53`

### Enable Additional OAuth Providers

In the Stack Auth dashboard, you can enable:
- GitHub OAuth
- Microsoft OAuth
- Apple OAuth
- And more...

### Customize Email Templates

1. Go to **Email Templates** in Stack Auth dashboard
2. Customize:
   - Welcome email
   - Password reset email
   - Email verification
   - Magic link emails

### Configure Webhooks

Set up webhooks to sync user data with your Neon database:

1. Go to **Webhooks** in Stack Auth dashboard
2. Add webhook URL: `https://yourdomain.com/api/auth/webhook`
3. Select events: `user.created`, `user.updated`, `user.deleted`

## Database Schema (Optional)

If you want to store additional user data in Neon:

```sql
-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY, -- Stack Auth user ID
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manager')),
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
```

## API Routes with Authentication

Example API route with authentication:

```typescript
// app/api/users/route.ts
import { stackServerApp } from "@/lib/stack";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await stackServerApp.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Your logic here
  return NextResponse.json({ data: "Protected data" });
}
```

## Protecting Pages

### Client Component

```typescript
"use client";

import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";

export default function ProtectedPage() {
  const user = useUser();
  const router = useRouter();

  if (!user) {
    router.push("/login");
    return null;
  }

  return <div>Protected content</div>;
}
```

### Server Component

```typescript
import { stackServerApp } from "@/lib/stack";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/login");
  }

  return <div>Protected content</div>;
}
```

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Make sure all environment variables are set in `.env.local`
2. Restart the dev server: `npm run dev`
3. Clear Next.js cache: `rm -rf .next`

### Authentication Not Working

1. Check environment variables are correctly set
2. Verify Stack Auth project ID and keys
3. Check browser console for errors
4. Ensure cookies are enabled

### Database Connection Issues

1. Check Neon database status in Neon console
2. Verify connection string is correct
3. Test connection with: `psql $DATABASE_URL`

## Resources

- [Stack Auth Documentation](https://docs.stack-auth.com)
- [Neon Documentation](https://neon.tech/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Stack Auth GitHub](https://github.com/stack-auth/stack)

## Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use environment variables** - Never hardcode secrets
3. **Rotate keys regularly** - Change auth keys periodically
4. **Enable 2FA** - For Stack Auth dashboard access
5. **Monitor logs** - Check for suspicious activity
6. **Use HTTPS** - Always in production
7. **Set up CSP headers** - Content Security Policy
8. **Rate limiting** - Protect against brute force attacks

## Production Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables from `.env.local`
4. Deploy

### Environment Variables in Vercel

Add these in Vercel dashboard → Settings → Environment Variables:

```
DATABASE_URL=your-neon-connection-string
NEXT_PUBLIC_STACK_PROJECT_ID=your-project-id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your-publishable-key
STACK_SECRET_SERVER_KEY=your-secret-key
```

### Update Stack Auth URLs

In Stack Auth dashboard, update:
- **Sign In URL**: `https://yourdomain.com/login`
- **Sign Up URL**: `https://yourdomain.com/signup`
- **Callback URL**: `https://yourdomain.com/dashboard`

## Next Steps

1. ✅ Authentication is configured
2. ✅ Database is connected
3. ✅ User management is ready

Now you can:
- Create database tables for your hospital data
- Build out the document management features
- Add role-based access control
- Implement team management
- Create API routes for data operations

Happy coding! 🚀
