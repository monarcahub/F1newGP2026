/*
  SQL for Supabase Editor:

  -- Create f1profiles table
  CREATE TABLE f1profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    subscription_status TEXT DEFAULT 'INACTIVE' CHECK (subscription_status IN ('ACTIVE', 'INACTIVE', 'TEST')),
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
  );

  -- Create videos table
  CREATE TABLE videos (
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

  -- Enable RLS
  ALTER TABLE f1profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

  -- f1profiles Policies
  CREATE POLICY "Users can view their own profile" ON f1profiles FOR SELECT USING (auth.uid() = id);
  CREATE POLICY "Admins can view all profiles" ON f1profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM f1profiles WHERE id = auth.uid() AND role = 'admin')
  );
  CREATE POLICY "Admins can update all profiles" ON f1profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM f1profiles WHERE id = auth.uid() AND role = 'admin')
  );

  -- Videos Policies
  CREATE POLICY "Anyone can view free videos" ON videos FOR SELECT USING (status = 'FREE');
  CREATE POLICY "Active subscribers can view premium videos" ON videos FOR SELECT USING (
    status = 'PREMIUM' AND EXISTS (
      SELECT 1 FROM f1profiles WHERE id = auth.uid() AND subscription_status IN ('ACTIVE', 'TEST')
    )
  );
  CREATE POLICY "Admins can manage all videos" ON videos FOR ALL USING (
    EXISTS (SELECT 1 FROM f1profiles WHERE id = auth.uid() AND role = 'admin')
  );

  -- Trigger to create profile on signup
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger AS $$
  BEGIN
    INSERT INTO public.f1profiles (id, email, full_name, role, subscription_status)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user', 'INACTIVE');
    RETURN new;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
*/
