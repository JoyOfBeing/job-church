-- Migration 009: Member Profiles
-- Run in Supabase SQL Editor

-- Add profile columns to members
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS pronouns text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS is_elder boolean DEFAULT false;

-- Allow any member to view other members' basic profile info
CREATE POLICY "Members can view other members"
  ON members FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM members WHERE id = auth.uid())
  );
