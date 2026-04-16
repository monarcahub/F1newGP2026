/*
  SQL for Supabase Editor:

  -- Create f1profiles table
  CREATE TABLE IF NOT EXISTS f1profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    full_name TEXT,
    subscription_status TEXT DEFAULT 'ACTIVE' CHECK (subscription_status IN ('ACTIVE', 'INACTIVE', 'TEST')),
    plan TEXT DEFAULT 'FREE' CHECK (plan IN ('FREE', 'MONTHLY', 'ANNUAL', 'MENSAL', 'ANUAL')),
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
  );

  -- Create videos table
  CREATE TABLE IF NOT EXISTS videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    embed_url TEXT NOT NULL,
    status TEXT DEFAULT 'PREMIUM' CHECK (status IN ('PREMIUM', 'FREE', 'ARCHIVED')),
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
  );

  -- Create f1subscribes table for legacy/external subscribers
  CREATE TABLE IF NOT EXISTS f1subscribes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT,
    phone TEXT,
    plan TEXT NOT NULL CHECK (plan IN ('FREE', 'MONTHLY', 'ANNUAL', 'MENSAL', 'ANUAL')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
  );

  -- Enable RLS
  ALTER TABLE f1profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
  ALTER TABLE f1subscribes ENABLE ROW LEVEL SECURITY;

  -- Helper functions to avoid RLS recursion
  CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS BOOLEAN AS $$
  BEGIN
    RETURN EXISTS (
      SELECT 1 FROM public.f1profiles
      WHERE id = auth.uid() AND role = 'admin'
    );
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE OR REPLACE FUNCTION public.is_subscriber()
  RETURNS BOOLEAN AS $$
  BEGIN
    RETURN EXISTS (
      SELECT 1 FROM public.f1profiles
      WHERE id = auth.uid() AND subscription_status IN ('ACTIVE', 'TEST')
    );
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- f1profiles Policies
  DROP POLICY IF EXISTS "Users can view their own profile" ON f1profiles;
  DROP POLICY IF EXISTS "Admins can view all profiles" ON f1profiles;
  DROP POLICY IF EXISTS "Admins can update all profiles" ON f1profiles;
  
  CREATE POLICY "Users can view their own profile" ON f1profiles FOR SELECT USING (auth.uid() = id);
  CREATE POLICY "Admins can view all profiles" ON f1profiles FOR SELECT USING (is_admin());
  CREATE POLICY "Admins can update all profiles" ON f1profiles FOR UPDATE USING (is_admin());

  -- Videos Policies
  DROP POLICY IF EXISTS "Anyone can view all videos" ON videos;
  DROP POLICY IF EXISTS "Anyone can view free videos" ON videos;
  DROP POLICY IF EXISTS "Active subscribers can view premium videos" ON videos;
  DROP POLICY IF EXISTS "Admins can manage all videos" ON videos;

  CREATE POLICY "Anyone can view all videos" ON videos FOR SELECT USING (true);
  CREATE POLICY "Admins can manage all videos" ON videos FOR ALL USING (is_admin());

  -- f1subscribes Policies
  DROP POLICY IF EXISTS "Admins can manage all subscribes" ON f1subscribes;
  CREATE POLICY "Admins can manage all subscribes" ON f1subscribes FOR ALL USING (is_admin());

  -- Create reactions table
  CREATE TABLE IF NOT EXISTS f1reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    video_id UUID REFERENCES videos ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('like', 'love')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, video_id)
  );

  -- Create comments table
  CREATE TABLE IF NOT EXISTS f1comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    video_id UUID REFERENCES videos ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES f1comments ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
  );

  -- Enable RLS for new tables
  ALTER TABLE f1reactions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE f1comments ENABLE ROW LEVEL SECURITY;

  -- Reactions Policies
  DROP POLICY IF EXISTS "Users can view all reactions" ON f1reactions;
  DROP POLICY IF EXISTS "Users can manage their own reactions" ON f1reactions;
  
  CREATE POLICY "Users can view all reactions" ON f1reactions FOR SELECT USING (true);
  CREATE POLICY "Users can manage their own reactions" ON f1reactions FOR ALL USING (auth.uid() = user_id);

  -- Comments Policies
  DROP POLICY IF EXISTS "Users can view all comments" ON f1comments;
  DROP POLICY IF EXISTS "Authenticated users can create comments" ON f1comments;
  DROP POLICY IF EXISTS "Users can manage their own comments" ON f1comments;

  CREATE POLICY "Users can view all comments" ON f1comments FOR SELECT USING (true);
  CREATE POLICY "Authenticated users can create comments" ON f1comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  CREATE POLICY "Users can manage their own comments" ON f1comments FOR ALL USING (auth.uid() = user_id);

  -- Trigger to create profile on signup
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger AS $$
  BEGIN
    INSERT INTO public.f1profiles (id, email, phone, full_name, role, subscription_status, plan)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'phone', new.raw_user_meta_data->>'full_name', 'user', 'ACTIVE', 'FREE');
    RETURN new;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
*/
