-- ============================================
-- JOB Church — Tighten RLS Policies
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Remove the overly permissive members INSERT policy.
--    The signup trigger uses SECURITY DEFINER (bypasses RLS),
--    so this policy just creates a hole.
DROP POLICY IF EXISTS "Service can insert members" ON members;

-- 2. Tighten trinity_members INSERT.
--    Users should only be able to add THEMSELVES to a braid.
DROP POLICY IF EXISTS "Authenticated can insert trinity_members" ON trinity_members;

CREATE POLICY "Members can add themselves to a braid"
  ON trinity_members FOR INSERT TO authenticated
  WITH CHECK (member_id = auth.uid());

-- 3. Prevent members from escalating to admin.
--    RLS can't restrict columns, so we use a trigger.
CREATE OR REPLACE FUNCTION public.prevent_admin_escalation()
RETURNS trigger AS $$
BEGIN
  -- If is_admin is being changed and the user is not already an admin, block it
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
    IF NOT OLD.is_admin THEN
      RAISE EXCEPTION 'Cannot change admin status';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_admin_escalation ON members;

CREATE TRIGGER prevent_admin_escalation
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION public.prevent_admin_escalation();

-- 4. Admin: allow insert/update/delete on trinities and trinity_members
CREATE POLICY "Admins can manage trinities"
  ON trinities FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can manage trinity_members"
  ON trinity_members FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true)
  );

-- 5. Admins can update any member (for advancing thresholds, etc.)
CREATE POLICY "Admins can update all members"
  ON members FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true)
  );
