-- Migration 004: Membership + Deprogramming System
-- Run in Supabase SQL Editor

-- ============================================
-- Extend members table
-- ============================================

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS is_committed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS committed_at timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS donation_amount_cents integer,
  ADD COLUMN IF NOT EXISTS donation_frequency text CHECK (donation_frequency IN ('monthly', 'one-time')),
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS core_track_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS core_track_completed_at timestamptz;

-- ============================================
-- Elders table
-- ============================================

CREATE TABLE IF NOT EXISTS elders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id) ON DELETE CASCADE,
  name text NOT NULL,
  bio text,
  photo_url text,
  specialties text[] DEFAULT '{}',
  hourly_rate_cents integer,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE elders ENABLE ROW LEVEL SECURITY;

-- Committed members can view active elders
CREATE POLICY "Committed members can view active elders"
  ON elders FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM members WHERE id = auth.uid() AND is_committed = true
    )
  );

-- Admins can manage elders
CREATE POLICY "Admins can manage elders"
  ON elders FOR ALL
  USING (
    EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================
-- Tracks table
-- ============================================

CREATE TABLE IF NOT EXISTS tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  is_core boolean DEFAULT false,
  is_published boolean DEFAULT false,
  suggested_donation_cents integer,
  elder_id uuid REFERENCES elders(id) ON DELETE SET NULL,
  duration_weeks integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Committed members can view published tracks
CREATE POLICY "Committed members can view published tracks"
  ON tracks FOR SELECT
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM members WHERE id = auth.uid() AND is_committed = true
    )
  );

-- Admins can manage tracks
CREATE POLICY "Admins can manage tracks"
  ON tracks FOR ALL
  USING (
    EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================
-- Modules table
-- ============================================

CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid REFERENCES tracks(id) ON DELETE CASCADE NOT NULL,
  module_number integer NOT NULL,
  title text NOT NULL,
  content_html text,
  video_url text,
  prompt text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(track_id, module_number)
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- Committed members can view modules of published tracks
CREATE POLICY "Committed members can view modules"
  ON modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tracks WHERE tracks.id = modules.track_id AND tracks.is_published = true
    )
    AND EXISTS (
      SELECT 1 FROM members WHERE id = auth.uid() AND is_committed = true
    )
  );

-- Admins can manage modules
CREATE POLICY "Admins can manage modules"
  ON modules FOR ALL
  USING (
    EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================
-- Enrollments table
-- ============================================

CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  track_id uuid REFERENCES tracks(id) ON DELETE CASCADE NOT NULL,
  trinity_id uuid REFERENCES trinities(id) ON DELETE SET NULL,
  status text DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped')),
  donation_amount_cents integer,
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(member_id, track_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Members can view own enrollments
CREATE POLICY "Members can view own enrollments"
  ON enrollments FOR SELECT
  USING (member_id = auth.uid());

-- Members can enroll themselves
CREATE POLICY "Members can enroll themselves"
  ON enrollments FOR INSERT
  WITH CHECK (
    member_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM members WHERE id = auth.uid() AND is_committed = true
    )
  );

-- Members can update own enrollments
CREATE POLICY "Members can update own enrollments"
  ON enrollments FOR UPDATE
  USING (member_id = auth.uid())
  WITH CHECK (member_id = auth.uid());

-- Admins can manage enrollments
CREATE POLICY "Admins can manage enrollments"
  ON enrollments FOR ALL
  USING (
    EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================
-- Module progress table
-- ============================================

CREATE TABLE IF NOT EXISTS module_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completed_at timestamptz,
  UNIQUE(member_id, module_id)
);

ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;

-- Members can view own progress
CREATE POLICY "Members can view own progress"
  ON module_progress FOR SELECT
  USING (member_id = auth.uid());

-- Members can insert own progress
CREATE POLICY "Members can insert own progress"
  ON module_progress FOR INSERT
  WITH CHECK (member_id = auth.uid());

-- Members can update own progress
CREATE POLICY "Members can update own progress"
  ON module_progress FOR UPDATE
  USING (member_id = auth.uid())
  WITH CHECK (member_id = auth.uid());

-- Admins can manage progress
CREATE POLICY "Admins can manage progress"
  ON module_progress FOR ALL
  USING (
    EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================
-- Elder sessions table
-- ============================================

CREATE TABLE IF NOT EXISTS elder_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  elder_id uuid REFERENCES elders(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  scheduled_at timestamptz NOT NULL,
  amount_cents integer,
  platform_fee_cents integer,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE elder_sessions ENABLE ROW LEVEL SECURITY;

-- Members can view own sessions
CREATE POLICY "Members can view own sessions"
  ON elder_sessions FOR SELECT
  USING (member_id = auth.uid());

-- Elders can view their sessions
CREATE POLICY "Elders can view their sessions"
  ON elder_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM elders WHERE elders.id = elder_sessions.elder_id AND elders.member_id = auth.uid()
    )
  );

-- Members can book sessions
CREATE POLICY "Members can book sessions"
  ON elder_sessions FOR INSERT
  WITH CHECK (
    member_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM members WHERE id = auth.uid() AND is_committed = true
    )
  );

-- Members can update own sessions (cancel)
CREATE POLICY "Members can update own sessions"
  ON elder_sessions FOR UPDATE
  USING (member_id = auth.uid())
  WITH CHECK (member_id = auth.uid());

-- Admins can manage sessions
CREATE POLICY "Admins can manage sessions"
  ON elder_sessions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================
-- Seed core track + 6 modules (placeholder content)
-- ============================================

INSERT INTO tracks (slug, title, description, is_core, is_published, duration_weeks)
VALUES (
  'the-work-before-the-work',
  'The Work Before the Work',
  'Required before offering services on the JOB Board. Six modules of deprogramming — unlearning the performance, returning to yourself.',
  true,
  false,
  6
) ON CONFLICT (slug) DO NOTHING;

-- Insert modules for the core track
DO $$
DECLARE
  core_track_id uuid;
BEGIN
  SELECT id INTO core_track_id FROM tracks WHERE slug = 'the-work-before-the-work';

  INSERT INTO modules (track_id, module_number, title, content_html, prompt)
  VALUES
    (core_track_id, 1, 'Trauma-Informed Presence',
     '<p>Understand trauma in yourself first. Learn to recognize nervous system states — fight, flight, freeze, fawn — and how they show up in your daily life and relationships.</p><p>This isn''t about fixing. It''s about noticing.</p>',
     'Where in your body do you feel the most tension right now? What does it want you to know?'),

    (core_track_id, 2, 'Boundaries as Sacred Architecture',
     '<p>Where you end and another begins. Consent as a daily practice, not a one-time checkbox.</p><p>Boundaries aren''t walls — they''re architecture. They create the space where real connection becomes possible.</p>',
     'Name one boundary you''ve been afraid to set. What would change if you set it?'),

    (core_track_id, 3, 'The Binary Detox',
     '<p>Hold contradiction. Sit in "I don''t know." The world trained you to pick sides — right/wrong, good/bad, success/failure.</p><p>What if the most honest answer is "both" or "neither"?</p>',
     'What''s a belief you hold that contradicts another belief you also hold? Can you let both be true?'),

    (core_track_id, 4, 'Grief Work',
     '<p>Mourn the performing self. The career identity. The lost years. The version of you that hustled to be worthy.</p><p>You can''t build something new on top of unprocessed grief. This is the composting.</p>',
     'What identity are you most afraid to let go of? Write its eulogy.'),

    (core_track_id, 5, 'Play & Embodiment',
     '<p>Back into the body. Joy that isn''t productive. Movement that isn''t exercise. Creation that isn''t content.</p><p>Your body has been waiting for you to come home.</p>',
     'When was the last time you did something purely for the joy of it — with no outcome in mind? Do that thing this week.'),

    (core_track_id, 6, 'The Offer',
     '<p>What''s yours to give? Not your resume. Not your LinkedIn headline. The thing that lights you up and serves others simultaneously.</p><p>This module ends with a declaration — your offer to the world. This feeds directly into the Magic Show.</p>',
     'Complete this sentence: "What I''m here to offer is ___." Don''t think. Write.')
  ON CONFLICT (track_id, module_number) DO NOTHING;
END $$;
