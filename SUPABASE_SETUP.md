# Supabase Authentication & RLS Setup Guide

This guide will help you set up Supabase authentication and Row Level Security (RLS) policies for the SODDO Hospital Document Management System.

## Prerequisites

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project in Supabase
3. Wait for the project to finish setting up (usually takes 2-3 minutes)

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click on the **Settings** icon (⚙️) in the left sidebar
3. Click on **API** under Project Settings
4. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 2: Configure Environment Variables

1. Copy the `.env.local.example` file to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and replace the placeholder values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 3: Enable Authentication Providers

### Email Authentication

Email authentication is enabled by default in Supabase. You can configure it in:

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Enable **Email** provider
3. Configure email templates if needed (optional)

### Google OAuth Authentication

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Enable **Google** provider
3. Follow the instructions to set up Google OAuth:
   - Create a Google Cloud Project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `https://your-project-id.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for local development)
4. Copy the Client ID and Client Secret to Supabase

## Step 4: Create Database Tables

Run the following SQL in the Supabase SQL Editor (**Database** → **SQL Editor**):

### User Profiles Table

```sql
-- Create user profiles table
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manager')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
```

### Documents Table (Example)

```sql
-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_department ON public.documents(department);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
```

### Teams Table (Example)

```sql
-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team members junction table
CREATE TABLE public.team_members (
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'lead')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
```

## Step 5: Set Up Row Level Security (RLS) Policies

### User Profiles Policies

```sql
-- Users can view all profiles
CREATE POLICY "Users can view all profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.user_profiles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### Documents Policies

```sql
-- Users can view their own documents
CREATE POLICY "Users can view own documents"
ON public.documents
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can view documents in their team
CREATE POLICY "Users can view team documents"
ON public.documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    JOIN public.documents d ON d.user_id = tm.user_id
    WHERE tm.user_id = auth.uid()
  )
);

-- Admins and managers can view all documents
CREATE POLICY "Admins can view all documents"
ON public.documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
);

-- Users can insert their own documents
CREATE POLICY "Users can insert own documents"
ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own documents
CREATE POLICY "Users can update own documents"
ON public.documents
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Managers can approve/reject documents
CREATE POLICY "Managers can update document status"
ON public.documents
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
);

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents"
ON public.documents
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can delete any document
CREATE POLICY "Admins can delete any document"
ON public.documents
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### Teams Policies

```sql
-- All authenticated users can view teams
CREATE POLICY "Users can view teams"
ON public.teams
FOR SELECT
TO authenticated
USING (true);

-- Admins can manage teams
CREATE POLICY "Admins can insert teams"
ON public.teams
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update teams"
ON public.teams
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete teams"
ON public.teams
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Team members policies
CREATE POLICY "Users can view team members"
ON public.team_members
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage team members"
ON public.team_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

## Step 6: Create Database Functions

### Auto-create user profile on signup

```sql
-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Update timestamp function

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Apply to documents
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Apply to teams
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

## Step 7: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/signup`

3. Create a new account using:
   - Email and password
   - Or Google OAuth

4. Check your email for the confirmation link (if email confirmation is enabled)

5. Sign in at `http://localhost:3000/login`

6. You should be redirected to the dashboard

7. Visit `http://localhost:3000/users` to see the user management page

## Step 8: Verify RLS Policies

Test your RLS policies in the Supabase SQL Editor:

```sql
-- Test as a specific user (replace with actual user ID)
SET request.jwt.claim.sub = 'user-id-here';

-- Try to select from user_profiles
SELECT * FROM public.user_profiles;

-- Try to select from documents
SELECT * FROM public.documents;
```

## Additional Configuration

### Email Templates

Customize your authentication emails in Supabase:

1. Go to **Authentication** → **Email Templates**
2. Customize the following templates:
   - Confirm signup
   - Invite user
   - Magic Link
   - Change Email
   - Reset Password

### Security Settings

1. Go to **Authentication** → **Settings**
2. Configure:
   - **Site URL**: Your production URL (e.g., `https://yourdomain.com`)
   - **Redirect URLs**: Add your callback URLs
   - **JWT Expiry**: Set token expiration time
   - **Enable Email Confirmations**: Require email verification
   - **Enable Auto Confirm**: For development only

## Troubleshooting

### Common Issues

1. **"Invalid API key"**: Double-check your `.env.local` file
2. **"redirect_to not allowed"**: Add your callback URL to allowed redirect URLs in Supabase dashboard
3. **"User not found"**: Make sure the user profile was created (check trigger)
4. **RLS policy errors**: Test policies in SQL editor with `SET request.jwt.claim.sub`

### Debugging Tips

- Check Supabase logs in **Database** → **Logs**
- Use the SQL Editor to test queries
- Enable debug mode in development: `export NEXT_PUBLIC_DEBUG=true`

## Production Checklist

- [ ] Update Site URL and Redirect URLs in Supabase dashboard
- [ ] Disable auto-confirm for email signups
- [ ] Enable email confirmations
- [ ] Set up custom email templates
- [ ] Configure password requirements
- [ ] Set up rate limiting
- [ ] Review and test all RLS policies
- [ ] Set up database backups
- [ ] Configure monitoring and alerts
- [ ] Add your production domain to allowed origins

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Auth Policies Examples](https://supabase.com/docs/guides/auth/row-level-security#policies)
