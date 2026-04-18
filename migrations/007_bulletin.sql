-- Migration 007: Church Bulletin
-- Run in Supabase SQL Editor

-- ============================================
-- Bulletin posts table
-- ============================================

CREATE TABLE IF NOT EXISTS bulletin_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('offering', 'announcement', 'call', 'reflection', 'event', 'ministry')),
  title text NOT NULL,
  body text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bulletin_posts ENABLE ROW LEVEL SECURITY;

-- All committed members can view bulletin posts
CREATE POLICY "Committed members can view bulletin posts"
  ON bulletin_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members WHERE id = auth.uid() AND is_committed = true
    )
  );

-- Committed members can create bulletin posts
CREATE POLICY "Committed members can create bulletin posts"
  ON bulletin_posts FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM members WHERE id = auth.uid() AND is_committed = true
    )
  );

-- Members can update their own posts
CREATE POLICY "Members can update own bulletin posts"
  ON bulletin_posts FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Members can delete their own posts
CREATE POLICY "Members can delete own bulletin posts"
  ON bulletin_posts FOR DELETE
  USING (author_id = auth.uid());

-- Admins can manage all posts
CREATE POLICY "Admins can manage bulletin posts"
  ON bulletin_posts FOR ALL
  USING (
    EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================
-- Bulletin interests (like "I'm interested")
-- ============================================

CREATE TABLE IF NOT EXISTS bulletin_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES bulletin_posts(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, member_id)
);

ALTER TABLE bulletin_interests ENABLE ROW LEVEL SECURITY;

-- Committed members can view interests
CREATE POLICY "Committed members can view bulletin interests"
  ON bulletin_interests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members WHERE id = auth.uid() AND is_committed = true
    )
  );

-- Members can express interest
CREATE POLICY "Members can express interest"
  ON bulletin_interests FOR INSERT
  WITH CHECK (
    member_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM members WHERE id = auth.uid() AND is_committed = true
    )
  );

-- Members can remove their interest
CREATE POLICY "Members can remove own interest"
  ON bulletin_interests FOR DELETE
  USING (member_id = auth.uid());
