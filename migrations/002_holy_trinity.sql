-- ============================================
-- JOB Church — Holy Trinity Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop old tables
DROP TABLE IF EXISTS journey_progress;
DROP TABLE IF EXISTS elders;

-- Remove tithe columns from members
ALTER TABLE members DROP COLUMN IF EXISTS tithe_amount;
ALTER TABLE members DROP COLUMN IF EXISTS tithe_note;

-- Add wants_match column for unmatched queue
ALTER TABLE members ADD COLUMN IF NOT EXISTS wants_match boolean DEFAULT false;

-- Update the trigger to not insert journey rows anymore
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.members (id, email, name)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trinities
CREATE TABLE public.trinities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  invite_code text UNIQUE NOT NULL,
  created_by uuid REFERENCES public.members(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Trinity members (max 3 enforced in app)
CREATE TABLE public.trinity_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trinity_id uuid REFERENCES public.trinities(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE (trinity_id, member_id)
);

-- Gatherings (Sunday Night Live)
CREATE TABLE public.gatherings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  date timestamptz NOT NULL,
  crowdcast_url text,
  video_url text,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.trinities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trinity_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gatherings ENABLE ROW LEVEL SECURITY;

-- Trinities: authenticated can read all, create
CREATE POLICY "Authenticated can select trinities"
  ON trinities FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert trinities"
  ON trinities FOR INSERT TO authenticated WITH CHECK (true);

-- Trinity members: authenticated can read all, insert
CREATE POLICY "Authenticated can select trinity_members"
  ON trinity_members FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert trinity_members"
  ON trinity_members FOR INSERT TO authenticated WITH CHECK (true);

-- Gatherings: authenticated can read
CREATE POLICY "Authenticated can select gatherings"
  ON gatherings FOR SELECT TO authenticated USING (true);

-- Gatherings: admin can insert/update/delete (done via Supabase dashboard or service role)
CREATE POLICY "Admins can manage gatherings"
  ON gatherings FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true)
  );

-- Members: ensure insert policy exists for the trigger
CREATE POLICY "Service can insert members"
  ON members FOR INSERT WITH CHECK (true);
