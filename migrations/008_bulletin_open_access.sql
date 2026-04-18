-- Migration 008: Open Bulletin to all members (not just committed)
-- Run in Supabase SQL Editor

-- Drop existing committed-only policies
DROP POLICY IF EXISTS "Committed members can view bulletin posts" ON bulletin_posts;
DROP POLICY IF EXISTS "Committed members can create bulletin posts" ON bulletin_posts;
DROP POLICY IF EXISTS "Committed members can view bulletin interests" ON bulletin_interests;
DROP POLICY IF EXISTS "Members can express interest" ON bulletin_interests;

-- Replace with any-member policies
CREATE POLICY "Members can view bulletin posts"
  ON bulletin_posts FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM members WHERE id = auth.uid())
  );

CREATE POLICY "Members can create bulletin posts"
  ON bulletin_posts FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (SELECT 1 FROM members WHERE id = auth.uid())
  );

CREATE POLICY "Members can view bulletin interests"
  ON bulletin_interests FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM members WHERE id = auth.uid())
  );

CREATE POLICY "Members can express interest"
  ON bulletin_interests FOR INSERT
  WITH CHECK (
    member_id = auth.uid()
    AND EXISTS (SELECT 1 FROM members WHERE id = auth.uid())
  );
