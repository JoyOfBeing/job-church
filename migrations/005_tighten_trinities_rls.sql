-- ============================================
-- JOB Church — Tighten Trinities RLS
-- Run this in Supabase SQL Editor
-- ============================================

-- Problem: Any authenticated user can see ALL braids (including invite codes)
-- and create braids with arbitrary data.

-- 1. Drop the overly permissive SELECT policy on trinities
DROP POLICY IF EXISTS "Authenticated can select trinities" ON trinities;

-- 2. Users can only see braids they belong to or created
CREATE POLICY "Members can view their own trinities"
  ON trinities FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM trinity_members
      WHERE trinity_members.trinity_id = trinities.id
        AND trinity_members.member_id = auth.uid()
    )
  );

-- 3. Drop the overly permissive INSERT policy on trinities
DROP POLICY IF EXISTS "Authenticated can insert trinities" ON trinities;

-- 4. Users can only create braids where they are the creator
CREATE POLICY "Users can create their own trinities"
  ON trinities FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

-- 5. Tighten trinity_members SELECT — only see members of braids you belong to
DROP POLICY IF EXISTS "Authenticated can select trinity_members" ON trinity_members;

CREATE POLICY "Members can view their own braid members"
  ON trinity_members FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trinity_members AS my
      WHERE my.trinity_id = trinity_members.trinity_id
        AND my.member_id = auth.uid()
    )
  );

-- 6. Secure function for invite code lookups (used by join page).
--    Returns limited data — just the trinity id and member count.
--    SECURITY DEFINER bypasses RLS so unenrolled users can look up a code.
CREATE OR REPLACE FUNCTION public.lookup_invite_code(code text)
RETURNS TABLE (
  trinity_id uuid,
  member_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id AS trinity_id,
    (SELECT count(*) FROM trinity_members tm WHERE tm.trinity_id = t.id) AS member_count
  FROM trinities t
  WHERE t.invite_code = code
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
